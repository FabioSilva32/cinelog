// Curated starter collections are not member accounts or live social engagement.
const ids=new Set(['list-elena-35mm','list-cinelog-scifi','list-cinelog-neon-noir']);
export function presentEditorialList(list){if(!list||list.user_id||!ids.has(String(list.id)))return list;return {...list,isEditorial:true,likesCount:0,comments:[],author:{id:'cinelog-editorial',username:'cinelog_editorial',displayName:'CineLog Editorial',avatar:'/favicon.svg'}};}
