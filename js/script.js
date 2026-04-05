/**
 * PORTFOLIO - MAIN SCRIPT (Público)
 */

// --- 1. EFECTO NAVBAR ---
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.scrollY > 50 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled');
    }
});

// --- 2. CARGAR REDES SOCIALES (Dinámico) ---
async function cargarRedesSociales() {
    try {
        const { data, error } = await _supabase.from('perfil').select('*').eq('id', 1).single();
        if (error || !data) return;

        const linkGmail = document.getElementById('link-gmail');
        const linkLinkedin = document.getElementById('link-linkedin');
        const linkGithub = document.getElementById('link-github');
        const textEmail = document.getElementById('text-email');

        if (linkGmail) linkGmail.href = `mailto:${data.email}`;
        if (textEmail) textEmail.innerText = data.email;
        if (linkLinkedin) linkLinkedin.href = data.linkedin;
        if (linkGithub) linkGithub.href = data.github;
    } catch (e) {
        console.log("Perfil no configurado aún.");
    }
}

// --- 3. MOSTRAR PROYECTOS ---
async function mostrarProyectos() {
    const contenedor = document.getElementById('project-grid');
    if (!contenedor) return;

    const { data: proyectos, error } = await _supabase.from('proyectos').select('*').order('created_at', { ascending: false });

    if (error) {
        contenedor.innerHTML = '<p>Error al cargar proyectos.</p>';
        return;
    }

    contenedor.innerHTML = proyectos.map(p => {
        const progreso = p.progreso || 0;
        const etapa = progreso == 100 ? "Finalizado" : progreso >= 60 ? "Beta" : "En Desarrollo";
        const imgUrl = p.imagen_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600';

        return `
<div class="col-md-4">
  <div class="card h-100">

    <img src="${imgUrl}" class="card-img-top" alt="${p.titulo}"
         onerror="this.src='https://via.placeholder.com/600x400?text=Proyecto'">

    <div class="card-body d-flex flex-column">

      <h5 class="card-title">${p.titulo}</h5>

      <p class="card-text">${p.descripcion || ''}</p>

      <!-- Progreso -->
      <div class="mb-3">
        <small>${etapa} - ${progreso}%</small>
        <div class="progress">
          <div class="progress-bar" style="width: ${progreso}%"></div>
        </div>
      </div>

      <!-- Tecnologías -->
      <div class="mb-3">
        ${p.tecnologias 
          ? p.tecnologias.split(',').map(t => `<span class="badge bg-secondary me-1">${t.trim()}</span>`).join('') 
          : ''}
      </div>

      <!-- Links -->
      <div class="mt-auto d-flex gap-2">
        ${p.github_url 
          ? `<a href="${p.github_url}" target="_blank" class="btn btn-dark btn-sm"><i class="fab fa-github"></i></a>` 
          : ''}
        ${p.web_url 
          ? `<a href="${p.web_url}" target="_blank" class="btn btn-primary btn-sm">Ver</a>` 
          : ''}
      </div>

    </div>
  </div>
</div>
`;
    }).join('');
}

// --- 4. MOSTRAR HABILIDADES ---
async function mostrarHabilidades(categoria = 'Lenguajes') {
    const contenedor = document.getElementById('habilidades-container');
    if (!contenedor) return;

    const { data: habilidades } = await _supabase.from('habilidades').select('*').eq('categoria', categoria);
    
    contenedor.innerHTML = habilidades && habilidades.length > 0 ? habilidades.map(h => {
        const p = Math.max(0, Math.min(100, h.porcentaje || 0));
        return `
        <div class="skill-item">
            <div class="skill-circle" style="--p: ${p}">
                <i class="${h.icono || 'fas fa-code'}"></i>
                <span>${p}%</span>
            </div>
            <p>${h.nombre}</p>
        </div>`;
    }).join('') : '<p>No hay habilidades en esta categoría.</p>';
}

// --- 5. ATAJO LOGIN (Alt + L) ---
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'l') window.location.href = 'login.html';
});

// --- 6. INICIALIZACIÓN ---
window.addEventListener('supabaseReady', () => {
    mostrarProyectos();
    mostrarHabilidades('Lenguajes');
    cargarRedesSociales();

    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            mostrarHabilidades(btn.dataset.category);
        });
    });
});