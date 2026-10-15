import React, { useRef, useEffect } from 'react';

export const ALL_ANIMATED_BANNERS = [
  { id: 'animated-stars', name: '✨ Interstellar Cosmic Starfield', cost: 250, desc: 'Deep space with 180+ stars, multi-color glowing nebulae & shooting meteors', theme: 'stars' },
  { id: 'animated-plasma', name: '⚡ Electric Tesla Lightning Storm', cost: 350, desc: 'Branching procedural lightning bolts, electric plasma core & charged sparks', theme: 'plasma' },
  { id: 'animated-synthwave', name: '🌆 Retro Synthwave Highway', cost: 450, desc: '3D Outrun neon highway grid, glowing striped sun & wireframe mountains', theme: 'synthwave' },
  { id: 'animated-matrix', name: '💻 Cyber Matrix Rain', cost: 300, desc: 'Dual-depth cascading phosphor green glyphs with flickering white lead symbols', theme: 'matrix' },
  { id: 'animated-aurora', name: '🌌 Celestial Aurora Borealis', cost: 400, desc: 'Volumetric dancing light curtains in emerald, turquoise & amethyst across starlight', theme: 'aurora' },
  { id: 'animated-neonrain', name: '🌧️ Cyberpunk Neon Rain', cost: 350, desc: 'Moody rainy neon city night with puddles, splash rings & ambient neon reflections', theme: 'neonrain' },
  { id: 'animated-hyperdrive', name: '🚀 Hyperdrive Warp Tunnel', cost: 500, desc: 'Relativistic lightspeed hyperspace jump with radial warp streaks & singularity glow', theme: 'hyperdrive' },
  { id: 'animated-firestorm', name: '🔥 Infernal Firestorm Abyss', cost: 400, desc: 'Volcanic magma base with turbulent glowing embers, sparks & rising heat haze', theme: 'firestorm' },
  { id: 'animated-blizzard', name: '❄️ Glacial Cryo Blizzard', cost: 350, desc: 'Howling Arctic snowstorm with wind-whipped crystalline flakes & ice mist', theme: 'blizzard' },
  { id: 'animated-scanlines', name: '🎞️ 35mm Vintage Cinema Reel', cost: 200, desc: 'Volumetric golden projector beam, floating dust motes & analog celluloid flicker', theme: 'scanlines' }
];

