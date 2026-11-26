# AgoFitness · Sitio web

Sitio estático (HTML + CSS + JS, sin dependencias). Funciona directo en Vercel o GitHub Pages.

## Estructura

```
index.html          ← contenido y textos
styles.css          ← diseño (colores de marca al inicio, en :root)
script.js           ← número de WhatsApp (primeras líneas)
assets/
  logo.png          ← logo rosa
  logo-white.png    ← logo blanco (menú)
  img/              ← aquí van tus fotos
catalogos/          ← aquí van tus PDFs
```

## 1. WhatsApp
Abre `script.js` y cambia:

```js
const WHATSAPP_NUMBER = "520000000000";
```

Usa solo números con código de país (México = 52). Ejemplo: `"525512345678"`.
Todos los botones de WhatsApp del sitio usan este número. Cada botón trae un mensaje
prellenado distinto; lo cambias en el atributo `data-msg="..."` dentro de `index.html`.

## 2. Catálogos PDF
Sube tus archivos a la carpeta `catalogos/` con **exactamente** estos nombres:

- `catalogos/catalogo-siclo.pdf`
- `catalogos/catalogo-second-skin.pdf`

Para actualizar un catálogo, solo reemplaza el PDF con el mismo nombre.
Tip: comprime los PDFs (ilovepdf.com) para que carguen rápido en el celular; GitHub no acepta archivos de más de 100 MB.

## 3. Imágenes
Sube tus fotos a `assets/img/` con estos nombres (jpg). Mientras no existan, se ve un degradado de marca:

| Archivo | Dónde aparece | Tamaño sugerido |
|---|---|---|
| `hero.jpg` | Fondo principal | 2000×1300 horizontal |
| `siclo.jpg` | Tarjeta catálogo SICLO | 1200×1500 vertical |
| `second-skin.jpg` | Tarjeta catálogo SECOND SKIN | 1200×1500 vertical |
| `producto-1.jpg` | Galería (alta) | 900×1300 vertical |
| `producto-2.jpg` / `producto-3.jpg` | Galería | 900×900 |
| `producto-4.jpg` | Galería (ancha) | 1600×900 horizontal |
| `nosotros.jpg` | Sección "Sobre AgoFitness" | 1200×1500 vertical |

Comprime las fotos (squoosh.app o tinypng.com), idealmente menos de 400 KB cada una.

## 4. Textos y redes
- Textos, nombres de productos y preguntas frecuentes: edítalos en `index.html` (están en español y comentados por sección).
- Instagram / TikTok: cambia los links en el footer de `index.html`.
- Colores: en `styles.css`, variables `--rose`, `--ink`, `--bone`.

## Publicar
Sube estos archivos a la raíz del repo y haz commit. Vercel lo republica solo en cada push.
