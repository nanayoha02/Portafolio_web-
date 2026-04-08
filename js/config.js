if (window._supabase) {
    console.log("Supabase ya inicializado");
} else {
    window._supabase = supabase.createClient(
        "https://hydpocjkzsrsfbwgdodi.supabase.co",
        "sb_publishable_HnGLMO92-LnYnnPhFIYkEQ__NGTp_SJ"
    );

    window.dispatchEvent(new Event("supabaseReady"));
}