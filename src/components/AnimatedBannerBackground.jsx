import React, { useRef, useEffect } from 'react';

export const ALL_ANIMATED_BANNERS = [
  { id: 'animated-stars', name: '✨ Interstellar Cosmic Starfield', cost: 250, desc: 'Deep space with 150+ twinkling stars, nebulae & realistic shooting meteors', theme: 'stars' },
  { id: 'animated-plasma', name: '⚡ Electric Plasma Vortex', cost: 350, desc: 'Crackling neon lightning bolts, surging plasma cores & energy sparks', theme: 'plasma' },
  { id: 'animated-synthwave', name: '🌆 Retro Synthwave Highway', cost: 450, desc: 'Neon grid highway, wireframe mountains & glowing striped sunset', theme: 'synthwave' },
  { id: 'animated-matrix', name: '💻 Cyber Matrix Rain', cost: 300, desc: 'Continuous phosphorescent green cascading cyber cipher rain', theme: 'matrix' },
  { id: 'animated-aurora', name: '🌌 Celestial Aurora Borealis', cost: 400, desc: 'Fluid undulating ribbons of emerald, cyan & magenta across starlight', theme: 'aurora' },
  { id: 'animated-neonrain', name: '🌧️ Cyberpunk Neon Rain', cost: 350, desc: 'Moody rainy neon city night with glowing streaks & puddles', theme: 'neonrain' },
  { id: 'animated-hyperdrive', name: '🚀 Hyperdrive Warp Tunnel', cost: 500, desc: 'Light-speed hyperspace warp with relativistic star streaks', theme: 'hyperdrive' },
  { id: 'animated-firestorm', name: '🔥 Infernal Firestorm Abyss', cost: 400, desc: 'Swirling volcanic magma embers, rising sparks & heat ripples', theme: 'firestorm' },
  { id: 'animated-blizzard', name: '❄️ Glacial Cryo Blizzard', cost: 350, desc: 'Falling crystalline glowing snowflakes & shimmering frost mist', theme: 'blizzard' },
  { id: 'animated-scanlines', name: '🎞️ 35mm Vintage Film Reel', cost: 200, desc: 'Analog 35mm projector light beam, frame jitter & dust motes', theme: 'scanlines' }
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
    const stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.5,
      baseAlpha: Math.random() * 0.6 + 0.3,
      twinkleSpeed: Math.random() * 0.04 + 0.015,
      phase: Math.random() * Math.PI * 2,
      color: ['#ffffff', '#bfdbfe', '#e0e7ff', '#fef08a', '#fbcfe8'][Math.floor(Math.random() * 5)]
    }));
    let meteors = [];
    let nextMeteor = 60;

    // ── 2. THEME: PLASMA ──
    const plasmaParticles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#38bdf8' : '#e11d48'
    }));

    // ── 3. THEME: MATRIX ──
    const fontSize = 13;
    const columns = Math.ceil(width / fontSize) + 1;
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));
    const matrixChars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ'.split('');

    // ── 4. THEME: NEON RAIN ──
    const raindrops = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 30 + 15,
      speed: Math.random() * 14 + 10,
      color: ['#38bdf8', '#c0392b', '#818cf8', '#a855f7'][Math.floor(Math.random() * 4)],
      alpha: Math.random() * 0.6 + 0.3
    }));
    const splashes = [];

    // ── 5. THEME: FIRESTORM EMBERS ──
    const embers = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.8,
      speedY: Math.random() * 1.8 + 0.8,
      drift: (Math.random() - 0.5) * 0.8,
      life: Math.random(),
      color: ['#ff4500', '#ff8c00', '#ffd700', '#ef4444', '#f43f5e'][Math.floor(Math.random() * 5)]
    }));

    // ── 6. THEME: BLIZZARD ──
    const snowflakes = Array.from({ length: 110 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.4 + 0.6,
      speedY: Math.random() * 1.4 + 0.7,
      speedX: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.7 + 0.3
    }));

    // ── 7. THEME: HYPERDRIVE ──
    const warpStars = Array.from({ length: 140 }, () => ({
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
      pz: 0
    }));

    // ── 8. THEME: SCANLINES (35mm Film Projector) ──
    const dustMotes = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4
    }));

    // ── ANIMATION LOOP ──
    const render = () => {
      time++;
      ctx.clearRect(0, 0, width, height);

      if (theme === 'stars') {
        // Deep Cosmos Gradient
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#06030e');
        grad.addColorStop(0.5, '#0a0618');
        grad.addColorStop(1, '#030209');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Luminous organic nebulae clouds
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const neb1 = ctx.createRadialGradient(width * 0.25 + Math.sin(time * 0.008) * 40, height * 0.45, 10, width * 0.25, height * 0.45, width * 0.45);
        neb1.addColorStop(0, 'rgba(136, 8, 8, 0.22)');
        neb1.addColorStop(0.5, 'rgba(88, 28, 135, 0.12)');
        neb1.addColorStop(1, 'transparent');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, width, height);

        const neb2 = ctx.createRadialGradient(width * 0.78 + Math.cos(time * 0.006) * 30, height * 0.55, 10, width * 0.78, height * 0.55, width * 0.4);
        neb2.addColorStop(0, 'rgba(2, 132, 199, 0.2)');
        neb2.addColorStop(0.6, 'rgba(147, 51, 234, 0.1)');
        neb2.addColorStop(1, 'transparent');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Twinkling stars
        stars.forEach(s => {
          const a = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.phase) * 0.35;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, Math.min(1, a));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();

          if (s.r > 1.8 && a > 0.65) {
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(s.x - s.r * 2.5, s.y);
            ctx.lineTo(s.x + s.r * 2.5, s.y);
            ctx.moveTo(s.x, s.y - s.r * 2.5);
            ctx.lineTo(s.x, s.y + s.r * 2.5);
            ctx.stroke();
          }
        });
        ctx.globalAlpha = 1;

        // Shooting meteors
        if (time >= nextMeteor) {
          meteors.push({
            x: Math.random() * width * 0.75,
            y: Math.random() * height * 0.3,
            len: Math.random() * 120 + 80,
            speed: Math.random() * 14 + 10,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.25,
            life: 1.0,
            color: Math.random() > 0.5 ? '#93c5fd' : '#fed7aa'
          });
          nextMeteor = time + Math.floor(Math.random() * 90 + 50);
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
          ctx.lineWidth = 2.2;
          ctx.lineCap = 'round';
          ctx.globalAlpha = m.life;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;

      } else if (theme === 'plasma') {
        // Deep Cyber-Electric Chamber
        ctx.fillStyle = '#05020c';
        ctx.fillRect(0, 0, width, height);

        // Core plasma orbs
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const plasmaColors = [
          { x: width * 0.25 + Math.cos(time * 0.02) * (width * 0.1), y: height * 0.5 + Math.sin(time * 0.025) * (height * 0.2), r: width * 0.28, color: 'rgba(225, 29, 72, 0.45)' },
          { x: width * 0.72 + Math.sin(time * 0.018) * (width * 0.12), y: height * 0.5 + Math.cos(time * 0.02) * (height * 0.2), r: width * 0.32, color: 'rgba(14, 165, 233, 0.45)' },
          { x: width * 0.5 + Math.sin(time * 0.03) * (width * 0.08), y: height * 0.5 + Math.cos(time * 0.03) * (height * 0.15), r: width * 0.25, color: 'rgba(168, 85, 247, 0.4)' }
        ];

        plasmaColors.forEach(p => {
          const g = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, p.r);
          g.addColorStop(0, p.color);
          g.addColorStop(0.5, 'rgba(136, 8, 8, 0.15)');
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Organically twisting lightning filaments
        for (let b = 0; b < 3; b++) {
          ctx.strokeStyle = b === 0 ? 'rgba(56, 189, 248, 0.85)' : b === 1 ? 'rgba(244, 63, 94, 0.85)' : 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = b === 2 ? 1.2 : 2;
          ctx.beginPath();
          let lx = 0;
          let ly = height * (0.35 + b * 0.18) + Math.sin(time * 0.07 + b) * 20;
          ctx.moveTo(lx, ly);
          const segments = 18;
          const segW = width / segments;
          for (let i = 1; i <= segments; i++) {
            lx += segW;
            ly += Math.sin(i * 1.2 + time * 0.08 + b) * 22 + (Math.random() - 0.5) * 16;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }

        // Charged particle sparks
        plasmaParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

      } else if (theme === 'synthwave') {
        // Sunset sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, '#070214');
        sky.addColorStop(0.35, '#1e053a');
        sky.addColorStop(0.55, '#4a0e4e');
        sky.addColorStop(1, '#0c0118');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        const horizonY = height * 0.54;
        const sunR = Math.min(80, height * 0.36);
        const sunX = width * 0.5;
        const sunY = horizonY - sunR * 0.3;

        // Radiant sun glow
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const sGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.5, sunX, sunY, sunR * 2.4);
        sGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
        sGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.25)');
        sGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sGlow;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Sun disc
        const sGrad = ctx.createLinearGradient(0, sunY - sunR, 0, sunY + sunR);
        sGrad.addColorStop(0, '#fef08a');
        sGrad.addColorStop(0.4, '#f97316');
        sGrad.addColorStop(1, '#c0392b');
        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal laser lines cutting through sun
        const cuts = [0.15, 0.32, 0.48, 0.62, 0.74, 0.85, 0.94];
        cuts.forEach((pct, idx) => {
          const cutY = sunY - sunR + (sunR * 2 * pct);
          const cutH = 2.5 + idx * 1.5;
          ctx.fillStyle = '#1e053a';
          ctx.fillRect(sunX - sunR - 10, cutY, (sunR + 10) * 2, cutH);
        });
        ctx.restore();

        // Distant mountains silhouette
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width * 0.12, horizonY - 28);
        ctx.lineTo(width * 0.24, horizonY);
        ctx.lineTo(width * 0.36, horizonY - 18);
        ctx.lineTo(sunX - sunR * 0.75, horizonY);
        ctx.moveTo(sunX + sunR * 0.75, horizonY);
        ctx.lineTo(width * 0.64, horizonY - 24);
        ctx.lineTo(width * 0.78, horizonY);
        ctx.lineTo(width * 0.9, horizonY - 32);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // Horizon laser beam
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, horizonY);
        ctx.lineTo(width, horizonY);
        ctx.stroke();

        // 3D Perspective Outrun Grid
        const gridSpeed = (time * 1.4) % 28;
        ctx.lineWidth = 1.4;

        // Horizontals
        for (let y = horizonY + 2; y < height; y += (y - horizonY) * 0.3 + 6) {
          const actY = y + (gridSpeed * (y - horizonY)) / (height - horizonY);
          if (actY > horizonY && actY < height) {
            ctx.strokeStyle = `rgba(236, 72, 153, ${Math.min(0.9, (actY - horizonY) / (height - horizonY))})`;
            ctx.beginPath();
            ctx.moveTo(0, actY);
            ctx.lineTo(width, actY);
            ctx.stroke();
          }
        }

        // Converging perspective lines
        const vanishingX = width * 0.5;
        for (let x = -width * 0.5; x <= width * 1.5; x += 55) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizonY);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

      } else if (theme === 'matrix') {
        // Phosphorescent green cyber terminal
        ctx.fillStyle = 'rgba(3, 8, 4, 0.22)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `bold ${fontSize}px "Courier New", monospace`;
        for (let i = 0; i < drops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Leading bright glyph
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;
          ctx.fillText(char, x, y);

          // Trail glyph
          ctx.fillStyle = '#22c55e';
          ctx.shadowBlur = 0;
          ctx.fillText(char, x, y - fontSize);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }

      } else if (theme === 'aurora') {
        // Starry night with fluid undulating ribbons
        ctx.fillStyle = '#040714';
        ctx.fillRect(0, 0, width, height);

        // Faint stars backdrop
        stars.slice(0, 60).forEach(s => {
          ctx.fillStyle = s.color;
          ctx.globalAlpha = 0.5;
          ctx.fillRect(s.x, s.y, 1.2, 1.2);
        });
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const ribbonColors = [
          'rgba(52, 211, 153, 0.45)', // Emerald
          'rgba(34, 211, 238, 0.45)', // Cyan
          'rgba(192, 132, 252, 0.35)'  // Violet
        ];

        ribbonColors.forEach((color, idx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.moveTo(0, height);
          for (let x = 0; x <= width; x += 18) {
            const wave = height * (0.32 + idx * 0.08)
              + Math.sin(x * 0.007 + time * 0.02 + idx * 1.5) * 45
              + Math.cos(x * 0.014 - time * 0.015) * 25;
            ctx.lineTo(x, wave);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fill();
        });
        ctx.restore();

      } else if (theme === 'neonrain') {
        // Moody rainy cyberpunk night
        ctx.fillStyle = '#070814';
        ctx.fillRect(0, 0, width, height);

        // Neon street bounce lighting
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const neonGlow = ctx.createLinearGradient(0, height, 0, height * 0.35);
        neonGlow.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
        neonGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
        neonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = neonGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Driving rain
        raindrops.forEach(drop => {
          drop.y += drop.speed;
          drop.x -= drop.speed * 0.15;
          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * (width + 100);
            if (splashes.length < 25 && Math.random() > 0.4) {
              splashes.push({ x: drop.x, y: height - 2, r: 1, alpha: 0.8 });
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

        // Ground splash rings
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

      } else if (theme === 'firestorm') {
        // Infernal abyss
        ctx.fillStyle = '#0b0202';
        ctx.fillRect(0, 0, width, height);

        // Volcanic thermal core
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const vGlow = ctx.createRadialGradient(width * 0.5, height, 10, width * 0.5, height, width * 0.65);
        vGlow.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
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

      } else if (theme === 'blizzard') {
        // Arctic ice storm
        ctx.fillStyle = '#040916';
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const bGlow = ctx.createRadialGradient(width * 0.5, height * 0.5, 20, width * 0.5, height * 0.5, width * 0.7);
        bGlow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        bGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = bGlow;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        // Drifting crystalline snow
        snowflakes.forEach(s => {
          s.y += s.speedY;
          s.x += s.speedX + Math.sin(time * 0.03 + s.y * 0.01) * 0.7;
          if (s.y > height) {
            s.y = -5;
            s.x = Math.random() * width;
          }
          if (s.x > width) s.x = 0;
          ctx.fillStyle = '#bae6fd';
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;

      } else if (theme === 'hyperdrive') {
        // Hyperspace warp corridor
        ctx.fillStyle = '#020208';
        ctx.fillRect(0, 0, width, height);

        const cx = width * 0.5;
        const cy = height * 0.5;

        // Central blue hyperspace core
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const hGlow = ctx.createRadialGradient(cx, cy, 5, cx, cy, 140);
        hGlow.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
        hGlow.addColorStop(0.5, 'rgba(99, 102, 241, 0.2)');
        hGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = hGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
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

      } else if (theme === 'scanlines') {
        // 35mm Hollywood Vintage Projector Beam & Celluloid
        ctx.fillStyle = '#0a0604';
        ctx.fillRect(0, 0, width, height);

        // Projector light cone expanding from the left
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const beamFlicker = 0.32 + Math.sin(time * 0.15) * 0.05 + (Math.random() - 0.5) * 0.04;
        const pBeam = ctx.createRadialGradient(0, height * 0.5, 10, width * 0.8, height * 0.5, width * 0.85);
        pBeam.addColorStop(0, `rgba(251, 191, 36, ${beamFlicker})`);
        pBeam.addColorStop(0.6, 'rgba(217, 119, 6, 0.12)');
        pBeam.addColorStop(1, 'transparent');
        ctx.fillStyle = pBeam;
        ctx.fillRect(0, 0, width, height);

        // Floating dust motes drifting across the projector beam
        dustMotes.forEach(d => {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0) d.x = width;
          if (d.x > width) d.x = 0;
          if (d.y < 0) d.y = height;
          if (d.y > height) d.y = 0;
          ctx.fillStyle = '#fef3c7';
          ctx.globalAlpha = d.alpha * (0.5 + Math.sin(time * 0.04 + d.x) * 0.5);
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Subtle analog 35mm film scanlines & grain
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        for (let y = 0; y < height; y += 4) {
          ctx.fillRect(0, y, width, 1.2);
        }

        // Random subtle analog celluloid hair/jitter
        if (Math.random() > 0.85) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
          ctx.lineWidth = 1;
          const rx = Math.random() * width;
          ctx.beginPath();
          ctx.moveTo(rx, 0);
          ctx.lineTo(rx + (Math.random() - 0.5) * 8, height);
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
