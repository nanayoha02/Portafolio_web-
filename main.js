/* ============================================================
   Portafolio — Yohana Franceschi
   main.js: menú móvil, filtro de proyectos, scroll suave, formulario
   ============================================================ */
(function () {
  'use strict';

  /* Escape de texto antes de inyectarlo en innerHTML */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  /* Preferencias de movimiento, compartidas por el hero y la galería */
  const MQ_MOVIMIENTO = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MQ_PUNTERO_FINO = window.matchMedia('(hover: hover) and (pointer: fine)');
  const puedeMover = () => MQ_PUNTERO_FINO.matches && !MQ_MOVIMIENTO.matches;

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
      id: 'fallback-sharehub',
      titulo: 'ShareHub',
      estado: 'listo',
      descripcion:
        'Plataforma colaborativa basada en la economía circular que permite compartir u optimizar el uso de activos ociosos para reducir el desperdicio.',
      stack: ['JavaScript', 'Node.js', 'HTML/CSS', 'Base de Datos'],
      demo: '',
      codigo: 'https://github.com/yohana/sharehub',
      imagen: '',
    },
    {
      id: 'fallback-virtual-menu',
      titulo: 'Virtual Menu',
      estado: 'listo',
      descripcion:
        'Carta digital e interactiva para restaurantes, diseñada para optimizar la experiencia de navegación del cliente desde dispositivos móviles.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'UI/UX Design'],
      demo: '',
      codigo: 'https://github.com/yohana/virtual-menu',
      imagen: '',
    },
    {
      id: 'fallback-automatizacion',
      titulo: 'Sistema de Automatización & API',
      estado: 'desarrollo',
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
     3. GALERÍA DE PROYECTOS
        La BD no guarda categorías, así que se deducen del
        texto del proyecto (tecnologías, título y descripción).
  -------------------------------------------------------- */
  const REGLAS_CATEGORIAS = [
    { id: 'webgl', etiqueta: 'WebGL', claves: ['three', 'threejs', 'webgl', 'babylon', 'shader', 'glsl', 'pixi'] },
    {
      id: 'fullstack',
      etiqueta: 'Full-stack',
      claves: ['node', 'express', 'supabase', 'nestjs', 'nextjs', 'next.js', 'react', 'vue', 'angular', 'svelte', 'php', 'cakephp', 'laravel', 'django', 'flask', 'spring boot', '.net', 'dotnet', 'firebase', 'graphql'],
    },
    {
      id: 'sistemas',
      etiqueta: 'Sistemas',
      claves: ['linux', 'kernel', 'unix', 'ubuntu', 'debian', 'bash', 'shell', 'ensamblador', 'assembly', 'docker'],
    },
    {
      id: 'ecologicos',
      etiqueta: 'Ecológicos',
      claves: ['ecologic', 'economia circular', 'sostenib', 'reciclaj', 'reciclar', 'ambiental', 'climatic', 'residuos', 'desperdicio', 'renovable', 'circular'],
    },
  ];

  /* Minúsculas y sin acentos, para comparar sin sorpresas */
  function normalizar(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function deducirCategorias(p) {
    const texto = normalizar([...(p.stack || []), p.titulo, p.descripcion].join(' '));
    return REGLAS_CATEGORIAS.filter((regla) => regla.claves.some((clave) => texto.includes(clave))).map(
      (regla) => regla.id
    );
  }

  const contenedorTarjetas = document.getElementById('galeria-tarjetas');
  const filtroBtns = document.querySelectorAll('.galeria-filtros .filter-btn');
  const panelDetalles = document.getElementById('galeria-detalles');
  const interruptorRejilla = document.getElementById('galeria-modo-rejilla');
  const bloqueGaleria = document.querySelector('.galeria-bloque');
  const pistaGaleria = document.getElementById('galeria-pista');

  function tarjetaGaleria(p) {
    const categorias = deducirCategorias(p);
    const imagen = p.imagen
      ? `<img src="${esc(p.imagen)}" alt="Captura de ${esc(p.titulo)}" class="galeria-tarjeta-img" loading="lazy" onerror="this.style.display='none'" />`
      : `<i class="fa-solid fa-diagram-project galeria-tarjeta-sin-img" aria-hidden="true"></i>`;
    const etiquetas = (p.stack || [])
      .map((t) => `<span class="galeria-tec">${esc(t)}</span>`)
      .join('');
    const distintivos = categorias
      .map((id) => {
        const regla = REGLAS_CATEGORIAS.find((r) => r.id === id);
        return regla ? `<span class="galeria-distintivo">${esc(regla.etiqueta)}</span>` : '';
      })
      .join('');

    return `
      <article class="galeria-tarjeta" role="button" tabindex="0"
        data-indice="${p.indice}"
        data-categorias="${esc(categorias.join(','))}"
        data-estado="${esc(p.estado)}"
        aria-label="Ver detalles de ${esc(p.titulo)}">
        <div class="galeria-tarjeta-interior">
          <div class="galeria-tarjeta-marco">
            ${imagen}
            <div class="galeria-tarjeta-info" aria-hidden="true">
              <p class="galeria-tarjeta-resumen">${esc(p.descripcion || 'Sin descripción disponible.')}</p>
              ${distintivos ? `<div class="galeria-distintivos">${distintivos}</div>` : ''}
              <span class="galeria-tarjeta-ver"><i class="fa-solid fa-arrow-right"></i> Ver detalles</span>
            </div>
          </div>
          <div class="galeria-tarjeta-cuerpo">
            <h3 class="galeria-tarjeta-nombre">${esc(p.titulo)}</h3>
            ${etiquetas ? `<div class="galeria-tec-lista">${etiquetas}</div>` : ''}
          </div>
        </div>
      </article>
    `;
  }

  function renderProyectos(lista) {
    if (!contenedorTarjetas) return;
    contenedorTarjetas.innerHTML = lista.length
      ? lista.map(tarjetaGaleria).join('')
      : `<p class="galeria-vacio">No hay proyectos en esta categoría todavía</p>`;
    prepararEscena();
  }

  function coincideFiltro(p, filtro) {
    if (filtro === 'todos') return true;
    return deducirCategorias(p).includes(filtro);
  }

  function aplicarFiltro(filtro) {
    filtroBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === filtro);
    });
    renderProyectos(projects.filter((p) => coincideFiltro(p, filtro)));
  }

  filtroBtns.forEach((btn) => {
    btn.addEventListener('click', () => aplicarFiltro(btn.dataset.filter));
  });

  /* Panel de detalles */
  function abrirDetalles(indice) {
    const proyecto = projects[indice];
    if (!panelDetalles || !proyecto) return;
    const btnDemo = document.getElementById('galeria-btn-demo');
    const btnCodigo = document.getElementById('galeria-btn-codigo');

    document.getElementById('galeria-detalles-nombre').textContent = proyecto.titulo;
    document.getElementById('galeria-detalles-descripcion').textContent =
      proyecto.descripcion || 'Sin descripción disponible.';

    if (btnDemo) {
      const hayDemo = Boolean(proyecto.demo);
      btnDemo.href = hayDemo ? proyecto.demo : '#';
      btnDemo.classList.toggle('galeria-btn-vacia', !hayDemo);
      btnDemo.setAttribute('aria-disabled', String(!hayDemo));
      btnDemo.setAttribute('tabindex', hayDemo ? '0' : '-1');
    }
    if (btnCodigo) {
      const hayCodigo = Boolean(proyecto.codigo);
      btnCodigo.href = hayCodigo ? proyecto.codigo : '#';
      btnCodigo.classList.toggle('galeria-btn-vacia', !hayCodigo);
      btnCodigo.setAttribute('aria-disabled', String(!hayCodigo));
      btnCodigo.setAttribute('tabindex', hayCodigo ? '0' : '-1');
    }

    contenedorTarjetas.querySelectorAll('.galeria-tarjeta').forEach((card) => {
      card.setAttribute('aria-selected', String(Number(card.dataset.indice) === indice));
    });

    panelDetalles.classList.remove('hidden');
  }

  function cerrarDetalles() {
    if (panelDetalles) panelDetalles.classList.add('hidden');
    if (contenedorTarjetas) {
      contenedorTarjetas.querySelectorAll('.galeria-tarjeta').forEach((card) => card.removeAttribute('aria-selected'));
    }
  }

  if (contenedorTarjetas) {
    contenedorTarjetas.addEventListener('click', (e) => {
      const card = e.target.closest('.galeria-tarjeta');
      if (card) abrirDetalles(Number(card.dataset.indice));
    });
    contenedorTarjetas.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      const card = e.target.closest('.galeria-tarjeta');
      if (!card) return;
      e.preventDefault();
      abrirDetalles(Number(card.dataset.indice));
    });
  }

  const btnCerrar = document.getElementById('galeria-btn-cerrar');
  if (btnCerrar) btnCerrar.addEventListener('click', cerrarDetalles);
  const btnCerrarX = document.getElementById('galeria-detalles-cerrar-x');
  if (btnCerrarX) btnCerrarX.addEventListener('click', cerrarDetalles);

  if (interruptorRejilla && bloqueGaleria) {
    interruptorRejilla.addEventListener('change', () => {
      bloqueGaleria.classList.toggle('galeria-modo-rejilla', interruptorRejilla.checked);
      prepararEscena();
    });
  }

  /* --------------------------------------------------------
     3b. EFECTO ONDA 3D DE LA GALERÍA
         Curva senoidal resuelta con transformaciones CSS 3D y
         un único requestAnimationFrame. El bucle se apaga
         cuando la galería no está a la vista, en modo rejilla
         o si el sistema pide movimiento reducido.
  -------------------------------------------------------- */
  const enModoRejilla = () => Boolean(interruptorRejilla && interruptorRejilla.checked);
  const hayOnda = () => tarjetasOnda.length > 1;
  const animacionActiva = () => puedeMover() && !enModoRejilla() && hayOnda();

  let tarjetasOnda = [];
  let pasoX = 260;
  let ajustes = { amplitud: 54, profundidad: 132, inclinacion: 15, porOnda: 3.4, deriva: 0.11, alcance: 260 };
  let fotograma = 0;
  let fase = 0;
  let instantePrevio = 0;
  let escenaVisible = false;
  let puntero = { x: 0, y: 0, activo: false };
  let giro = { x: 0, y: 0 };
  let giroObjetivo = { x: 0, y: 0 };
  let indiceResaltado = -1;
  let temporizadorMedicion = 0;

  /* Menos amplitud, profundidad y deriva en pantallas pequeñas */
  function parametrosOnda() {
    const ancho = window.innerWidth;
    const movil = ancho <= 640;
    const tablet = ancho <= 1024;
    return {
      amplitud: movil ? 18 : tablet ? 36 : 54,
      profundidad: movil ? 30 : tablet ? 84 : 132,
      inclinacion: movil ? 6 : tablet ? 10 : 15,
      porOnda: movil ? 2.4 : tablet ? 3 : 3.4,
      deriva: movil ? 0.05 : 0.1,
      alcance: movil ? 150 : 260,
    };
  }

  /* Posición de cada tarjeta respecto al centro visible */
  function medirPosiciones() {
    if (!contenedorTarjetas || !tarjetasOnda.length) return;
    const centro = contenedorTarjetas.scrollLeft + contenedorTarjetas.clientWidth / 2;
    tarjetasOnda.forEach((t) => {
      t.u = (t.izq + t.ancho / 2 - centro) / pasoX;
    });
  }

  function alDesplazarGaleria() {
    medirPosiciones();
    if (animacionActiva()) pintarEscena();
  }

  /* Una sola pasada de estilos por frame: lee el bloque, escribe tarjetas */
  function pintarEscena() {
    if (!contenedorTarjetas || !tarjetasOnda.length) return;
    const rect = bloqueGaleria ? bloqueGaleria.getBoundingClientRect() : null;
    /* El puntero solo inclina la escena si el sistema lo permite: con
       movimiento reducido o en puntero grueso la onda queda totalmente fija. */
    const interactivo = puntero.activo && puedeMover();

    if (rect && rect.height && interactivo) {
      giroObjetivo.x = ((puntero.x - rect.left) / rect.width - 0.5) * 2;
      giroObjetivo.y = ((puntero.y - rect.top) / rect.height - 0.5) * 2;
    } else {
      giroObjetivo.x = 0;
      giroObjetivo.y = 0;
    }
    giro.x += (giroObjetivo.x - giro.x) * 0.07;
    giro.y += (giroObjetivo.y - giro.y) * 0.07;

    const punteroFila = rect && interactivo ? puntero.x - rect.left + contenedorTarjetas.scrollLeft : 0;
    const porRadian = (Math.PI * 2) / ajustes.porOnda;

    tarjetasOnda.forEach((t) => {
      const angulo = t.u * porRadian + fase;
      const seno = Math.sin(angulo);
      const coseno = Math.cos(angulo);
      const distancia = Math.abs(t.izq + t.ancho / 2 - punteroFila);
      const contacto = interactivo ? Math.max(0, 1 - distancia / ajustes.alcance) : 0;
      const propio = t.i === indiceResaltado ? 1 : 0;

      const y = ajustes.amplitud * seno + giro.y * 11 * (0.3 + 0.7 * contacto) - propio * 6;
      const z = ajustes.profundidad * coseno + contacto * 30 + propio * 34;
      const giroY = -ajustes.inclinacion * seno + giro.x * 8;
      const giroX = coseno * ajustes.inclinacion * 0.3 - giro.y * 5;
      const escala = 1 + contacto * 0.04 + propio * 0.02;

      t.el.style.transform =
        'translate3d(0,' + y.toFixed(2) + 'px,' + z.toFixed(1) + 'px)' +
        ' rotateX(' + giroX.toFixed(2) + 'deg) rotateY(' + giroY.toFixed(2) + 'deg)' +
        ' scale(' + escala.toFixed(3) + ')';
    });
  }

  function bucleOnda(instante) {
    fotograma = requestAnimationFrame(bucleOnda);
    if (!instantePrevio) instantePrevio = instante;
    const delta = Math.min(64, instante - instantePrevio);
    instantePrevio = instante;
    if (!document.hidden) fase = (fase + (delta / 1000) * ajustes.deriva) % (Math.PI * 2);
    pintarEscena();
  }

  function iniciarOnda() {
    if (fotograma || !animacionActiva() || !escenaVisible) return;
    instantePrevio = 0;
    fotograma = requestAnimationFrame(bucleOnda);
  }

  function detenerOnda() {
    if (!fotograma) return;
    cancelAnimationFrame(fotograma);
    fotograma = 0;
    instantePrevio = 0;
  }

  /* Entrada escalonada al llegar a la vista */
  let observadorEntrada = null;
  if (window.IntersectionObserver) {
    observadorEntrada = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) entrada.target.classList.add('es-visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' }
    );
  }

  function observarEntrada() {
    if (!observadorEntrada || MQ_MOVIMIENTO.matches) {
      tarjetasOnda.forEach((t) => t.el.classList.add('es-visible'));
      return;
    }
    observadorEntrada.disconnect();
    tarjetasOnda.forEach((t) => {
      t.el.classList.remove('es-visible');
      observadorEntrada.observe(t.el);
    });
  }

  /* Recalcula geometría, onda y estado del bucle */
  function prepararEscena() {
    if (!contenedorTarjetas) return;

    tarjetasOnda = Array.from(contenedorTarjetas.querySelectorAll('.galeria-tarjeta')).map((el, i) => ({
      el,
      i,
      u: 0,
      izq: 0,
      ancho: 0,
    }));
    ajustes = parametrosOnda();

    if (!tarjetasOnda.length) {
      detenerOnda();
      return;
    }

    tarjetasOnda.forEach((t) => {
      t.el.style.setProperty('--i', t.i);
      t.izq = t.el.offsetLeft;
      t.ancho = t.el.offsetWidth;
    });
    pasoX = hayOnda()
      ? Math.max(1, tarjetasOnda[1].el.offsetLeft - tarjetasOnda[0].el.offsetLeft)
      : tarjetasOnda[0].el.offsetWidth + 16;

    /* La onda no debe recortar tarjetas: el relleno vertical sigue la amplitud */
    if (enModoRejilla()) {
      contenedorTarjetas.style.paddingTop = '';
      contenedorTarjetas.style.paddingBottom = '';
      tarjetasOnda.forEach((t) => {
        t.el.style.transform = '';
      });
    } else {
      contenedorTarjetas.style.paddingTop = Math.round(ajustes.amplitud + 38) + 'px';
      contenedorTarjetas.style.paddingBottom = Math.round(ajustes.amplitud + 38) + 'px';
    }

    if (pistaGaleria) {
      pistaGaleria.hidden = enModoRejilla() || contenedorTarjetas.scrollWidth <= contenedorTarjetas.clientWidth + 4;
    }

    medirPosiciones();
    observarEntrada();
    if (!enModoRejilla()) pintarEscena();

    if (escenaVisible && animacionActiva()) iniciarOnda();
    else detenerOnda();
  }

  /* Pausa el bucle cuando la galería sale de la pantalla */
  if (bloqueGaleria && window.IntersectionObserver) {
    new IntersectionObserver(
      (entradas) => {
        escenaVisible = entradas.some((e) => e.isIntersecting);
        if (escenaVisible) iniciarOnda();
        else detenerOnda();
      },
      { threshold: 0 }
    ).observe(bloqueGaleria);
  }

  /* Cursor: inclina la escena y acerca la tarjeta más cercana */
  if (bloqueGaleria) {
    bloqueGaleria.addEventListener(
      'pointermove',
      (e) => {
        /* Sin hover real (táctil) o con movimiento reducido el puntero
           no debe mover la escena ni dejar una tarjeta resaltada. */
        if (!puedeMover()) {
          puntero.activo = false;
          indiceResaltado = -1;
          return;
        }
        puntero.x = e.clientX;
        puntero.y = e.clientY;
        puntero.activo = true;
        const tarjeta = e.target.closest ? e.target.closest('.galeria-tarjeta') : null;
        indiceResaltado = tarjeta ? tarjetasOnda.findIndex((t) => t.el === tarjeta) : -1;
      },
      { passive: true }
    );
    bloqueGaleria.addEventListener('pointerleave', () => {
      puntero.activo = false;
      indiceResaltado = -1;
    });
  }

  if (contenedorTarjetas) {
    contenedorTarjetas.addEventListener('scroll', alDesplazarGaleria, { passive: true });
  }

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(temporizadorMedicion);
      temporizadorMedicion = setTimeout(prepararEscena, 120);
    },
    { passive: true }
  );

  if (typeof MQ_MOVIMIENTO.addEventListener === 'function') {
    MQ_MOVIMIENTO.addEventListener('change', prepararEscena);
  }

  if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
    document.fonts.ready.then(prepararEscena).catch(() => {});
  }

  /* El índice referencia la posición dentro de `projects`, no la de la lista filtrada */
  function marcarIndices() {
    projects.forEach((p, i) => {
      p.indice = i;
    });
  }

  /* Render inicial (respaldo estático) */
  marcarIndices();
  renderProyectos(projects);

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
        descripcion: p.descripcion || '',
        stack: (p.tecnologias || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        demo: p.web_url || '',
        codigo: p.github_url || '',
        imagen: p.imagen_url || '',
      }));

      marcarIndices();
      const activa = document.querySelector('.galeria-filtros .filter-btn.active');
      aplicarFiltro(activa ? activa.dataset.filter : 'todos');
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
      set('about-title', data.titulo);
      set('about-desc1', data.descripcion_1);
      set('about-desc2', data.descripcion_2);

      const listaEl = document.getElementById('about-lista');
      if (listaEl && data.lista) {
        listaEl.innerHTML = data.lista
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => `<span class="tech-badge">${esc(t)}</span>`)
          .join('');
      }

      const photo = document.getElementById('hero-photo');
      if (photo && data.imagen) photo.src = data.imagen;
    } catch (e) {
      /* Mantiene el contenido estático si la BD falla */
    }
  }
  cargarSobreMiDesdeBD();

  /* Contacto (email, GitHub, LinkedIn) desde Supabase */
  async function cargarContactoDesdeBD() {
    if (!window._supabase) return;
    try {
      const { data, error } = await window._supabase
        .from('perfil')
        .select('email, github, linkedin')
        .eq('id', 1)
        .single();
      if (error || !data) return;

      const email = (data.email || '').trim();
      const github = (data.github || '').trim();
      const linkedin = (data.linkedin || '').trim();

      const actualizarTarjetaSocial = (titulo, href, etiqueta) => {
        document.querySelectorAll('#contacto .info-card').forEach((card) => {
          const tituloEl = card.querySelector('p.font-semibold');
          if (tituloEl && tituloEl.textContent.trim() === titulo) {
            card.href = href;
            const sub = card.querySelector('p.text-sm');
            if (sub) sub.textContent = etiqueta;
          }
        });
      };

      if (email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach((a) => { a.href = 'mailto:' + email; });
        actualizarTarjetaSocial('Correo', 'mailto:' + email, email);
      }
      if (github) {
        document.querySelectorAll('a[href*="github.com/"]').forEach((a) => { a.href = github; });
        actualizarTarjetaSocial('GitHub', github, github.replace(/^https?:\/\/(www\.)?/, ''));
      }
      if (linkedin) {
        document.querySelectorAll('a[href*="linkedin.com/in/"]').forEach((a) => { a.href = linkedin; });
        const ultima = linkedin.split('/').filter(Boolean).pop();
        actualizarTarjetaSocial('LinkedIn', linkedin, ultima ? 'in/' + ultima : linkedin);
      }
    } catch (e) {
      /* Mantiene los enlaces estáticos si la BD falla */
    }
  }
  cargarContactoDesdeBD();

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
  if (puedeMover()) {
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

  /* --------------------------------------------------------
     12. FONDO 3D (capa decorativa)
         Las ondas orgánicas, la iluminación y la geometría son
         planos CSS 3D animados por el compositor; el canvas solo
         dibuja las partículas. Un único requestAnimationFrame, sin
         lecturas de layout dentro del bucle, y apagado por completo
         con prefers-reduced-motion o con la pestaña en segundo plano.
         Es independiente de la galería: no comparte estado ni bucle.
  -------------------------------------------------------- */
  /* --------------------------------------------------------
     Estado compartido del puntero.
     El fondo 3D ya lo calcula en apuntar(); es la única fuente de
     puntero y no hace falta un segundo listener de pointermove. No
     altera el comportamiento del fondo.
  -------------------------------------------------------- */
  const punteroEscena = { x: 0, y: 0 };

  /* --------------------------------------------------------
     Reloj de escena: un ÚNICO requestAnimationFrame para el fondo
     3D. Cada capa se suscribe con su propio callback y
     recibe los segundos transcurridos desde el fotograma anterior.

     El cálculo del delta es el mismo que usaba el fondo antes del
     refactor: tope de 64 ms por fotograma, y el instante previo se
     reinicia en cada arranque. Cambia únicamente quién pide el
     fotograma, no qué se hace con él.
  -------------------------------------------------------- */
  const relojEscena = (function () {
    const suscriptores = [];
    let fotograma = 0;
    let instantePrevio = 0;

    function bucle(instante) {
      fotograma = requestAnimationFrame(bucle);
      const delta = Math.min(64, instante - (instantePrevio || instante));
      instantePrevio = instante;
      const segundos = delta / 1000;
      for (let i = 0; i < suscriptores.length; i++) suscriptores[i](segundos);
    }

    return {
      suscribir: function (fn) { suscriptores.push(fn); },
      activo: function () { return !!fotograma; },
      arrancar: function () {
        if (fotograma) return;
        instantePrevio = 0;
        fotograma = requestAnimationFrame(bucle);
      },
      parar: function () {
        if (!fotograma) return;
        cancelAnimationFrame(fotograma);
        fotograma = 0;
      },
    };
  })();

  /* --------------------------------------------------------
     FONDO 3D GLOBAL
  -------------------------------------------------------- */
  function iniciarFondo3D() {
    const capa = document.querySelector('.background-3d');
    const canvas = capa && capa.querySelector('.fondo-3d-particulas');
    if (!capa || !canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MQ_ESCRITORIO = window.matchMedia('(min-width: 1025px)');
    const MQ_TABLET = window.matchMedia('(min-width: 641px) and (max-width: 1024px)');
    const MQ_MOVIL = window.matchMedia('(max-width: 640px)');

    /* Menos partículas y menos resolución en pantallas pequeñas */
    const PERFILES = {
      escritorio: { particulas: 54, dpr: 2 },
      tablet: { particulas: 30, dpr: 1.75 },
      movil: { particulas: 18, dpr: 1.5 },
    };
    const nombrePerfil = () => (MQ_MOVIL.matches ? 'movil' : MQ_TABLET.matches ? 'tablet' : 'escritorio');

    /* Puntos de luz precargados: el bucle nunca crea gradientes */
    const sprites = [[255, 226, 232], [255, 198, 208], [196, 80, 107]].map((canal) => {
      const soporte = document.createElement('canvas');
      soporte.width = 24;
      soporte.height = 24;
      const c = soporte.getContext('2d');
      const grad = c.createRadialGradient(12, 12, 0, 12, 12, 12);
      grad.addColorStop(0, 'rgba(' + canal[0] + ',' + canal[1] + ',' + canal[2] + ',1)');
      grad.addColorStop(0.4, 'rgba(' + canal[0] + ',' + canal[1] + ',' + canal[2] + ',0.42)');
      grad.addColorStop(1, 'rgba(' + canal[0] + ',' + canal[1] + ',' + canal[2] + ',0)');
      c.fillStyle = grad;
      c.fillRect(0, 0, 24, 24);
      return soporte;
    });

    let particulas = [];
    let ancho = 0;
    let alto = 0;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let tiempo = 0;
    let bx = 0;
    let by = 0;
    let objetivoBx = 0;
    let objetivoBy = 0;
    let ultimoBx = '';
    let ultimoBy = '';
    let temporizadorMedida = 0;

    function crearParticulas() {
      const perfil = PERFILES[nombrePerfil()];
      particulas = [];
      for (let i = 0; i < perfil.particulas; i++) {
        const z = Math.random();
        particulas.push({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          z: z,
          r: 1.1 + z * 3.4,
          a: 0.1 + Math.random() * 0.24,
          vx: (Math.random() - 0.5) * 5,
          vy: -(3 + Math.random() * 9),
          fase: Math.random() * Math.PI * 2,
          ritmo: 0.5 + Math.random() * 1.1,
          sprite: i % sprites.length,
        });
      }
    }

    function medir() {
      const nuevoAncho = window.innerWidth;
      const nuevoAlto = window.innerHeight;
      /* En móvil la barra del navegador cambia de alto al hacer scroll:
         se ignoran esas variaciones para no redibujar en cada gesto */
      if (nuevoAncho === ancho && Math.abs(nuevoAlto - alto) < 90) return;
      ancho = nuevoAncho;
      alto = nuevoAlto;
      vw = nuevoAncho;
      vh = nuevoAlto;
      const dpr = Math.min(window.devicePixelRatio || 1, PERFILES[nombrePerfil()].dpr);
      canvas.width = Math.max(1, Math.round(ancho * dpr));
      canvas.height = Math.max(1, Math.round(alto * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      crearParticulas();
    }

    function dibujar(paso) {
      ctx.clearRect(0, 0, ancho, alto);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particulas.length; i++) {
        const p = particulas[i];
        const centelleo = 0.55 + 0.45 * Math.sin(tiempo * p.ritmo + p.fase);
        const x = p.x + Math.sin(tiempo * 0.22 + p.fase) * 9 * (0.3 + p.z);
        const radio = p.r * (0.7 + p.z * 0.6);
        ctx.globalAlpha = p.a * centelleo;
        ctx.drawImage(sprites[p.sprite], x - radio, p.y - radio, radio * 2, radio * 2);
        if (paso > 0) {
          p.x += p.vx * paso;
          p.y += p.vy * paso;
          if (p.y < -12) {
            p.y = alto + 12;
            p.x = Math.random() * ancho;
          } else if (p.x < -12) {
            p.x = ancho + 12;
          } else if (p.x > ancho + 12) {
            p.x = -12;
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    /* El fotograma lo pide ahora el reloj compartido de la escena: el
       fondo se suscribe con su callback.
       El cuerpo de la función es idéntico al que tenía antes. */
    relojEscena.suscribir(function (segundos) {
      tiempo += segundos;

      bx += (objetivoBx - bx) * 0.05;
      by += (objetivoBy - by) * 0.05;
      const nuevoBx = bx.toFixed(3);
      const nuevoBy = by.toFixed(3);
      if (nuevoBx !== ultimoBx || nuevoBy !== ultimoBy) {
        ultimoBx = nuevoBx;
        ultimoBy = nuevoBy;
        capa.style.setProperty('--bx', nuevoBx);
        capa.style.setProperty('--by', nuevoBy);
      }
      dibujar(segundos);
    });

    function arrancar() {
      if (relojEscena.activo() || MQ_MOVIMIENTO.matches || document.hidden) return;
      relojEscena.arrancar();
    }

    function parar() {
      relojEscena.parar();
    }

    /* Parallax: solo escritorio con puntero fino, y sin leer el layout */
    function apuntar(e) {
      objetivoBx = (e.clientX / (vw || 1)) * 2 - 1;
      objetivoBy = (e.clientY / (vh || 1)) * 2 - 1;
      punteroEscena.x = objetivoBx;
      punteroEscena.y = objetivoBy;
    }
    function soltar() {
      objetivoBx = 0;
      objetivoBy = 0;
      punteroEscena.x = 0;
      punteroEscena.y = 0;
    }
    function conectarPuntero(conectar) {
      const opciones = { passive: true };
      if (conectar) {
        window.addEventListener('pointermove', apuntar, opciones);
        document.addEventListener('mouseleave', soltar, opciones);
        window.addEventListener('blur', soltar, opciones);
      } else {
        window.removeEventListener('pointermove', apuntar, opciones);
        document.removeEventListener('mouseleave', soltar, opciones);
        window.removeEventListener('blur', soltar, opciones);
        soltar();
      }
    }
    conectarPuntero(MQ_PUNTERO_FINO.matches);
    if (typeof MQ_PUNTERO_FINO.addEventListener === 'function') {
      MQ_PUNTERO_FINO.addEventListener('change', (e) => conectarPuntero(e.matches));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) parar();
      else arrancar();
    });

    function alCambiarMovimiento() {
      if (MQ_MOVIMIENTO.matches) {
        parar();
        bx = 0;
        by = 0;
        objetivoBx = 0;
        objetivoBy = 0;
        capa.style.setProperty('--bx', '0');
        capa.style.setProperty('--by', '0');
        dibujar(0);
      } else {
        arrancar();
      }
    }
    if (typeof MQ_MOVIMIENTO.addEventListener === 'function') {
      MQ_MOVIMIENTO.addEventListener('change', alCambiarMovimiento);
    }

    window.addEventListener(
      'resize',
      () => {
        clearTimeout(temporizadorMedida);
        temporizadorMedida = setTimeout(medir, 180);
      },
      { passive: true }
    );

    function alCambiarPerfil() {
      ancho = 0;
      alto = 0;
      medir();
      dibujar(0);
    }
    [MQ_ESCRITORIO, MQ_TABLET, MQ_MOVIL].forEach((mq) => {
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', alCambiarPerfil);
    });

    capa.style.setProperty('--bx', '0');
    capa.style.setProperty('--by', '0');
    medir();
    if (MQ_MOVIMIENTO.matches) dibujar(0);
    else arrancar();
  }
})();
