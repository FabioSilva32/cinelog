import {spawn} from 'node:child_process';
const npmCli=process.env.npm_execpath;
if(!npmCli)throw Error('Run this check with npm run check:release.');
const checks=[['Lint',[npmCli,'run','lint']],['Production build',[npmCli,'run','build']],['Regression and security tests',['--test','scripts/studio-checks.test.mjs','scripts/release-security.test.mjs','scripts/banner-framing.test.mjs','scripts/catalogue-search.test.mjs','scripts/viewing-upgrades.test.mjs','scripts/save-feedback.test.mjs']],['Page/menu initialization',['scripts/page-menu-checks.mjs']],['Extras interactions',['scripts/extras-interactions.mjs']]];
for(const [label,args]of checks){console.log('\n'+label);const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args,{stdio:'inherit',windowsHide:true});child.on('error',reject);child.on('exit',resolve);});if(code!==0){console.error(label+' failed.');process.exit(code||1);}}
console.log('\nLocal release checks passed. Live account/device checks and database policies need separate verification.');
