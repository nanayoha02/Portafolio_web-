let supabaseClient;

function initSupabase() {
  supabaseClient = window._supabase;
}

function manejarLogin() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email === "yoha@gmail.com" && password === "1234") {
      sessionStorage.setItem('adminLoggedIn', 'true');
      window.location.href = 'admin.html';
    } else {
      alert("Acceso denegado.");
    }
  });
}

async function cargarDatosAdmin() {
  initSupabase();
  if (!supabaseClient) return;

  await Promise.all([
    cargarProyectosAdmin(),
    cargarHabilidadesAdmin(),
    cargarTestimoniosAdmin(),
    cargarCertificacionesAdmin(),
    cargarContactoAdmin(),
    cargarSobreMiAdmin()
  ]);
}

async function cargarCertificacionesAdmin() {
  const listaC = document.getElementById('lista-certificaciones');
  if (!listaC) return;

  const { data } = await supabaseClient.from('certificaciones').select('*').order('created_at', { ascending: false });
  listaC.innerHTML = data && data.length
    ? data.map(c => `
      <div class="admin-item" data-id="${c.id}">
        <div class="admin-item-info">
          <strong>${c.nombre || 'Sin nombre'}</strong>
          <span class="admin-item-progress">${c.emisor || ''}${c.anio ? ` &middot; ${c.anio}` : ''}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-delete" onclick="eliminar('certificaciones', '${c.id}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`).join('')
    : '<p class="text-muted">No hay certificaciones.</p>';
}

async function cargarTestimoniosAdmin() {
  const listaT = document.getElementById('lista-testimonios');
  if (!listaT) return;

  const { data } = await supabaseClient.from('testimonios').select('*').order('created_at', { ascending: false });
  listaT.innerHTML = data && data.length
    ? data.map(t => `
      <div class="admin-item" data-id="${t.id}">
        <div class="admin-item-info">
          <strong>${t.nombre || 'Sin nombre'}</strong>
          <span class="admin-item-progress">${t.rol || ''}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-delete" onclick="eliminar('testimonios', '${t.id}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`).join('')
    : '<p class="text-muted">No hay testimonios aún.</p>';
}

async function cargarProyectosAdmin() {
  const listaP = document.getElementById('lista-proyectos');
  if (!listaP) return;

  const { data } = await supabaseClient.from('proyectos').select('*').order('created_at', { ascending: false });
  listaP.innerHTML = data && data.length
    ? data.map(p => `
      <div class="admin-item" data-id="${p.id}">
        <div class="admin-item-info">
          <strong>${p.titulo || 'Sin título'}</strong>
          <span class="admin-item-progress">${p.progreso || 0}%</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-edit" onclick="editarProyecto('${p.id}')" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-delete" onclick="eliminar('proyectos', '${p.id}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`).join('')
    : '<p class="text-muted">No hay proyectos aún.</p>';
}

async function cargarHabilidadesAdmin() {
  const listaH = document.getElementById('lista-habilidades');
  if (!listaH) return;

  const { data } = await supabaseClient.from('habilidades').select('*');
  listaH.innerHTML = data && data.length
    ? data.map(h => `
      <div class="skill-item-card" data-id="${h.id}">
        <button class="btn-delete-skill" onclick="eliminar('habilidades', '${h.id}')" title="Eliminar">&times;</button>
        <i class="${h.icono || 'fas fa-code'}"></i>
        <h4>${h.nombre}</h4>
        <span class="skill-badge">${h.nivel || 'Junior'}</span>
        <small class="skill-category">${h.categoria || ''}</small>
      </div>`).join('')
    : '<p class="text-muted">No hay habilidades aún.</p>';
}

async function cargarContactoAdmin() {
  const { data: perfil } = await supabaseClient.from('perfil').select('*').eq('id', 1).single();
  if (perfil) {
    const cEmail = document.getElementById('c-email');
    const cLinkedin = document.getElementById('c-linkedin');
    const cGithub = document.getElementById('c-github');
    if (cEmail) cEmail.value = perfil.email || '';
    if (cLinkedin) cLinkedin.value = perfil.linkedin || '';
    if (cGithub) cGithub.value = perfil.github || '';
  }
}

async function cargarSobreMiAdmin() {
  const { data } = await supabaseClient.from('sobre_mi').select('*').eq('id', 1).single();
  if (data) {
    const fields = {
      'about-titulo-input': data.titulo,
      'about-desc1-input': data.descripcion_1 || data.descripcion1,
      'about-desc2-input': data.descripcion_2 || data.descripcion2,
      'about-lista-input': data.lista
    };
    Object.entries(fields).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    });
  }
}

async function eliminar(tabla, id) {
  if (confirm(`¿Eliminar este elemento de ${tabla}?`)) {
    await supabaseClient.from(tabla).delete().eq('id', id);
    cargarDatosAdmin();
  }
}

