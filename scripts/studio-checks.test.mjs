import test from 'node:test';
import assert from 'node:assert/strict';
import { getMediaType, knownRuntime, hasGenre } from '../src/utils/media.js';

test('preserves legacy series classification and anime tags', () => {
  assert.equal(getMediaType({details:{number_of_seasons:2}}),'tv');
  assert.equal(getMediaType({type:'tv'}),'tv');
  assert.equal(getMediaType({media_type:'movie',tags:['Anime']}),'anime');
  assert.equal(getMediaType({genres:['Animation'],origin_country:['JP']}),'anime');
  assert.equal(getMediaType({genres:['Animation'],origin_country:['US']}),'movie');
});
test('unknown and invalid runtimes are not invented or assigned to duration buckets', () => {
  for(const value of [undefined,0,-5,'bad',Infinity]) assert.equal(knownRuntime({runtime:value}),null);
  assert.equal(knownRuntime({runtime:169}),169);
  assert.equal(knownRuntime({episode_run_time:[45]}),45);
});
test('genre challenges accept TMDB and legacy science fiction names', () => {
  assert.equal(hasGenre({genres:['Science Fiction']},'Sci-Fi'),true);
  assert.equal(hasGenre({genres:['Sci-Fi']},'Science Fiction'),true);
  assert.equal(hasGenre({genres:['Drama']},'Sci-Fi'),false);
});
test('classifying imported records does not mutate saved data', () => {
  const movie=Object.freeze({media_type:'movie',runtime:142,genres:Object.freeze(['Science Fiction']),screenings:Object.freeze([{date:'2026-10-12',rating:9.9}])});
  const before=JSON.stringify(movie);
  getMediaType(movie);knownRuntime(movie);hasGenre(movie,'Sci-Fi');
  assert.equal(JSON.stringify(movie),before);
});

import { localDateKey } from '../src/utils/dates.js';
test('local calendar dates remain unique across Lisbon daylight-saving transitions', () => {
  for (const month of [2,9]) {
    const keys=[];
    const current=new Date(2026,month,25);
    for(let day=0;day<10;day++){keys.push(localDateKey(current));current.setDate(current.getDate()+1);}
    assert.equal(new Set(keys).size,10);
    assert.equal(keys[0],`2026-${String(month+1).padStart(2,'0')}-25`);
  }
});

