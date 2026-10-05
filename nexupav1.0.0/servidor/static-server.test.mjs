import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp,writeFile,mkdir,rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStaticServer } from "./static-server.mjs";

test("Entrega estática: sin APIs falsas, sin rutas privadas y sin acceso de prueba en producción",async t=>{
 const folder=await mkdtemp(join(tmpdir(),"nexo-release-test-"));
 await writeFile(join(folder,"index.html"),"<h1>Nexo</h1>");
 await writeFile(join(folder,"app-config.js"),"window.NEXO_CONFIG = {previewEnabled: true};");
 await writeFile(join(folder,".private"),"not-public");
 await mkdir(join(folder,"assets"));await writeFile(join(folder,"assets","app.js"),"console.log('nexo')");
 const server=createStaticServer({webRoot:folder});await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 t.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(folder,{recursive:true});});
 const base=`http://127.0.0.1:${server.address().port}`;
 const home=await fetch(base);assert.equal(home.status,200);assert.equal(home.headers.get("x-content-type-options"),"nosniff");assert.match(home.headers.get("content-security-policy"),/frame-ancestors 'none'/);assert.equal(home.headers.get("cache-control"),"no-store");
 assert.match(await (await fetch(base+"/app-config.js")).text(),/previewEnabled: false/);
 assert.equal((await fetch(base+"/.private")).status,403);
 assert.equal((await fetch(base+"/%2e%2e%5csecret")).status,403);
 assert.equal((await fetch(base+"/%ZZ")).status,400);
 assert.equal((await fetch(base+"/api/session")).status,503);
 assert.equal((await fetch(base+"/missing.js")).status,404);
 assert.equal((await fetch(base,{method:"POST"})).status,405);
 const head=await fetch(base,{method:"HEAD"});assert.equal(head.status,200);assert.equal(await head.text(),"");
 const asset=await fetch(base+"/assets/app.js");assert.match(asset.headers.get("cache-control"),/immutable/);
 const health=await(await fetch(base+"/health")).json();assert.equal(health.version,"1.0.0");assert.equal(health.authentication,"external-login-required");
});
