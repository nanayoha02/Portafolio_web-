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
// // ===============================
// 2. GUARDAR HABILIDAD (ADMIN)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-habilidad");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // 1. Capturamos los valores usando los nuevos IDs del HTML
        const nombre = document.getElementById("nombre").value;
        const nivel = document.getElementById("nivel-habilidad").value;
        const categoria = document.getElementById("categoria").value;
        const icono = document.getElementById("icono").value;

        // 2. Insertamos en Supabase (asegúrate que la columna en la BD se llame 'nivel')
        const { error } = await _supabase
            .from("habilidades")
            .insert([{ 
                nombre, 
                nivel, // Enviamos el texto "Junior", "Avanzado", etc.
                categoria, 
                icono 
            }]);

        if (error) {
            console.error(error);
            alert("❌ Error al guardar: " + error.message);
        } else {
            alert("✅ ¡Habilidad guardada como tarjeta!");
            form.reset();
            
            // 3. ¡IMPORTANTE! Refrescar la lista de tarjetas automáticamente
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

        const linkGmail = document.getElementById('link-gmail');
        const linkLinkedin = document.getElementById('link-linkedin');
        const linkGithub = document.getElementById('link-github');
        const textEmail = document.getElementById('text-email');

        if (linkGmail) linkGmail.href = `mailto:${data.email}`;
        if (textEmail) textEmail.innerText = data.email;
        if (linkLinkedin) linkLinkedin.href = data.linkedin;
        if (linkGithub) linkGithub.href = data.github;

    } catch {
        console.log("Perfil no configurado aún.");
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
        const etapa = progreso == 100 ? "Finalizado" : progreso >= 60 ? "Beta" : "En Desarrollo";
        const imgUrl = p.imagen_url || 'https://via.placeholder.com/600x400';

        return `
<div class="col-md-4">
  <div class="card h-100">

    <img src="${imgUrl}" class="card-img-top">

    <div class="card-body d-flex flex-column">

      <h5 class="card-title">${p.titulo}</h5>

      <p class="card-text">${p.descripcion || ''}</p>

      <div class="mb-3">
        <small>${etapa} - ${progreso}%</small>
        <div class="progress">
          <div class="progress-bar" style="width:${progreso}%"></div>
        </div>
      </div>

      <div class="mb-3">
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
</div>
`;
    }).join('');
}

// ===============================
// 5. HABILIDADES (PÚBLICO)
// ===============================
async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    // Limpiamos y mostramos que estamos cargando
    contenedor.innerHTML = '<p class="text-center">Cargando habilidades...</p>';

    const { data, error } = await _supabase
        .from('habilidades')
        .select('*')
        .eq('categoria', categoria);

    if (error || !data || data.length === 0) {
        contenedor.innerHTML = '<p class="text-center">Próximamente más habilidades en esta categoría.</p>';
        return;
    }

    // Renderizamos las tarjetas sin barras ni porcentajes
    contenedor.innerHTML = data.map((h, i) => {
    const nivelClass = (h.nivel || "Junior").toLowerCase();

    return `
    <div class="skill-card" style="animation-delay:${i * 0.1}s">
        <div class="skill-icon">
            <i class="${h.icono || 'fas fa-code'}"></i>
        </div>
        <h4>${h.nombre}</h4>
        <span class="skill-badge ${nivelClass}">
            ${h.nivel || 'Junior'}
        </span>
    </div>
    `;
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

        const titulo = document.getElementById('about-titulo-input');
        const desc1 = document.getElementById('about-desc1-input');
        const desc2 = document.getElementById('about-desc2-input');
        const lista = document.getElementById('about-lista-input');
        const preview = document.getElementById('preview-img');

        if (titulo) titulo.value = data.titulo || '';
        if (desc1) desc1.value = data.descripcion_1 || '';
        if (desc2) desc2.value = data.descripcion_2 || '';
        if (lista) lista.value = data.lista || '';
        if (preview) preview.src = data.imagen || '';

    } catch {
        console.log("Error admin sobre mí");
    }
}

// ===============================
// 7. PREVIEW IMAGEN
// ===============================
document.getElementById("about-img-file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById("preview-img").src = URL.createObjectURL(file);
});

// ===============================
// 8. GUARDAR SOBRE MI
// ===============================
document.getElementById("form-sobre")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    let imageUrl = "";

    const file = document.getElementById("about-img-file").files[0];

    if (file) {
        const fileName = `about-${Date.now()}`;

        const { error: uploadError } = await _supabase.storage
          .from('imagenes')
          .upload(fileName, file);

       if (uploadError) {
          console.error(uploadError);
         alert("Error subiendo imagen: " + uploadError.message);
        return;
}

    await _supabase
        .from('sobre_mi')
        .update({
            titulo: document.getElementById('about-titulo-input').value,
            descripcion_1: document.getElementById('about-desc1-input').value,
            descripcion_2: document.getElementById('about-desc2-input').value,
            lista: document.getElementById('about-lista-input').value,
            ...(imageUrl && { imagen: imageUrl })
        })
        .eq('id', 1);

    alert("✅ Sobre mí actualizado");
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

        const titulo = document.getElementById('about-titulo');
        const desc1 = document.getElementById('about-desc1');
        const desc2 = document.getElementById('about-desc2');
        const img = document.getElementById('about-img');
        const lista = document.getElementById('about-lista');

        if (titulo) titulo.innerText = data.titulo;
        if (desc1) desc1.innerText = data.descripcion_1;
        if (desc2) desc2.innerText = data.descripcion_2;
        if (img) img.src = data.imagen;

        if (lista) {
            lista.innerHTML = data.lista
                ? data.lista.split(',').map(i => `<li>${i.trim()}</li>`).join('')
                : '';
        }

    } catch {
        console.log("Error público sobre mí");
    }
}

// ===============================
// 10. ATAJO LOGIN
// ===============================
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'l') {
        window.location.href = 'login.html';
    }
});

// ===============================
// 11. INIT
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