(function() {
  'use strict';

  if (typeof _supabase === "undefined") {
    console.warn("Supabase no disponible");
    return;
  }

  const sb = _supabase;

  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  async function cargarRedesSociales() {
    try {
      const { data, error } = await sb.from('perfil').select('*').eq('id', 1).single();
      if (error || !data) return;
      const ids = ['link-gmail', 'link-linkedin', 'link-github'];
      const attrs = ['href', 'href', 'href'];
      const vals = [`mailto:${data.email}`, data.linkedin, data.github];
      ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attrs[i], vals[i] || '#');
      });
    } catch (err) { console.log("Perfil no disponible"); }
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
        contenedor.innerHTML = '<div class="span-4 text-center" style="padding:20px;color:var(--text-muted);font-size:0.9rem">Sin proyectos a&uacute;n.</div>';
        return;
      }

      if (document.getElementById('stat-proyectos')) {
        document.getElementById('stat-proyectos').textContent = proyectos.length;
      }

      contenedor.innerHTML = proyectos.slice(0, 4).map((p, i) => {
        const progreso = Number(p.progreso) || 0;
        let etapa = "En Desarrollo";
        if (progreso >= 100) etapa = "Finalizado";
        else if (progreso >= 60) etapa = "Beta";

        const imgUrl = p.imagen_url || '';
        const span = i === 0 ? 'span-2' : 'span-1';

        return `
          <div class="bento-card project-card ${span}">
            ${imgUrl ? `<img src="${imgUrl}" class="project-img" alt="${p.titulo || ''}" loading="lazy" onerror="this.style.display='none'">` : ''}
            <div class="project-body">
              <h3>${p.titulo || ''}</h3>
              <p>${p.descripcion || ''}</p>
              ${p.tecnologias ? `<div class="project-tags">${p.tecnologias.split(',').map(t => `<span>${t.trim()}</span>`).join('')}</div>` : ''}
              <div class="project-progress">
                <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${progreso}%"></div></div>
                <small>${etapa} &mdash; ${progreso}%</small>
              </div>
              <div class="project-links">
                ${p.github_url ? `<a href="${p.github_url}" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>` : ''}
                ${p.web_url ? `<a href="${p.web_url}" target="_blank" class="btn-view"><i class="fas fa-external-link-alt"></i> Ver</a>` : ''}
              </div>
            </div>
          </div>`;
      }).join('');
    } catch (err) {
      console.error(err);
      contenedor.innerHTML = '<div class="span-4 text-center" style="padding:20px;color:var(--text-muted)">Error al cargar proyectos.</div>';
    }
  }

  async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    contenedor.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted);grid-column:1/-1">Cargando...</p>';

    try {
      const { data, error } = await sb.from('habilidades').select('*').eq('categoria', categoria);
      if (error) throw error;

      if (document.getElementById('stat-habilidades')) {
        const { data: all } = await sb.from('habilidades').select('*');
        document.getElementById('stat-habilidades').textContent = all ? all.length : 0;
      }

      if (!data || data.length === 0) {
        contenedor.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted);grid-column:1/-1">Sin habilidades</p>';
        return;
      }

      contenedor.innerHTML = data.map(h => `
        <div class="skill-item">
          <i class="${h.icono || 'fas fa-code'}"></i>
          <span>${h.nombre}</span>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
    }
  }

  async function cargarSobreMi() {
    try {
      const { data, error } = await sb.from('sobre_mi').select('*').eq('id', 1).single();
      if (error || !data) return;

      const d1 = document.getElementById('about-desc1');
      const d2 = document.getElementById('about-desc2');
      if (d1) d1.innerText = data.descripcion_1 || data.descripcion1 || d1.innerText;
      if (d2) d2.innerText = data.descripcion_2 || data.descripcion2 || d2.innerText;
    } catch (err) { console.log("Error cargando Sobre M&iacute;"); }
  }

  async function mostrarTestimonios() {
    const contenedor = document.getElementById('testimonios-container');
    if (!contenedor) return;

    try {
      const { data, error } = await sb.from('testimonios').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        contenedor.innerHTML = '<p style="font-size:0.85rem;color:var(--text-muted)">A&uacute;n no hay testimonios.</p>';
        return;
      }

      const t = data[0];
      contenedor.innerHTML = `
        <p class="testimonial-text">${t.texto || ''}</p>
        <div class="testimonial-author">
          <img src="${t.avatar_url || 'https://via.placeholder.com/40'}" alt="${t.nombre || ''}" class="testimonial-avatar" onerror="this.src='https://via.placeholder.com/40'">
          <div>
            <div class="testimonial-name">${t.nombre || ''}</div>
            <div class="testimonial-role">${t.rol || ''}</div>
          </div>
        </div>`;
    } catch (err) { console.error(err); }
  }

  async function mostrarCertificaciones() {
    const contenedor = document.getElementById('cert-grid');
    if (!contenedor) return;

    try {
      const { data, error } = await sb.from('certificaciones').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        contenedor.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted);grid-column:1/-1">Sin certificaciones a&uacute;n.</p>';
        return;
      }

      contenedor.innerHTML = data.map(c => `
        <div class="cert-item">
          <div class="cert-icon"><i class="${c.icono || 'fas fa-certificate'}"></i></div>
          <div class="cert-info">
            <h4>${c.nombre || ''}</h4>
            <span>${c.emisor || ''}${c.anio ? ` &middot; ${c.anio}` : ''}</span>
          </div>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
      contenedor.innerHTML = '';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    mostrarProyectos();
    mostrarHabilidades('Lenguajes');
    mostrarTestimonios();
    mostrarCertificaciones();
    cargarRedesSociales();
    cargarSobreMi();

    document.querySelectorAll('.skill-tab-bento').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.skill-tab-bento').forEach(b => b.classList.remove('active'));
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
