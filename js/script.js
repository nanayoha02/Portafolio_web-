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
// 1. EFECTO NAVBAR
// ===============================
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// ===============================
// 2. INIT GENERAL (SIN EVENTO RARO)
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

    // Esperar a que supabase exista
    if (typeof _supabase === "undefined") {
        console.error("❌ Supabase no disponible");
        return;
    }

    await iniciarApp();
});

// ===============================
// 3. INICIAR APP
// ===============================
async function iniciarApp() {
    try {
        await Promise.all([
            mostrarProyectos(),
            mostrarHabilidades("Lenguajes"),
            cargarRedesSociales(),
            cargarSobreMi()
        ]);

        activarTabs();

    } catch (err) {
        console.error("Error iniciando app:", err);
    }
}

// ===============================
// 4. REDES SOCIALES
// ===============================
async function cargarRedesSociales() {
    try {
        const { data, error } = await _supabase
            .from("perfil")
            .select("*")
            .eq("id", 1)
            .single();

        if (error || !data) return;

        document.getElementById("link-gmail")?.setAttribute("href", `mailto:${data.email}`);
        document.getElementById("link-linkedin")?.setAttribute("href", data.linkedin);
        document.getElementById("link-github")?.setAttribute("href", data.github);
        document.getElementById("text-email")?.innerText = data.email;

    } catch (err) {
        console.log("Perfil no configurado");
    }
}

// ===============================
// 5. PROYECTOS (CORREGIDO)
// ===============================
async function mostrarProyectos() {
    const contenedor = document.getElementById("project-grid");
    if (!contenedor) return;

    try {
        const { data: proyectos, error } = await _supabase
            .from("proyectos")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!proyectos || proyectos.length === 0) {
            contenedor.innerHTML = "<p>Sin proyectos aún.</p>";
            return;
        }

        contenedor.innerHTML = proyectos.map(p => {

            const progreso = Number(p.progreso) || 0;

            // ✅ SIN OPERADORES RAROS (error eliminado)
            let etapa = "En Desarrollo";
            if (progreso === 100) etapa = "Finalizado";
            else if (progreso >= 60) etapa = "Beta";

            const imgUrl = p.imagen_url || "https://via.placeholder.com/600x400";

            return `
            <div class="col-md-4">
                <div class="card h-100">
                    <img src="${imgUrl}" class="card-img-top"
                        onerror="this.src='https://via.placeholder.com/600x400'">

                    <div class="card-body d-flex flex-column">
                        <h5>${p.titulo || ""}</h5>
                        <p>${p.descripcion || ""}</p>

                        <small>${etapa} - ${progreso}%</small>

                        <div class="progress mb-2">
                            <div class="progress-bar" style="width:${progreso}%"></div>
                        </div>

                        <div class="mb-2">
                            ${
                                p.tecnologias
                                ? p.tecnologias.split(",")
                                    .map(t => `<span class="badge bg-secondary me-1">${t.trim()}</span>`)
                                    .join("")
                                : ""
                            }
                        </div>

                        <div class="mt-auto d-flex gap-2">
                            ${
                                p.github_url
                                ? `<a href="${p.github_url}" target="_blank" class="btn btn-dark btn-sm">
                                    <i class="fab fa-github"></i>
                                   </a>`
                                : ""
                            }

                            ${
                                p.web_url
                                ? `<a href="${p.web_url}" target="_blank" class="btn btn-primary btn-sm">
                                    Ver
                                   </a>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
            </div>
            `;
        }).join("");

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = "<p>Error al cargar proyectos.</p>";
    }
}

// ===============================
// 6. HABILIDADES
// ===============================
async function mostrarHabilidades(categoria = "Lenguajes") {
    const contenedor = document.getElementById("habilidades-container");
    if (!contenedor) return;

    contenedor.innerHTML = "<p>Cargando...</p>";

    try {
        const { data, error } = await _supabase
            .from("habilidades")
            .select("*")
            .eq("categoria", categoria);

        if (error) throw error;

        if (!data || data.length === 0) {
            contenedor.innerHTML = "<p>Sin habilidades aún.</p>";
            return;
        }

        contenedor.innerHTML = data.map((h, i) => `
            <div class="skill-card" style="animation-delay:${i * 0.1}s">
                <i class="${h.icono || "fas fa-code"}"></i>
                <h4>${h.nombre}</h4>
                <span class="skill-badge ${(h.nivel || "junior").toLowerCase()}">
                    ${h.nivel}
                </span>
            </div>
        `).join("");

    } catch (err) {
        console.error(err);
        contenedor.innerHTML = "<p>Error al cargar habilidades.</p>";
    }
}

// ===============================
// 7. SOBRE MI
// ===============================
async function cargarSobreMi() {
    try {
        const { data, error } = await _supabase
            .from("sobre_mi")
            .select("*")
            .eq("id", 1)
            .single();

        if (error || !data) return;

        document.getElementById("about-titulo")?.innerText = data.titulo || "";
        document.getElementById("about-desc1")?.innerText = data.descripcion_1 || "";
        document.getElementById("about-desc2")?.innerText = data.descripcion_2 || "";

        if (data.imagen) {
            document.getElementById("about-img")?.setAttribute("src", data.imagen);
        }

        const lista = document.getElementById("about-lista");
        if (lista && data.lista) {
            lista.innerHTML = data.lista
                .split(",")
                .map(i => `<li>${i.trim()}</li>`)
                .join("");
        }

    } catch (err) {
        console.log("Error sobre mí");
    }
}

// ===============================
// 8. TABS HABILIDADES
// ===============================
function activarTabs() {
    document.querySelectorAll(".skill-tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".skill-tab")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");
            mostrarHabilidades(btn.dataset.category);
        });
    });
}