document.addEventListener('DOMContentLoaded', () => {
  // 1. NAV SCROLL EFFECT
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. REVEAL ANIMATION
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    reveals.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        el.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();

  // 3. CUSTOM CURSOR
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  
  if (cursor && cursorRing) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      
      requestAnimationFrame(() => {
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top = e.clientY + 'px';
      });
    });

    document.querySelectorAll('a, button, input, select').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
        cursorRing.style.borderColor = 'var(--primary)';
        cursorRing.style.background = 'rgba(0, 255, 204, 0.05)';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.width = '30px';
        cursorRing.style.height = '32px';
        cursorRing.style.borderColor = 'var(--primary-glow)';
        cursorRing.style.background = 'transparent';
      });
    });
  }

  // 4. BACKGROUND CANVAS (Subtle Particles)
  const bgCanvas = document.getElementById('bg-canvas');
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let w, h, particles = [];

    const resize = () => {
      w = bgCanvas.width = window.innerWidth;
      h = bgCanvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 1.2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }

  // 5. ORBIT CANVAS (About Section)
  const orbitCanvas = document.getElementById('orbit-canvas');
  if (orbitCanvas) {
    const ctx = orbitCanvas.getContext('2d');
    let w = orbitCanvas.width = 400;
    let h = orbitCanvas.height = 400;

    const animateOrbit = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.15)';
      ctx.lineWidth = 1;
      
      // Orbits
      for(let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(w/2, h/2, 50 * i, 0, Math.PI * 2);
        ctx.stroke();
        
        // Planet on orbit
        const angle = (t * 0.0008 * (4 - i)) % (Math.PI * 2);
        const px = w/2 + Math.cos(angle) * (50 * i);
        const py = h/2 + Math.sin(angle) * (50 * i);
        
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffcc';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(animateOrbit);
    };
    requestAnimationFrame(animateOrbit);
  }

  // 6. SOLAR SIMULATOR
  const states = [
    { name: 'Tocantins', code: 'TO', rate: 0.92, icms: 25 },
    { name: 'Maranhão', code: 'MA', rate: 0.98, icms: 27 },
    { name: 'Piauí', code: 'PI', rate: 0.95, icms: 27 },
    { name: 'Bahia', code: 'BA', rate: 0.89, icms: 25 },
    { name: 'Goiás', code: 'GO', rate: 0.85, icms: 25 }
  ];

  const stateSelect = document.getElementById('state-select');
  if (stateSelect) {
    states.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.code;
      opt.textContent = `${s.name} (${s.code})`;
      stateSelect.appendChild(opt);
    });
  }

  const tabs = document.querySelectorAll('.adj-tab');
  const panels = document.querySelectorAll('.adj-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('perfil-btn')) return;
      tabs.forEach(t => t.classList.remove('adj-tab-active'));
      tab.classList.add('adj-tab-active');
      const target = tab.getAttribute('data-tab');
      panels.forEach(p => {
        p.style.display = (p.id === `panel-${target}`) ? 'block' : 'none';
      });
    });
  });

  const billInput = document.getElementById('bill-input');
  const kwhSlider = document.getElementById('kwh-slider');
  const sliderLabel = document.getElementById('slider-kwh-label');
  const calculateBtn = document.getElementById('calculate-btn');
  const results = document.getElementById('results');

  const updateUI = () => {
    const kwh = parseInt(kwhSlider.value);
    if (sliderLabel) sliderLabel.textContent = `${kwh} kWh/mês`;
  };

  if (kwhSlider) {
    kwhSlider.addEventListener('input', updateUI);
    updateUI();
  }

  if (billInput) {
    billInput.addEventListener('input', () => {
      const bill = parseFloat(billInput.value) || 0;
      const state = states.find(s => s.code === stateSelect.value) || states[0];
      const kwh = Math.round(bill / (state.rate * (1 + state.icms/100)));
      if (kwhSlider) {
        kwhSlider.value = Math.min(Math.max(kwh, 50), 2000);
        updateUI();
      }
    });
  }

  document.querySelectorAll('.perfil-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const kwh = btn.getAttribute('data-perfil-kwh');
      if (kwhSlider) {
        kwhSlider.value = kwh;
        updateUI();
      }
    });
  });

  if (calculateBtn) {
    calculateBtn.addEventListener('click', () => {
      const kwh = parseInt(kwhSlider.value);
      const state = states.find(s => s.code === stateSelect.value) || states[0];
      
      const billOriginal = kwh * (state.rate * (1 + state.icms/100));
      const annualSavings = (billOriginal * 0.95) * 12;
      const watts = Math.ceil(kwh / 50) * 550;

      document.getElementById('res-savings').textContent = 'R$ ' + Math.round(annualSavings).toLocaleString('pt-BR');
      document.getElementById('res-watts').textContent = watts + 'W';

      if (results) {
        results.style.display = 'block';
        results.scrollIntoView({ behavior: 'smooth' });
      }

      const msg = encodeURIComponent(`Olá! Fiz uma simulação. Consumo: ${kwh}kWh/mês em ${state.name}.`);
      const waLink = document.getElementById('whatsapp-link');
      if (waLink) waLink.href = `https://wa.me/5589981451993?text=${msg}`;
    });
  }

  // 7. FOOTER & STATS
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  const statsNums = document.querySelectorAll('.stat-num');
  const startCounter = () => {
    statsNums.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      let count = 0;
      const increment = target / 100;
      const update = () => {
        if (count < target) {
          count += increment;
          stat.textContent = Math.ceil(count);
          setTimeout(update, 20);
        } else {
          stat.textContent = target;
        }
      };
      update();
    });
  };

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        startCounter();
        observer.unobserve(statsSection);
      }
    });
    observer.observe(statsSection);
  }
});
