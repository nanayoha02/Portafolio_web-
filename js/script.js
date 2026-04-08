/**
 * PORTFOLIO - MAIN SCRIPT (Público + Admin)
 */

// ===============================
// 0. VALIDACIÓN GLOBAL
// ===============================
if (typeof _supabase === "undefined") {
    console.error("❌ Supabase no está cargado");
}

// ===============================
// 1. EFECTO NAVBAR
// ===============================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===============================
// 2. GUARDAR HABILIDAD (ADMIN)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-habilidad");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const nombre = document.getElementById("nombre").value;
            const nivel = document.getElementById("nivel-habilidad").value;
            const categoria = document.getElementById("categoria").value;
            const icono = document.getElementById("icono").value;

            const { error } = await _supabase
                .from("habilidades")
                .insert([{ nombre, nivel, categoria, icono }]);

            if (error) throw error;

            alert("✅ Habilidad guardada");
            form.reset();

        } catch (err) {
            console.error(err);
            alert("❌ Error: " + err.message);
        }
    });
});

// ===============================
// 3. REDES SOCIALES
// ===============================
async function cargarRedesSociales() {
    try {
        const { data, error } = await _supabase
            .from('perfil')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return;

        document.getElementById('link-gmail')?.setAttribute('href', `mailto:${data.email}`);
        document.getElementById('link-linkedin')?.setAttribute('href', data.linkedin);
        document.getElementById('link-github')?.setAttribute('href', data.github);
        document.getElementById('text-email')?.innerText = data.email;

    } catch (err) {
        console.log("Perfil no configurado.");
    }
}

// ===============================
// 4. PROYECTOS
// ===============================
async function mostrarProyectos() {
    const contenedor = document.getElementById('project-grid');
    if (!contenedor) return;

    try {
        const { data: proyectos, error } = await _supabase
            .from('proyectos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!proyectos || proyectos.length === 0) {
            contenedor.innerHTML = '<p>Sin proyectos aún.</p>';
            return;
        }

        contenedor.innerHTML = proyectos.map(p => {
            const progreso = Number(p.progreso) || 0;

            let etapa;
            if (progreso === 100) {
                etapa = "Finalizado";
            } else if (progreso >= 60) {
                etapa = "Beta";
            } else {
                etapa = "En Desarrollo";
            }

            const imgUrl = p.imagen_url 
                ? p.imagen_url 
                : 'https://via.placeholder.com/600x400';

            return `
            <div class="col-md-4">
                <div class="card h-100">
                    <img src="${imgUrl}" class="card-img-top" onerror="this.src='https://via.placeholder.com/600x400'">
                    <div class="card-body d-flex flex-column">
                        <h5>${p.titulo || ''}</h5>
                        <p>${p.descripcion || ''}</p>

                        <small>${etapa} - ${progreso}%</small>
                        <div class="progress mb-2">
                            <div class="progress-bar" style="width:${progreso}%"></div>
                        </div>

                        <div class="mb-2">
                            ${
                                p.tecnologias 
                                ? p.tecnologias.split(',')
                                    .map(t => `<span class="badge bg-secondary me-1">${t.trim()}</span>`)
                                    .join('')
                                : ''
                            }
                        </div>

                        <div class="mt-auto d-flex gap-2">
                            ${
                                p.github_url 
                                ? `<a href="${p.github_url}" target="_blank" class="btn btn-dark btn-sm">
                                    <i class="fab fa-github"></i>
                                   </a>`
                                : ''
                            }
                            ${
                                p.web_url 
                                ? `<a href="${p.web_url}" target="_blank" class="btn btn-primary btn-sm">Ver</a>`
                                : ''
                            }
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = '<p>Error al cargar proyectos.</p>';
    }
}

// ===============================
// 5. HABILIDADES
// ===============================
async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    contenedor.innerHTML = '<p>Cargando...</p>';

    try {
        const { data, error } = await _supabase
            .from('habilidades')
            .select('*')
            .eq('categoria', categoria);

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = '<p>Sin habilidades aún.</p>';
            return;
        }

        contenedor.innerHTML = data.map((h, i) => `
            <div class="skill-card" style="animation-delay:${i * 0.1}s">
                <i class="${h.icono || 'fas fa-code'}"></i>
                <h4>${h.nombre}</h4>
                <span class="skill-badge ${(h.nivel || "junior").toLowerCase()}">${h.nivel}</span>
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = '<p>Error al cargar habilidades.</p>';
    }
}

// ===============================
// 6. SOBRE MI (PÚBLICO)
// ===============================
async function cargarSobreMi() {
    try {
        const { data, error } = await _supabase
            .from('sobre_mi')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return;

        document.getElementById('about-titulo')?.innerText = data.titulo || '';
        document.getElementById('about-desc1')?.innerText = data.descripcion_1 || '';
        document.getElementById('about-desc2')?.innerText = data.descripcion_2 || '';
        document.getElementById('about-img')?.setAttribute('src', data.imagen || '');

        const lista = document.getElementById('about-lista');
        if (lista && data.lista) {
            lista.innerHTML = data.lista
                .split(',')
                .map(i => `<li>${i.trim()}</li>`)
                .join('');
        }

    } catch (err) {
        console.log("Error sobre mí");
    }
}

// ===============================
// 7. INIT
// ===============================
window.addEventListener('supabaseReady', () => {
    try {
        mostrarProyectos();
        mostrarHabilidades('Lenguajes');
        cargarRedesSociales();
        cargarSobreMi();

        document.querySelectorAll('.skill-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mostrarHabilidades(btn.dataset.category);
            });
        });

    } catch (err) {
        console.error("Error inicializando:", err);
    }
});