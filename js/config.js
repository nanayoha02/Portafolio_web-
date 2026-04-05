// CONFIGURACIÓN DE CONEXIÓN CON SUPABASE
// Asegúrate de que estos valores coincidan con tu proyecto 'sharehubProyecto'

const SUPABASE_URL = 'https://hydpocjkzsrsfbwgdodi.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_HnGLMO92-LnYnnPhFIYkEQ__NGTp_SJ'; // <--- Verifica que sea la 'anon public'

// Inicializamos el cliente de Supabase
// Usamos _supabase (con guion bajo) para evitar conflictos con la librería
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Conexión con Supabase inicializada correctamente.");