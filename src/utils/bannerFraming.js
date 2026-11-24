// Measured letterbox margins in the bundled cinema stills, not user uploads.
const cinema = ['blade_runner_2049_orange_vegas_4k.png','blade_runner_2049_joi_purple_4k.png','blade_runner_2049_memory_facility_4k.png','blade_runner_2049_snow_stairs_4k.png','heat_1995_la_heist_4k.jpg'];
export function bannerBounds(url,width,height){
 const name=url?.startsWith('/film_frames/')?url.split('?')[0].split('/').at(-1):undefined;
 if(cinema.includes(name)||name==='br2049_amber_1080p.webp')return {width:3840,height:2160,top:280,bottom:280};
 if(name==='dune_arrakis_desert_2k.jpg'||name==='dune2_desert_vista.webp')return {width:2560,height:1440,top:184,bottom:184};
 return {width,height,top:0,bottom:0};
}
export function frameBanner(bounds,box,fit,focus){
 const activeHeight=bounds.height-bounds.top-bounds.bottom;
 const scale=(fit==='contain'?Math.min:Math.max)(box.width/bounds.width,box.height/activeHeight);
 return {size:`100% 100%, ${bounds.width*scale}px ${bounds.height*scale}px`,position:`center, ${(box.width-bounds.width*scale)/2}px ${(box.height-activeHeight*scale)*focus/100-bounds.top*scale}px`,ratio:bounds.width/activeHeight};
}
