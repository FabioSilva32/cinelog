export const DEMO_USER_ID='b4a8e239-1b20-4a8f-8d9e-5c4d3e2f1a0b';
export const isUUID=id=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id||''));
export const followingKey=id=>`cinelog_following_ids:${id}`;
export async function persistFollow(client,userId,targetId,follow){
 if(!userId||userId===targetId)throw new Error('Choose another member to follow.');
 if(userId===DEMO_USER_ID||targetId===DEMO_USER_ID)return;
 if(!isUUID(userId)||!isUUID(targetId))throw new Error('Sign in to follow this member.');
 const result=follow?await client.from('follows').insert({follower_id:userId,following_id:targetId}):await client.from('follows').delete().eq('follower_id',userId).eq('following_id',targetId);
 if(result.error && !(follow && result.error.code==='23505'))throw new Error(result.error.message||'Could not update following.');
}
