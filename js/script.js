/**
 * PORTFOLIO - MAIN SCRIPT (Público)
 */

// ===============================
// 0. VALIDACIÓN GLOBAL
// ===============================
if (typeof _supabase === "undefined") {
    console.error("❌ Supabase no está cargado");
}

// ===============================
// 1. NAVBAR SCROLL
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
// 2. REDES SOCIALES
// ===============================
async function cargarRedesSociales() {
    try {
        const { data, error } = await _supabase
            .from('perfil')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return;

        const gmail = document.getElementById('link-gmail');
        const linkedin = document.getElementById('link-linkedin');
        const github = document.getElementById('link-github');
        const emailText = document.getElementById('text-email');

        if (gmail) gmail.href = `mailto:${data.email}`;
        if (linkedin) linkedin.href = data.linkedin;
        if (github) github.href = data.github;
        if (emailText) emailText.innerText = data.email;

    } catch (err) {
        console.log("Perfil no configurado.");
    }
}

// ===============================
// 3. PROYECTOS
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

            let etapa = "En Desarrollo";
            if (progreso === 100) etapa = "Finalizado";
            else if (progreso >= 60) etapa = "Beta";

            const imgUrl = p.imagen_url || 'https://via.placeholder.com/600x400';

            return `
            <div class="col-md-4">
                <div class="card h-100">
                    <img src="${imgUrl}" class="card-img-top"
                        onerror="this.src='https://via.placeholder.com/600x400'">

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
// 4. HABILIDADES
// ===============================
// ===============================
// 4. HABILIDADES (CORREGIDO)
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
                <p class="skill-level">${h.nivel || ""}</p> 
            </div>
        `).join('');

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = '<p>Error al cargar habilidades.</p>';
    }
}
// ===============================
// 5. SOBRE MI
// ===============================
async function cargarSobreMi() {
    try {
        const { data, error } = await _supabase
            .from('sobre_mi')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return;

        const titulo = document.getElementById('about-titulo');
        const desc1 = document.getElementById('about-desc1');
        const desc2 = document.getElementById('about-desc2');
        const img = document.getElementById('about-img');
        const lista = document.getElementById('about-lista');

        if (titulo) titulo.innerText = data.titulo || '';
        if (desc1) desc1.innerText = data.descripcion_1 || '';
        if (desc2) desc2.innerText = data.descripcion_2 || '';
        if (img) img.src = data.imagen || '';

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
// 6. INIT (IMPORTANTE)
// ===============================
window.addEventListener('load', () => {
    if (typeof _supabase === "undefined") return;

    mostrarProyectos();
    mostrarHabilidades('Lenguajes');
    cargarRedesSociales();
    cargarSobreMi();

    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skill-tab')
                .forEach(b => b.classList.remove('active'));

            btn.classList.add('active');
            mostrarHabilidades(btn.dataset.category);
        });
    });
});
// ===============================
// 7. ATAJOS DE TECLADO (Navegación)
// ===============================
document.addEventListener('keydown', (e) => {
    // Verifica si se presiona Alt + L (minúscula o mayúscula)
    if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault(); // Evita comportamientos extraños del navegador
        window.location.href = 'login.html'; // Asegúrate de que el nombre del archivo sea correcto
    }
});