import { groupLibraryByMedia } from '../src/utils/media.js';
test('Split view partitions mixed and legacy media once without changing saved records', () => {
  const titles=[{id:'a',media_type:'movie'},{id:'b',media_type:'tv'},{id:'c',tags:['Anime']},{id:'d',genres:['Animation'],origin_country:['JP']},{id:'e',number_of_seasons:2}];
  const before=JSON.stringify(titles);
  const groups=groupLibraryByMedia(titles);
  assert.deepEqual(groups.movie.map(m=>m.id),['a']);
  assert.deepEqual(groups.tv.map(m=>m.id),['b','e']);
  assert.deepEqual(groups.anime.map(m=>m.id),['c','d']);
  assert.equal(Object.values(groups).flat().length,titles.length);
  assert.equal(JSON.stringify(titles),before);
  assert.equal(groups.movie[0],titles[0]);
});
import { readHistoryDestination } from '../src/utils/navigation.js';
test('Back and Forward restore their own profile destination and base tab', () => {
  const user={id:'sample',username:'A name'};
  assert.deepEqual(readHistoryDestination('http://localhost/?tab=social#user-A%20name',{tab:'social',targetUser:user}),{tab:'social',sub:'overview',modal:'user',target:user,mediaType:undefined});
  assert.equal(readHistoryDestination('http://localhost/?tab=collections',{modal:'user_profile',targetUser:user}).modal,null);
  assert.equal(readHistoryDestination('http://localhost/?tab=social').tab,'social');
});
test('movie history preserves media type, object data and profile subtab', () => {
  const movie={tmdb_id:123,media_type:'tv',screenings:[{rating:8}]};
  const destination=readHistoryDestination('http://localhost/?tab=profile&sub=reviews#movie-123',{movie,mediaType:'tv'});
  assert.equal(destination.target,movie);assert.equal(destination.mediaType,'tv');assert.equal(destination.sub,'reviews');
  assert.equal(readHistoryDestination('http://localhost/#movie-123').target,'123');
});
test('malformed profile names do not break history restoration', () => {
  assert.equal(readHistoryDestination('http://localhost/#user-%broken').target.username,'%broken');
});
import { initialWatchDate } from '../src/utils/dates.js';
test('editing legacy screenings keeps their actual latest date', () => {
  const movie={status:'watched',screenings:[{date:'2026-10-16'},{date:'2026-10-10'}]};
  const before=JSON.stringify(movie);
  assert.equal(initialWatchDate(movie,'2026-11-13'),'2026-10-16');
  assert.equal(initialWatchDate({episode_data:{screenings:[{date:'2024-04-02'}]}},'2026-11-13'),'2024-04-02');
  assert.equal(initialWatchDate({status:'watched',date_added:'2023-05-06T10:00:00Z'},'2026-11-13'),'2023-05-06');
  assert.equal(initialWatchDate({status:'plan_to_watch'},'2026-11-13'),'2026-11-13');
  assert.equal(JSON.stringify(movie),before);
});
import { pagePath,profilePath,filmPath,canonicalPath } from '../src/utils/navigation.js';
import { persistFollow,followingKey,DEMO_USER_ID } from '../src/utils/following.js';
test('clean page URLs are canonical and preserve public profiles on refresh',()=>{
 assert.equal(pagePath('library'),'/library');assert.equal(pagePath('social'),'/community');assert.equal(pagePath('profile','shop'),'/profile/extras');
 const fresh=readHistoryDestination('http://localhost/u/Lynnx');assert.equal(fresh.tab,'profile');assert.equal(fresh.modal,'user');assert.equal(fresh.target.username,'Lynnx');
 assert.equal(canonicalPath(fresh),'/u/Lynnx');assert.equal(profilePath('a name'),'/u/a%20name');
 assert.equal(canonicalPath(readHistoryDestination('http://localhost/?tab=tierlist')),'/tier-lists');
 assert.equal(readHistoryDestination('http://localhost/library',{tab:'social'}).tab,'library');
 assert.equal(readHistoryDestination('http://localhost/profile/extras').sub,'shop');
 assert.equal(filmPath(123,'tv'),'/film/tv/123');assert.equal(readHistoryDestination('http://localhost/film/tv/123').mediaType,'tv');
});
test('follow persistence surfaces server failures and tolerates an existing relationship',async()=>{
 const owner='11111111-1111-4111-8111-111111111111',target='22222222-2222-4222-8222-222222222222';
 const client={from:()=>({insert:async()=>({error:{message:'Policy denied',code:'42501'}})})};
 await assert.rejects(()=>persistFollow(client,owner,target,true),/Policy denied/);
 await persistFollow({from:()=>({insert:async()=>({error:{code:'23505'}})})},owner,target,true);
 await assert.rejects(()=>persistFollow(client,owner,owner,true),/another member/);
 assert.notEqual(followingKey(owner),followingKey(target));
});
test('demo following remains local and unfollow is scoped to both members',async()=>{
 await persistFollow({from:()=>{throw new Error('Demo must never write to the server');}},DEMO_USER_ID,'22222222-2222-4222-8222-222222222222',true);
 const filters=[];const chain={eq:(column,value)=>{filters.push([column,value]);return chain;},then:resolve=>Promise.resolve(resolve({error:null}))};
 await persistFollow({from:()=>({delete:()=>chain})},'11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222',false);
 assert.deepEqual(filters.map(f=>f[0]),['follower_id','following_id']);
});
import { readableReview } from '../src/utils/reviews.js';
test('social reviews hide stored episode metadata while retaining the written review',()=>{
 assert.equal(readableReview('A great ending. __EPISODE_DATA__:{"screenings":[]}'),'A great ending.');
 assert.equal(readableReview('__EPISODE_RATINGS__:{"1":8}'),'');assert.equal(readableReview(null),'');
});
import { isAuthCallbackURL } from '../src/utils/navigation.js';
test('routing leaves authentication callback parameters intact for Supabase',()=>{
 assert.equal(isAuthCallbackURL('http://localhost/?code=sample'),true);
 assert.equal(isAuthCallbackURL('http://localhost/#access_token=sample&type=recovery'),true);
 assert.equal(isAuthCallbackURL('http://localhost/?token_hash=sample&type=recovery'),true);
 assert.equal(isAuthCallbackURL('http://localhost/library'),false);
});
import { listPath,franchisePath } from '../src/utils/navigation.js';
test('list and franchise pages retain their exact entity on direct loads',()=>{
 const list=readHistoryDestination('http://localhost'+listPath('list-user-123'));assert.equal(list.tab,'collections');assert.deepEqual(list.entity,{kind:'list',id:'list-user-123'});assert.equal(canonicalPath(list),'/lists/list-user-123');
 const franchise=readHistoryDestination('http://localhost'+franchisePath('star-wars'));assert.equal(franchise.entity.kind,'franchise');assert.equal(franchise.entity.id,'star-wars');
});
import { canViewCachedList } from '../src/utils/navigation.js';
test('private cached lists never become visible to anonymous or other accounts',()=>{
 assert.equal(canViewCachedList({isPublic:false},undefined),false);
 assert.equal(canViewCachedList({isPublic:false,author:{id:'owner'}},'other'),false);
 assert.equal(canViewCachedList({isPublic:false,author:{id:'owner'}},'owner'),true);
 assert.equal(canViewCachedList({isPublic:true},undefined),true);
});
import { ownBannerUrl } from '../src/utils/profileBanner.js';
test('banners are isolated per account and an explicit removal remains empty',()=>{
 const storage={getItem:key=>({'cinelog_banner_url_owner':'owner.jpg','cinelog_banner_url':'someone-else.jpg'}[key]??null)};
 assert.equal(ownBannerUrl({},'owner',storage),'owner.jpg');
 assert.equal(ownBannerUrl({},'other',storage),'');
 assert.equal(ownBannerUrl({banner_url:''},'owner',storage,{bannerUrl:'old.jpg'}),'');
 assert.equal(ownBannerUrl({banner_url:'public.jpg'},'owner',storage),'public.jpg');
});
import { publishProfile } from '../src/utils/publishProfile.js';
function profileClient(results,writes){return {from:()=>({update:payload=>{writes.push(payload);return {eq:()=>({select:()=>({maybeSingle:async()=>results.shift()})})};}})};}
test('public profile publishing preserves banner fields when retrying an older schema',async()=>{
 const writes=[];const payload={username:'member',banner_url:'https://example.com/banner.jpg',banner_fit_mode:'contain',banner_pos_percent:35,purchased_themes:[]};
 await publishProfile(profileClient([{error:{code:'PGRST204'}},{data:{id:'member'},error:null}],writes),'member',payload);
 assert.equal(writes.length,2);assert.equal(writes[1].banner_url,payload.banner_url);assert.equal(writes[1].banner_fit_mode,'contain');assert.equal(writes[1].banner_pos_percent,35);
 assert.equal('purchased_themes' in writes[1],false);
});
test('public profile publishing never reports success for rejected or zero-row saves',async()=>{
 await assert.rejects(()=>publishProfile(profileClient([{error:{code:'42501'}}],[]),'member',{banner_url:'banner.jpg'}),/could not be published/);
 await assert.rejects(()=>publishProfile(profileClient([{data:null,error:null}],[]),'member',{banner_url:'banner.jpg'}),/could not be published/);
 const writes=[];await publishProfile(profileClient([{data:{id:'member'},error:null}],writes),'member',{banner_url:''});assert.equal(writes[0].banner_url,'');
});


