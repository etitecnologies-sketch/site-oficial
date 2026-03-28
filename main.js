(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;

  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function initCursor() {
    if (!finePointer || prefersReducedMotion) return;

    const cursor = qs('#cursor');
    const ring = qs('#cursor-ring');
    if (!cursor || !ring) return;

    const move = (e) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    };
    on(document, 'mousemove', move, { passive: true });

    qsa('a, button').forEach((el) => {
      on(el, 'mouseenter', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        ring.style.width = '56px';
        ring.style.height = '56px';
      });
      on(el, 'mouseleave', () => {
        cursor.style.width = '12px';
        cursor.style.height = '12px';
        ring.style.width = '36px';
        ring.style.height = '36px';
      });
    });
  }

  function createBgCanvasLoop() {
    const canvas = qs('#bg-canvas');
    if (!canvas || prefersReducedMotion) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let raf = 0;
    let running = true;
    let particles = [];
    let w = 0;
    let h = 0;
    let dpr = 1;

    const particleCount = (() => {
      const base = Math.floor(window.innerWidth / 22);
      return Math.max(30, Math.min(80, base));
    })();

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) {
        particles = Array.from({ length: particleCount }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.5 + 0.5,
        }));
      }
    };

    resize();
    on(window, 'resize', resize, { passive: true });

    const draw = () => {
      if (!running) return;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,204,0.6)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,255,204,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const vis = () => {
      running = !document.hidden;
      if (running && !raf) draw();
      if (!running && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    on(document, 'visibilitychange', vis);

    draw();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }

  function initOrbitCanvas() {
    const oc = qs('#orbit-canvas');
    if (!oc || prefersReducedMotion) return;
    const ox = oc.getContext('2d');
    if (!ox) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let ot = 0;

    const resize = () => {
      const parent = oc.parentElement;
      if (!parent) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.floor(parent.offsetWidth);
      h = Math.floor(parent.offsetHeight);
      oc.width = Math.floor(w * dpr);
      oc.height = Math.floor(h * dpr);
      oc.style.width = w + 'px';
      oc.style.height = h + 'px';
      ox.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    on(window, 'resize', resize, { passive: true });

    const draw = () => {
      if (!running) return;
      ox.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const rings = [80, 130, 180];
      rings.forEach((r, i) => {
        ox.beginPath();
        ox.arc(cx, cy, r, 0, Math.PI * 2);
        ox.strokeStyle = `rgba(0,255,204,${0.08 + i * 0.04})`;
        ox.lineWidth = 1;
        ox.stroke();
        const angle = ot * (0.5 + i * 0.3) * Math.PI / 180;
        const px = cx + r * Math.cos(angle);
        const py = cy + r * Math.sin(angle);
        ox.beginPath();
        ox.arc(px, py, 4, 0, Math.PI * 2);
        ox.fillStyle = '#00ffcc';
        ox.shadowColor = '#00ffcc';
        ox.shadowBlur = 10;
        ox.fill();
        ox.shadowBlur = 0;
      });
      ot += 0.5;
      raf = requestAnimationFrame(draw);
    };

    const vis = () => {
      running = !document.hidden;
      if (running && !raf) draw();
      if (!running && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    on(document, 'visibilitychange', vis);

    draw();
  }

  function initNavbar() {
    const navbar = qs('#navbar');
    if (!navbar) return;
    const update = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
    update();
    on(window, 'scroll', update, { passive: true });
  }

  function initDrawer() {
    const ham = qs('#ham-btn');
    const drawer = qs('#drawer');
    const overlay = qs('#overlay');
    const dClose = qs('#drawer-close');
    if (!ham || !drawer || !overlay || !dClose) return;

    const open = () => {
      drawer.classList.add('open');
      overlay.classList.add('open');
      ham.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
    };

    ham.setAttribute('aria-expanded', 'false');

    on(ham, 'click', open);
    on(dClose, 'click', close);
    on(overlay, 'click', close);
    qsa('a', drawer).forEach((a) => on(a, 'click', close));
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }

  function initReveal() {
    const els = qsa('.reveal');
    if (!els.length) return;
    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
  }

  function initCounters() {
    if (prefersReducedMotion) return;
    const els = qsa('[data-target]');
    if (!els.length) return;
    setTimeout(() => {
      els.forEach((el) => {
        const target = Number(el.dataset.target);
        if (!Number.isFinite(target)) return;
        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
          const p = Math.min(1, (now - start) / duration);
          const val = Math.floor(target * p);
          if (p < 1) {
            el.textContent = String(val);
            requestAnimationFrame(tick);
          } else {
            el.textContent = String(target) + (target === 95 ? '%' : target === 24 ? 'h' : '+');
          }
        };
        requestAnimationFrame(tick);
      });
    }, 400);
  }

  function initSimulator() {
    const sel = qs('#state-select');
    if (!sel) return;

    const PERIOD_BASE_DAYS = 30;

    const STATES = [
      { uf: 'AC', name: 'Acre (AC)', rate: 0.988, icms: '17%', dist: 'Energisa Acre', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'AL', name: 'Alagoas (AL)', rate: 0.868, icms: '25%', dist: 'Equatorial Alagoas', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'AM', name: 'Amazonas (AM)', rate: 0.86, icms: '25%', dist: 'Amazonas Energia', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'AP', name: 'Amapá (AP)', rate: 0.81, icms: '17%', dist: 'CEA Equatorial', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'BA', name: 'Bahia (BA)', rate: 0.82, icms: '25%', dist: 'Neoenergia Coelba', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'CE', name: 'Ceará (CE)', rate: 0.72, icms: '25%', dist: 'Enel CE', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'DF', name: 'Distrito Federal (DF)', rate: 0.81, icms: '25%', dist: 'Neoenergia Brasília', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'ES', name: 'Espírito Santo (ES)', rate: 0.68, icms: '27%', dist: 'EDP Espírito Santo', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'GO', name: 'Goiás (GO)', rate: 0.84, icms: '25%', dist: 'Equatorial Goiás', vigencia: 'Mar 2025 – Fev 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'MA', name: 'Maranhão (MA)', rate: 0.8, icms: '22%', dist: 'Equatorial Maranhão', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'MT', name: 'Mato Grosso (MT)', rate: 0.88, icms: '25%', dist: 'Energisa Mato Grosso', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'MS', name: 'Mato Grosso do Sul (MS)', rate: 0.86, icms: '17%', dist: 'Energisa MS', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'MG', name: 'Minas Gerais (MG)', rate: 0.71, icms: '30%', dist: 'CEMIG', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'PA', name: 'Pará (PA)', rate: 0.978, icms: '25%', dist: 'Equatorial Pará', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'PB', name: 'Paraíba (PB)', rate: 0.588, icms: '25%', dist: 'Energisa Paraíba', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'PR', name: 'Paraná (PR)', rate: 0.76, icms: '29%', dist: 'Copel', vigencia: 'Jun 2025 – Mai 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'PE', name: 'Pernambuco (PE)', rate: 0.77, icms: '27%', dist: 'Neoenergia Pernambuco', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'PI', name: 'Piauí (PI)', rate: 0.88, icms: '25%', dist: 'Equatorial Piauí', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'RJ', name: 'Rio de Janeiro (RJ)', rate: 0.88, icms: '18%', dist: 'Enel RJ / Light', vigencia: 'Jul 2025 – Jun 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'RN', name: 'Rio Grande do Norte (RN)', rate: 0.74, icms: '25%', dist: 'Neoenergia Cosern', vigencia: 'Abr 2025 – Mar 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'RS', name: 'Rio Grande do Sul (RS)', rate: 0.72, icms: '30%', dist: 'Equatorial CEEE / RGE', vigencia: 'Nov 2025 – Out 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'RO', name: 'Rondônia (RO)', rate: 0.83, icms: '25%', dist: 'Energisa Rondônia', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'RR', name: 'Roraima (RR)', rate: 0.641, icms: '17%', dist: 'Equatorial Roraima', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'SC', name: 'Santa Catarina (SC)', rate: 0.66, icms: '25%', dist: 'Celesc', vigencia: 'Ago 2025 – Jul 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'SP', name: 'São Paulo (SP)', rate: 0.725, icms: '25%', dist: 'Enel SP / CPFL / EDP', vigencia: 'Jul 2025 – Jun 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'SE', name: 'Sergipe (SE)', rate: 0.84, icms: '27%', dist: 'Energisa Sergipe', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
      { uf: 'TO', name: 'Tocantins (TO)', rate: 0.92, icms: '25%', dist: 'Energisa Tocantins', vigencia: 'Out 2025 – Set 2026', url: 'https://www.aneel.gov.br/ranking-das-tarifas' },
    ].sort((a, b) => a.name.localeCompare(b.name));

    const fmt = (v) => 'R$ ' + v.toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const getDias = () => {
      const raw = Number.parseInt(qs('#dias-input')?.value || '30', 10);
      if (!Number.isFinite(raw) || raw < 1) return 30;
      return Math.min(raw, 31);
    };
    const getState = () => STATES.find((s) => s.uf === sel.value);

    const classSet = (el, cls, onOff) => el && el.classList.toggle(cls, !!onOff);

    STATES.forEach((s) => {
      const o = document.createElement('option');
      o.value = s.uf;
      o.textContent = `${s.name} — R$ ${s.rate.toFixed(3)}/kWh`;
      sel.appendChild(o);
    });
    sel.value = 'TO';

    let activeSubclass = 'b1';
    let activeBandeira = { nome: 'Amarela', valor: 0.01885 };
    let currentKwh30 = 300;

    function getSubclassRate(s) {
      if (activeSubclass === 'b1') return { rate: s.rate, label: 'Residencial (B1)', faixas: null };

      if (activeSubclass === 'br') {
        const brRates = {
          TO: { ate80: 0.0, acima80: 0.82952 },
          AC: { ate80: 0.0, acima80: 0.75 },
          AL: { ate80: 0.0, acima80: 0.68 },
          AM: { ate80: 0.0, acima80: 0.66 },
          AP: { ate80: 0.0, acima80: 0.6 },
          BA: { ate80: 0.0, acima80: 0.63 },
          CE: { ate80: 0.0, acima80: 0.55 },
          DF: { ate80: 0.0, acima80: 0.62 },
          ES: { ate80: 0.0, acima80: 0.52 },
          GO: { ate80: 0.0, acima80: 0.65 },
          MA: { ate80: 0.0, acima80: 0.61 },
          MT: { ate80: 0.0, acima80: 0.68 },
          MS: { ate80: 0.0, acima80: 0.66 },
          MG: { ate80: 0.0, acima80: 0.54 },
          PA: { ate80: 0.0, acima80: 0.75 },
          PB: { ate80: 0.0, acima80: 0.45 },
          PR: { ate80: 0.0, acima80: 0.58 },
          PE: { ate80: 0.0, acima80: 0.59 },
          PI: { ate80: 0.0, acima80: 0.67 },
          RJ: { ate80: 0.0, acima80: 0.67 },
          RN: { ate80: 0.0, acima80: 0.57 },
          RS: { ate80: 0.0, acima80: 0.55 },
          RO: { ate80: 0.0, acima80: 0.64 },
          RR: { ate80: 0.0, acima80: 0.49 },
          SC: { ate80: 0.0, acima80: 0.5 },
          SP: { ate80: 0.0, acima80: 0.55 },
          SE: { ate80: 0.0, acima80: 0.64 },
        };
        const br = brRates[s.uf] || { ate80: 0, acima80: s.rate * 0.89 };
        return { rate: br.acima80, label: 'Baixa Renda (CadÚnico)', faixas: br, isBaixaRenda: true };
      }

      if (activeSubclass === 'rural') return { rate: s.rate * 0.78, label: 'Rural (B2)', faixas: null };
      if (activeSubclass === 'comercial') return { rate: s.rate * 1.08, label: 'Comercial (B3)', faixas: null };
      return { rate: s.rate, label: 'Residencial (B1)', faixas: null };
    }

    function calcEnergiaBaixaRenda(kwhPeriodo, faixas, dias) {
      const limite = 80 * (dias / PERIOD_BASE_DAYS);
      if (kwhPeriodo <= limite) return 0;
      return (kwhPeriodo - limite) * faixas.acima80;
    }

    function calcCost(kwh30) {
      const s = getState();
      if (!s) return null;
      const dias = getDias();
      const sub = getSubclassRate(s);

      const kwhPeriodo = kwh30 * (dias / PERIOD_BASE_DAYS);
      const kwhDia = kwhPeriodo / dias;

      let energia = 0;
      if (sub.isBaixaRenda && sub.faixas) energia = calcEnergiaBaixaRenda(kwhPeriodo, sub.faixas, dias);
      else energia = kwhPeriodo * sub.rate;

      const pisCofins = energia * 0.085;
      const icmsVal = energia * (Number.parseInt(s.icms, 10) / 100);
      const tributos = pisCofins + icmsVal;
      const bandeira = kwhPeriodo * activeBandeira.valor * (sub.isBaixaRenda ? 0.65 : 1);
      const total = energia + tributos + bandeira;
      const comSolar = total * 0.05;
      const custoDia = total / dias;

      return { kwh30, kwhPeriodo, kwhDia, energia, tributos, bandeira, total, comSolar, custoDia, dias, s, sub };
    }

    function updateTariffBox() {
      const s = getState();
      if (!s) return;
      const sub = getSubclassRate(s);
      qs('#tariff-box').style.display = 'block';
      qs('#tb-dist').textContent = s.dist;
      qs('#tb-rate').textContent = `R$ ${sub.rate.toFixed(5)}/kWh`;
      qs('#tb-icms').textContent = s.icms;
      qs('#tb-vigencia').textContent = s.vigencia;
      qs('#tb-aneel').href = s.url;

      const faixasWrap = qs('#tb-faixas-wrap');
      if (sub.isBaixaRenda && sub.faixas) {
        faixasWrap.style.display = 'block';
        qs('#tb-faixas').innerHTML = `0–80 kWh → R$ 0,00000 (ISENTO)<br>Acima de 80 kWh → R$ ${sub.faixas.acima80.toFixed(5)}/kWh`;
      } else {
        faixasWrap.style.display = 'none';
      }
    }

    function updateDiasInfo(c) {
      const box = qs('#dias-info');
      if (!box || !c) return;
      box.style.display = 'block';
      qs('#dias-kwh-dia').textContent = c.kwhDia.toFixed(1);
      qs('#dias-custo-dia').textContent = fmt(c.custoDia);
    }

    function updateCostDisplay() {
      const dias = getDias();
      const c = calcCost(currentKwh30);
      if (!c) return;

      qs('#slider-kwh-label').textContent = `${Math.round(c.kwh30)} kWh/mês · ${dias} dias`;
      qs('#ct-kwh').textContent = Math.round(c.kwh30);
      qs('#ct-dia').textContent = fmt(c.custoDia);
      qs('#ct-energia').textContent = fmt(c.energia);
      qs('#ct-tributos').textContent = fmt(c.tributos);
      qs('#ct-bandeira').textContent = fmt(c.bandeira);
      qs('#ct-total').textContent = fmt(c.total);
      qs('#ct-solar').textContent = fmt(c.comSolar);
      updateDiasInfo(c);

      const total = c.total || 0;
      const bE = total ? (c.energia / total) * 100 : 0;
      const bT = total ? (c.tributos / total) * 100 : 0;
      const bB = total ? (c.bandeira / total) * 100 : 0;

      qs('#bar-energia').style.width = bE.toFixed(1) + '%';
      qs('#bar-tributos').style.width = bT.toFixed(1) + '%';
      qs('#bar-bandeira').style.width = bB.toFixed(1) + '%';
      qs('#bar-pct').textContent = `Energia ${bE.toFixed(1)}% · Tributos ${bT.toFixed(1)}% · Bandeira ${bB.toFixed(1)}%`;
    }

    function applyKwh30(kwh30) {
      currentKwh30 = Math.max(50, Math.min(9999, Math.round(kwh30)));
      const slider = qs('#kwh-slider');
      slider.value = Math.min(currentKwh30, 2000);
      const pct = ((Math.min(currentKwh30, 2000) - 50) / (2000 - 50)) * 100;
      slider.style.setProperty('--pct', pct + '%');
      updateCostDisplay();
    }

    function setTab(name) {
      ['slider', 'kwh', 'aparelhos', 'perfil', 'bandeira'].forEach((t) => {
        qs('#panel-' + t).style.display = t === name ? 'block' : 'none';
        classSet(qs('#tab-' + t), 'adj-tab-active', t === name);
      });
    }

    function setSubclass(sc) {
      activeSubclass = sc;
      ['b1', 'br', 'rural', 'comercial'].forEach((id) => classSet(qs('#sc-' + id), 'adj-tab-active', id === sc));

      const infos = {
        b1: '🏠 Tarifa padrão residencial (B1) — sem desconto especial. Tarifa única por kWh conforme ANEEL.',
        br: '♿ Tarifa Social (Baixa Renda) — até 80 kWh/mês: ISENTO (R$ 0,00). Acima de 80 kWh: tarifa reduzida. Exige cadastro no CadÚnico/BPC.',
        rural: '🌾 Tarifa rural (B2) — desconto de ~22% sobre a tarifa residencial padrão. Para propriedades com atividade agropecuária.',
        comercial: '🏪 Tarifa comercial (B3) — acréscimo de ~8% sobre a tarifa residencial. Para estabelecimentos comerciais e de serviços.',
      };
      qs('#subclass-info').textContent = infos[sc] || infos.b1;
      updateTariffBox();
      updateCostDisplay();
    }

    function setBandeira(id, valor, nome) {
      activeBandeira = { nome, valor };
      qsa('.bandeira-btn').forEach((b) => b.classList.remove('active-band'));
      const active = qs('#band-' + id);
      if (active) active.classList.add('active-band');
      qs('#band-nome-ativo').textContent = nome;
      qs('#band-valor-ativo').textContent = valor === 0 ? 'R$ 0,00 (sem acréscimo)' : `R$ ${valor.toFixed(5)}/kWh`;
      updateCostDisplay();
    }

    const APARELHOS = [
      { nome: '💡 Lâmpada LED 9W', watts: 9, horas: 6 },
      { nome: '💡 Lâmpada LED 15W', watts: 15, horas: 6 },
      { nome: '❄️ Ar-cond. 9.000 BTU', watts: 900, horas: 8 },
      { nome: '❄️ Ar-cond. 12.000 BTU', watts: 1100, horas: 8 },
      { nome: '❄️ Ar-cond. 18.000 BTU', watts: 1700, horas: 8 },
      { nome: '🖥️ TV 40\"', watts: 70, horas: 6 },
      { nome: '🖥️ Computador', watts: 200, horas: 8 },
      { nome: '🧊 Geladeira Frost Free', watts: 130, horas: 24 },
      { nome: '🧊 Freezer', watts: 180, horas: 24 },
      { nome: '👕 Máquina de Lavar', watts: 1500, horas: 1 },
      { nome: '👕 Secadora de Roupa', watts: 2500, horas: 1 },
      { nome: '♨️ Chuveiro Elétrico', watts: 5500, horas: 0.5 },
      { nome: '🍳 Forno Elétrico', watts: 2000, horas: 1 },
      { nome: '🫙 Micro-ondas', watts: 1200, horas: 0.5 },
      { nome: "💧 Bomba d'água 1/2cv", watts: 370, horas: 4 },
      { nome: "💧 Bomba d'água 1cv", watts: 736, horas: 4 },
      { nome: '🔌 Ferro de Passar', watts: 1200, horas: 1 },
      { nome: '📶 Roteador Wi-Fi', watts: 10, horas: 24 },
    ];

    const grid = qs('#aparelhos-grid');
    if (grid) {
      APARELHOS.forEach((ap, i) => {
        const div = document.createElement('div');
        div.className = 'aparelho-item';
        div.innerHTML = `
          <label>${ap.nome}<br><span style="font-size:11px;color:var(--muted)">${ap.watts}W · ${ap.horas}h/dia padrão</span></label>
          <input type="number" id="ap-${i}" value="0" min="0" max="99" inputmode="numeric">
          <span class="ap-watts" id="ap-kwh-${i}">0 kWh</span>
        `;
        grid.appendChild(div);
      });

      const calcAparelhos = () => {
        let total = 0;
        APARELHOS.forEach((ap, i) => {
          const qty = Number.parseInt(qs('#ap-' + i).value || '0', 10) || 0;
          const kwh = qty * ap.watts * ap.horas * PERIOD_BASE_DAYS / 1000;
          qs('#ap-kwh-' + i).textContent = kwh.toFixed(1) + ' kWh';
          total += kwh;
        });
        qs('#ap-total-kwh').textContent = Math.round(total) + ' kWh/mês';
        if (total > 0) applyKwh30(total);
      };
      on(grid, 'input', calcAparelhos);
    }

    function estimateKwhFromBill(bill) {
      let lo = 50;
      let hi = 15000;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        const c = calcCost(mid);
        if (!c) return 0;
        if (c.total > bill) hi = mid;
        else lo = mid;
      }
      return (lo + hi) / 2;
    }

    function syncFromBill() {
      const bill = Number.parseFloat(qs('#bill-input')?.value || '');
      if (!Number.isFinite(bill) || bill <= 0) return;
      const est = estimateKwhFromBill(bill);
      qs('#slider-block').style.display = 'block';
      applyKwh30(est);
    }

    qsa('[data-subclass]').forEach((btn) => on(btn, 'click', () => setSubclass(btn.dataset.subclass)));
    qsa('[data-tab]').forEach((btn) => on(btn, 'click', () => setTab(btn.dataset.tab)));
    qsa('[data-kwh]').forEach((btn) => on(btn, 'click', () => applyKwh30(Number(btn.dataset.kwh))));

    qsa('[data-perfil-kwh]').forEach((btn) => {
      on(btn, 'click', () => {
        qsa('.perfil-btn').forEach((b) => b.classList.remove('perfil-active'));
        btn.classList.add('perfil-active');
        applyKwh30(Number(btn.dataset.perfilKwh));
      });
    });

    qsa('[data-bandeira]').forEach((btn) => {
      on(btn, 'click', () => {
        setBandeira(btn.dataset.bandeira, Number(btn.dataset.valor), btn.dataset.nome);
      });
    });

    on(qs('#kwh-slider'), 'input', (e) => applyKwh30(Number(e.target.value)));

    on(qs('#kwh-direto'), 'input', (e) => {
      const v = Number.parseFloat(e.target.value);
      if (!Number.isFinite(v) || v <= 0) return;
      qs('#kwh-dia-direto').value = (v / PERIOD_BASE_DAYS).toFixed(1);
      applyKwh30(v);
    });
    on(qs('#kwh-dia-direto'), 'input', (e) => {
      const v = Number.parseFloat(e.target.value);
      if (!Number.isFinite(v) || v <= 0) return;
      const mes = Math.round(v * PERIOD_BASE_DAYS);
      qs('#kwh-direto').value = String(mes);
      applyKwh30(mes);
    });

    on(qs('#bill-input'), 'input', syncFromBill);
    on(qs('#dias-input'), 'input', () => {
      updateTariffBox();
      updateCostDisplay();
      syncFromBill();
    });
    on(sel, 'change', () => {
      updateTariffBox();
      updateCostDisplay();
      syncFromBill();
    });

    updateTariffBox();
    qs('#subclass-info').textContent = '🏠 Tarifa padrão residencial (B1) — sem desconto especial. Tarifa única por kWh conforme ANEEL.';
    applyKwh30(currentKwh30);

    on(qs('#calculate-btn'), 'click', () => {
      const bill = Number.parseFloat(qs('#bill-input')?.value || '');
      if (!Number.isFinite(bill) || bill <= 0) {
        alert('Insira um valor válido para a conta.');
        return;
      }

      qs('#slider-block').style.display = 'block';
      syncFromBill();

      const dias = getDias();
      const s = getState();
      const kwh = currentKwh30;
      const kwp = kwh / (5.0 * PERIOD_BASE_DAYS * 0.8);
      const panels = Math.ceil((kwp * 1000) / 550);
      const watts = panels * 550;
      const inv = (watts / 1000) * 0.9;

      const c = calcCost(kwh);
      const mensalEstimado = c.total * (PERIOD_BASE_DAYS / dias);
      const savings = mensalEstimado * 12;
      const area = panels * 2.6;
      const savings25 = savings * 25 * 1.07;

      qs('#res-panels').textContent = String(panels);
      qs('#res-watts').textContent = watts + 'W';
      qs('#res-inverter').textContent = inv.toFixed(1) + 'kW';
      qs('#res-savings').textContent = 'R$ ' + savings.toLocaleString('pt-br', { minimumFractionDigits: 0 });
      qs('#res-kwh').textContent = String(kwh);
      qs('#res-area').textContent = String(Math.round(area));
      qs('#res-25anos').textContent = fmt(savings25);

      const msg = encodeURIComponent(
        `Olá! Simulei no site ETI.\nEstado: ${s.name}\nConta: R$ ${bill} (${dias} dias)\nConsumo: ${kwh} kWh/mês\nBandeira: ${activeBandeira.nome}\nSistema: ${watts}W com ${panels} módulos\nQuero um orçamento detalhado!`
      );
      qs('#whatsapp-link').href = `https://wa.me/5589981451993?text=${msg}`;

      const r = qs('#results');
      r.classList.remove('show');
      void r.offsetWidth;
      r.style.display = 'block';
      r.classList.add('show');
      setTimeout(() => r.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    });
  }

  function setFooterYear() {
    const el = qs('#footer-year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    createBgCanvasLoop();
    initOrbitCanvas();
    initNavbar();
    initDrawer();
    initCounters();
    initReveal();
    initSimulator();
    setFooterYear();
  });
})();

