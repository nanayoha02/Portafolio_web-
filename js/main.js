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

// Iniciar carga inmediatamente
cargarEntorno();