import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { once } from "node:events";
import { createAuthServer } from "./server.mjs";
test("registro, sesión, contraseña protegida y cierre",async()=>{
 const dir=mkdtempSync(join(tmpdir(),"nexo-auth-test-"));const server=createAuthServer({dbPath:join(dir,"users.sqlite")});server.listen(0,"127.0.0.1");await once(server,"listening");const base=`http://127.0.0.1:${server.address().port}`;const email="prueba@example.test";const password="contraseña-de-prueba-larga";let cookie="";
 const post=(path,body,extra={})=>fetch(base+path,{method:"POST",headers:{"Content-Type":"application/json",...extra},body:JSON.stringify(body)});
 try{
  let r=await post("/auth/register",{name:"Estudiante de prueba",email,password});assert.equal(r.status,201);cookie=r.headers.get("set-cookie").split(";")[0];assert.ok(cookie.startsWith("nexo_session="));assert.equal((await r.json()).user.email,email);
  const database=new DatabaseSync(join(dir,"users.sqlite"),{readOnly:true});const stored=database.prepare("SELECT password_hash FROM users WHERE email=?").get(email).password_hash;database.close();assert.match(stored,/^scrypt\$v1\$/);assert.equal(stored.includes(password),false);
  r=await fetch(base+"/auth/me",{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal((await r.json()).user.email,email);
  r=await post("/auth/login",{email,password:"otra-contraseña-larga"});assert.equal(r.status,401);
  r=await post("/auth/login",{email,password});assert.equal(r.status,200);
  r=await post("/auth/register",{name:"Otra",email,password});assert.equal(r.status,409);
  r=await post("/auth/logout",{},{"Cookie":cookie});assert.equal(r.status,200);
  r=await fetch(base+"/auth/me",{headers:{Cookie:cookie}});assert.equal(r.status,401);
  r=await post("/auth/register",{name:"Mal",email:"bad",password});assert.equal(r.status,400);
  r=await post("/auth/register",{name:"Mal",email:"otra@example.test",password},{Origin:"https://host-no-autorizado.test"});assert.equal(r.status,403);
 }finally{await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
});