test('missing public banner schema is reported without pretending a local save was published',async()=>{
 const writes=[];
 await assert.rejects(()=>publishProfile(profileClient([{error:{code:'PGRST204'}},{error:{code:'42703',message:'column banner_url does not exist'}}],writes),'member',{banner_url:'public.jpg',banner_fit_mode:'cover'}),/database is missing profile customization fields/);
 assert.equal(writes.length,2);assert.equal(writes[1].banner_url,'public.jpg');
});


import {getProfileRewards} from '../src/utils/profileRewards.js';
import {libraryForViewingYear,viewingYears} from '../src/utils/viewingYear.js';
test('extracted profile rewards retain purchased borders and points without changing saved records',()=>{
 const library=Object.freeze([Object.freeze({status:'watched',review:'A thoughtful film.',favorite:true,genres:[]})]);
 const user=Object.freeze({purchasedBorders:Object.freeze(['noir']),purchasedBadges:Object.freeze(['VIP Cinephile']),spentCinePoints:5,triviaCinePoints:7});
 const before=JSON.stringify({library,user});const rewards=getProfileRewards(library,user);
 assert.equal(rewards.cinePoints,27);assert.equal(rewards.unlockedBorders.has('noir'),true);assert.equal(rewards.unlockedBadges.includes('VIP Cinephile'),true);assert.equal(JSON.stringify({library,user}),before);
});
test('year in film uses screening dates and rewatches rather than the import year',()=>{
 const films=[{id:'old',status:'watched',date_added:'2026-11-15',watch_date:'2024-05-01'},{id:'rewatch',status:'watched',watch_date:'2023-01-02',screenings:[{date:'2025-11-01'}]},{id:'legacy',date_added:'2025-04-03'},{id:'unknown'}];
 assert.deepEqual(libraryForViewingYear(films,2025).map(m=>m.id),['rewatch','legacy']);assert.equal(libraryForViewingYear(films,2026).length,0);assert.deepEqual(viewingYears(films,2026),[2026,2025,2024,2023]);
});
test('a missing cosmetic column never turns a purchase into a successful partial profile save',async()=>{
 const writes=[];await assert.rejects(()=>publishProfile(profileClient([{error:{code:'PGRST204'}}],writes),'member',{banner_url:'banner.jpg',purchased_borders:['noir']},{requiredFields:['purchased_borders']}),/database is missing/);assert.equal(writes.length,1);
});


