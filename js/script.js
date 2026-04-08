/**
 * PORTFOLIO - MAIN SCRIPT (Público + Admin)
 */

// ===============================
// 1. EFECTO NAVBAR
// ===============================
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.scrollY > 50 
            ? navbar.classList.add('scrolled') 
            : navbar.classList.remove('scrolled');
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

        const nombre = document.getElementById("nombre").value;
        const nivel = document.getElementById("nivel-habilidad").value;
        const categoria = document.getElementById("categoria").value;
        const icono = document.getElementById("icono").value;

        const { error } = await _supabase
            .from("habilidades")
            .insert([{ nombre, nivel, categoria, icono }]);

        if (error) {
            console.error(error);
            alert("❌ Error: " + error.message);
        } else {
            alert("✅ Habilidad guardada");
            form.reset();
            if (typeof cargarHabilidadesAdmin === "function") {
                cargarHabilidadesAdmin();
            }
        }
    });
});

// ===============================
// 3. REDES SOCIALES
// ===============================
async function cargarRedesSociales() {
    try {
        const { data } = await _supabase
            .from('perfil')
            .select('*')
            .eq('id', 1)
            .single();

        if (!data) return;

        document.getElementById('link-gmail')?.setAttribute('href', `mailto:${data.email}`);
        document.getElementById('link-linkedin')?.setAttribute('href', data.linkedin);
        document.getElementById('link-github')?.setAttribute('href', data.github);
        document.getElementById('text-email')?.innerText = data.email;

    } catch {
        console.log("Perfil no configurado.");
    }
}

// ===============================
// 4. PROYECTOS
// ===============================
async function mostrarProyectos() {
    const contenedor = document.getElementById('project-grid');
    if (!contenedor) return;

    const { data: proyectos } = await _supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

    if (!proyectos) {
        contenedor.innerHTML = '<p>Error al cargar proyectos.</p>';
        return;
    }

    contenedor.innerHTML = proyectos.map(p => {
        const progreso = p.progreso || 0;

        // ✅ CORREGIDO (antes fallaba)
        let etapa;
        if (progreso === 100) {
            etapa = "Finalizado";
        } else if (progreso >= 60) {
            etapa = "Beta";
        } else {
            etapa = "En Desarrollo";
        }

        const imgUrl = p.imagen_url || 'https://via.placeholder.com/600x400';

        return `
        <div class="col-md-4">
            <div class="card h-100">
                <img src="${imgUrl}" class="card-img-top">
                <div class="card-body d-flex flex-column">
                    <h5>${p.titulo}</h5>
                    <p>${p.descripcion || ''}</p>

                    <small>${etapa} - ${progreso}%</small>
                    <div class="progress mb-2">
                        <div class="progress-bar" style="width:${progreso}%"></div>
                    </div>

                    <div class="mb-2">
                        ${p.tecnologias 
                            ? p.tecnologias.split(',').map(t => `<span class="badge bg-secondary me-1">${t.trim()}</span>`).join('')
                            : ''}
                    </div>

                    <div class="mt-auto d-flex gap-2">
                        ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="btn btn-dark btn-sm"><i class="fab fa-github"></i></a>` : ''}
                        ${p.web_url ? `<a href="${p.web_url}" target="_blank" class="btn btn-primary btn-sm">Ver</a>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// ===============================
// 5. HABILIDADES (PÚBLICO)
// ===============================
async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    contenedor.innerHTML = '<p>Cargando...</p>';

    const { data } = await _supabase
        .from('habilidades')
        .select('*')
        .eq('categoria', categoria);

    if (!data || data.length === 0) {
        contenedor.innerHTML = '<p>Sin habilidades aún.</p>';
        return;
    }

    contenedor.innerHTML = data.map((h, i) => {
        const nivelClass = (h.nivel || "Junior").toLowerCase();

        return `
        <div class="skill-card" style="animation-delay:${i * 0.1}s">
            <i class="${h.icono || 'fas fa-code'}"></i>
            <h4>${h.nombre}</h4>
            <span class="skill-badge ${nivelClass}">${h.nivel}</span>
        </div>`;
    }).join('');
}

// ===============================
// 6. SOBRE MI (ADMIN)
// ===============================
async function cargarSobreMiAdmin() {
    try {
        const { data } = await _supabase
            .from('sobre_mi')
            .select('*')
            .eq('id', 1)
            .single();

        if (!data) return;

        document.getElementById('about-titulo-input').value = data.titulo || '';
        document.getElementById('about-desc1-input').value = data.descripcion_1 || '';
        document.getElementById('about-desc2-input').value = data.descripcion_2 || '';
        document.getElementById('about-lista-input').value = data.lista || '';

        if (data.imagen) {
            document.getElementById('preview-img').src = data.imagen;
        }

    } catch {
        console.log("Error admin sobre mí");
    }
}

// ===============================
// 7. PREVIEW IMAGEN
// ===============================
document.getElementById("about-img-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById("preview-img").src = URL.createObjectURL(file);
    }
});

// ===============================
// 8. GUARDAR SOBRE MI
// ===============================
document.getElementById("form-sobre")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let imageUrl = "";
    const file = document.getElementById("about-img-file").files[0];

    if (file) {
        const ext = file.name.split('.').pop();
        const fileName = `about-${Date.now()}.${ext}`;

        const { error: uploadError } = await _supabase.storage
            .from('imagenes')
            .upload(fileName, file);

        if (uploadError) {
            alert(uploadError.message);
            return;
        }

        const { data } = _supabase.storage
            .from('imagenes')
            .getPublicUrl(fileName);

        imageUrl = data.publicUrl;
    }

    const { error } = await _supabase
        .from('sobre_mi')
        .update({
            titulo: document.getElementById('about-titulo-input').value,
            descripcion_1: document.getElementById('about-desc1-input').value,
            descripcion_2: document.getElementById('about-desc2-input').value,
            lista: document.getElementById('about-lista-input').value,
            ...(imageUrl && { imagen: imageUrl })
        })
        .eq('id', 1);

    if (error) {
        alert(error.message);
    } else {
        alert("✅ Actualizado");
    }
});

// ===============================
// 9. SOBRE MI (PÚBLICO)
// ===============================
async function cargarSobreMi() {
    try {
        const { data } = await _supabase
            .from('sobre_mi')
            .select('*')
            .eq('id', 1)
            .single();

        if (!data) return;

        document.getElementById('about-titulo')?.innerText = data.titulo;
        document.getElementById('about-desc1')?.innerText = data.descripcion_1;
        document.getElementById('about-desc2')?.innerText = data.descripcion_2;
        document.getElementById('about-img')?.setAttribute('src', data.imagen);

        const lista = document.getElementById('about-lista');
        if (lista) {
            lista.innerHTML = data.lista
                ? data.lista.split(',').map(i => `<li>${i.trim()}</li>`).join('')
                : '';
        }

    } catch {
        console.log("Error público");
    }
}

// ===============================
// 10. INIT
// ===============================
window.addEventListener('supabaseReady', () => {
    mostrarProyectos();
    mostrarHabilidades('Lenguajes');
    cargarRedesSociales();
    cargarSobreMiAdmin();
    cargarSobreMi();

    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mostrarHabilidades(btn.dataset.category);
        });
    });
});