// Wait for the owner-scoped server deletion before changing cached UI data.
export async function removeOwnedRecord(client,table,id,userId){
 if(!['custom_lists','list_comments'].includes(table)||!id||!userId)throw new Error('This item could not be removed. Please sign in and try again.');
 const {data,error}=await client.from(table).delete().eq('id',String(id)).eq('user_id',userId).select('id').maybeSingle();
 if(error||!data)throw new Error('This item could not be removed. It may be unavailable or you may not have permission. Please try again.',{cause:error});
 return true;
}
