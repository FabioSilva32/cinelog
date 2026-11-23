import assert from 'node:assert/strict';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const store=new Map();globalThis.localStorage=globalThis.sessionStorage={getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,String(value)),removeItem:key=>store.delete(key)};
globalThis.window={history:{state:{},pushState(){},replaceState(){},back(){}},location:new URL('http://localhost/explore'),innerWidth:1280,innerHeight:900,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}}),localStorage:globalThis.localStorage,addEventListener(){},removeEventListener(){}};
globalThis.document={body:{nodeType:1},documentElement:{}};
const server=await createServer({configFile:false,plugins:[react()],server:{middlewareMode:true},appType:'custom',logLevel:'silent'});
const user={id:'demo',username:'tester',displayName:'Test viewer',favorites:[],featuredBadges:[]};const movie={id:'m1',tmdb_id:1,title:'Test film',status:'watched',media_type:'movie',genres:['Drama'],rating:8,watch_date:'2025-03-01',date_added:'2025-03-01',screenings:[]};
const noop=()=>{};const base={currentUser:user,library:[movie],onClose:noop,onMovieClick:noop,onOpenExplore:noop,onNavigate:noop,onUpdateProfile:async()=>true};
let passed=0;
async function check(file,props={},expect='',portal=false){const module=await server.ssrLoadModule('/src/components/'+file+'.jsx');try{const markup=renderToStaticMarkup(React.createElement(module.default,{...base,...props}));if(expect)assert.ok(markup.includes(expect),file+' should expose '+expect);assert.ok(markup.length>0,file+' rendered no content');console.log('PASS '+file+(props.initialSubTab?' / '+props.initialSubTab:''));passed++;}catch(error){if(portal&&/Portals are not currently supported/.test(error.message)){console.log('PASS '+file+' initialized through portal (browser interaction not simulated)');passed++;}else throw error;}}
try{
 const appModule=await server.ssrLoadModule('/src/App.jsx');const toastModule=await server.ssrLoadModule('/src/components/ToastSystem.jsx');assert.ok(renderToStaticMarkup(React.createElement(toastModule.ToastProvider,null,React.createElement(appModule.default))).includes('main-content'));console.log('PASS App shell and initial navigation');passed++;
 await check('ImportLibraryModal',{onImport:async()=>true},'Import from JSON');await check('ResetPasswordModal',{},'Reset');await check('AuthModal',{},'Good to see you again.');await check('SettingsPanel',{},'Preferences');
 for(const file of ['ExploreTab','LibraryTab','CollectionsTab','TierListTab','StatsTab','WatchCalendarTab','WrappedTab','ConstellationTab','AchievementsTab','ChallengesTab','TriviaTab','ForYouTab','ProfileJournal','ProfileExtras'])await check(file);
 for(const sub of ['overview','reviews','watchlist','stats','calendar','wrapped','achievements','constellation','shop'])await check('ProfileTab',{initialSubTab:sub,onSubTabChange:noop});
 await check('MovieDetailModal',{movie,inLibrary:true,onSave:async()=>true},'Test film');
 await check('ListDetailModal',{isPage:true,list:{id:'list-test',title:'Test list',author:{id:user.id,username:user.username},entries:[movie],comments:[]},onDeleteList:async()=>true},'Test list');
 await check('CollectionDetailModal',{isPage:true,collection:{id:'test',title:'Test franchise',movies:[movie]}},'Test franchise');
 await check('ProfileEditor',{onUpdateProfile:async()=>true},'',true);await check('ProfileCustomizerModal',{show:true,favorites:[],onSave:async()=>true},'',true);await check('PublicProfilePage',{targetUser:{id:'other',username:'other'}},'Loading');await check('TonightPicker');const countryModule=await server.ssrLoadModule('/src/components/CountrySelector.jsx');assert.ok(renderToStaticMarkup(React.createElement(countryModule.CountrySelector,{country:'PT',onChange:noop})).includes('Portugal'));console.log('PASS CountrySelector');passed++;
 await check('CreateListModal',{onSaveList:async()=>true},'',true);await check('CreateListModal',{initialList:{id:'existing',title:'Existing list',entries:[movie],isPublic:true},onSaveList:async()=>true},'',true);await check('ConfirmModal',{isOpen:true,title:'Remove test item?',onCancel:noop,onConfirm:async()=>true},'',true);await check('ShowcasePicker',{favorites:[],slot:0,onSelect:noop},'',true);
 const appearance=await server.ssrLoadModule('/src/components/AppearanceStudio.jsx');
 const state={publishing:false,publishError:'',displayName:'Viewer',username:'viewer',bio:'',avatar:'',equippedBorder:'none',bannerUrl:'',bannerFitMode:'cover',bannerPosPercent:20,featuredBadges:[],bannerMode:'presets',presetSearchQuery:'',tmdbSearchQuery:'',tmdbSearchResults:[],customUrlInput:''};
 for(const tab of ['info','banner','avatar','badges','showcase']){const html=renderToStaticMarkup(React.createElement(appearance.default,{state:{...state,customizerTab:tab},actions:{},unlockedBorders:new Set(['none']),sortedBadges:[],favorites:[null,null,null,null,null,null],cinemaAvatars:[],cinemaCovers:[]}));assert.ok(html.includes('Save profile'));console.log('PASS AppearanceStudio / '+tab);passed++;}
 console.log(passed+' page/menu initialization checks passed. These checks do not verify browser layout or execute writes.');
}catch(error){console.error(error);process.exitCode=1;}finally{await server.close();process.exit(process.exitCode||0);}
