import { cp, mkdir, readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const release=resolve(root,'nexupav1.0.0');
if(!release.startsWith(root+sep)||release!==resolve(root,'nexupav1.0.0'))throw new Error('Destino incorrecto');
if(!existsSync(resolve(root,'dist-demo/index.html')))throw new Error('Compila primero la web.');
const manifestPath=resolve(release,'release-manifest.json');
// Only replace previously generated files, and refuse to overwrite manual edits.
if(existsSync(manifestPath)){
 const previous=JSON.parse(await readFile(manifestPath,'utf8'));
 if(previous.generator!=='nexo-release-v1')throw new Error('Esta carpeta no pertenece al generador.');
 for(const file of previous.files){const target=resolve(release,file.path);if(!target.startsWith(release+sep))throw new Error('Ruta inválida');if(existsSync(target)&&createHash('sha256').update(await readFile(target)).digest('hex')!==file.sha256)throw new Error(`Conserva primero tu modificación manual: ${file.path}`);}
 for(const file of previous.files){const target=resolve(release,file.path);if(existsSync(target))await unlink(target);}
}
await mkdir(release,{recursive:true});
const copy=async(from,to)=>{await mkdir(dirname(resolve(release,to)),{recursive:true});await cp(resolve(root,from),resolve(release,to),{recursive:true});};
await copy('dist-demo','web');
await copy('server','servidor');
await copy('release/README.md','README.md');
await copy('release/LOGIN-Y-DATOS.md','docs/LOGIN-Y-DATOS.md');
await copy('release/QA.md','docs/QA.md');
await copy('release/nexo.service.example','servidor/nexo.service.example');
await copy('release/verify.mjs','verify.mjs');
for(const dir of ['components','hooks','tests','server','vendor','social-worker'])await copy(dir,`source/${dir}`);
for(const entry of await readdir(resolve(root,'app')))if(entry.endsWith('.css')||['page.tsx','layout.tsx'].includes(entry))await copy(`app/${entry}`,`source/app/${entry}`);
for(const file of ['app-config.ts','community-state.ts','demo-data.ts','demo-store.tsx','nexo-auth.tsx','social-api.ts','refresh-order.ts','social-polling.ts','camera-utils.ts','connector-errors.mts','feature-flags.ts','gesture-math.ts','profile-image.ts','utils.ts','web-haptics.ts'])await copy(`lib/${file}`,`source/lib/${file}`);
for(const file of ['public','index.html','demo-entry.tsx','vite.demo.config.ts','postcss.config.mjs','design-2026-env.d.ts','package-lock.json'])await copy(file,`source/${file}`);
const pkg=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
pkg.scripts={"dev:demo":"vite --config vite.demo.config.ts","build:demo":"vite build --config vite.demo.config.ts","preview:demo":"vite preview --config vite.demo.config.ts","check":"tsc --noEmit --incremental false","test:release":"node --experimental-strip-types --test tests/*.test.mjs server/*.test.mjs social-worker/*.test.mjs"};
await writeFile(resolve(release,'source/package.json'),JSON.stringify(pkg,null,2)+'\n');
const ts=JSON.parse(await readFile(resolve(root,'tsconfig.json'),'utf8'));ts.exclude=['node_modules','dist-demo'];ts.compilerOptions.types=['node'];ts.compilerOptions.plugins=[];
await writeFile(resolve(release,'source/tsconfig.json'),JSON.stringify(ts,null,2)+'\n');
const config=await readFile(resolve(release,'web/app-config.js'),'utf8');
await writeFile(resolve(release,'web/app-config.js'),config.replace('previewEnabled: true','previewEnabled: false'));
await writeFile(resolve(release,'package.json'),JSON.stringify({name:'nexupa-release',version:'1.0.0',private:true,type:'module',engines:{node:'>=22.13.0'},scripts:{start:'node servidor/static-server.mjs',verify:'node verify.mjs',test:'node --test servidor/static-server.test.mjs'}},null,2)+'\n');
await writeFile(resolve(release,'.gitignore'),'source/node_modules/\nsource/dist-demo/\n*.tsbuildinfo\n.env*\ndata/\n');
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,entry.name);if(entry.isSymbolicLink())throw new Error('No se permiten enlaces simbólicos');if(entry.isDirectory())await walk(path);else if(path!==manifestPath){files.push({path:relative(release,path).split(sep).join('/'),sha256:createHash('sha256').update(await readFile(path)).digest('hex')});}}}
await walk(release);files.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(manifestPath,JSON.stringify({generator:'nexo-release-v1',version:'1.0.0',scope:'static-web-with-cloudflare-social-api',files},null,2)+'\n');
console.log(`Preparados ${files.length} archivos en ${release}`);
