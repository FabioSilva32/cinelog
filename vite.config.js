import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {rmSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const workspace=dirname(fileURLToPath(import.meta.url));
// Keep design experiments in the workspace, but never publish them with the app.
function excludeDesignMockups(){let output;return {name:'exclude-design-mockups',apply:'build',configResolved(config){output=resolve(config.root,config.build.outDir);},writeBundle(){const target=resolve(output,'mockups');if(output!==resolve(workspace,'dist')||dirname(target)!==output)throw Error('Unexpected build output: refusing preview cleanup.');rmSync(target,{recursive:true,force:true});}};}
export default defineConfig({plugins:[react(),excludeDesignMockups()]});
