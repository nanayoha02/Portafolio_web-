let supabaseClient;

function initSupabase() {
  supabaseClient = window._supabase;
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function fechaLegible(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dia = d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
  const hora = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${hora}`;
}

function mostrarErrorAdmin(mensaje) {
  const el = document.getElementById('admin-msg');
  if (!el) return;
  el.textContent = mensaje;
  el.classList.add('visible');
}

function manejarLogin() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  const loginError = document.getElementById('login-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    if (loginError) {
      loginError.textContent = '';
      loginError.classList.remove('visible');
    }

    try {
      if (!supabaseClient) throw new Error('Cliente de Supabase no disponible');
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        if (loginError) {
          loginError.textContent = 'Credenciales incorrectas. Revisa correo y contraseña.';
          loginError.classList.add('visible');
        }
        return;
      }
      window.location.href = 'admin.html';
    } catch (err) {
      if (loginError) {
        loginError.textContent = err && err.message ? err.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
        loginError.classList.add('visible');
      }
    } finally {
      if (btn) btn.disabled = false;
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
    cargarSobreMiAdmin(),
    cargarCurriculumAdmin(),
    cargarMensajesAdmin()
  ]);
}

async function cargarCurriculumAdmin() {
  const link = document.getElementById('cv-link');
  if (!link) return;

  try {
    const { data, error } = await supabaseClient.from('perfil').select('cv_url').eq('id', 1).single();
    if (error) {
      mostrarErrorAdmin('No se pudo cargar el curriculum: ' + error.message);
      return;
    }
    if (data && data.cv_url) {
      link.href = data.cv_url;
      link.style.display = 'inline-flex';
    } else {
      link.style.display = 'none';
    }
  } catch (err) {
    mostrarErrorAdmin('Error al cargar el curriculum: ' + err.message);
  }
}

async function cargarCertificacionesAdmin() {
  const listaC = document.getElementById('lista-certificaciones');
  if (!listaC) return;

  const { data, error } = await supabaseClient.from('certificaciones').select('*').order('created_at', { ascending: false });
  if (error) {
    mostrarErrorAdmin('No se pudieron cargar las certificaciones: ' + error.message);
    return;
  }
  listaC.innerHTML = data && data.length
    ? data.map(c => `
      <div class="admin-item" data-id="${c.id}">
        <div class="admin-item-info">
          <strong>${esc(c.nombre || 'Sin nombre')}</strong>
          <span class="admin-item-progress">${esc(c.emisor || '')}${c.anio ? ` &middot; ${esc(c.anio)}` : ''}</span>
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

  const { data, error } = await supabaseClient.from('testimonios').select('*').order('created_at', { ascending: false });
  if (error) {
    mostrarErrorAdmin('No se pudieron cargar los testimonios: ' + error.message);
    return;
  }
  listaT.innerHTML = data && data.length
    ? data.map(t => `
      <div class="admin-item" data-id="${t.id}">
        <div class="admin-item-info">
          <strong>${esc(t.nombre || 'Sin nombre')}</strong>
          <span class="admin-item-progress">${esc(t.rol || '')}</span>
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

  const { data, error } = await supabaseClient.from('proyectos').select('*').order('created_at', { ascending: false });
  if (error) {
    mostrarErrorAdmin('No se pudieron cargar los proyectos: ' + error.message);
    return;
  }
  listaP.innerHTML = data && data.length
    ? data.map(p => `
      <div class="admin-item" data-id="${p.id}">
        <div class="admin-item-info">
          <strong>${esc(p.titulo || 'Sin título')}</strong>
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

  const { data, error } = await supabaseClient.from('habilidades').select('*');
  if (error) {
    mostrarErrorAdmin('No se pudieron cargar las habilidades: ' + error.message);
    return;
  }
  listaH.innerHTML = data && data.length
    ? data.map(h => `
      <div class="skill-item-card" data-id="${h.id}">
        <button class="btn-delete-skill" onclick="eliminar('habilidades', '${h.id}')" title="Eliminar">&times;</button>
        <i class="${esc(h.icono || 'fas fa-code')}"></i>
        <h4>${esc(h.nombre)}</h4>
        <span class="skill-badge">${h.porcentaje != null ? esc(h.porcentaje) + '%' : 'Junior'}</span>
        <small class="skill-category">${esc(h.categoria || '')}</small>
      </div>`).join('')
    : '<p class="text-muted">No hay habilidades aún.</p>';
}

async function cargarContactoAdmin() {
  try {
    const { data: perfil, error } = await supabaseClient.from('perfil').select('*').eq('id', 1).single();
    if (error) {
      mostrarErrorAdmin('No se pudo cargar el contacto: ' + error.message);
      return;
    }
    if (perfil) {
      const cEmail = document.getElementById('c-email');
      const cLinkedin = document.getElementById('c-linkedin');
      const cGithub = document.getElementById('c-github');
      if (cEmail) cEmail.value = perfil.email || '';
      if (cLinkedin) cLinkedin.value = perfil.linkedin || '';
      if (cGithub) cGithub.value = perfil.github || '';
    }
  } catch (err) {
    mostrarErrorAdmin('Error al cargar el contacto: ' + err.message);
  }
}

async function cargarSobreMiAdmin() {
  try {
    const { data, error } = await supabaseClient.from('sobre_mi').select('*').eq('id', 1).single();
    if (error) {
      mostrarErrorAdmin('No se pudo cargar el perfil: ' + error.message);
      return;
    }
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
  } catch (err) {
    mostrarErrorAdmin('Error al cargar el perfil: ' + err.message);
  }
}

async function cargarMensajesAdmin() {
  const listaM = document.getElementById('lista-mensajes');
  if (!listaM) return;

  try {
    const { data, error } = await supabaseClient.from('mensajes').select('*').order('created_at', { ascending: false });
    if (error) {
      mostrarErrorAdmin('No se pudieron cargar los mensajes: ' + error.message);
      return;
    }
    listaM.innerHTML = data && data.length
      ? data.map(m => `
      <div class="admin-item admin-item-mensaje" data-id="${m.id}">
        <div class="admin-item-info">
          <strong>${esc(m.nombre || 'Sin nombre')}</strong>
          <span class="admin-item-progress">${esc(m.correo || '')}${fechaLegible(m.created_at) ? ` &middot; ${fechaLegible(m.created_at)}` : ''}</span>
          <span class="admin-item-mensaje-texto">${esc(m.mensaje || '')}</span>
        </div>
        <div class="admin-item-actions">
          <button class="btn-delete" onclick="eliminar('mensajes', '${m.id}')" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>`).join('')
      : '<p class="text-muted">No hay mensajes aún.</p>';
  } catch (err) {
    mostrarErrorAdmin('Error al cargar los mensajes: ' + err.message);
  }
}

async function eliminar(tabla, id) {
  if (!confirm(`¿Eliminar este elemento de ${tabla}?`)) return;
  try {
    const { error } = await supabaseClient.from(tabla).delete().eq('id', id);
    if (error) {
      mostrarErrorAdmin(`No se pudo eliminar de ${tabla}: ${error.message}`);
      return;
    }
    cargarDatosAdmin();
  } catch (err) {
    mostrarErrorAdmin('Error al eliminar: ' + err.message);
  }
}

function editarProyecto(id) {
  supabaseClient.from('proyectos').select('*').eq('id', id).single()
    .then(({ data, error }) => {
      if (error || !data) {
        mostrarErrorAdmin('No se pudo cargar el proyecto para editar: ' + (error ? error.message : 'no encontrado'));
        return;
      }
      const idEl = document.getElementById('p-id');
      if (idEl) {
        idEl.value = data.id;
        idEl.dataset.imgUrl = data.imagen_url || '';
      }
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
    })
    .catch((err) => mostrarErrorAdmin('Error al editar: ' + err.message));
}

async function logout() {
  try {
    await supabaseClient.auth.signOut();
  } catch (e) { /* si falla, igual se redirige */ }
  window.location.href = 'login.html';
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

function esperarSupabase(cb) {
  if (supabaseClient) { cb(); return; }
  const check = setInterval(() => {
    if (window._supabase) {
      supabaseClient = window._supabase;
      clearInterval(check);
      cb();
    }
  }, 100);
}

async function protegerAdmin() {
  if (!supabaseClient) return null;
  try {
    const { data } = await supabaseClient.auth.getSession();
    return data && data.session ? data.session : null;
  } catch (e) {
    return null;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSupabase();

  if (document.getElementById('login-form')) {
    esperarSupabase(manejarLogin);
    return;
  }

  if (window.location.pathname.includes('admin.html')) {
    esperarSupabase(async () => {
      const sesion = await protegerAdmin();
      if (!sesion) {
        window.location.href = 'login.html';
        return;
      }

      const emailEl = document.getElementById('user-email');
      if (emailEl && sesion.user) emailEl.textContent = sesion.user.email || 'Admin';

      supabaseClient.auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_OUT') window.location.href = 'login.html';
      });

      cargarDatosAdmin();

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
          porcentaje: parseInt(document.getElementById('nivel-habilidad').value, 10) || 50,
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
          id: 1,
          email: document.getElementById('c-email').value,
          linkedin: document.getElementById('c-linkedin').value,
          github: document.getElementById('c-github').value
        };

        const { error } = await supabaseClient.from('perfil').upsert(update);
        if (error) {
          mostrarErrorAdmin('No se pudo guardar el contacto: ' + error.message);
        } else {
          alert('Contacto actualizado');
        }
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-cv')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button');
      btn.disabled = true;

      try {
        const file = document.getElementById('cv-file')?.files[0];
        if (!file) {
          alert('Selecciona un archivo PDF');
          btn.disabled = false;
          return;
        }

        const name = `cv_yohana_${Date.now()}.pdf`;
        const { error: upErr } = await supabaseClient.storage
          .from('proyectos-imagenes')
          .upload(name, file, { contentType: 'application/pdf', upsert: true });
        if (upErr) throw upErr;

        const { data: urlData } = supabaseClient.storage.from('proyectos-imagenes').getPublicUrl(name);

        const { error } = await supabaseClient.from('perfil').update({ cv_url: urlData.publicUrl }).eq('id', 1);
        if (error) {
          alert('La tabla "perfil" no tiene la columna cv_url. Ejecuta en el SQL Editor de Supabase:\n\nALTER TABLE perfil ADD COLUMN IF NOT EXISTS cv_url text;');
        } else {
          alert('Curriculum subido correctamente');
          cargarCurriculumAdmin();
        }

        e.target.reset();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });

    document.getElementById('form-sobre')?.addEventListener('submit', async (e) => {      e.preventDefault();
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

        const { error } = await supabaseClient.from('sobre_mi').upsert({ id: 1, ...payload });
        if (error) {
          mostrarErrorAdmin('No se pudo guardar el perfil: ' + error.message);
        }
        alert('Perfil guardado');
        cargarDatosAdmin();
      } catch (err) { alert(err.message); }
      btn.disabled = false;
    });
    });
  }
});
