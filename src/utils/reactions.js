// Cloud-first reactions: errors never become successful local likes.
export async function persistReaction(client,table,entityId,userId,liked){
 const column=table==='list_likes'?'list_id':table==='review_likes'?'library_id':null;
 if(!column||!entityId||!userId)throw new Error('Sign in to like this item.');
 const result=liked?await client.from(table).insert({[column]:String(entityId),user_id:userId}):await client.from(table).delete().eq(column,String(entityId)).eq('user_id',userId);
 if(result.error&&!(liked&&result.error.code==='23505'))throw new Error('Your reaction could not be saved. Please try again.',{cause:result.error});
 return liked;
}
