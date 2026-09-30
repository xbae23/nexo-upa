// Servidor de cuentas para pruebas LOCALES. No se ejecuta en GitHub Pages.
import { createServer } from "node:http";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scrypt, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive=promisify(scrypt);
const parameters={N:131072,r:8,p:1,maxmem:256*1024*1024};
const SESSION_AGE=7*24*60*60*1000;
const cookieName="nexo_session";
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digest=value=>createHash("sha256").update(value).digest("hex");
const json=(response,status,value,headers={})=>{response.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer",...headers});response.end(JSON.stringify(value));};
function parseCookies(header){return Object.fromEntries((header||"").split(";").map(x=>x.trim().split("=")).filter(x=>x.length===2));}
async function hashPassword(password){const salt=randomBytes(24).toString("base64url");const hash=await derive(password,salt,64,parameters);return `scrypt$v1$${parameters.N}$${parameters.r}$${parameters.p}$${salt}$${hash.toString("base64url")}`;}
async function verifyPassword(password,stored){try{const [algorithm,version,n,r,p,salt,value]=stored.split("$");if(algorithm!=="scrypt"||version!=="v1"||Number(n)!==parameters.N||Number(r)!==parameters.r||Number(p)!==parameters.p)return false;const expected=Buffer.from(value,"base64url");const actual=await derive(password,salt,expected.length,parameters);return actual.length===expected.length&&timingSafeEqual(actual,expected);}catch{return false;}}
function initDb(path){mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;");const version=db.prepare("PRAGMA user_version").get().user_version;if(version===0){db.exec(`BEGIN;
CREATE TABLE users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,created_at INTEGER NOT NULL,verified_at INTEGER);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL,created_at INTEGER NOT NULL);
CREATE INDEX sessions_expiry ON sessions(expires_at);
PRAGMA user_version=1;
COMMIT;`);}else if(version!==1)throw new Error("Versión de base de datos no compatible.");return db;}
async function readBody(request){let body="";for await(const chunk of request){body+=chunk;if(body.length>16384){const error=new Error("Solicitud demasiado grande.");error.status=413;throw error;}}try{return JSON.parse(body);}catch{const error=new Error("JSON inválido.");error.status=400;throw error;}}
function sessionUser(db,request){const token=parseCookies(request.headers.cookie)[cookieName];if(!token||!/^[A-Za-z0-9_-]{43}$/.test(token))return null;const user=db.prepare(`SELECT users.id,users.email,users.name,users.verified_at FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?`).get(digest(token),Date.now());return user||null;}
const attempts=new Map();
function canAttempt(ip){const now=Date.now();const bucket=attempts.get(ip)||{start:now,count:0};if(now-bucket.start>60000){bucket.start=now;bucket.count=0;}bucket.count++;attempts.set(ip,bucket);return bucket.count<=10;}
function clearAttempts(){for(const [ip,value] of attempts)if(Date.now()-value.start>60000)attempts.delete(ip);}
function addSession(db,userId,response){const token=randomBytes(32).toString("base64url");db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)").run(digest(token),userId,Date.now()+SESSION_AGE,Date.now());return `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_AGE/1000}`;}
export function createAuthServer({dbPath=resolve(".local","nexo-users.sqlite"),allowedOrigins=["http://127.0.0.1:5173","http://127.0.0.1:5174","http://localhost:5173","http://localhost:5174"]}={}){
 const db=initDb(dbPath);
 const timer=setInterval(()=>{db.prepare("DELETE FROM sessions WHERE expires_at<=?").run(Date.now());clearAttempts();},60000);timer.unref();
 const server=createServer(async(request,response)=>{const origin=request.headers.origin;const allow=origin&&allowedOrigins.includes(origin);const cors=allow?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Credentials":"true","Vary":"Origin"}:{};
  if(origin&&!allow){json(response,403,{error:"Origen no autorizado."});return;}
  if(request.method==="OPTIONS"){response.writeHead(204,{...cors,"Access-Control-Allow-Methods":"GET,POST,OPTIONS","Access-Control-Allow-Headers":"Content-Type"});response.end();return;}
  if(request.url==="/health"&&request.method==="GET"){json(response,200,{status:"ok"},cors);return;}
  if(!request.url?.startsWith("/auth/")){json(response,404,{error:"No existe esta ruta."},cors);return;}
  try{
   if(request.url==="/auth/me"&&request.method==="GET"){const user=sessionUser(db,request);json(response,user?200:401,user?{user}:{error:"Inicia sesión."},cors);return;}
   if(request.url==="/auth/logout"&&request.method==="POST"){const token=parseCookies(request.headers.cookie)[cookieName];if(token)db.prepare("DELETE FROM sessions WHERE token_hash=?").run(digest(token));json(response,200,{ok:true},{...cors,"Set-Cookie":`${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`});return;}
   if(request.method!=="POST"||!["/auth/register","/auth/login"].includes(request.url)){json(response,405,{error:"Método no permitido."},cors);return;}
   if(!String(request.headers["content-type"]||"").startsWith("application/json")){json(response,415,{error:"Envía JSON."},cors);return;}
   if(!canAttempt(request.socket.remoteAddress||"local")){json(response,429,{error:"Demasiados intentos. Espera un minuto."},cors);return;}
   const body=await readBody(request);const email=String(body.email||"").trim().toLowerCase();const password=String(body.password||"");
   if(email.length>254||!emailPattern.test(email)||password.length<12||password.length>128){json(response,400,{error:"Escribe un correo válido y una contraseña de 12 a 128 caracteres."},cors);return;}
   if(request.url==="/auth/register"){
    const name=String(body.name||"").trim();if(name.length<2||name.length>80){json(response,400,{error:"Escribe tu nombre (2 a 80 caracteres)."},cors);return;}
    if(db.prepare("SELECT id FROM users WHERE email=?").get(email)){json(response,409,{error:"El correo ya está registrado."},cors);return;}
    const id=randomBytes(16).toString("hex");const hash=await hashPassword(password);
    try{db.prepare("INSERT INTO users(id,email,name,password_hash,created_at) VALUES(?,?,?,?,?)").run(id,email,name,hash,Date.now());}catch(error){if(String(error).includes("UNIQUE")){json(response,409,{error:"El correo ya está registrado."},cors);return;}throw error;}
    json(response,201,{user:{id,email,name,verified_at:null},emailVerified:false},{...cors,"Set-Cookie":addSession(db,id,response)});return;
   }
   const record=db.prepare("SELECT id,email,name,verified_at,password_hash FROM users WHERE email=?").get(email);
   if(!record||!await verifyPassword(password,record.password_hash)){json(response,401,{error:"Correo o contraseña incorrectos."},cors);return;}
   const {password_hash:unused,...user}=record;json(response,200,{user},{...cors,"Set-Cookie":addSession(db,user.id,response)});
  }catch(error){json(response,error.status||500,{error:error.status?error.message:"No se pudo completar la solicitud."},cors);}
 });
 server.on("close",()=>{clearInterval(timer);db.close();});
 return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.NEXO_AUTH_PORT||8788);
 createAuthServer({dbPath:resolve(process.env.NEXO_DB_PATH||".local/nexo-users.sqlite")}).listen(port,"127.0.0.1",()=>console.log(`API local disponible en http://127.0.0.1:${port}`));
}