import {SIGNATURE_COVERS,SIGNATURE_AVATARS} from '../src/utils/profileCatalog.js';
import {ACHIEVEMENTS} from '../src/utils/achievements.js';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
test('new signature artwork has unique stable selections and shipped local assets',()=>{
 for(const collection of [SIGNATURE_COVERS,SIGNATURE_AVATARS]){assert.ok(collection.length>=6);assert.equal(new Set(collection.map(item=>item.id)).size,collection.length);for(const item of collection){assert.ok(item.name);assert.ok(existsSync(fileURLToPath(new URL('../public'+item.url,import.meta.url))));}}
});
test('new included frames do not remove earned borders or grant unearned badges',()=>{
 const rewards=getProfileRewards([],{});for(const frame of ['ruby-halo','silverline','gilt'])assert.equal(rewards.unlockedBorders.has(frame),true);assert.equal(rewards.unlockedBadges.includes('Opening Frame'),false);
 const watched=[{status:'watched',genres:[],screenings:[{date:'2024-01-01'},{date:'2024-02-01'}]}];const earned=getProfileRewards(watched,{});assert.equal(earned.unlockedBadges.includes('Opening Frame'),true);assert.equal(earned.unlockedBadges.includes('Encore'),true);assert.equal(earned.unlockedBadges.includes('Personal Canon'),false);assert.equal(new Set(ACHIEVEMENTS.map(item=>item.id)).size,ACHIEVEMENTS.length);
});


import {removeOwnedRecord} from '../src/utils/removeOwnedRecord.js';
import {decodeTierTransfer} from '../src/utils/tierTransfer.js';
test('destructive list actions are owner-scoped and rejected deletions stay failures',async()=>{
 const filters=[];const chain={eq:(key,value)=>{filters.push([key,value]);return chain;},select:()=>({maybeSingle:async()=>({data:{id:'list-1'},error:null})})};
 await removeOwnedRecord({from:()=>({delete:()=>chain})},'custom_lists','list-1','owner');assert.deepEqual(filters,[['id','list-1'],['user_id','owner']]);
 const denied={from:()=>({delete:()=>({eq(){return this},select:()=>({maybeSingle:async()=>({data:null,error:{message:'Denied'}})})})})};
 await assert.rejects(()=>removeOwnedRecord(denied,'custom_lists','list-1','owner'),/could not be removed/);await assert.rejects(()=>removeOwnedRecord(denied,'profiles','owner','owner'),/could not be removed/);
});
test('tier transfer validation rejects malformed payloads before replacement',()=>{
 const pack={default:{name:'My tiers',tiers:[{id:'s',label:'S'}],tierData:{s:['movie-1']}}};const code=btoa(unescape(encodeURIComponent(JSON.stringify(pack))));assert.deepEqual(decodeTierTransfer(code),pack);
 for(const value of ['broken',btoa('[]'),btoa('{}'),btoa('{"default":{"tiers":"wrong"}}'),btoa('{"__proto__":{}}'),btoa('{"default":{"tiers":[null]}}'),btoa('{"default":{"tierData":{"s":"wrong"}}}')])assert.throws(()=>decodeTierTransfer(value));
});


