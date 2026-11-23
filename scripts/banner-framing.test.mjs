import test from 'node:test';
import assert from 'node:assert/strict';
import {bannerBounds,frameBanner} from '../src/utils/bannerFraming.js';

test('All bundled letterbox variants stay outside the visible cover at every focus',()=>{
 const sources=['curated/blade_runner_2049_orange_vegas_4k.png','curated/blade_runner_2049_joi_purple_4k.png','curated/blade_runner_2049_memory_facility_4k.png','curated/blade_runner_2049_snow_stairs_4k.png','curated/dune_arrakis_desert_2k.jpg','curated/heat_1995_la_heist_4k.jpg','stillslab/br2049_amber_1080p.webp','stillslab/dune2_desert_vista.webp'];
 for(const source of sources){
  const bounds=bannerBounds('/film_frames/'+source);
  assert.ok(bounds.top>0,source);
  for(const width of [280,350,680,1100])for(const focus of [0,17,47,85,100]){
   const frame=frameBanner(bounds,{width,height:170},'cover',focus);
   const height=Number(frame.size.split(',')[1].trim().split(' ')[1].replace('px',''));
   const top=Number(frame.position.split(',')[1].trim().split(' ')[1].replace('px',''));
   const scale=height/bounds.height;
   assert.ok(top+bounds.top*scale<=.001);
   assert.ok(top+(bounds.height-bounds.bottom)*scale>=169.999);
  }
 }
});
test('Dark scene content and user uploads are not automatically cropped',()=>{
 for(const url of ['/film_frames/stillslab/taxi_driver_neon_1080p.webp','/film_frames/stillslab/spidey_bnd_dusk_perch.webp','https://example.com/film_frames/curated/blade_runner_2049_orange_vegas_4k.png'])assert.deepEqual(bannerBounds(url,1200,600),{width:1200,height:600,top:0,bottom:0});
});
