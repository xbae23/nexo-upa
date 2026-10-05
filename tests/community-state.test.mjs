import test from 'node:test';
import assert from 'node:assert/strict';
import { seed, expire, dayKey } from '../lib/community-state.ts';
test('Una instalación nueva no inventa usuarios, fotos, mensajes ni actividad',()=>{
 const state=seed();for(const key of ['posts','stories','following','conversations','notifications'])assert.deepEqual(state[key],[]);
 assert.equal(state.profile.avatar,undefined);assert.equal(state.profile.phone,'');
});
test('La caducidad no revive Dumps y conserva la foto del perfil',()=>{
 const now=Date.now(),state=seed();state.profile.avatar='data:image/webp;base64,test';
 state.stories=[{id:'old',expiresAt:now},{id:'live',expiresAt:now+1000}];
 const next=expire(state,now);assert.deepEqual(next.stories.map(x=>x.id),['live']);assert.equal(next.profile.avatar,state.profile.avatar);
 assert.deepEqual(expire(next,now+1001).stories,[]);
});
test('Los mensajes nuevos no extienden la caducidad del primer mensaje',()=>{
 const now=Date.now(),state=seed();state.conversations=[{id:'one',firstMessageAt:now-7*86400000,messages:[{at:now-1,text:'nuevo'}],theme:'gris',pinned:true}];
 const next=expire(state,now);assert.equal(next.conversations[0].firstMessageAt,null);assert.deepEqual(next.conversations[0].messages,[]);assert.equal(next.conversations[0].pinned,true);
});
test('Notify y Reporte se renuevan por día en México, sin acumular',()=>{
 const now=Date.parse('2026-10-04T06:01:00Z'),state=seed();state.quota={day:dayKey(now-86400000),notify:2,reporte:1};
 assert.deepEqual(expire(state,now).quota,{day:dayKey(now),notify:0,reporte:0});
 state.quota.day=dayKey(now);assert.deepEqual(expire(state,now).quota,state.quota);
});