import {profileDraftFingerprint} from '../src/utils/profileDraft.js';
test('profile discard checks ignore search controls but detect published fields and badge order',()=>{
 const base={username:'viewer',bannerPosPercent:20,featuredBadges:['Opening Frame','Encore'],favorites:[{id:'1',tmdb_id:10,media_type:'movie'},null]};
 assert.equal(profileDraftFingerprint(base),profileDraftFingerprint({...base,bannerPosPercent:'20',presetSearchQuery:'a search',favorites:[{id:'different-local-id',tmdb_id:10,media_type:'movie'}]}));
 assert.notEqual(profileDraftFingerprint(base),profileDraftFingerprint({...base,bannerPosPercent:80}));assert.notEqual(profileDraftFingerprint(base),profileDraftFingerprint({...base,featuredBadges:['Encore','Opening Frame']}));
});


import {listDraftFingerprint} from '../src/utils/listDraft.js';
test('list editing tracks identity, order and visibility without treating title metadata as a film replacement',()=>{
 const draft={title:'Favorites',description:'My films',isRanked:true,isPublic:false,entries:[{id:'local-1',tmdb_id:10},{id:'local-2',tmdb_id:20}]};
 assert.equal(listDraftFingerprint(draft),listDraftFingerprint({...draft,entries:[{id:'new-local-1',tmdb_id:10,title:'Updated film metadata'},{id:'new-local-2',tmdb_id:20}]}));
 assert.notEqual(listDraftFingerprint(draft),listDraftFingerprint({...draft,isPublic:true}));assert.notEqual(listDraftFingerprint(draft),listDraftFingerprint({...draft,entries:[...draft.entries].reverse()}));
});


import {loadScreeningDetails,selectTrailer,tmdbMediaType} from '../src/utils/screeningDetails.js';
const trailer=(key='abcdefghijk',language='en',type='Trailer')=>({key,site:'YouTube',type,official:true,iso_639_1:language});
function screeningApi(routes,calls=[]){return async url=>{const path=new URL(url).pathname.replace('/3/','');calls.push(path);const data=routes[path];return {ok:data!==undefined&&data!==false,json:async()=>data===false?{}:data};};}
test('legacy anime resolves the correct TV namespace without changing the library category',async()=>{
 const movie=Object.freeze({tmdb_id:42,title:'JUJUTSU KAISEN',media_type:'anime',release_year:'2020',poster_path:'/anime.jpg'});const before=JSON.stringify(movie);
 const result=await loadScreeningDetails(movie,{apiKey:'test',fetchImpl:screeningApi({'tv/42':{id:42,name:'Jujutsu Kaisen',first_air_date:'2020-10-03',overview:'Series story',poster_path:'/anime.jpg',videos:{results:[trailer()]}},'movie/42':{id:42,title:'An unrelated movie',release_date:'1980-01-01',overview:'Wrong story'}})});
 assert.equal(result.mediaType,'tv');assert.equal(result.details.overview,'Series story');assert.equal(result.trailer.key,'abcdefghijk');assert.equal(getMediaType(movie),'anime');assert.equal(JSON.stringify(movie),before);
});
test('anime films stay films even when a TV record shares the same numeric ID',async()=>{
 const movie={tmdb_id:129,title:'Spirited Away',media_type:'anime',release_year:'2001'};const result=await loadScreeningDetails(movie,{apiKey:'test',fetchImpl:screeningApi({'tv/129':{id:129,name:'Different series',first_air_date:'1990-01-01',overview:'Other'},'movie/129':{id:129,title:'Spirited Away',release_date:'2001-07-20',overview:'Film story',videos:{results:[trailer()]}}})});assert.equal(result.mediaType,'movie');assert.equal(tmdbMediaType({media_type:'movie',tags:['Anime']}),'movie');
});
test('partial cached details do not prevent fresh synopsis and video requests',async()=>{
 const calls=[];const result=await loadScreeningDetails({id:5,title:'A film',media_type:'movie',details:{id:5,title:'A film'}},{apiKey:'test',fetchImpl:screeningApi({'movie/5':{id:5,title:'A film',overview:'Fresh story',videos:{results:[trailer()]}}},calls)});assert.ok(calls.includes('movie/5'));assert.equal(result.details.overview,'Fresh story');assert.ok(result.trailer);
});
test('Japanese season teasers and translated synopses fill otherwise empty series data',async()=>{
 const result=await loadScreeningDetails({id:7,title:'Anime',media_type:'tv'},{apiKey:'test',fetchImpl:screeningApi({'tv/7':{id:7,name:'Anime',overview:'',original_language:'ja',videos:{results:[]},seasons:[{season_number:0},{season_number:1}]},'tv/7/videos':{results:[]},'tv/7/season/1/videos':{results:[trailer('ABCDEFGHIJK','ja','Teaser')]},'tv/7/translations':{translations:[{iso_639_1:'ja',data:{overview:'Original-language synopsis'}}]}})});assert.equal(result.trailer.type,'Teaser');assert.equal(result.overviewLanguage,'ja');assert.equal(result.details.overview,'Original-language synopsis');assert.equal(result.partialFailure,false);
});
test('empty provider data is distinguished from failed video requests',async()=>{
 const base={'movie/8':{id:8,title:'No videos',overview:'A story'},'movie/8/videos':{results:[]}};const empty=await loadScreeningDetails({id:8,title:'No videos'},{apiKey:'test',fetchImpl:screeningApi(base)});assert.equal(empty.trailer,null);assert.equal(empty.partialFailure,false);const failed=await loadScreeningDetails({id:8,title:'No videos'},{apiKey:'test',fetchImpl:screeningApi({...base,'movie/8/videos':false})});assert.equal(failed.partialFailure,true);
});
test('trailer selection prefers supported English trailers and never presents clips as trailers',()=>{
 const videos=[trailer('ABCDEFGHIJK','ja'),trailer(),{...trailer('12345678901'),type:'Clip'}];assert.equal(selectTrailer(videos).key,'abcdefghijk');assert.equal(selectTrailer([{...trailer(),type:'Clip'}]),null);assert.equal(videos.length,3);
});
test('aborted detail requests stop instead of starting fallback requests',async()=>{
 let calls=0;await assert.rejects(()=>loadScreeningDetails({id:1,title:'A film'},{apiKey:'test',fetchImpl:async()=>{calls++;throw new DOMException('Aborted','AbortError');}}),{name:'AbortError'});assert.equal(calls,1);
});


