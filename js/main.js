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
            .eq('id', 1)
            .single();

        if (error || !data) return;

        
        const titulo = document.getElementById('about-titulo');
        const desc1 = document.getElementById('about-desc1');
        const desc2 = document.getElementById('about-desc2');
        const img = document.getElementById('about-img');
        const lista = document.getElementById('about-lista');

        if (!titulo || !desc1 || !desc2 || !img || !lista) return;


        titulo.innerText = data.titulo;
        desc1.innerText = data.descripcion1;
        desc2.innerText = data.descripcion2;
        img.src = data.imagen_url;

        lista.innerHTML = data.lista
            ? data.lista.split(',').map(item => `<li>${item.trim()}</li>`).join('')
            : '';

    } catch (e) {
        console.log("Error cargando Sobre Mí");
    }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

window.addEventListener('supabaseReady', () => {
    cargarSobreMi();
});
// Iniciar carga inmediatamente
cargarEntorno();