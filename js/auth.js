/**
 * ADMIN SCRIPT - Maneja Login, CRUD y Perfil
 */

// --- 1. LOGIN ---
function manejarLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('email').value === "yoha@gmail.com" && 
            document.getElementById('password').value === "1234") {
            sessionStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert("Acceso denegado.");
        }
    });
}

// --- 2. GESTIÓN DE DATOS ---
async function cargarDatosAdmin() {
    // Proyectos
    const listaP = document.getElementById('lista-proyectos');
    if (listaP) {
        const { data } = await _supabase.from('proyectos').select('*').order('created_at', { ascending: false });
        listaP.innerHTML = data ? data.map(p => `
            <div class="admin-item">
                <span>${p.titulo}</span>
                <button onclick="eliminar('proyectos', '${p.id}')"><i class="fas fa-trash"></i></button>
            </div>`).join('') : '';
    }

    // Habilidades
    const listaH = document.getElementById('lista-habilidades');
    if (listaH) {
        const { data } = await _supabase.from('habilidades').select('*');
        listaH.innerHTML = data ? data.map(h => `
            <div class="admin-item">
                <span>${h.nombre}</span>
                <button onclick="eliminar('habilidades', '${h.id}')"><i class="fas fa-trash"></i></button>
            </div>`).join('') : '';
    }

    // Cargar Perfil (Redes) en los Inputs
    const { data: perfil } = await _supabase.from('perfil').select('*').eq('id', 1).single();
    if (perfil) {
        if (document.getElementById('admin-email-publico')) document.getElementById('admin-email-publico').value = perfil.email || '';
        if (document.getElementById('admin-linkedin')) document.getElementById('admin-linkedin').value = perfil.linkedin || '';
        if (document.getElementById('admin-github')) document.getElementById('admin-github').value = perfil.github || '';
    }
}

async function eliminar(tabla, id) {
    if (confirm("¿Eliminar?")) {
        await _supabase.from(tabla).delete().eq('id', id);
        cargarDatosAdmin();
    }
}

function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

function showTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// --- 3. INICIALIZACIÓN ---
window.addEventListener('supabaseReady', () => {
    if (document.getElementById('login-form')) manejarLogin();

    if (window.location.pathname.includes('admin.html')) {
        if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'login.html';
            return;
        }
        cargarDatosAdmin();

        // GUARDAR PROYECTO
        document.getElementById('form-proyectos')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;

            try {
                let finalUrl = "";
                const file = document.getElementById('p-img-file')?.files[0];
                if (file) {
                    const name = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                    await _supabase.storage.from('proyectos-imagenes').upload(name, file);
                    const { data } = _supabase.storage.from('proyectos-imagenes').getPublicUrl(name);
                    finalUrl = data.publicUrl;
                }

                const payload = {
                    titulo: document.getElementById('p-titulo').value,
                    descripcion: document.getElementById('p-desc').value,
                    tecnologias: document.getElementById('p-tech').value,
                    github_url: document.getElementById('p-repo').value,
                    web_url: document.getElementById('p-live').value,
                    progreso: parseInt(document.getElementById('p-etapa').value),
                    imagen_url: finalUrl
                };

                await _supabase.from('proyectos').insert([payload]);
                alert("Proyecto añadido");
                e.target.reset();
                cargarDatosAdmin();
            } catch (err) { alert(err.message); }
            btn.disabled = false;
        });

        // ACTUALIZAR PERFIL (Redes Sociales)
        document.getElementById('form-contacto-admin')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;

            const update = {
                email: document.getElementById('admin-email-publico').value,
                linkedin: document.getElementById('admin-linkedin').value,
                github: document.getElementById('admin-github').value
            };

            const { error } = await _supabase.from('perfil').update(update).eq('id', 1);
            if (error) {
                // Si no existe el registro id:1, lo insertamos
                await _supabase.from('perfil').insert([{ id: 1, ...update }]);
                alert("Datos creados por primera vez");
            } else {
                alert("Redes actualizadas con éxito");
            }
            btn.disabled = false;
            cargarDatosAdmin();
        });
    }
});