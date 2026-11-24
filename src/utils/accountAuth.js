// All account entry points require a real Supabase session. No demo/local bypass.
export async function submitAccount(client,{mode,email,password,profile={},redirectTo}){
 const cleanEmail=String(email||'').trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))throw new Error('Enter a valid email address.');
 if(mode==='reset'){const {error}=await client.auth.resetPasswordForEmail(cleanEmail,{redirectTo});if(error)throw error;return {message:'If this email has an account, a recovery link will arrive shortly.'};}
 if(!password||password.length<(mode==='signup'?6:1))throw new Error(mode==='signup'?'Use a password with at least 6 characters.':'Enter your password.');
 const result=mode==='signup'?await client.auth.signUp({email:cleanEmail,password,options:{emailRedirectTo:redirectTo,data:profile}}):await client.auth.signInWithPassword({email:cleanEmail,password});
 if(result.error)throw result.error;
 const {user,session}=result.data||{};
 if(!session){if(mode==='signup')return {message:'Check your email to confirm your account, then sign in.'};throw new Error('Sign-in did not create a session. Please try again.');}
 if(!user||session.user?.id!==user.id)throw new Error('Your session could not be verified. Please sign in again.');
 const {data:saved,error}=await client.from('profiles').select('*').eq('id',user.id).maybeSingle();
 if(error)throw new Error('You signed in, but your profile could not be loaded. Please retry.');
 return {user:{id:user.id,email:user.email||cleanEmail,username:saved?.username||user.user_metadata?.username||cleanEmail.split('@')[0],displayName:saved?.display_name||user.user_metadata?.display_name||cleanEmail.split('@')[0],avatar:saved?.avatar_url||user.user_metadata?.avatar_url||'',bio:saved?.bio||user.user_metadata?.bio||'',favorites:saved?.favorites||[],equippedBorder:saved?.equipped_border||'none',bannerUrl:saved?.banner_url||'',featuredBadges:saved?.featured_badges||[],bannerFitMode:saved?.banner_fit_mode||'cover',bannerPosPercent:saved?.banner_pos_percent??20,spentCinePoints:saved?.spent_cine_points??0,purchasedBorders:saved?.purchased_borders||[],purchasedBadges:saved?.purchased_badges||[],purchasedBanners:saved?.purchased_banners||[],purchasedThemes:saved?.purchased_themes||[],triviaCinePoints:saved?.trivia_cine_points??0}};
}
