import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(await readFile(resolve(root,'release-manifest.json'),'utf8'));
let failed=0;
for(const file of manifest.files){
 const target=resolve(root,file.path);
 if(!target.startsWith(root+sep))throw new Error('Ruta fuera de la entrega');
 try{const hash=createHash('sha256').update(await readFile(target)).digest('hex');if(hash!==file.sha256)throw new Error('Contenido diferente');}
 catch(error){console.error(file.path+': '+error.message);failed++;}
}
if(failed){process.exitCode=1;console.error(`${failed} archivos no coinciden. Si cambiaste tu configuración, documenta ese cambio.`);}
else console.log(`Nexo ${manifest.version}: ${manifest.files.length} archivos verificados.`);