export default function AnimatedBannerBackground({ bannerId, style = {} }) {
  const canvasRef = useRef(null);
  const theme = bannerId && bannerId.startsWith('animated-') ? bannerId.replace('animated-', '') : null;

  useEffect(() => {
    if (!theme) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 800;
    let height = canvas.offsetHeight || 320;

    const setupCanvas = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth || 800;
      height = canvas.offsetHeight || 320;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupCanvas();

    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    let time = 0;

    // ── 1. THEME: STARS ──
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      phase: Math.random() * Math.PI * 2,
      color: ['#ffffff', '#bae6fd', '#e0e7ff', '#fed7aa', '#fbcfe8'][Math.floor(Math.random() * 5)]
    }));
    let meteors = [];
    let nextMeteor = 40;

    // ── 2. THEME: PLASMA LIGHTNING ──
    let lightningBolts = [];
    let nextBoltTime = 20;
    const plasmaMotes = Array.from({ length: 30 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * 80 + 20,
      speed: (Math.random() * 0.03 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#38bdf8' : '#e11d48'
    }));

    function createLightning(startX, startY, endX, endY, depth = 0) {
      const segments = [{ x: startX, y: startY }];
      const dx = endX - startX;
      const dy = endY - startY;
      const steps = 14;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const normal = (Math.random() - 0.5) * 45 * (1 - Math.abs(t - 0.5));
        segments.push({
          x: startX + dx * t + (dy / Math.hypot(dx, dy)) * normal,
          y: startY + dy * t - (dx / Math.hypot(dx, dy)) * normal
        });
      }
      segments.push({ x: endX, y: endY });
      return segments;
    }

    // ── 3. THEME: MATRIX RAIN ──
    const fontSize = 13;
    const cols = Math.ceil(width / fontSize) + 1;
    const matrixStreams = Array.from({ length: cols }, (_, i) => ({
      x: i * fontSize,
      y: Math.random() * -height * 1.5,
      speed: Math.random() * 3 + 2,
      length: Math.floor(Math.random() * 18 + 10),
      chars: Array.from({ length: 25 }, () => '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'[Math.floor(Math.random() * 50)]),
      leadChar: '7'
    }));

    // ── 4. THEME: NEON RAIN ──
    const raindrops = Array.from({ length: 140 }, () => ({
      x: Math.random() * (width + 120),
      y: Math.random() * height,
      len: Math.random() * 32 + 18,
      speed: Math.random() * 14 + 10,
      color: ['#38bdf8', '#c0392b', '#818cf8', '#a855f7'][Math.floor(Math.random() * 4)],
      alpha: Math.random() * 0.55 + 0.35
    }));
    const splashes = [];

    // ── 5. THEME: FIRESTORM EMBERS ──
    const embers = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 20,
      r: Math.random() * 2.8 + 0.8,
      speedY: Math.random() * 1.8 + 0.9,
      drift: (Math.random() - 0.5) * 1.1,
      life: Math.random(),
      color: ['#ff4500', '#ff8c00', '#ffd700', '#ef4444', '#f43f5e'][Math.floor(Math.random() * 5)]
    }));

    // ── 6. THEME: BLIZZARD ──
    const snowflakes = Array.from({ length: 130 }, () => ({
      x: Math.random() * (width + 150),
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.6,
      speedY: Math.random() * 1.6 + 0.8,
      speedX: -(Math.random() * 2.4 + 1.2),
      alpha: Math.random() * 0.7 + 0.3
    }));

    // ── 7. THEME: HYPERDRIVE ──
    const warpStars = Array.from({ length: 160 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      pz: 0
    }));

    // ── 8. THEME: 35mm VINTAGE PROJECTOR ──
    const dustMotes = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.2 + 0.7,
      alpha: Math.random() * 0.5 + 0.25,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2
    }));

    // ── ANIMATION LOOP ──
    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      // ─────────────────────────────────────────────────────────────
      // 1. STARS: Interstellar Cosmic Starfield
      // ─────────────────────────────────────────────────────────────
      if (theme === 'stars') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#04020a');
        bgGrad.addColorStop(0.5, '#080516');
        bgGrad.addColorStop(1, '#020106');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Volumetric breathing nebulae
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const neb1 = ctx.createRadialGradient(width * 0.25 + Math.sin(time * 0.007) * 45, height * 0.45, 10, width * 0.25, height * 0.45, width * 0.45);
        neb1.addColorStop(0, 'rgba(136, 8, 8, 0.25)');
        neb1.addColorStop(0.5, 'rgba(124, 58, 237, 0.12)');
        neb1.addColorStop(1, 'transparent');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, width, height);

        const neb2 = ctx.createRadialGradient(width * 0.78 + Math.cos(time * 0.006) * 35, height * 0.55, 10, width * 0.78, height * 0.55, width * 0.42);
        neb2.addColorStop(0, 'rgba(2, 132, 199, 0.22)');
        neb2.addColorStop(0.6, 'rgba(192, 38, 211, 0.12)');
        neb2.addColorStop(1, 'transparent');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Stars with twinkles & diffraction spikes
        stars.forEach(s => {
          const a = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.35;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, a));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();

          if (s.r > 1.7 && a > 0.65) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(s.x - s.r * 2.8, s.y);
            ctx.lineTo(s.x + s.r * 2.8, s.y);
            ctx.moveTo(s.x, s.y - s.r * 2.8);
            ctx.lineTo(s.x, s.y + s.r * 2.8);
            ctx.stroke();
          }
        });
        ctx.globalAlpha = 1;

        // Shooting meteors
        if (time >= nextMeteor) {
          meteors.push({
            x: Math.random() * width * 0.75,
            y: Math.random() * height * 0.3,
            len: Math.random() * 130 + 80,
            speed: Math.random() * 14 + 10,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            life: 1.0,
            color: Math.random() > 0.5 ? '#93c5fd' : '#fed7aa'
          });
          nextMeteor = time + Math.floor(Math.random() * 80 + 40);
        }

        meteors.forEach((m, idx) => {
          m.x += Math.cos(m.angle) * m.speed;
          m.y += Math.sin(m.angle) * m.speed;
          m.life -= 0.025;
          if (m.life <= 0) {
            meteors.splice(idx, 1);
            return;
          }
          const tailX = m.x - Math.cos(m.angle) * m.len;
          const tailY = m.y - Math.sin(m.angle) * m.len;
          const mGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          mGrad.addColorStop(0, '#ffffff');
          mGrad.addColorStop(0.2, m.color);
          mGrad.addColorStop(1, 'transparent');
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.globalAlpha = m.life;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

      // ─────────────────────────────────────────────────────────────
      // 2. PLASMA: Electric Tesla Lightning Storm
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'plasma') {
        ctx.fillStyle = '#05020c';
        ctx.fillRect(0, 0, width, height);

        // Ambient plasma clouds
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const pCore = ctx.createRadialGradient(width * 0.5, height * 0.5, 10, width * 0.5, height * 0.5, width * 0.35);
        pCore.addColorStop(0, 'rgba(147, 51, 234, 0.4)');
        pCore.addColorStop(0.5, 'rgba(14, 165, 233, 0.2)');
        pCore.addColorStop(1, 'transparent');
        ctx.fillStyle = pCore;
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.5, width * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Spawn branching lightning bolts
        if (time >= nextBoltTime) {
          const startX = Math.random() * width;
          const endX = startX + (Math.random() - 0.5) * 300;
          lightningBolts.push({
            segments: createLightning(startX, 0, endX, height),
            life: 1.0,
            color: Math.random() > 0.5 ? '#38bdf8' : '#e879f9'
          });
          nextBoltTime = time + Math.floor(Math.random() * 28 + 14);
        }

        // Draw lightning bolts with high-voltage corona
        lightningBolts.forEach((bolt, idx) => {
          bolt.life -= 0.08;
          if (bolt.life <= 0) {
            lightningBolts.splice(idx, 1);
            return;
          }
          // Glowing outer aura
          ctx.strokeStyle = bolt.color;
          ctx.lineWidth = 5 * bolt.life;
          ctx.globalAlpha = bolt.life * 0.6;
          ctx.beginPath();
          bolt.segments.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();

          // White-hot core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.8 * bolt.life;
          ctx.globalAlpha = bolt.life;
          ctx.stroke();
        });

        // Orbiting plasma motes
        plasmaMotes.forEach(m => {
          m.angle += m.speed;
          const px = width * 0.5 + Math.cos(m.angle) * m.dist;
          const py = height * 0.5 + Math.sin(m.angle) * (m.dist * 0.45);
          ctx.fillStyle = m.color;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(px, py, m.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 3. SYNTHWAVE: 80s Outrun Neon Horizon
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'synthwave') {
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#060112');
        sky.addColorStop(0.3, '#190332');
        sky.addColorStop(0.52, '#4c0d4f');
        sky.addColorStop(1, '#0b0116');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.52;
        const sunR = Math.min(84, height * 0.38);
        const sunX = width * 0.5;
        const sunY = horizonY - sunR * 0.28;

        // Radiant Sun
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const sGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 2.4);
        sGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        sGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
        sGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
        ctx.fill();

        const sGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
        sGrad.addColorStop(0, '#fef08a');
        sGrad.addColorStop(0.45, '#f97316');
        sGrad.addColorStop(1, '#c0392b');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Laser horizontal stripes cut into Sun
        const cuts = [0.18, 0.34, 0.5, 0.64, 0.76, 0.86, 0.94];
        cuts.forEach((pct, idx) => {
          const cutY = sunY - sunR + (sunR * 2 * pct);
          const cutH = 2.5 + idx * 1.6;
          ctx.fillStyle = '#190332';
          ctx.fillRect(sunX - sunR - 10, cutY, (sunR + 10) * 2, cutH);
        });
        ctx.restore();

        // Wireframe Mountains
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width * 0.12, horizonY - 32);
        ctx.lineTo(width * 0.24, horizonY);
        ctx.lineTo(width * 0.35, horizonY - 20);
        ctx.lineTo(sunX - sunR * 0.72, horizonY);
        ctx.moveTo(sunX + sunR * 0.72, horizonY);
        ctx.lineTo(width * 0.65, horizonY - 26);
        ctx.lineTo(width * 0.78, horizonY);
        ctx.lineTo(width * 0.9, horizonY - 35);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // Horizon Laser Beam
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // 3D Moving Perspective Highway Grid
        const gridSpeed = (time * 1.5) % 28;
        for (let y = horizonY + 2; y < height; y += (y - horizonY) * 0.3 + 6) {
          const actY = y + (gridSpeed * (y - horizonY)) / (height - horizonY);
          if (actY > horizonY && actY < height) {
            ctx.strokeStyle = `rgba(236, 72, 153, ${Math.min(0.9, (actY - horizonY) / (height - horizonY))})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(0, actY);
            ctx.lineTo(width, actY);
            ctx.stroke();
          }
        }

        const vanishingX = width * 0.5;
        for (let x = -width * 0.5; x <= width * 1.5; x += 55) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.55)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

      // ─────────────────────────────────────────────────────────────
      // 4. MATRIX: Cyber Matrix Rain
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'matrix') {
        ctx.fillStyle = 'rgba(2, 7, 3, 0.24)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `bold ${fontSize}px monospace`;
        matrixStreams.forEach(stream => {
          stream.y += stream.speed;
          if (stream.y > height + stream.length * fontSize) {
            stream.y = Math.random() * -100;
            stream.speed = Math.random() * 3 + 2;
          }

          // Randomize lead char occasionally
          if (Math.random() > 0.85) {
            stream.leadChar = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'[Math.floor(Math.random() * 50)];
          }

          for (let i = 0; i < stream.length; i++) {
            const charY = stream.y - i * fontSize;
            if (charY > 0 && charY < height) {
              if (i === 0) {
                // Luminous white head
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#22c55e';
                ctx.shadowBlur = 10;
                ctx.fillText(stream.leadChar, stream.x, charY);
              } else {
                // Phosphor green trailing glyphs
                const alpha = Math.max(0.1, 1 - (i / stream.length));
                ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
                ctx.shadowBlur = 0;
                ctx.fillText(stream.chars[i % stream.chars.length], stream.x, charY);
              }
            }
          }
        });
        ctx.shadowBlur = 0;

      // ─────────────────────────────────────────────────────────────
      // 5. AURORA: Celestial Northern Lights
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'aurora') {
        ctx.fillStyle = '#030511';
        ctx.fillRect(0, 0, width, height);

        // Distant stars
        stars.slice(0, 70).forEach(s => {
          ctx.fillStyle = s.color;
          ctx.globalAlpha = 0.55;
          ctx.fillRect(s.x, s.y, 1.3, 1.3);
        });
        ctx.globalAlpha = 1;

        // Shimmering dancing light curtains
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const curtains = [
          { color: 'rgba(52, 211, 153, 0.45)', waveSpeed: 0.018, freq: 0.007, phase: 0 },
          { color: 'rgba(34, 211, 238, 0.45)', waveSpeed: 0.014, freq: 0.009, phase: 1.8 },
          { color: 'rgba(192, 132, 252, 0.35)', waveSpeed: 0.022, freq: 0.006, phase: 3.5 }
        ];

        curtains.forEach(c => {
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 16) {
            const y = height * 0.32
              + Math.sin(x * c.freq + time * c.waveSpeed + c.phase) * 45
              + Math.cos(x * 0.015 - time * 0.012) * 26;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 6. NEON RAIN: Cyberpunk Neon Noir
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'neonrain') {
        ctx.fillStyle = '#060714';
        ctx.fillRect(0, 0, width, height);

        // Ground neon light bounce
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const neonGlow = ctx.createLinearGradient(0, height, 0, height * 0.4);
        neonGlow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
        neonGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
        neonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = neonGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Driving rain
        raindrops.forEach(drop => {
          drop.y += drop.speed;
          drop.x -= drop.speed * 0.14;
          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * (width + 120);
            if (splashes.length < 30 && Math.random() > 0.4) {
              splashes.push({ x: drop.x, y: height - 2, r: 1, alpha: 0.85 });
            }
          }
          ctx.strokeStyle = drop.color;
          ctx.lineWidth = 1.3;
          ctx.globalAlpha = drop.alpha;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 3, drop.y + drop.len);
          ctx.stroke();
        });

        // Expanding splash rings
        splashes.forEach((s, i) => {
          s.r += 0.8;
          s.alpha -= 0.05;
          if (s.alpha <= 0) {
            splashes.splice(i, 1);
            return;
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, ' + s.alpha + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.r * 2.2, s.r * 0.6, 0, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

      // ─────────────────────────────────────────────────────────────
      // 7. FIRESTORM: Volcanic Magma Abyss
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'firestorm') {
        ctx.fillStyle = '#0a0202';
        ctx.fillRect(0, 0, width, height);

        // Volcanic thermal core
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const vGlow = ctx.createRadialGradient(width * 0.5, height, 10, width * 0.5, height, width * 0.65);
        vGlow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        vGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.25)');
        vGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = vGlow;
        ctx.fillRect(0, 0, width, height);

        // Rising embers & fiery cinders
        embers.forEach(e => {
          e.y -= e.speedY;
          e.x += e.drift + Math.sin(time * 0.05 + e.y * 0.02) * 1.2;
          e.life -= 0.003;
          if (e.y < -10 || e.life <= 0) {
            e.y = height + Math.random() * 20;
            e.x = Math.random() * width;
            e.life = 1;
          }
          ctx.fillStyle = e.color;
          ctx.shadowColor = e.color;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

      // ─────────────────────────────────────────────────────────────
      // 8. BLIZZARD: Glacial Cryo Snowstorm
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'blizzard') {
        ctx.fillStyle = '#040814';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const bGlow = ctx.createRadialGradient(width * 0.5, height * 0.5, 20, width * 0.5, height * 0.5, width * 0.7);
        bGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        bGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Drifting snow
        snowflakes.forEach(s => {
          s.y += s.speedY;
          s.x += s.speedX + Math.sin(time * 0.03 + s.y * 0.01) * 0.7;
          if (s.y > height) {
            s.y = -5;
            s.x = Math.random() * (width + 150);
          }
          if (s.x < 0) s.x = width + 50;
          ctx.fillStyle = '#bae6fd';
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

      // ─────────────────────────────────────────────────────────────
      // 9. HYPERDRIVE: Lightspeed Warp Tunnel
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'hyperdrive') {
        ctx.fillStyle = '#020208';
        ctx.fillRect(0, 0, width, height);

        const cx = width * 0.5;
        const cy = height * 0.5;

        // Hyperspace singularity
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const hGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 150);
        hGlow.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
        hGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        hGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = hGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        warpStars.forEach(s => {
          s.pz = s.z;
          s.z -= 20;
          if (s.z <= 0) {
            s.z = width;
            s.pz = width;
            s.x = (Math.random() - 0.5) * width;
            s.y = (Math.random() - 0.5) * height;
          }
          const k = 240 / s.z;
          const px = s.x * k + cx;
          const py = s.y * k + cy;

          const pk = 240 / s.pz;
          const prevX = s.x * pk + cx;
          const prevY = s.y * pk + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = Math.min(3.2, (1 - s.z / width) * 3.5 + 0.6);
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        });

      // ─────────────────────────────────────────────────────────────
      // 10. SCANLINES: 35mm Hollywood Vintage Projector
      // ─────────────────────────────────────────────────────────────
      } else if (theme === 'scanlines') {
        ctx.fillStyle = '#0a0604';
        ctx.fillRect(0, 0, width, height);

        // Volumetric golden projector light beam from left
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const beamFlicker = 0.35 + Math.sin(time * 0.16) * 0.06 + (Math.random() - 0.5) * 0.03;
        const pBeam = ctx.createRadialGradient(0, height * 0.5, 10, width * 0.8, height * 0.5, width * 0.85);
        pBeam.addColorStop(0, `rgba(251, 191, 36, ${beamFlicker})`);
        pBeam.addColorStop(0.6, 'rgba(217, 119, 6, 0.14)');
        pBeam.addColorStop(1, 'transparent');
        ctx.fillStyle = pBeam;
        ctx.fillRect(0, 0, width, height);

        // Illuminated cinema dust motes
        dustMotes.forEach(d => {
          d.x += d.vx;
          d.y += d.vy + Math.sin(time * 0.04 + d.wobble) * 0.2;
          if (d.x < 0) d.x = width;
          if (d.x > width) d.x = 0;
          if (d.y < 0) d.y = height;
          if (d.y > height) d.y = 0;
          ctx.fillStyle = '#fef3c7';
          ctx.globalAlpha = d.alpha * (0.6 + Math.sin(time * 0.05 + d.x) * 0.4);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Subtle analog 35mm celluloid weave
        if (Math.random() > 0.86) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.lineWidth = 1;
          const rx = Math.random() * width;
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx + (Math.random() - 0.5) * 6, height);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  if (!theme) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}
