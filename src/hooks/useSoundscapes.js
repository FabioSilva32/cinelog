import {useState,useRef,useEffect} from 'react';
export function useSoundscapes(){
  const [soundVolumes, setSoundVolumes] = useState({ projector: 0, scifi: 0, orchestral: 0, lofi: 0 });
  const audioCtxRef = useRef(null);
  const gainNodesRef = useRef({});
  const sourcesRef = useRef({});

  // Cleanup audio nodes on unmount
  useEffect(() => {
    const sources=sourcesRef.current;
    return () => {
      Object.values(sources).forEach(src => {
        try { src.stop(); src.disconnect(); } catch {}
      });
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);


  const initAudioTrack = (trackId) => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    if (!gainNodesRef.current[trackId]) {
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(ctx.destination);
      gainNodesRef.current[trackId] = gainNode;

      if (trackId === 'projector') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.2;
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 3;
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        whiteNoise.start();
        sourcesRef.current[trackId] = whiteNoise;
      } else if (trackId === 'scifi') {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 55;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120;
        osc.connect(filter);
        filter.connect(gainNode);
        osc.start();
        sourcesRef.current[trackId] = osc;
      } else if (trackId === 'orchestral') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 110;
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = 164.81;
        osc.connect(gainNode);
        osc2.connect(gainNode);
        osc.start();
        osc2.start();
        sourcesRef.current[trackId] = osc;
        sourcesRef.current[trackId+'_harmony'] = osc2;
      } else if (trackId === 'lofi') {
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 0.8;
        }
        const pinkNoise = ctx.createBufferSource();
        pinkNoise.buffer = noiseBuffer;
        pinkNoise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        pinkNoise.connect(filter);
        filter.connect(gainNode);
        pinkNoise.start();
        sourcesRef.current[trackId] = pinkNoise;
      }
    }
  };

  const handleVolumeChange = (trackId, val) => {
    const num = parseFloat(val);
    setSoundVolumes(prev => ({ ...prev, [trackId]: num }));
    initAudioTrack(trackId);
    if (gainNodesRef.current[trackId] && audioCtxRef.current) {
      gainNodesRef.current[trackId].gain.setTargetAtTime(num * 0.4, audioCtxRef.current.currentTime, 0.05);
    }
  };


return {soundVolumes,handleVolumeChange};
}
