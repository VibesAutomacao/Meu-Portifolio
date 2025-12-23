/* snow.js - Neve discreta sem Papai Noel
   - Canvas full-screen com flocos pequenos e queda lenta
   - Não bloqueia interações (pointer-events:none)
*/
(function(){
  const canvas = document.getElementById('snow-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = window.devicePixelRatio || 1;
  let particles = [];

  function rand(min, max){ return Math.random()*(max-min)+min; }

  function resize(){
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    ctx.setTransform(DPR,0,0,DPR,0,0);
    initParticles();
  }

  function initParticles(){
    particles = [];
    const count = Math.min(120, Math.max(45, Math.floor(window.innerWidth/14)));
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*window.innerWidth,
        y: Math.random()*window.innerHeight,
        r: rand(0.6,2.0),
        a: rand(0.25,0.85),
        vx: rand(-0.35,0.45),
        vy: rand(0.12,0.8),
        angle: rand(0, Math.PI*2),
        swing: rand(0.6,1.4)
      });
    }
  }

  let last = performance.now();
  function update(now){
    const dt = Math.min(40, now - last) / 16.666;
    last = now;
    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
    for(let p of particles){
      p.angle += 0.01 * p.swing * dt;
      p.x += p.vx * dt + Math.sin(p.angle)*0.2;
      p.y += p.vy * dt;
      if(p.y > window.innerHeight + 10){ p.y = -10; p.x = Math.random()*window.innerWidth; }
      if(p.x > window.innerWidth + 20) p.x = -20;
      if(p.x < -20) p.x = window.innerWidth + 20;
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,'+ (p.a*0.9) +')';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(update);
  }

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(update);

})();
