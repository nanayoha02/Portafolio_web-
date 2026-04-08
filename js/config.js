// CONFIGURACIÓN DE CONEXIÓN CON SUPABASE

const SUPABASE_URL = 'https://hydpocjkzsrsfbwgdodi.supabase.co'; 

// 🔥 REEMPLAZA ESTA KEY POR LA REAL (anon public)
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5ZHBvY2prenNyc2Zid2dkb2RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjIwMDQsImV4cCI6MjA5MDczODAwNH0.-zZ9hjL7__-7XY66zTmGmbjDS-6DSRq9Ya5chO-9xY4';

// Inicializamos Supabase
window._supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ Supabase conectado");

// 🔥 ESTO SOLUCIONA QUE TODO CARGUE
window.dispatchEvent(new Event('supabaseReady'));