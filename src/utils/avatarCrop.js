// Match the displayed center-square crop to the pixels exported as the avatar.
export function avatarCropRect(width,height,crop={x:0,y:0,size:1}){
 const side=Math.min(width,height);if(!(side>0))throw Error('Image dimensions are invalid.');
 const size=Math.max(.01,Math.min(1,Number(crop.size)||1));const x=Math.max(0,Math.min(1-size,Number(crop.x)||0)),y=Math.max(0,Math.min(1-size,Number(crop.y)||0));
 return {x:(width-side)/2+x*side,y:(height-side)/2+y*side,size:size*side};
}
