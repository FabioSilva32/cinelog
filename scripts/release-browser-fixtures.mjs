export const viewerId='11111111-1111-4111-8111-111111111111',memberId='22222222-2222-4222-8222-222222222222';
export function createFixtures(){
 const profiles=[{id:viewerId,username:'release_viewer',display_name:'Release Viewer',avatar_url:'/profile-art/avatar-fox.svg',bio:'Local release test',banner_url:'/profile-art/cover-velvet.svg',banner_fit_mode:'cover',banner_pos_percent:30,equipped_border:'none',favorites:[],featured_badges:[]},{id:memberId,username:'release_member',display_name:'Release Member',avatar_url:'/profile-art/avatar-owl.svg',bio:'Another local viewer',banner_url:'/profile-art/cover-forest.svg',banner_fit_mode:'cover',banner_pos_percent:40,equipped_border:'silver',favorites:[],featured_badges:[]}];
 const film={id:'33333333-3333-4333-8333-333333333333',user_id:viewerId,tmdb_id:238,media_type:'movie',title:'The Godfather',poster_path:'/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',release_year:'1972',genres:['Drama','Crime'],status:'watched',rating:8.5,review:'Local release review.',favorite:false,date_added:'2026-11-01T12:00:00Z',tags:[]};
 const extraFilms=Array.from({length:24},(_,i)=>({...film,id:String(50000000+i)+'-5555-4555-8555-555555555555',tmdb_id:800000+i,title:'Release '+['Film','Series','Anime'][i%3]+' '+(i+1),media_type:['movie','tv','anime'][i%3],status:['watched','watching','plan_to_watch'][i%3],rating:i%3===2?null:Math.round((1+i%10)*10)/10,review:i%3===0?'A fixture review with enough detail.':'',favorite:i%5===0}));
 const list={id:'release-list',user_id:memberId,title:'Release collection',description:'A local test list',is_public:true,is_ranked:true,entries:[film],author_info:{id:memberId,username:'release_member',displayName:'Release Member',avatar:profiles[1].avatar_url},created_at:'2026-11-01T12:00:00Z',likes_count:0};
 const tables={profiles,library:[film,...extraFilms,{...film,id:'44444444-4444-4444-8444-444444444444',user_id:memberId,review:'SPOILER_FIXTURE_SECRET\n__EPISODE_DATA__:'+JSON.stringify({contains_spoilers:true})}],custom_lists:[list],follows:[],list_likes:[],review_likes:[],list_comments:[],tier_lists:[],activity_feed:[],user_notifications:[],user_badges:[]};
 const user={id:viewerId,aud:'authenticated',role:'authenticated',email:'viewer@example.test',user_metadata:{display_name:'Release Viewer'},created_at:'2026-01-01T00:00:00Z'};
 const token=Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url')+'.'+Buffer.from(JSON.stringify({sub:viewerId,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')+'.local-test-signature';
 const session={access_token:token,refresh_token:'local-only-refresh-token',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user};
 const writes=[],failures=new Set();
 const matches=(row,params)=>[...params].every(([key,value])=>{if(['select','order','limit','offset','or'].includes(key))return true;if(value.startsWith('ilike.'))return String(row[key]||'').toLowerCase()===value.slice(6).toLowerCase();if(value.startsWith('eq.'))return String(row[key])===value.slice(3);if(value.startsWith('neq.'))return String(row[key])!==value.slice(4);if(value.startsWith('in.('))return value.slice(4,-1).split(',').map(x=>x.replaceAll('"','')).includes(String(row[key]));return true;});
 function respond(request){const url=new URL(request.url),method=request.method;if(method==='OPTIONS')return {status:204,body:null};if(url.pathname.includes('/auth/v1/'))return {status:method==='DELETE'||url.pathname.endsWith('/logout')?204:200,body:url.pathname.endsWith('/token')?session:user};
 const table=url.pathname.split('/rest/v1/')[1]?.split('/')[0];if(!tables[table])return {status:404,body:{code:'42P01',message:'Fixture table missing'}};
 let rows=tables[table].filter(row=>matches(row,url.searchParams));if(method==='POST'||method==='PATCH'||method==='DELETE'){
  if(failures.has(table))return {status:403,body:{code:'42501',message:'Fixture save rejected'}};
  writes.push({table,method});const payload=request.postData?JSON.parse(request.postData):null;
  if(method==='POST'){const incoming=(Array.isArray(payload)?payload:[payload]).map(row=>({...row,id:row.id||crypto.randomUUID(),created_at:row.created_at||new Date().toISOString()}));tables[table].push(...incoming);rows=incoming;}
  if(method==='PATCH'){for(const row of rows)Object.assign(row,payload);}
  if(method==='DELETE'){tables[table]=tables[table].filter(row=>!rows.includes(row));}
 }
 if(table==='library')rows=rows.map(row=>({...row,profiles:profiles.find(p=>p.id===row.user_id)}));
 const accept=String(request.headers.Accept||request.headers.accept||'');return {status:200,body:method==='HEAD'?null:accept.includes('vnd.pgrst.object')?rows[0]||null:rows,headers:[{name:'Content-Range',value:rows.length?'0-'+(rows.length-1)+'/'+rows.length:'*/0'}]};
 }
 return {tables,user,session,writes,respond,failures};
}
