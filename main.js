/* ============================================================
   Portafolio — Yohana Franceschi
   main.js: menú móvil, filtro de proyectos, scroll suave, formulario
   ============================================================ */
(function () {
  'use strict';

  /* --------------------------------------------------------
     1. MENÚ MÓVIL
  -------------------------------------------------------- */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : mobileMenu.classList.contains('hidden');
    mobileMenu.classList.toggle('hidden', !isOpen);
    menuIcon.className = isOpen ? 'fa-solid fa-xmark text-lg' : 'fa-solid fa-bars text-lg';
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => toggleMenu());
    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => toggleMenu(false));
    });
  }

  /* --------------------------------------------------------
     2. DATOS DE PROYECTOS
        - fallbackProjects: respaldo estático mientras carga la BD
        - projects: se reemplaza con los datos reales de Supabase
  -------------------------------------------------------- */
  const fallbackProjects = [
    {
      titulo: 'ShareHub',
      estado: 'listo',
      categorias: ['web', 'fullstack'],
      descripcion:
        'Plataforma colaborativa basada en la economía circular que permite compartir u optimizar el uso de activos ociosos para reducir el desperdicio.',
      stack: ['JavaScript', 'Node.js', 'HTML/CSS', 'Base de Datos'],
      demo: '',
      codigo: 'https://github.com/yohana/sharehub',
      imagen: '',
    },
    {
      titulo: 'Virtual Menu',
      estado: 'listo',
      categorias: ['web', 'frontend'],
      descripcion:
        'Carta digital e interactiva para restaurantes, diseñada para optimizar la experiencia de navegación del cliente desde dispositivos móviles.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'UI/UX Design'],
      demo: '',
      codigo: 'https://github.com/yohana/virtual-menu',
      imagen: '',
    },
    {
      titulo: 'Sistema de Automatización & API',
      estado: 'desarrollo',
      categorias: ['backend'],
      descripcion:
        'API REST para la gestión de datos internos, optimización de consultas y automatización de procesos en tiempo real.',
      stack: ['Python', 'PostgreSQL', 'REST API', 'Git'],
      demo: '',
      codigo: 'https://github.com/yohana/automation-api',
      imagen: '',
    },
  ];

  let projects = fallbackProjects.slice();

  /* --------------------------------------------------------
     3. RENDER DE PROYECTOS + FILTROS
  -------------------------------------------------------- */
  const grid = document.getElementById('projects-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');

  function statusInfo(estado) {
    if (estado === 'listo') {
      return { text: '🟢 Listo', cls: 'status-ready' };
    }
    return { text: '🟡 En Desarrollo', cls: 'status-dev' };
  }

  function projectCard(p, i) {
    const status = statusInfo(p.estado);
    const techBadges = p.stack
      .map((t) => `<span class="tech-badge">${t}</span>`)
      .join('');
    const img = p.imagen
      ? `<img src="${p.imagen}" alt="${p.titulo}" class="project-img" loading="lazy" onerror="this.style.display='none'" />`
      : '';
    const demo = p.demo
      ? `<a href="${p.demo}" target="_blank" rel="noopener" class="demo-link">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Demo en Vivo
          </a>`
      : '';
    const codigo = p.codigo
      ? `<a href="${p.codigo}" target="_blank" rel="noopener" class="code-link">
            <i class="fa-brands fa-github"></i> Código
          </a>`
      : '';

    return `
      <article class="project-card show" data-categorias="${p.categorias.join(',')}" data-estado="${p.estado}">
        <span class="project-num">${String(i + 1).padStart(2, '0')}</span>
        ${img}
        <span class="status-badge ${status.cls}">${status.text}</span>
        <h3 class="project-title">${p.titulo}</h3>
        <p class="project-desc">${p.descripcion}</p>
        ${techBadges ? `<div class="flex flex-wrap gap-2">${techBadges}</div>` : ''}
        <div class="project-links">${demo}${codigo}</div>
      </article>
    `;
  }

  function renderProjects(list) {
    grid.innerHTML = list.map(projectCard).join('');
  }

  function matchesFilter(p, filter) {
    if (filter === 'todos') return true;
    if (filter === 'listo') return p.estado === 'listo';
    if (filter === 'desarrollo') return p.estado === 'desarrollo';
    if (filter === 'web') return p.categorias.includes('web');
    return true;
  }

  function applyFilter(filter) {
    filterBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    const visible = projects.filter((p) => matchesFilter(p, filter));
    renderProjects(visible);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
  });

  /* Render inicial (respaldo estático) */
  renderProjects(projects);

  /* Carga real de proyectos desde Supabase */
  async function cargarProyectosDesdeBD() {
    if (!window._supabase) return;
    try {
      const { data, error } = await window._supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || !data.length) return;

      projects = data.map((p) => ({
        titulo: p.titulo || 'Sin título',
        estado: p.progreso != null && p.progreso >= 100 ? 'listo' : 'desarrollo',
        categorias: ['web', 'fullstack'],
        descripcion: p.descripcion || '',
        stack: (p.tecnologias || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        demo: p.web_url || '',
        codigo: p.github_url || '',
        imagen: p.imagen_url || '',
      }));

      renderProjects(projects);
      const active = document.querySelector('.filter-btn.active');
      if (active) applyFilter(active.dataset.filter);
    } catch (e) {
      /* Mantiene el respaldo estático si la BD falla */
    }
  }
  cargarProyectosDesdeBD();

  /* Habilidades desde Supabase (agrupadas por categoría) */
  async function cargarHabilidadesDesdeBD() {
    const container = document.getElementById('skills-grid');
    if (!container || !window._supabase) return;
    try {
      const { data, error } = await window._supabase
        .from('habilidades')
        .select('*')
        .order('categoria');
      if (error || !data || !data.length) return;

      const grupos = {};
      data.forEach((h) => {
        const cat = h.categoria || 'Otros';
        if (!grupos[cat]) grupos[cat] = [];
        grupos[cat].push(h);
      });

      container.innerHTML = Object.entries(grupos)
        .map(([cat, items]) => `
          <div class="skill-card">
            <div class="flex items-center gap-3 mb-6">
              <span class="w-10 h-10 rounded-lg bg-[#8B263E]/25 text-[#C4506B] flex items-center justify-center"><i class="fa-solid fa-code"></i></span>
              <h3 class="text-lg font-bold text-white">${cat}</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              ${items
                .map(
                  (h) => `<span class="tech-badge"><i class="${h.icono || 'fa-solid fa-code'}"></i> ${h.nombre}${h.porcentaje != null ? ` <span class="opacity-70">${h.porcentaje}%</span>` : ''}</span>`
                )
                .join('')}
            </div>
          </div>`)
        .join('');
    } catch (e) {
      /* Mantiene las habilidades estáticas si la BD falla */
    }
  }
  cargarHabilidadesDesdeBD();

  /* Sobre mí desde Supabase */
  async function cargarSobreMiDesdeBD() {
    if (!window._supabase) return;
    try {
      const { data, error } = await window._supabase
        .from('sobre_mi')
        .select('*')
        .eq('id', 1)
        .single();
      if (error || !data) return;

      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el && val) el.textContent = val;
      };
      set('about-desc1', data.descripcion_1);
      set('about-desc2', data.descripcion_2);

      const photo = document.getElementById('hero-photo');
      if (photo && data.imagen) photo.src = data.imagen;
    } catch (e) {
      /* Mantiene el contenido estático si la BD falla */
    }
  }
  cargarSobreMiDesdeBD();

  /* --------------------------------------------------------
     4. SCROLL SUAVE (fallback para navegadores)
  -------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------------------------
     5. NAVBAR: resaltar enlace según la sección visible
  -------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));

  /* --------------------------------------------------------
     6. FORMULARIO DE CONTACTO (validación visual)
  -------------------------------------------------------- */
  const contactForm = document.getElementById('contact-form');
  const formFeedback = document.getElementById('form-feedback');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nombre = document.getElementById('nombre');
      const correo = document.getElementById('correo');
      const mensaje = document.getElementById('mensaje');

      let valid = true;

      [nombre, correo, mensaje].forEach((field) => {
        const ok = field.value.trim() !== '';
        field.classList.toggle('!border-red-500', !ok);
        if (!ok) valid = false;
      });

      if (valid) {
        const btn = contactForm.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        let ok = false;
        if (window._supabase) {
          const { error } = await window._supabase.from('mensajes').insert([
            { nombre: nombre.value.trim(), correo: correo.value.trim(), mensaje: mensaje.value.trim() },
          ]);
          ok = !error;
        }
        if (btn) btn.disabled = false;
        formFeedback.textContent = ok
          ? '¡Gracias! Tu mensaje se envió correctamente.'
          : 'No se pudo enviar. Escríbeme por correo.';
        formFeedback.classList.toggle('text-emerald-400', ok);
        formFeedback.classList.toggle('text-red-400', !ok);
        formFeedback.classList.remove('hidden');
        if (ok) contactForm.reset();
        setTimeout(() => formFeedback.classList.add('hidden'), 6000);
      }
    });
  }

  /* --------------------------------------------------------
     7. AÑO DEL COPYRIGHT
  -------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --------------------------------------------------------
     8. ATAJO ADMIN: Ctrl + Alt + A → abre el login del panel
  -------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      window.open('login.html', '_blank');
    }
  });

  /* Comando secreto: escribir "com9" (fuera de los campos de texto) abre el login */
  const CLAVE = 'com9';
  let tecleado = '';
  let temporizador;
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length !== 1) return;
    tecleado = (tecleado + e.key.toLowerCase()).slice(-CLAVE.length);
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { tecleado = ''; }, 2000);
    if (tecleado === CLAVE) {
      tecleado = '';
      window.location.href = 'login.html';
    }
  });

  /* --------------------------------------------------------
     9. DESCARGAR CV: usa el PDF subido desde el panel admin
  -------------------------------------------------------- */
  const qrImg = document.getElementById('qr-img');
  const qrLabel = document.getElementById('qr-label');
  function setQr(url, esCv) {
    if (!qrImg) return;
    qrImg.src = 'https://quickchart.io/qr?size=200&margin=1&dark=0B0A0C&light=F3EFEA&text=' + encodeURIComponent(url);
    if (qrLabel) qrLabel.textContent = esCv ? 'Escanea para ver mi CV' : 'Escanea para abrir mi portafolio';
  }
  setQr(location.href, false);

  const cvBtn = document.getElementById('btn-cv');
  if (cvBtn && window._supabase) {
    window._supabase
      .from('perfil')
      .select('cv_url')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data && data.cv_url) {
          cvBtn.href = data.cv_url;
          cvBtn.classList.remove('hidden');
          const fb = document.getElementById('btn-cv-fallback');
          if (fb) fb.classList.add('hidden');
          setQr(data.cv_url, true);
        }
      })
      .catch(() => {});
  }

  /* --------------------------------------------------------
     10. EFECTO 3D: parallax del hero e inclinación de tarjetas
  -------------------------------------------------------- */
  const puedeMover = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (puedeMover) {
    const hero = document.getElementById('inicio');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      });
      hero.addEventListener('mouseleave', () => {
        hero.style.setProperty('--mx', 0);
        hero.style.setProperty('--my', 0);
      });
    }

    const TILT = '.project-card, .skill-card';
    document.addEventListener('mousemove', (e) => {
      const card = e.target.closest && e.target.closest(TILT);
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transition = 'transform .08s ease-out';
      card.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) scale(1.03)`;
    });
    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest && e.target.closest(TILT);
      if (!card || card.contains(e.relatedTarget)) return;
      card.style.transition = 'transform .4s ease';
      card.style.transform = '';
    });
  }

  /* --------------------------------------------------------
     11. CERTIFICACIONES Y TESTIMONIOS desde Supabase
         (la sección solo aparece si hay datos)
  -------------------------------------------------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  async function cargarCertificacionesYTestimonios() {
    if (!window._supabase) return;
    try {
      const cert = await window._supabase.from('certificaciones').select('*').order('created_at', { ascending: false });
      if (!cert.error && cert.data && cert.data.length) {
        document.getElementById('cert-grid').innerHTML = cert.data.map((c) => {
          const icono = /^[\w\- ]+$/.test(c.icono || '') ? c.icono : 'fas fa-certificate';
          return `<div class="info-card"><i class="${icono} text-[#C4506B]"></i><div><p class="font-semibold text-white">${esc(c.nombre)}</p><p class="text-sm text-[#A098A8]">${esc(c.emisor)}${c.anio ? ' · ' + esc(c.anio) : ''}</p></div></div>`;
        }).join('');
        document.getElementById('certificaciones').classList.remove('hidden');
      }
      const tes = await window._supabase.from('testimonios').select('*').order('created_at', { ascending: false });
      if (!tes.error && tes.data && tes.data.length) {
        document.getElementById('testi-grid').innerHTML = tes.data.map((t) => {
          const avatar = t.avatar_url ? `<img src="${esc(t.avatar_url)}" alt="" class="w-10 h-10 rounded-full object-cover" loading="lazy" />` : '';
          return `<figure class="glass-card flex flex-col gap-5"><blockquote class="testi-quote">“${esc(t.texto)}”</blockquote><figcaption class="flex items-center gap-3">${avatar}<div><p class="font-semibold text-white">${esc(t.nombre)}</p><p class="text-sm text-[#A098A8]">${esc(t.rol)}</p></div></figcaption></figure>`;
        }).join('');
        document.getElementById('testimonios').classList.remove('hidden');
      }
    } catch (e) {
      /* Si falla, las secciones siguen ocultas */
    }
  }
  cargarCertificacionesYTestimonios();
})();
