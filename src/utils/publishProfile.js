const publicFields=['username','display_name','bio','avatar_url','favorites','equipped_border','banner_url','banner_fit_mode','banner_pos_percent','featured_badges'];
export async function publishProfile(client,userId,payload,{requiredFields=[]}={}){
 const write=fields=>client.from('profiles').update(fields).eq('id',userId).select('id').maybeSingle();
 let result=await write(payload);
 if(result.error && ['PGRST204','42703'].includes(result.error.code)){
  // Older schemas may lack shop fields; never drop the public banner on retry.
  const core=Object.fromEntries(publicFields.filter(key=>key in payload).map(key=>[key,payload[key]]));
  if(requiredFields.every(key=>key in core))result=await write(core);
 }
 if(result.error || !result.data){
  const missingSchema=['PGRST204','42703'].includes(result.error?.code);
  const message=missingSchema
   ? 'Your profile could not be published because the database is missing profile customization fields. The prepared profile migration must be applied before banners can be saved publicly.'
   : result.error?.code==='42501'
    ? 'Your profile could not be published because the server rejected the update. Please sign in again and retry.'
    : 'Your profile could not be published. The banner is not yet visible to other people. Please try again.';
  throw new Error(message,{cause:result.error});
 }
 return result.data;
}
