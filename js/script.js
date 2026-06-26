(function() {
  'use strict';

  if (typeof _supabase === "undefined") {
    console.warn("Supabase no disponible");
    return;
  }

  const sb = _supabase;

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });

  async function cargarRedesSociales() {
    try {
      const { data, error } = await sb.from('perfil').select('*').eq('id', 1).single();
      if (error || !data) return;

      const setAttr = (id, attr, val) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, val);
      };

      setAttr('link-gmail', 'href', `mailto:${data.email}`);
      setAttr('link-linkedin', 'href', data.linkedin);
      setAttr('link-github', 'href', data.github);
    } catch (err) {
      console.log("Perfil no disponible");
    }
  }

  async function mostrarProyectos() {
    const contenedor = document.getElementById('project-grid');
    if (!contenedor) return;

    try {
      const { data: proyectos, error } = await sb
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!proyectos || proyectos.length === 0) {
        contenedor.innerHTML = '<p class="text-center">Sin proyectos a&uacute;n.</p>';
        return;
      }

      contenedor.innerHTML = proyectos.map(p => {
        const progreso = Number(p.progreso) || 0;
        let etapa = "En Desarrollo";
        if (progreso >= 100) etapa = "Finalizado";
        else if (progreso >= 60) etapa = "Beta";

        const imgUrl = p.imagen_url || 'https://via.placeholder.com/600x400';

        return `
          <div class="col-md-4">
            <div class="card h-100">
              <img src="${imgUrl}" class="card-img-top" alt="${p.titulo || ''}"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/600x400'">
              <div class="card-body d-flex flex-column">
                <h5>${p.titulo || ''}</h5>
                <p class="card-text">${p.descripcion || ''}</p>
                <small class="text-muted mb-2">${etapa} &mdash; ${progreso}%</small>
                <div class="progress mb-2">
                  <div class="progress-bar" style="width:${progreso}%"></div>
                </div>
                <div class="mb-2">
                  ${p.tecnologias
                    ? p.tecnologias.split(',').map(t => `<span class="badge bg-secondary me-1">${t.trim()}</span>`).join('')
                    : ''}
                </div>
                <div class="mt-auto d-flex gap-2">
                  ${p.github_url
                    ? `<a href="${p.github_url}" target="_blank" class="btn btn-dark btn-sm" aria-label="GitHub"><i class="fab fa-github"></i></a>`
                    : ''}
                  ${p.web_url
                    ? `<a href="${p.web_url}" target="_blank" class="btn btn-primary btn-sm">Ver</a>`
                    : ''}
                </div>
              </div>
            </div>
          </div>`;
      }).join('');
    } catch (err) {
      console.error(err);
      contenedor.innerHTML = '<p class="text-center">Error al cargar proyectos.</p>';
    }
  }

  async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    contenedor.innerHTML = '<p class="text-center">Cargando...</p>';

    try {
      const { data, error } = await sb.from('habilidades').select('*').eq('categoria', categoria);
      if (error) throw error;

      if (!data || data.length === 0) {
        contenedor.innerHTML = '<p class="text-center">Sin habilidades a&uacute;n.</p>';
        return;
      }

      contenedor.innerHTML = data.map((h, i) => `
        <div class="skill-card" style="animation-delay:${i * 0.1}s">
          <i class="${h.icono || 'fas fa-code'}"></i>
          <h4>${h.nombre}</h4>
          <p class="skill-level">${h.nivel || ''}</p>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
      contenedor.innerHTML = '<p class="text-center">Error al cargar habilidades.</p>';
    }
  }

  async function cargarSobreMi() {
    try {
      const { data, error } = await sb.from('sobre_mi').select('*').eq('id', 1).single();
      if (error || !data) return;

      const setText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val || '';
      };

      setText('about-titulo', data.titulo);
      setText('about-desc1', data.descripcion_1 || data.descripcion1);
      setText('about-desc2', data.descripcion_2 || data.descripcion2);

      const img = document.getElementById('about-img');
      if (img) img.src = data.imagen || data.imagen_url || 'img/yoha_photo.png';

      const lista = document.getElementById('about-lista');
      if (lista && data.lista) {
        lista.innerHTML = data.lista.split(',').map(i => `<li>${i.trim()}</li>`).join('');
      }
    } catch (err) {
      console.log("Error cargando Sobre M&iacute;");
    }
  }

  async function mostrarTestimonios() {
    const contenedor = document.getElementById('testimonios-grid');
    if (!contenedor) return;

    try {
      const { data, error } = await sb.from('testimonios').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        contenedor.innerHTML = '';
        return;
      }

      contenedor.innerHTML = data.map(t => `
        <div class="col-md-6 col-lg-4">
          <div class="testimonial-card h-100">
            <p class="testimonial-text">${t.texto || ''}</p>
            <div class="testimonial-author">
              <img src="${t.avatar_url || 'https://via.placeholder.com/44'}" alt="${t.nombre || ''}"
                class="testimonial-avatar"
                onerror="this.src='https://via.placeholder.com/44'">
              <div>
                <div class="testimonial-name">${t.nombre || ''}</div>
                <div class="testimonial-role">${t.rol || ''}</div>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    mostrarProyectos();
    mostrarHabilidades('Lenguajes');
    mostrarTestimonios();
    cargarRedesSociales();
    cargarSobreMi();

    document.querySelectorAll('.skill-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        mostrarHabilidades(btn.dataset.category);
      });
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      window.location.href = 'login.html';
    }
  });
})();