function editarProyecto(id) {
  supabaseClient.from('proyectos').select('*').eq('id', id).single().then(({ data }) => {
    if (!data) return;
    document.getElementById('p-id').value = data.id;
    document.getElementById('p-titulo').value = data.titulo || '';
    document.getElementById('p-desc').value = data.descripcion || '';
    document.getElementById('p-tech').value = data.tecnologias || '';
    document.getElementById('p-repo').value = data.github_url || '';
    document.getElementById('p-live').value = data.web_url || '';

    const etapaMap = { 100: 'Finalizado', 60: 'Beta', 0: 'En Desarrollo' };
    const etapaSelect = document.getElementById('p-etapa');
    const etapaVal = data.progreso >= 100 ? 'Finalizado' : data.progreso >= 60 ? 'Beta' : 'En Desarrollo';
    if (etapaSelect) etapaSelect.value = etapaVal;

    document.getElementById('p-id').dataset.editing = 'true';
    document.querySelector('#form-proyectos .btn-primary').textContent = 'Actualizar Proyecto';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function logout() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'index.html';
}

function showTab(tabId, event) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (event) event.currentTarget.classList.add('active');
}

function getEtapaValue(etapaText) {
  const map = { 'En Desarrollo': 30, 'Versión Beta': 65, 'Beta': 65, 'Finalizado': 100 };
  return map[etapaText] || 30;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('login-form')) manejarLogin();

  if (window.location.pathname.includes('admin.html')) {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
      window.location.href = 'login.html';
      return;
    }

    initSupabase();
    if (!supabaseClient) {
      const checkSupabase = setInterval(() => {
        if (window._supabase) {
          supabaseClient = window._supabase;
          cargarDatosAdmin();
          clearInterval(checkSupabase);
        }
      }, 100);
    } else {
      cargarDatosAdmin();
    }

    document.getElementById('form-proyectos')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        let finalUrl = "";
        const file = document.getElementById('p-img-file')?.files[0];
        if (file) {
          const name = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { error: uploadError } = await supabaseClient.storage.from('proyectos-imagenes').upload(name, file);
          if (!uploadError) {
            const { data } = supabaseClient.storage.from('proyectos-imagenes').getPublicUrl(name);
            finalUrl = data.publicUrl;
          }
        }

        const isEditing = document.getElementById('p-id').dataset.editing === 'true';
        const proyectoId = document.getElementById('p-id').value;
        const etapaText = document.getElementById('p-etapa').value;

        const payload = {
          titulo: document.getElementById('p-titulo').value,
          descripcion: document.getElementById('p-desc').value,
          tecnologias: document.getElementById('p-tech').value,
          github_url: document.getElementById('p-repo').value,
          web_url: document.getElementById('p-live').value,
          progreso: getEtapaValue(etapaText),
          imagen_url: finalUrl || document.getElementById('p-id').dataset.imgUrl || ''
        };

        if (isEditing && proyectoId) {
          const updatePayload = { ...payload };
          if (!file) delete updatePayload.imagen_url;
          await supabaseClient.from('proyectos').update(updatePayload).eq('id', proyectoId);
          alert('Proyecto actualizado');
        } else {
          await supabaseClient.from('proyectos').insert([payload]);
          alert('Proyecto añadido');
        }

        e.target.reset();
        document.getElementById('p-id').value = '';
        document.getElementById('p-id').dataset.editing = 'false';
        document.getElementById('p-id').dataset.imgUrl = '';
        document.querySelector('#form-proyectos .btn-primary').textContent = 'Guardar Proyecto';
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-testimonio')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        let avatarUrl = '';
        const file = document.getElementById('t-avatar')?.files[0];
        if (file) {
          const name = `avatar_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { error: uploadError } = await supabaseClient.storage.from('proyectos-imagenes').upload(name, file);
          if (!uploadError) {
            const { data } = supabaseClient.storage.from('proyectos-imagenes').getPublicUrl(name);
            avatarUrl = data.publicUrl;
          }
        }

        const payload = {
          nombre: document.getElementById('t-nombre').value,
          texto: document.getElementById('t-texto').value,
          rol: document.getElementById('t-rol').value,
          avatar_url: avatarUrl
        };

        await supabaseClient.from('testimonios').insert([payload]);
        alert('Testimonio añadido');
        e.target.reset();
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-certificacion')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        const payload = {
          nombre: document.getElementById('c-nombre').value,
          emisor: document.getElementById('c-emisor').value,
          anio: document.getElementById('c-anio').value,
          icono: document.getElementById('c-icono').value || 'fas fa-certificate'
        };

        await supabaseClient.from('certificaciones').insert([payload]);
        alert('Certificaci&oacute;n a&ntilde;adida');
        e.target.reset();
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-habilidad')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        const payload = {
          nombre: document.getElementById('nombre').value,
          nivel: document.getElementById('nivel-habilidad').value,
          categoria: document.getElementById('categoria').value,
          icono: document.getElementById('icono').value || 'fas fa-code'
        };

        await supabaseClient.from('habilidades').insert([payload]);
        alert('Habilidad añadida');
        e.target.reset();
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-contacto')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        const update = {
          email: document.getElementById('c-email').value,
          linkedin: document.getElementById('c-linkedin').value,
          github: document.getElementById('c-github').value
        };

        const { error } = await supabaseClient.from('perfil').update(update).eq('id', 1);
        if (error) {
          await supabaseClient.from('perfil').insert([{ id: 1, ...update }]);
          alert('Datos de contacto creados');
        } else {
          alert('Contacto actualizado');
        }
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-sobre')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        let imgUrl = '';
        const file = document.getElementById('about-img-file')?.files[0];
        if (file) {
          const name = `about_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          await supabaseClient.storage.from('proyectos-imagenes').upload(name, file);
          const { data } = supabaseClient.storage.from('proyectos-imagenes').getPublicUrl(name);
          imgUrl = data.publicUrl;
        }

        const payload = {
          titulo: document.getElementById('about-titulo-input').value,
          descripcion_1: document.getElementById('about-desc1-input').value,
          descripcion_2: document.getElementById('about-desc2-input').value,
          lista: document.getElementById('about-lista-input').value
        };
        if (imgUrl) payload.imagen = imgUrl;

        const { error } = await supabaseClient.from('sobre_mi').update(payload).eq('id', 1);
        if (error) {
          await supabaseClient.from('sobre_mi').insert([{ id: 1, ...payload }]);
        }
        alert('Perfil guardado');
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });
  }
});