import {mediaLabel} from '../src/utils/mediaLabel.js';
test('poster metadata distinguishes anime films and series without labeling live action as anime',()=>{
 assert.equal(mediaLabel({media_type:'movie',release_date:'2026-01-01'}),'Film');assert.equal(mediaLabel({name:'A series',first_air_date:'2026-01-01'}),'Series');
 assert.equal(mediaLabel({media_type:'tv',genre_ids:[16],original_language:'ja'}),'Anime series');assert.equal(mediaLabel({media_type:'movie',genres:[{id:16,name:'Animation'}],original_language:'ja'}),'Anime film');
 assert.equal(mediaLabel({media_type:'movie',genre_ids:[16],original_language:'en'}),'Film');assert.equal(mediaLabel({media_type:'tv',genre_ids:[18],original_language:'ja'}),'Series');assert.equal(mediaLabel({media_type:'anime'}),'Anime');
});

test('quick status edits preserve reviews, scores and screening history',async()=>{const {withViewingStatus}=await import('../src/utils/quickStatus.js');const screenings=[{date:'2026-10-02',rating:8}];const movie={id:'saved',status:'watching',rating:8.5,review:'Keep this',episode_data:{screenings,ratings:{1:9}}};const next=withViewingStatus(movie,'watched','2026-11-17');assert.equal(next.watch_date,'2026-10-02');assert.equal(next.review,movie.review);assert.equal(next.rating,8.5);assert.deepEqual(next.episode_data,movie.episode_data);assert.equal(movie.status,'watching');assert.equal(withViewingStatus(next,'plan_to_watch').watch_date,'2026-10-02');assert.throws(()=>withViewingStatus(movie,'invalid'));});

test('brand rating colors apply to standard tiers while custom rows retain their choice',async()=>{const {tierDisplayColor}=await import('../src/utils/ratingColors.js');assert.equal(tierDisplayColor({id:'s',label:'S',color:'#ff4d4d'}),'#ff3554');assert.equal(tierDisplayColor({id:'a',label:'A',color:'#ff8c00'}),'#bd5cff');assert.equal(tierDisplayColor({id:'s',label:'My favorites',color:'#ff4d4d'}),'#ff4d4d');assert.equal(tierDisplayColor({id:'custom',label:'S+',color:'#123456'}),'#123456');assert.equal(tierDisplayColor({id:'s',label:'S',color:'#abcdef'}),'#abcdef');});

