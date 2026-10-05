import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { realpath, stat, readFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".webmanifest":"application/manifest+json",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2",".mp4":"video/mp4",".webm":"video/webm"};
const here=dirname(fileURLToPath(import.meta.url));
export function createStaticServer({webRoot=resolve(here,"../web"),preview=false}={}) {
 const root=resolve(webRoot);
 return createServer(async(req,res)=>{
  const headers={"X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","X-Frame-Options":"DENY","Permissions-Policy":"camera=(self), microphone=(self), geolocation=()","Cache-Control":"no-store","Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"};
  function finish(status,text){res.writeHead(status,{...headers,"Content-Type":"text/plain; charset=utf-8"});res.end(req.method==="HEAD"?undefined:text);}
  try {
   if(!["GET","HEAD"].includes(req.method)){res.setHeader("Allow","GET, HEAD");return finish(405,"Método no permitido");}
   const raw=(req.url||"/").split("?")[0];
   const pathname=decodeURIComponent(raw);
   if(pathname==="/health"){res.writeHead(200,{...headers,"Content-Type":"application/json"});return res.end(req.method==="HEAD"?undefined:JSON.stringify({status:"ok",version:"1.0.0",service:"nexo-web",authentication:"external-login-required"}));}
   if(pathname.startsWith("/api/"))return finish(503,"La API de la comunidad debe conectarse antes de admitir usuarios reales.");
   if(pathname.includes("\\")||pathname.includes("\0")||pathname.split("/").some(part=>part.startsWith(".")))return finish(403,"Ruta no permitida");
   if(pathname==="/app-config.js"){
    const configPath=resolve(root,"app-config.js");
    let config=await readFile(configPath,"utf8");
    // Production is closed by default, even if a copied preview config says true.
    config=config.replace(/previewEnabled:\s*(true|false)/,`previewEnabled: ${preview}`);
    res.writeHead(200,{...headers,"Content-Type":mime[".js"]});return res.end(req.method==="HEAD"?undefined:config);
   }
   const target=resolve(root,"."+(pathname==="/"?"/index.html":pathname));
   const canonical=await realpath(target);
   const canonicalRoot=await realpath(root);
   if(!canonical.startsWith(canonicalRoot+sep))return finish(403,"Ruta no permitida");
   const info=await stat(canonical);if(!info.isFile()||!mime[extname(canonical)])return finish(404,"No encontrado");
   const cache=pathname.startsWith("/assets/")?"public, max-age=31536000, immutable":"no-cache";
   res.writeHead(200,{...headers,"Cache-Control":extname(canonical)===".html"?"no-store":cache,"Content-Type":mime[extname(canonical)],"Content-Length":info.size});
   if(req.method==="HEAD")return res.end();
   const stream=createReadStream(canonical);stream.on("error",()=>res.destroy());stream.pipe(res);
  } catch(error) {finish(error.code==="ENOENT"?404:error instanceof URIError?400:500,"No se pudo servir esta ruta");}
 });
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root=resolve(process.env.NEXO_WEB_ROOT||resolve(here,"../web"));
 if(!existsSync(resolve(root,"index.html")))throw new Error("Falta web/index.html. Ejecuta npm run release desde el proyecto fuente.");
 const port=Number(process.env.PORT||8080),host=process.env.HOST||"127.0.0.1";
 createStaticServer({webRoot:root,preview:process.env.NEXO_PREVIEW==="true"}).listen(port,host,()=>console.log(`Nexo web en http://${host}:${port}`));
}
