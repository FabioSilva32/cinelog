import {readFile} from 'node:fs/promises';

// Scope the short-lived Vercel credential to this exact preview origin.
export async function enablePreviewAccess(send, socket, origin, patterns = []) {
  const target = new URL(origin);
  if (!target.hostname.endsWith('.vercel.app')) {
    if (patterns.length) await send('Fetch.enable', {patterns});
    return;
  }
  const env = await readFile('.env.local', 'utf8');
  let review;
  try { review=JSON.parse(await readFile('.vercel/release-access.local.json','utf8')); } catch {}
  const share=review?.origin===target.origin?review.share:undefined;
  if(share){
    if(patterns.length)await send('Fetch.enable',{patterns});
    // Establish Vercel's normal share cookie once; do not rewrite asset requests.
    await send('Page.navigate',{url:target.origin+'/?_vercel_share='+encodeURIComponent(share)});
    await new Promise(resolve=>setTimeout(resolve,2000));
    return;
  }
  const token = env.match(/^VERCEL_OIDC_TOKEN=(.*)$/m)?.[1].trim().replace(/^['"]|['"]$/g, '');
  if (!token&&!share) throw Error('Refresh the linked Vercel development credentials before testing this protected preview.');
  socket.addEventListener('message', async event => {
    const message = JSON.parse(event.data);
    if (message.method !== 'Fetch.requestPaused') return;
    const request = message.params.request;
    if (new URL(request.url).origin !== target.origin) return;
    await send('Fetch.continueRequest', {
      requestId: message.params.requestId,
      headers: [...Object.entries(request.headers).map(([name, value]) => ({name, value})),
        {name: 'x-vercel-trusted-oidc-idp-token', value: token}],
    });
  });
  await send('Fetch.enable', {patterns: [...patterns, {urlPattern: target.origin + '/*'}]});
}