test('tier moves insert at the preview index without losing or duplicating titles',async()=>{const {moveTierPoster,tierInsertionIndex}=await import('../src/utils/tierOrdering.js');const original={s:['1','2','3'],a:['4']};assert.deepEqual(moveTierPoster(original,'3','s',0),{s:['3','1','2'],a:['4']});assert.deepEqual(moveTierPoster(original,'1','s',2),{s:['2','3','1'],a:['4']});assert.deepEqual(moveTierPoster(original,'2','a',0),{s:['1','3'],a:['2','4']});assert.deepEqual(moveTierPoster(original,'5','a',1),{s:['1','2','3'],a:['4','5']});assert.deepEqual(original,{s:['1','2','3'],a:['4']});const rects=[{left:0,top:0,bottom:150,width:100},{left:110,top:0,bottom:150,width:100},{left:0,top:160,bottom:310,width:100}];assert.equal(tierInsertionIndex(rects,20,60),0);assert.equal(tierInsertionIndex(rects,180,60),2);assert.equal(tierInsertionIndex(rects,20,180),2);assert.equal(tierInsertionIndex(rects,180,180),3);});

test('personal score colors separate low scores and retain the upper rating bands',async()=>{const {ratingTone,getRatingColor}=await import('../src/utils/ratingColors.js');for(const [score,tone]of [[1,'poor'],[1.9,'poor'],[2,'low'],[3.9,'low'],[4,'mixed'],[5.9,'mixed'],[6,'good'],[7.9,'good'],[8,'excellent'],[8.9,'excellent'],[9,'perfect'],[9.9,'perfect'],[10,'perfect']])assert.equal(ratingTone(score),tone);assert.notEqual(getRatingColor(8),getRatingColor(9));assert.equal(getRatingColor(9),getRatingColor(10));});

test('yearbook aggregates numeric scores and counts a title once per recorded month',async()=>{const {yearJournal}=await import('../src/utils/yearJournal.js');const movie={id:'one',status:'watched',rating:'9',runtime:120,genres:[{name:'Drama'}],watch_date:'2026-02-04',screenings:[{date:'2026-01-01'},{date:'2026-01-20'},{date:'2025-12-01'}],review:'A favorite'};const result=yearJournal([movie,{id:'two',status:'watched',rating:'7',runtime:90,genres:['Drama'],watch_date:'2026-02-01'},{id:'planned',status:'plan_to_watch',date_added:'2026-01-01'}],2026);assert.equal(result.watched.length,2);assert.equal(result.average,'8.0');assert.equal(result.hours,4);assert.deepEqual(result.months.slice(0,3),[1,2,0]);assert.deepEqual(result.genres,[['Drama',2]]);assert.equal(result.reviews.length,1);assert.equal(result.highest[0].id,'one');assert.equal(movie.rating,'9');});

test('film locator centers its selected star and keeps movie identities distinct',async()=>{const {mapMovieKey,starFocusCamera}=await import('../src/utils/mapFocus.js');const star={x:145,y:80};const camera=starFocusCamera(star,800,500);assert.equal(star.x*camera.scale+camera.x,400);assert.equal(star.y*camera.scale+camera.y,250);assert.notEqual(mapMovieKey({tmdb_id:1,media_type:'tv'}),mapMovieKey({tmdb_id:1,media_type:'movie'}));assert.equal(mapMovieKey({id:'saved-record',tmdb_id:1}),'saved-record');});

test('map wheel zoom preserves the point under the cursor and clamps its scale',async()=>{const {zoomMapAt}=await import('../src/utils/mapFocus.js');const camera={x:30,y:-20,scale:2};const next=zoomMapAt(camera,300,200,-100);assert.ok(next.scale>2);assert.ok(Math.abs((300-next.x)/next.scale-(300-camera.x)/camera.scale)<1e-9);assert.ok(Math.abs((200-next.y)/next.scale-(200-camera.y)/camera.scale)<1e-9);assert.equal(zoomMapAt(camera,0,0,-100000).scale,5);assert.equal(zoomMapAt(camera,0,0,100000).scale,.6);});

