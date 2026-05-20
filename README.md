# Comunidad PRIMA Caballito · Guía de WhatsApp

Tutorial visual para vecinos del edificio **PRIMA Caballito** que explica cómo
funcionan las Comunidades de WhatsApp aplicadas al edificio: qué grupos hay,
cuáles son nuevos, cómo sumarse, cómo invitar a un vecino y cómo salir.

Diseñado en **formato vertical (1080×1920)** para verse cómodo desde el celular.

## Cómo verlo

Abrí `index.html` en el navegador del celular o de la compu.

- Navegá con los botones **Atrás / Siguiente** de abajo, con **swipe** (mobile),
  con las **flechas ← →** (compu) o con **tap** en los bordes.
- Funciona sin conexión una vez cargado.

## Publicación automática (GitHub Pages + Actions)

El repo ya incluye el workflow `.github/workflows/deploy.yml`, que en cada push
a `main` construye y publica el sitio en GitHub Pages.

**Configuración inicial (una sola vez):**

1. Subí el repo a GitHub (público).
2. En el repo → **Settings → Pages → Build and deployment → Source:
   `GitHub Actions`**.
3. Hacé push a `main` (o corré el workflow a mano desde la pestaña **Actions →
   Deploy to GitHub Pages → Run workflow**).
4. Cuando el workflow termina, el link público queda visible en el job
   (`https://<usuario>.github.io/<repo>/`). Ese link es el que se comparte por
   WhatsApp.

## Archivos

- `index.html` — la presentación (17 láminas).
- `styles.css` — estilos (sistema visual DICOP: navy / amarillo / cyan).
- `deck.js` — motor mobile-first: escalado a pantalla, animaciones, botones, swipe y teclado.
- `assets/prima-logo.png` — logo del edificio.
- `.nojekyll` — evita que GitHub Pages procese el sitio con Jekyll.
- `.github/workflows/deploy.yml` — deploy automático a Pages.

## Editar contenido

Los textos están escritos como HTML estático dentro de `index.html`. Para
cambiar una frase, abrí el archivo, buscá el texto y reemplazalo. No hace falta
tocar nada de JavaScript.
