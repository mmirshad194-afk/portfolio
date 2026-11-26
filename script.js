/**
 * MIRSHAD P — 3D PORTFOLIO JAVASCRIPT
 * Three.js background, 3D card tilt, custom cursor, all interactions
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons immediately
  if (window.lucide) window.lucide.createIcons();

  // Start loader, then initialize all after load
  initLoader();
});

// ═══════════════════════════════════════
// LOADER
// ═══════════════════════════════════════
function initLoader() {
  const loader = document.getElementById('loader');
  document.body.style.overflow = 'hidden';

  const startTime = Date.now();

  function finish() {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 1800 - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initAll();
    }, remaining);
  }

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish);
  }
}

// ═══════════════════════════════════════
// MAIN INIT — called after loader
// ═══════════════════════════════════════
function initAll() {
  init3DBackground();
  initCustomCursor();
  initNavigation();
  initTypewriter();
  initScrollReveal();
  initSkillBars();
  initCard3DTilt();
  initProject3DTilt();
  initCounterAnimation();
  initContactForm();
  initScrollEffects();
  initParallaxBadges();
  if (window.lucide) window.lucide.createIcons();
}

// ═══════════════════════════════════════
// THREE.JS 3D BACKGROUND
// ═══════════════════════════════════════
function init3DBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Scene setup
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ── Particle Field ──
  const particleCount = 2000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color('#6366f1'),
    new THREE.Color('#818cf8'),
    new THREE.Color('#06b6d4'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#38bdf8'),
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 120;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 60;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3]     = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.14,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Floating Wireframe Shapes ──
  const shapes = [];

  function addShape(geo, x, y, z, hexColor) {
    const mat = new THREE.MeshBasicMaterial({
      color: hexColor,
      wireframe: true,
      transparent: true,
      opacity: 0.09,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.007,
      ry: (Math.random() - 0.5) * 0.007,
      floatAmp: Math.random() * 1.8 + 0.8,
      floatSpeed: Math.random() * 0.4 + 0.3,
      floatOffset: Math.random() * Math.PI * 2,
      baseY: y,
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  addShape(new THREE.IcosahedronGeometry(4.5, 1), -20, 8, -10, 0x6366f1);
  addShape(new THREE.OctahedronGeometry(3.5, 0), 18, -6, -15, 0x06b6d4);
  addShape(new THREE.TetrahedronGeometry(4, 0), -15, -10, -8, 0xa855f7);
  addShape(new THREE.IcosahedronGeometry(3, 1), 22, 12, -12, 0x818cf8);
  addShape(new THREE.OctahedronGeometry(2.5, 0), 10, -16, -6, 0xf43f5e);
  addShape(new THREE.TetrahedronGeometry(2.5, 0), -10, 16, -14, 0x06b6d4);
  addShape(new THREE.IcosahedronGeometry(2, 0), 0, -20, -10, 0x6366f1);

  // ── Mouse interaction ──
  let mouseX = 0, mouseY = 0;
  let camTargetX = 0, camTargetY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ── Render loop ──
  let time = 0;
  function animate() {
    requestAnimationFrame(animate);
    time += 0.008;

    // Smooth camera
    camTargetX += (mouseX - camTargetX) * 0.025;
    camTargetY += (mouseY - camTargetY) * 0.025;
    camera.position.x = camTargetX * 4;
    camera.position.y = camTargetY * 2.5;
    camera.lookAt(scene.position);

    // Rotate particles
    particles.rotation.y = time * 0.025;
    particles.rotation.x = time * 0.012;

    // Float & rotate shapes
    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y = s.userData.baseY + Math.sin(time * s.userData.floatSpeed + s.userData.floatOffset) * s.userData.floatAmp;
    });

    renderer.render(scene, camera);
  }

  animate();
}

// ═══════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Hide default cursor
  document.body.style.cursor = 'none';

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover states
  const interactables = document.querySelectorAll('a, button, .skill-cube, .p3d-inner, .highlight-3d, .tech-badge');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });
}

// ═══════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════
function initNavigation() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const overlay = document.getElementById('mobile-overlay');

  // Scroll sticky header
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Mobile hamburger
  if (hamburger && navLinks) {
    function closeMenu() {
      hamburger.classList.remove('open');
      navLinks.classList.remove('mobile-open');
      if (overlay) overlay.classList.remove('active');
    }

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('mobile-open');
      if (overlay) overlay.classList.toggle('active');
    });

    if (overlay) overlay.addEventListener('click', closeMenu);

    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Active nav on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    sections.forEach(sec => {
      const top = sec.offsetTop - 220;
      const bottom = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', y >= top && y < bottom);
      }
    });
  }, { passive: true });
}

// ═══════════════════════════════════════
// TYPEWRITER
// ═══════════════════════════════════════
function initTypewriter() {
  const el = document.getElementById('tw-text');
  if (!el) return;

  const roles = ['Full Stack Apps', 'REST APIs', 'MySQL Databases', 'Clean Interfaces', 'Scalable Backends'];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const cur = roles[ri];
    if (!deleting) {
      el.textContent = cur.substring(0, ci + 1);
      ci++;
      if (ci === cur.length) { deleting = true; setTimeout(tick, 2000); return; }
      setTimeout(tick, 95);
    } else {
      el.textContent = cur.substring(0, ci - 1);
      ci--;
      if (ci === 0) {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(tick, 400);
        return;
      }
      setTimeout(tick, 48);
    }
  }

  setTimeout(tick, 1200);
}

// ═══════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('active');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  reveals.forEach(el => obs.observe(el));
}

// ═══════════════════════════════════════
// SKILL BARS
// ═══════════════════════════════════════
function initSkillBars() {
  const cubes = document.querySelectorAll('.skill-cube');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach((fill, i) => {
          const w = fill.getAttribute('data-width');
          if (w) setTimeout(() => { fill.style.width = w + '%'; }, i * 150);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  cubes.forEach(c => obs.observe(c));
}

// ═══════════════════════════════════════
// 3D TILT — About Profile Card
// ═══════════════════════════════════════
function initCard3DTilt() {
  const card = document.getElementById('profile-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotX = (y - 0.5) * -16;
    const rotY = (x - 0.5) * 16;
    card.style.transition = 'transform 0.08s ease';
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  });
}

// ═══════════════════════════════════════
// 3D TILT — Project Cards
// ═══════════════════════════════════════
function initProject3DTilt() {
  document.querySelectorAll('.p3d-inner').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (y - 0.5) * -8;
      const rotY = (x - 0.5) * 8;
      card.style.transition = 'transform 0.08s ease, border-color 0.3s, box-shadow 0.3s';
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s';
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ═══════════════════════════════════════
// COUNTER ANIMATION
// ═══════════════════════════════════════
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const target = parseInt(entry.target.dataset.count);
      const start = performance.now();
      const dur = 1800;

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        entry.target.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

// ═══════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-message');
  const btn = document.getElementById('submit-btn');
  if (!form || !btn) return;

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('name')?.value.trim() || '';
    const email   = document.getElementById('email')?.value.trim() || '';
    const subject = document.getElementById('subject')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    if (!name || !email || !subject || !message) {
      showFeedback('⚠️ Please fill in all fields.', 'error');
      return;
    }
    if (!emailRe.test(email)) {
      showFeedback('⚠️ Please enter a valid email address.', 'error');
      return;
    }

    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<span class="submit-text">Sending...</span>';

    setTimeout(() => {
      showFeedback(`✅ Thanks, ${name}! Your message was sent. I'll reply soon.`, 'success');
      form.reset();
      btn.disabled = false;
      btn.innerHTML = originalHTML;
      if (window.lucide) window.lucide.createIcons();
    }, 1800);
  });

  function showFeedback(text, type) {
    feedback.textContent = text;
    feedback.className = `form-feedback ${type}`;
    if (type === 'success') {
      setTimeout(() => { feedback.className = 'form-feedback'; }, 6000);
    }
  }
}

// ═══════════════════════════════════════
// PARALLAX SCROLL EFFECTS
// ═══════════════════════════════════════
function initScrollEffects() {
  const heroWrap = document.querySelector('.hero-wrap');

  window.addEventListener('scroll', () => {
    if (!heroWrap) return;
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroWrap.style.transform = `translateY(${y * 0.28}px)`;
      heroWrap.style.opacity = `${Math.max(0, 1 - y / 650)}`;
    }
  }, { passive: true });
}

// ═══════════════════════════════════════
// PARALLAX TECH BADGES (mouse follow)
// ═══════════════════════════════════════
function initParallaxBadges() {
  const badges = document.querySelectorAll('.tech-badge');
  if (!badges.length) return;

  window.addEventListener('mousemove', (e) => {
    const cx = e.clientX / window.innerWidth - 0.5;
    const cy = e.clientY / window.innerHeight - 0.5;

    badges.forEach(badge => {
      const depth = parseFloat(badge.dataset.depth || 0.3);
      badge.style.transform = `translate(${cx * depth * 30}px, ${cy * depth * 24}px)`;
    });
  }, { passive: true });
}