test('fit camera centers sparse director groups and pan preserves zoom',async()=>{const {fitMapCamera,panMapCamera}=await import('../src/utils/mapFocus.js');const stars=[{x:80,y:60,size:10},{x:150,y:120,size:10}];const fitted=fitMapCamera(stars,900,600);assert.equal(fitted.scale,3);for(const star of stars){const x=star.x*fitted.scale+fitted.x,y=star.y*fitted.scale+fitted.y;assert.ok(x>=44&&x<=856);assert.ok(y>=44&&y<=556);}assert.deepEqual(panMapCamera(fitted,100,-25),{scale:fitted.scale,x:fitted.x+100,y:fitted.y-25});assert.deepEqual(fitMapCamera([],900,600),{x:0,y:0,scale:1});});


test('taste map groups each title once per genre and filters favorites and progress',async()=>{const {tasteMapData}=await import('../src/utils/tasteMap.js');const library=[{id:'one',title:'First',genres:['Drama','Drama',{name:'Science Fiction'}],status:'watched',rating:'8',favorite:true},{id:'two',title:'Second',genres:['Drama'],status:'watching',rating:6},{id:'three',title:'Third',genres:[],status:'plan_to_watch',is_favorite:true}];const data=tasteMapData(library);assert.equal(data.groups.find(g=>g.name==='Drama').count,2);assert.equal(data.groups.find(g=>g.name==='Drama').average,'7.0');assert.equal(data.groups.find(g=>g.name==='Sci-Fi').count,1);assert.equal(data.groups.find(g=>g.name==='Uncategorised').count,1);assert.equal(tasteMapData(library,'favorites').movies.length,2);assert.equal(tasteMapData(library,'watching').movies[0].id,'two');assert.equal(tasteMapData(library,'all','first').movies.length,1);assert.equal(tasteMapData(library,'all','missing').groups.length,0);assert.equal(library[0].rating,'8');});

test('collectible frames unlock through their milestones without granting the creator seal',()=>{const ids=['orbit-voyager','noir-raven','critics-quill','dragon-screen','archive-reel','festival-wreath'];const empty=getProfileRewards([],{id:'ordinary-viewer'});for(const id of ids)assert.equal(empty.unlockedBorders.has(id),false);const library=Array.from({length:60},(_,i)=>({status:'watched',release_year:1950+Math.floor(i/10)*10,genres:['Science Fiction','Thriller','Fantasy'],review:'A'.repeat(210)}));const before=JSON.stringify(library);const earned=getProfileRewards(library,{id:'ordinary-viewer'});for(const id of ids)assert.equal(earned.unlockedBorders.has(id),true,id);assert.equal(earned.unlockedBorders.has('creator'),false);assert.equal(JSON.stringify(library),before);for(const id of ['iris','moon','frame','peak','reel','spark'])assert.ok(SIGNATURE_AVATARS.some(item=>item.id===id));});

test('new volume-two frames are earned without changing existing ownership',()=>{const library=Array.from({length:20},(_,i)=>({status:'watched',release_year:1970,genres:['Science Fiction','Adventure','Animation']}));const user={id:'viewer',purchasedBorders:['noir-etch']};const before=JSON.stringify(user);const rewards=getProfileRewards(library,user);for(const id of ['lunar-archivist','tidebound','velvet-marquee','paper-crane']){assert.equal(getProfileRewards([],user).unlockedBorders.has(id),false);assert.equal(rewards.unlockedBorders.has(id),true,id);}assert.equal(rewards.unlockedBorders.has('noir-etch'),true);assert.equal(rewards.unlockedBorders.has('creator'),false);assert.equal(JSON.stringify(user),before);});

test('previous standard green/blue tiers adopt the vibrant palette while custom colors stay intact',async()=>{const {tierDisplayColor,ratingColors,getRatingColor}=await import('../src/utils/ratingColors.js');assert.equal(tierDisplayColor({id:'b',label:'B',color:'#27bfff'}),ratingColors.good);assert.equal(tierDisplayColor({id:'c',label:'C',color:'#22dc8e'}),ratingColors.mixed);assert.equal(tierDisplayColor({id:'b',label:'B',color:'#16c9ff'}),ratingColors.good);assert.equal(tierDisplayColor({id:'c',label:'C',color:'#14f195'}),ratingColors.mixed);assert.equal(tierDisplayColor({id:'d',label:'D',color:'#b3b5c1'}),ratingColors.low);assert.equal(tierDisplayColor({id:'custom',label:'Custom',color:'#27bfff'}),'#27bfff');assert.equal(new Set([1,2,4,6,8,9].map(getRatingColor)).size,6);assert.equal(getRatingColor(null),'#a3a3a3');assert.equal(getRatingColor(0),'#a3a3a3');});
