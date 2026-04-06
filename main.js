document.addEventListener('DOMContentLoaded', () => {
  // 1. NAV & MOBILE MENU
  const navbar = document.getElementById('navbar');
  const hamBtn = document.getElementById('ham-btn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const drawerClose = document.getElementById('drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-nav a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  const toggleDrawer = () => {
    if (drawer) drawer.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  };

  if (hamBtn) hamBtn.addEventListener('click', toggleDrawer);
  if (overlay) overlay.addEventListener('click', toggleDrawer);
  if (drawerClose) drawerClose.addEventListener('click', toggleDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', toggleDrawer));

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
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
        cursorRing.style.borderColor = 'var(--secondary)';
      });
      el.addEventListener('mouseleave', () => {
        cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
        cursorRing.style.borderColor = 'rgba(255,255,255,0.3)';
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
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w || this.y < 0 || this.y > h) this.reset();
      }
      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

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

  // 5. SOLAR SIMULATOR
  const states = [
    { name: 'Tocantins', code: 'TO', rate: 0.92, icms: 25 },
    { name: 'Maranhão', code: 'MA', rate: 0.98, icms: 27 },
    { name: 'Piauí', code: 'PI', rate: 0.95, icms: 27 },
    { name: 'Bahia', code: 'BA', rate: 0.89, icms: 25 },
    { name: 'Goiás', code: 'GO', rate: 0.85, icms: 25 }
  ];

  const aparelhos = [
    { name: 'Ar Condicionado', watts: 1000, use: 8 },
    { name: 'Geladeira', watts: 150, use: 24 },
    { name: 'Chuveiro', watts: 5500, use: 0.5 },
    { name: 'Iluminação/TV', watts: 200, use: 6 }
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

  // Perfil
  document.querySelectorAll('.perfil-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.perfil-btn').forEach(b => b.classList.remove('perfil-active'));
      btn.classList.add('perfil-active');
      const kwh = btn.getAttribute('data-perfil-kwh');
      if (kwhSlider) {
        kwhSlider.value = kwh;
        updateUI();
      }
    });
  });

  // Aparelhos
  const aparelhosGrid = document.getElementById('aparelhos-grid');
  if (aparelhosGrid) {
    aparelhos.forEach((ap, idx) => {
      const item = document.createElement('div');
      item.className = 'input-group';
      item.innerHTML = `
        <label>${ap.name} (Qtd)</label>
        <input type="number" value="0" min="0" data-idx="${idx}" class="ap-input" style="width:100%">
      `;
      aparelhosGrid.appendChild(item);
    });

    aparelhosGrid.addEventListener('input', () => {
      let totalKwh = 0;
      document.querySelectorAll('.ap-input').forEach(input => {
        const idx = input.getAttribute('data-idx');
        const qty = parseInt(input.value) || 0;
        const ap = aparelhos[idx];
        totalKwh += (ap.watts * ap.use * 30 * qty) / 1000;
      });
      if (kwhSlider) {
        kwhSlider.value = Math.min(Math.max(Math.round(totalKwh), 50), 2000);
        updateUI();
      }
    });
  }

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

  // 6. FOOTER & STATS
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
