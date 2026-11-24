import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'vite';
const snapshot=JSON.parse(readFileSync(new URL('../src/data/franchiseCatalogues.json',import.meta.url)));
test('Franchise catalogues have stable typed identities and verified source metadata',()=>{
 for(const [id,c]of Object.entries(snapshot.collections)){
  assert.ok(c.sources.length>0,id);assert.ok(c.movies.length>0,id);
  const keys=c.movies.map(m=>m.media_type+':'+m.tmdb_id);
  assert.equal(keys.length,new Set(keys).size,id);
  for(const m of c.movies){assert.ok(m.title);assert.equal(typeof m.tmdb_id,'number');assert.ok(['movie','tv'].includes(m.media_type));assert.ok(!m.poster_path||m.poster_path.startsWith('/'));}
 }
});
test('Fast saga, MCU and Jurassic exclude unrelated titles and franchises',()=>{
 const fast=snapshot.collections.fast.movies;assert.equal(fast.find(m=>m.tmdb_id===9799)?.title,'The Fast and the Furious');assert.ok(fast.some(m=>m.title==='Fast Five'));assert.ok(!fast.some(m=>m.tmdb_id===238));
 const mcu=snapshot.collections.mcu.movies;for(const id of [1250,557,166424])assert.ok(!mcu.some(m=>m.media_type==='movie'&&m.tmdb_id===id));
 assert.ok(!snapshot.collections.jurassic.movies.some(m=>m.title.includes('Sherlock')));
 assert.deepEqual(snapshot.collections.jurassic.sources.filter(s=>s.type==='collection').map(s=>s.id),[328]);
 assert.ok(!snapshot.collections.marvel.movies.some(m=>/g\.i\. joe|muppet babies|transformers/i.test(m.title)));
});
test('Catalogue merge uses both type and ID, keeps personal data and correct artwork',async()=>{
 const server=await createServer({configFile:false,server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
 try{const {mergeCatalogue,newLibraryRow,rankCollections,byPopularity}=await server.ssrLoadModule('/src/utils/catalogue.js');
  const movies=[{tmdb_id:42,id:42,title:'Verified film',poster_path:'/film.jpg',media_type:'movie'},{tmdb_id:42,id:42,title:'Verified series',media_type:'tv'}];
  const own={id:'own-film',tmdb_id:42,title:'Old cached title',poster_path:'/wrong.jpg',media_type:'movie',status:'watched',rating:9.2,review:'Keep my review',favorite:true};
  const merged=mergeCatalogue(movies,[own]);assert.equal(merged[0].title,'Verified film');assert.equal(merged[0].poster_path,'/film.jpg');assert.equal(merged[0].review,own.review);assert.equal(merged[0].rating,9.2);assert.equal(merged[0].status,'watched');assert.equal(merged[0].id,'own-film');assert.equal(merged[1].inLibrary,false);assert.equal(merged[1].rating,null);
  const row=newLibraryRow({id:99,title:'Anime feature',media_type:'movie',genre_ids:[16],original_language:'ja'},'owner','plan_to_watch',{16:'Animation'},'new-id');assert.equal(row.user_id,'owner');assert.equal(row.media_type,'movie');assert.deepEqual(row.genres,['Animation']);assert.deepEqual(row.tags,['Anime']);assert.equal(row.status,'plan_to_watch');assert.equal(row.rating,null);
  assert.equal(rankCollections([{name:'Alien Sharks Collection'},{name:'Alien Collection'}],'Alien')[0].name,'Alien Collection');
  assert.equal(rankCollections([{name:'Fast Getaway Collection'},{name:'The Fast and the Furious Collection'}],'Fast & Furious')[0].name,'The Fast and the Furious Collection');
  assert.equal([{title:'High rating',popularity:2,vote_average:10},{title:'Popular',popularity:100,vote_average:5}].sort(byPopularity)[0].title,'Popular');
  const {FRANCHISE_COLLECTIONS}=await server.ssrLoadModule('/src/utils/collections.js');
  for(const f of FRANCHISE_COLLECTIONS)assert.ok(snapshot.collections[f.id],f.id);
  const fast=FRANCHISE_COLLECTIONS.find(f=>f.id==='fast');assert.equal(fast.matcher({tmdb_id:51497,media_type:'movie'}),true);assert.equal(fast.matcher({tmdb_id:238,media_type:'movie',title:'Fast Five'}),false);assert.equal(fast.matcher({tmdb_id:51497,media_type:'tv'}),false);
 }finally{await server.close();}
});
