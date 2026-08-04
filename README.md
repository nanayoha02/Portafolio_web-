# Portafolio — Yohana Franceschi

Portafolio web estático, moderno y responsivo (Mobile-First) para una **Desarrolladora de Software**. Tema oscuro nativo, sin dependencias de build: solo **HTML + CSS + JavaScript** con Tailwind CSS y Font Awesome vía CDN.

## 🚀 Demo

[https://yohana-portfolio-ten.vercel.app](https://yohana-portfolio-ten.vercel.app)

## 📂 Estructura

```
├── index.html      # Estructura semántica del sitio
├── styles.css      # Estilos personalizados y animaciones
├── main.js         # Menú móvil, filtros, scroll suave, formulario
├── img/
│   └── yoha_photo.png  # Foto de perfil (reemplázala con la tuya)
├── favicon.svg     # Favicon del sitio
└── README.md
```

## ✨ Secciones

- **Header/Nav sticky** con menú hamburguesa en móvil y scroll suave.
- **Hero** con saludo, CTAs (Ver Proyectos / Descargar CV) y redes sociales.
- **Sobre mí** + **Habilidades técnicas** por categorías (Frontend, Backend & BD, Herramientas).
- **Proyectos interactivos** con filtros en tiempo real (`Todos`, `🟢 Listo`, `🟡 En Desarrollo`, `Web / Full Stack`).
- **Contacto** con formulario de validación visual.
- **Footer** con redes sociales y copyright.

## 🗂️ Proyectos de ejemplo (Data Initializer)

Los proyectos viven en `main.js` dentro de la constante `projects`. Para agregar o modificar uno, edita el objeto correspondiente:

```js
{
  titulo: 'Mi Proyecto',
  estado: 'listo',               // 'listo' | 'desarrollo'
  categorias: ['web', 'fullstack'], // 'web' | 'frontend' | 'backend' | 'fullstack'
  descripcion: 'Qué resuelve y su valor.',
  stack: ['React', 'Node.js'],     // badges del stack
  demo: 'https://...',             // link de la demo
  codigo: 'https://github.com/...' // link del código
}
```

## 🎨 Personalización

- **Colores / tipografía:** definidos con utilidades de Tailwind en `index.html` y clases en `styles.css`.
- **Foto de perfil:** reemplaza `img/yoha_photo.png`.
- **Enlaces sociales / correo:** edita los `href` en las secciones Hero, Contacto y Footer.

## 📦 Despliegue

### Vercel (recomendado)

```bash
npm i -g vercel
vercel --prod
```

Sin comando de build: Vercel detecta el proyecto como estático y publica `index.html` automáticamente.

### GitHub Pages

```bash
# Crea la rama gh-pages y publica el contenido
git checkout -b gh-pages
git push origin gh-pages
```

O simplemente sube la carpeta al repositorio y activa Pages desde la raíz.

### Local

Abre `index.html` directamente en tu navegador, o sirve con cualquier servidor estático:

```bash
npx serve .
```

## 📝 Notas

- El formulario de contacto es **visual** (validación en cliente). Para envíos reales conecta un backend (Formspree, EmailJS, Supabase, etc.).
- La ruta `img/yoha_photo.png` es la foto de perfil; el sitio funciona igual sin imagen (fallback controlado).

---

© Yohana Franceschi. Todos los derechos reservados.
