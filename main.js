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
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
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
      
      setTimeout(() => {
        cursorRing.style.left = e.clientX + 'px';
        cursorRing.style.top = e.clientY + 'px';
      }, 50);
    });

    document.querySelectorAll('a, button, input, select').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        cursor.style.opacity = '0.5';
        cursorRing.style.width = '60px';
        cursorRing.style.height = '60px';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.opacity = '1';
        cursorRing.style.width = '36px';
        cursorRing.style.height = '36px';
      });
    });
  }

  // 4. BACKGROUND CANVAS (Simple Particles)
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
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw() {
        ctx.fillStyle = 'rgba(0, 255, 204, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

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

  // 5. ORBIT CANVAS (Quem Somos)
  const orbitCanvas = document.getElementById('orbit-canvas');
  if (orbitCanvas) {
    const ctx = orbitCanvas.getContext('2d');
    let w = orbitCanvas.width = 400;
    let h = orbitCanvas.height = 400;

    const animateOrbit = (t) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
      ctx.lineWidth = 1;
      
      // Orbits
      for(let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(w/2, h/2, 50 * i, 0, Math.PI * 2);
        ctx.stroke();
        
        // Planet on orbit
        const angle = (t * 0.001 * (4 - i)) % (Math.PI * 2);
        const px = w/2 + Math.cos(angle) * (50 * i);
        const py = h/2 + Math.sin(angle) * (50 * i);
        
        ctx.fillStyle = '#00ffcc';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.shadowBlur = 10;
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
    { name: 'Tocantins', code: 'TO', rate: 0.92, icms: 25, dist: 'Energisa TO' },
    { name: 'Maranhão', code: 'MA', rate: 0.98, icms: 27, dist: 'Equatorial MA' },
    { name: 'Piauí', code: 'PI', rate: 0.95, icms: 27, dist: 'Equatorial PI' },
    { name: 'Bahia', code: 'BA', rate: 0.89, icms: 25, dist: 'Coelba' },
    { name: 'Goiás', code: 'GO', rate: 0.85, icms: 25, dist: 'Equatorial GO' }
  ];

  const aparelhos = [
    { name: 'Ar Condicionado 9k BTU', watts: 800, use: 8 },
    { name: 'Ar Condicionado 12k BTU', watts: 1100, use: 8 },
    { name: 'Geladeira Duplex', watts: 150, use: 24 },
    { name: 'Geladeira Simples', watts: 100, use: 24 },
    { name: 'Chuveiro Elétrico', watts: 5500, use: 0.5 },
    { name: 'Lâmpadas LED (10un)', watts: 90, use: 6 },
    { name: 'Televisor LED', watts: 100, use: 5 },
    { name: 'Computador/Notebook', watts: 150, use: 8 },
    { name: 'Máquina de Lavar', watts: 500, use: 1 },
    { name: 'Ferro de Passar', watts: 1200, use: 0.5 }
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

  // Tab switching
  const tabs = document.querySelectorAll('.adj-tab');
  const panels = document.querySelectorAll('.adj-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('adj-tab-active'));
      tab.classList.add('adj-tab-active');
      const target = tab.getAttribute('data-tab');
      panels.forEach(p => {
        if (p.id === `panel-${target}`) {
          p.style.display = 'block';
        } else {
          p.style.display = 'none';
        }
      });
    });
  });

  // Simulator Inputs
  const billInput = document.getElementById('bill-input');
  const kwhSlider = document.getElementById('kwh-slider');
  const sliderLabel = document.getElementById('slider-kwh-label');
  const calculateBtn = document.getElementById('calculate-btn');
  const results = document.getElementById('results');

  // Update slider label
  if (kwhSlider && sliderLabel) {
    kwhSlider.addEventListener('input', () => {
      sliderLabel.textContent = `${kwhSlider.value} kWh`;
      updateLiveCalculations();
    });
    sliderLabel.textContent = `${kwhSlider.value} kWh`;
  }

  // Populate aparelhos grid
  const aparelhosGrid = document.getElementById('aparelhos-grid');
  if (aparelhosGrid) {
    aparelhos.forEach((ap, idx) => {
      const item = document.createElement('div');
      item.className = 'aparelho-item';
      item.innerHTML = `
        <label>${ap.name}</label>
        <div class="ap-watts">${ap.watts}W</div>
        <input type="number" value="0" min="0" data-idx="${idx}" class="ap-input">
      `;
      aparelhosGrid.appendChild(item);
    });

    document.querySelectorAll('.ap-input').forEach(input => {
      input.addEventListener('input', updateAparelhosTotal);
    });
  }

  // Presets
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const kwh = btn.getAttribute('data-kwh');
      kwhSlider.value = kwh;
      sliderLabel.textContent = `${kwh} kWh`;
      updateLiveCalculations();
    });
  });

  // Perfil
  document.querySelectorAll('.perfil-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.perfil-btn').forEach(b => b.classList.remove('perfil-active'));
      btn.classList.add('perfil-active');
      const kwh = btn.getAttribute('data-perfil-kwh');
      kwhSlider.value = kwh;
      sliderLabel.textContent = `${kwh} kWh`;
      updateLiveCalculations();
    });
  });

  // Bandeira
  document.querySelectorAll('.bandeira-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bandeira-btn').forEach(b => b.classList.remove('active-band'));
      btn.classList.add('active-band');
      const nome = btn.getAttribute('data-nome');
      const valor = parseFloat(btn.getAttribute('data-valor'));
      document.getElementById('band-nome-ativo').textContent = nome;
      document.getElementById('band-valor-ativo').textContent = `R$ ${valor.toFixed(5)}/kWh`;
      updateLiveCalculations();
    });
  });

  // Subclass
  document.querySelectorAll('#subclass-btns button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#subclass-btns button').forEach(b => b.classList.remove('adj-tab-active'));
      btn.classList.add('adj-tab-active');
      updateLiveCalculations();
    });
  });

  function updateAparelhosTotal() {
    let totalKwh = 0;
    document.querySelectorAll('.ap-input').forEach(input => {
      const idx = input.getAttribute('data-idx');
      const qty = parseInt(input.value) || 0;
      const ap = aparelhos[idx];
      totalKwh += (ap.watts * ap.use * 30 * qty) / 1000;
    });
    const apTotal = document.getElementById('ap-total-kwh');
    if (apTotal) apTotal.textContent = `${Math.round(totalKwh)} kWh/mês`;
    kwhSlider.value = Math.round(totalKwh);
    sliderLabel.textContent = `${kwhSlider.value} kWh`;
    updateLiveCalculations();
  }

  // Live Calculations Update
  function updateLiveCalculations() {
    const kwh = parseFloat(kwhSlider.value) || 0;
    const stateCode = stateSelect.value;
    const state = states.find(s => s.code === stateCode) || states[0];
    
    const activeBand = document.querySelector('.bandeira-btn.active-band');
    const bandValue = activeBand ? parseFloat(activeBand.getAttribute('data-valor')) : 0;
    const bandCost = kwh * bandValue;

    const energyCost = kwh * state.rate;
    const icmsVal = (energyCost + bandCost) * (state.icms / 100);
    const total = energyCost + icmsVal + bandCost;

    // Update table
    document.getElementById('ct-kwh').textContent = kwh;
    document.getElementById('ct-dia').textContent = `R$ ${(total / 30).toFixed(2)}`;
    document.getElementById('ct-energia').textContent = `R$ ${energyCost.toFixed(2)}`;
    document.getElementById('ct-tributos').textContent = `R$ ${icmsVal.toFixed(2)}`;
    document.getElementById('ct-bandeira').textContent = `R$ ${bandCost.toFixed(2)}`;
    document.getElementById('ct-total').textContent = `R$ ${total.toFixed(2)}`;
    document.getElementById('ct-solar').textContent = `R$ ${(total * 0.05).toFixed(2)}`;

    // Update breakdown bar
    const barEnergia = document.getElementById('bar-energia');
    const barTributos = document.getElementById('bar-tributos');
    const barBandeira = document.getElementById('bar-bandeira');
    if (barEnergia && barTributos && barBandeira) {
      const energyPct = (energyCost / total) * 100;
      const icmsPct = (icmsVal / total) * 100;
      const bandPct = (bandCost / total) * 100;
      barEnergia.style.width = `${energyPct}%`;
      barTributos.style.width = `${icmsPct}%`;
      barBandeira.style.width = `${bandPct}%`;
      document.getElementById('bar-pct').textContent = `${Math.round(energyPct)}% Energia / ${Math.round(icmsPct)}% Tributos / ${Math.round(bandPct)}% Bandeira`;
    }
    
    // Show slider block if bill is entered
    document.getElementById('slider-block').style.display = 'block';
    document.getElementById('tariff-box').style.display = 'block';
    document.getElementById('tb-dist').textContent = state.dist;
    document.getElementById('tb-rate').textContent = `R$ ${state.rate.toFixed(4)}`;
    document.getElementById('tb-icms').textContent = `${state.icms}%`;
    document.getElementById('tb-vigencia').textContent = '2025-2026';
  }

  if (billInput) {
    billInput.addEventListener('input', () => {
      const bill = parseFloat(billInput.value) || 0;
      const stateCode = stateSelect.value;
      const state = states.find(s => s.code === stateCode) || states[0];
      const kwh = bill / (state.rate * (1 + state.icms/100));
      kwhSlider.value = Math.round(kwh);
      sliderLabel.textContent = `${Math.round(kwh)} kWh`;
      updateLiveCalculations();
    });
  }

  if (stateSelect) {
    stateSelect.addEventListener('change', updateLiveCalculations);
  }

  // Final Calculation
  if (calculateBtn) {
    calculateBtn.addEventListener('click', () => {
      const kwh = parseFloat(kwhSlider.value);
      if (!kwh || kwh <= 0) {
        alert('Por favor, ajuste o consumo primeiro.');
        return;
      }

      const panels = Math.ceil(kwh / 50); 
      const watts = panels * 550;
      const inverter = (watts / 1000) * 0.8;
      const bill = parseFloat(document.getElementById('ct-total').textContent.replace('R$ ', ''));
      const annualSavings = (bill * 0.95) * 12;
      const total25Years = annualSavings * 25;
      const area = panels * 2.2;

      document.getElementById('res-panels').textContent = panels;
      document.getElementById('res-watts').textContent = watts + 'W';
      document.getElementById('res-inverter').textContent = inverter.toFixed(1) + 'kW';
      document.getElementById('res-savings').textContent = 'R$ ' + annualSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      document.getElementById('res-kwh').textContent = Math.round(kwh);
      document.getElementById('res-area').textContent = area.toFixed(1);
      document.getElementById('res-25anos').textContent = 'R$ ' + total25Years.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

      results.style.display = 'block';
      results.classList.add('show');
      results.scrollIntoView({ behavior: 'smooth' });

      const msg = encodeURIComponent(`Olá! Fiz uma simulação no site. Consumo estimado: ${Math.round(kwh)} kWh/mês. O sistema sugeriu ${panels} módulos de 550W.`);
      const waLink = document.getElementById('whatsapp-link');
      if (waLink) waLink.href = `https://wa.me/5589981451993?text=${msg}`;
    });
  }

  // Footer year
  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  // Stats counter
  const statsNums = document.querySelectorAll('.stat-num');
  const startCounter = () => {
    statsNums.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'));
      let count = 0;
      const duration = 2000;
      const increment = target / (duration / 20);
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
