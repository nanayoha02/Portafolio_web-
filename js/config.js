const SUPABASE_URL = "https://hydpocjkzsrsfbwgdodi.supabase.co";
const SUPABASE_KEY = "sb_publishable_HnGLMO92-LnYnnPhFIYkEQ__NGTp_SJ";

window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.dispatchEvent(new Event("supabaseReady"));