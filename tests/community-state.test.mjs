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
test('Mensajes, publicaciones y actividad caducan a los tres días sin borrar el perfil',()=>{
 const now=Date.now(),state=seed();state.profile.name='Nombre permanente';state.profile.avatar='data:image/webp;base64,test';
 state.posts=[{id:'old',createdAt:now-3*86400000},{id:'live',createdAt:now-3*86400000+1}];
 state.notifications=[{id:'old',at:now-3*86400000,postId:'old'},{id:'live',at:now-1,postId:'live'}];
 state.conversations=[{id:'old',createdAt:now-4*86400000,firstMessageAt:now-3*86400000,messages:[{at:now-1,text:'nuevo'}],theme:'gris'},{id:'live',createdAt:now-1,firstMessageAt:now-1,messages:[],theme:'verde'}];
 state.following=['antiguo','vigente'];state.followingAt={antiguo:now-3*86400000,vigente:now-1};
 const next=expire(state,now);
 assert.deepEqual(next.posts.map(x=>x.id),['live']);assert.deepEqual(next.notifications.map(x=>x.id),['live']);
 assert.deepEqual(next.conversations.map(x=>x.id),['live']);assert.deepEqual(next.following,['vigente']);
 assert.equal(next.profile.name,'Nombre permanente');assert.equal(next.profile.avatar,state.profile.avatar);
});
test('Notify y Reporte se renuevan por día en México, sin acumular',()=>{
 const now=Date.parse('2026-10-04T06:01:00Z'),state=seed();state.quota={day:dayKey(now-86400000),notify:2,reporte:1};
 assert.deepEqual(expire(state,now).quota,{day:dayKey(now),notify:0,reporte:0});
 state.quota.day=dayKey(now);assert.deepEqual(expire(state,now).quota,state.quota);
});
