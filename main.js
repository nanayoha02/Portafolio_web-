/* ============================================================
   Portafolio — Yohana Franceschi
   main.js: menú móvil, robot interactivo 3D, seguimiento de mouse y modal
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
     2. DATOS DE PROYECTOS (Fallbacks locales)
        - Asegúrate de nombrar las partes del robot en Spline igual a estas llaves
  -------------------------------------------------------- */
  const fallbackProjects = {
    'ShareHub': {
      titulo: 'ShareHub',
      estado: 'listo',
      categorias: ['web', 'fullstack'],
      descripcion: 'Plataforma colaborativa basada en la economía circular que permite compartir u optimizar el uso de activos ociosos para reducir el desperdicio.',
      stack: ['JavaScript', 'Node.js', 'HTML/CSS', 'Base de Datos'],
      demo: '',
      codigo: 'https://github.com'
    },
    'Virtual Menu': {
      titulo: 'Virtual Menu',
      estado: 'listo',
      categorias: ['web', 'frontend'],
      descripcion: 'Carta digital e interactiva para restaurantes, diseñada para optimizar la experiencia de navegación del cliente desde dispositivos móviles.',
      stack: ['HTML5', 'CSS3', 'JavaScript', 'UI/UX Design'],
      demo: '',
      codigo: 'https://github.com'
    },
    'Sistema de Automatización & API': {
      titulo: 'Sistema de Automatización & API',
      estado: 'desarrollo',
      categorias: ['backend'],
      descripcion: 'API REST para la gestión de datos internos, optimización de consultas y automatización de procesos en tiempo real.',
      stack: ['Python', 'PostgreSQL', 'REST API', 'Git'],
      demo: '',
      codigo: 'https://github.com'
    }
  };

  let projects = { ...fallbackProjects };
  let filtroActivo = 'todos';

  /* --------------------------------------------------------
     3. CONTROLADOR DEL ROBOT INTERACTIVO 3D + MODAL
  -------------------------------------------------------- */
  const splineViewer = document.getElementById('spline-canvas');
  const projectModal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  const closeModalBtn = document.getElementById('close-modal');
  const modalShelfBtn = document.getElementById('modal-shelf-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  // Elementos internos de la ventana modal HTML
  const mTitle = document.getElementById('modal-title');
  const mDesc = document.getElementById('modal-desc');
  const mStatus = document.getElementById('modal-status');
  const mTags = document.getElementById('modal-tags');
  const mCodeLink = document.getElementById('modal-code-link');

  // Abre la ventana modal con efectos visuales suaves de Tailwind
  function abrirModalProyecto(proyecto) {
    mTitle.innerText = proyecto.titulo;
    mDesc.innerText = proyecto.descripcion;
    mStatus.innerText = proyecto.estado === 'listo' ? '🟢 Listo' : '🟡 En Desarrollo';
    
    // Renderiza las etiquetas tecnológicas del proyecto
    mTags.innerHTML = proyecto.stack
      .map(t => `<span class="bg-white/5 border border-white/10 text-xs font-mono px-3 py-1 rounded-md text-[#A098A8]">${t}</span>`)
      .join('');
    
    mCodeLink.href = proyecto.codigo || 'https://github.com';

    // Despliega la modal y remueve opacidades
    if (projectModal && modalContent) {
      projectModal.classList.remove('hidden');
      projectModal.classList.add('flex');
      setTimeout(() => {
        projectModal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
      }, 10);
    }
  }

  // Cierra la ventana modal limpiamente
  function cerrarModalProyecto() {
    if (projectModal && modalContent) {
      projectModal.classList.add('opacity-0');
      modalContent.classList.add('scale-95');
      setTimeout(() => {
        projectModal.classList.remove('flex');
        projectModal.classList.add('hidden');
      }, 300);
    }
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', cerrarModalProyecto);
  if (modalShelfBtn) modalShelfBtn.addEventListener('click', cerrarModalProyecto);
  
  window.addEventListener('click', (e) => {
    if (e.target === projectModal) cerrarModalProyecto();
  });

  // Escucha los eventos tridimensionales disparados desde el visor de Spline al hacer clic en el Robot
  if (splineViewer) {
    splineViewer.addEventListener('spline-event', (e) => {
      const nombreObjeto3D = e.detail.name;
      
      if (projects[nombreObjeto3D]) {
        const proyectoSeleccionado = projects[nombreObjeto3D];
        
        // Comprueba si el proyecto coincide con el filtro activo antes de abrirlo
        if (matchesFilter(proyectoSeleccionado, filtroActivo)) {
          abrirModalProyecto(proyectoSeleccionado);
        }
      }
    });
  }

  function matchesFilter(p, filter) {
    if (filter === 'todos') return true;
    if (filter === 'listo') return p.estado === 'listo';
    if (filter === 'desarrollo') return p.estado === 'desarrollo';
    if (filter === 'web') return p.categorias.includes('web');
    return true;
  }

  // Manejador del estado activo de los botones de filtrado
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-white/10'));
      btn.classList.add('active', 'bg-white/10');
      filtroActivo = btn.dataset.filter;
    });
  });

  /* --------------------------------------------------------
     4. INTERACCIÓN DE MOVIMIENTO: EL ROBOT SIGUE AL MOUSE
  -------------------------------------------------------- */
  if (splineViewer) {
    window.addEventListener('mousemove', (e) => {
      // Mapea la posición del puntero en rangos de porcentaje (-0.5 a 0.5)
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;

      // Envía las coordenadas del mouse directo al visor 3D de Spline
      splineViewer.dispatchEvent(new CustomEvent('mouse-move-3d', {
        detail: { x: x, y: y }
      }));
    });
  }

  /* --------------------------------------------------------
     5. CARGA REAL DE PROYECTOS DESDE SUPABASE
  -------------------------------------------------------- */
  async function cargarProyectosDesdeBD() {
    if (!window._supabase) return;
    try {
      const { data, error } = await window._supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || !data.length) return;

      const nuevosProyectos = {};
      data.forEach((p) => {
        const keyName = p.titulo || 'Sin título'; 
        nuevosProyectos[keyName] = {
          titulo: keyName,
          estado: p.progreso != null && p.progreso >= 100 ? 'listo' : 'desarrollo',
          categorias: ['web', 'fullstack'],
          descripcion: p.descripcion || '',
          stack: (p.tecnologias || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          demo: p.web_url || '',
          codigo: p.github_url || '',
          imagen: p.imagen_url || ''
        };
      });

      projects = nuevosProyectos;
    } catch (e) {
      /* Conserva fallbacks si la base de datos no está disponible */
    }
  }
  cargarProyectosDesdeBD();

  /* --------------------------------------------------------
     6. CARGA DE HABILIDADES DESDE SUPABASE (Completo y Corregido)
  -------------------------------------------------------- */
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
              <span class="w-10 h-10 rounded-lg bg-[#8B263E]/25 text-[#C4506B] flex items-center justify-center">
                <i class="fa-solid fa-code"></i>
              </span>
              <h3 class="text-lg font-bold text-white">${cat}</h3>
            </div>
            <div class="flex flex-wrap gap-2">
              ${items
                .map((h) => {
                  const porcentajeText = h.porcentaje != null ? ` <span class="opacity-70">${h.porcentaje}%</span>` : '';
                  const iconoClass = h.icono || 'fa-solid fa-code';
                  return `<span class="tech-badge"><i class="${iconoClass}"></i> ${h.nombre}${porcentajeText}</span>`;
                })
                .join('')}
            </div>
          </div>`)
        .join('');
    } catch (e) {
  /* Mantiene el renderizado limpio si falla la conexión */
    }
  }
  cargarHabilidadesDesdeBD();

})(); //