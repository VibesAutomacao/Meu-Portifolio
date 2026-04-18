/* snow.js
   - Cria um canvas full-screen para uma neve leve e discreta
   - Adiciona um elemento 'Papai Noel' (emoji) que cruza a tela a cada ~40s
   - Mantém pointer-events:none para não atrapalhar leitura/uso
*/
(function(){
  const canvas = document.getElementById('snow-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const DPR = window.devicePixelRatio || 1;

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
    const count = Math.min(120, Math.max(50, Math.floor(window.innerWidth/12)));
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*window.innerWidth,
        y: Math.random()*window.innerHeight,
        r: rand(0.6,2.2), // small
        a: rand(0.25,0.9),
        vx: rand(-0.3,0.6),
        vy: rand(0.15,0.9),
        angle: rand(0, Math.PI*2),
        swing: rand(0.5,1.6)
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
  document.addEventListener('visibilitychange', function(){
    if(document.hidden){ /* keep running but low-priority; could pause if desired */ }
  });

  resize();
  requestAnimationFrame(update);

  /* Papai Noel - emoji que cruza a tela a cada ~40s */
  const santa = document.createElement('div');
  santa.id = 'santa';
  santa.setAttribute('aria-hidden','true');
  santa.textContent = '🎅';
  document.body.appendChild(santa);

  function flySanta(){
    const top = 5 + Math.random()*25; // 5% - 30%
    santa.style.top = top + '%';
    // retrigger CSS animation
    santa.classList.remove('santa-fly');
    // force reflow
    void santa.offsetWidth;
    santa.classList.add('santa-fly');
  }

  // Primeiro voo após 5s, depois a cada ~40s
  setTimeout(flySanta, 5000);
  setInterval(flySanta, 40000);

})();
