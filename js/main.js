// js/main.js

async function cargarEntorno() {
    const dependencias = [
        'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
        'js/config.js'
    ];
    

    try {
        for (const src of dependencias) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => reject(new Error(`Error cargando: ${src}`));
                document.head.appendChild(script);
            });
        }
        console.log("🚀 Entorno de Supabase listo.");
        
        // Disparamos un evento personalizado para avisar que ya existe '_supabase'
        window.dispatchEvent(new Event('supabaseReady'));
        
    } catch (error) {
        console.error("Fallo en la carga del entorno:", error);
    }
}
// ANIMACIÓN SCROLL (REVEAL)
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
    reveals.forEach(el => {
        const windowHeight = window.innerHeight;
        const elementTop = el.getBoundingClientRect().top;

        if (elementTop < windowHeight - 100) {
            el.classList.add("show");
        }
    });
}

// --- 7. CARGAR SOBRE MI ---
async function cargarSobreMi() {
    try {
        const { data, error } = await _supabase
            .from('sobre_mi')
            .select('*')
            .limit(1);

        if (error || !data || data.length === 0) return;

        const info = data[0];

        // TEXTO
        document.getElementById('about-titulo').innerText = info.titulo;
        document.getElementById('about-desc1').innerText = info.descripcion_1;
        document.getElementById('about-desc2').innerText = info.descripcion_2;

        // IMAGEN
        document.getElementById('about-img').src = info.imagen;

        // LISTA (si la agregas luego)
        const lista = document.getElementById('about-lista');
        if (lista && info.lista) {
            lista.innerHTML = info.lista
                .split(',')
                .map(item => `<li>${item.trim()}</li>`)
                .join('');
        }

    } catch (e) {
        console.log("Error cargando Sobre Mí", e);
    }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

window.addEventListener('supabaseReady', () => {
    cargarSobreMi();
});
// Iniciar carga inmediatamente
cargarEntorno();