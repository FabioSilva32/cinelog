import { useEffect, useRef } from 'react';
let apiPromise;
function youtubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = () => { apiPromise = null; reject(new Error('Player API unavailable')); };
    document.head.append(script);
  });
  return apiPromise;
}
export default function TrailerPlayer({ videoId,title='Trailer' }) {
  const host = useRef(null);
  useEffect(() => {
    let cancelled = false, player;
    const frame = document.createElement('iframe');
    frame.title = title;
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?enablejsapi=1&playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`;
    frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    host.current.replaceChildren(frame);
    youtubeAPI().then(YT => {
      if (cancelled) return;
      player = new YT.Player(frame, { events: { onReady: e => e.target.setVolume(20) } });
    }).catch(() => { /* The regular embed remains usable if the API is blocked. */ });
    return () => { cancelled = true; player?.destroy(); };
  }, [videoId,title]);
  return <div className="screening-video" ref={host}/>;
}
