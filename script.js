/* =========================================================
   CONFIGURACIÓN — cambia solo estas líneas
   ========================================================= */

// Tu número de WhatsApp con código de país, SOLO números (sin +, espacios ni guiones).
// México: 52 + 10 dígitos  →  ejemplo: "525512345678"
const WHATSAPP_NUMBER = "520000000000";

// Mensaje por defecto si un botón no tiene uno propio (data-msg)
const WHATSAPP_DEFAULT_MSG = "Hola AgoFitness, quiero información sobre sus productos GymCo.";

/* ========================================================= */

const root = document.documentElement;
root.classList.remove("no-js");
const body = document.body;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- WhatsApp ---------- */
document.querySelectorAll(".js-whatsapp").forEach((el) => {
  const msg = el.dataset.msg || WHATSAPP_DEFAULT_MSG;
  el.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  el.target = "_blank";
  el.rel = "noopener";
});

/* ---------- Intro / loader ---------- */
function startSite() {
  if (body.classList.contains("is-loaded")) return;
  body.classList.add("is-leaving");
  setTimeout(() => {
    body.classList.add("is-loaded");
    runCounters();
  }, reduceMotion ? 0 : 650);
}
let seenIntro = false;
try { seenIntro = sessionStorage.getItem("ago-intro") === "1"; sessionStorage.setItem("ago-intro", "1"); } catch (e) {}
const introTime = reduceMotion ? 0 : seenIntro ? 500 : 1500;
const t0 = performance.now();
const goWhenReady = () => setTimeout(startSite, Math.max(0, introTime - (performance.now() - t0)));
if (document.readyState === "complete") goWhenReady();
else window.addEventListener("load", goWhenReady);
setTimeout(startSite, 3500); // seguridad: nunca dejar el loader pegado

/* ---------- Contadores del hero ---------- */
function runCounters() {
  document.querySelectorAll("[data-count]").forEach((el, i) => {
    const end = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    const dur = 1600, start = performance.now() + 700 + i * 120;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Menú móvil ---------- */
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
const nav = document.getElementById("nav");
const setMenu = (open) => {
  links.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  body.style.overflow = open ? "hidden" : "";
  if (open) nav.classList.remove("is-hidden");
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("is-open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

/* ---------- Títulos palabra por palabra ---------- */
document.querySelectorAll("[data-split]").forEach((title) => {
  let i = 0;
  const wrapWords = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          const w = document.createElement("span");
          w.className = "w";
          const inner = document.createElement("span");
          inner.textContent = part;
          inner.style.setProperty("--i", i++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {
        wrapWords(child);
      }
    });
  };
  wrapWords(title);
});

/* ---------- Aparición al hacer scroll ---------- */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const targets = entry.target._revealTargets || [entry.target];
        targets.forEach((t) => { t.classList.add("is-visible"); if (t.hasAttribute("data-split")) t.classList.add("is-split-in"); });
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" })
  : null;

document.querySelectorAll(".reveal").forEach((el) => {
  // escalonado entre hermanos (tarjetas, pasos, etc.)
  const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  const idx = siblings.indexOf(el);
  if (!el.matches(".catalog, .tile, .about__media")) el.style.transitionDelay = `${idx * 90}ms`;
  else el.style.transitionDelay = `${idx * 140}ms, 0ms`;
  if (!io) return el.classList.add("is-visible");
  // los elementos con cortina (clip-path) no se detectan solos: se observa su contenedor
  if (el.matches(".catalog, .tile, .about__media")) {
    const proxy = el.parentElement;
    if (!proxy._revealTargets) { proxy._revealTargets = []; io.observe(proxy); }
    proxy._revealTargets.push(el);
  } else io.observe(el);
});
document.querySelectorAll("[data-split]").forEach((el) => (io ? io.observe(el) : el.classList.add("is-split-in")));

/* ---------- Scroll: progreso, nav, parallax y marquee ---------- */
const progress = document.getElementById("progress");
const heroBg = document.querySelector(".hero__bg");
const heroSlash = document.querySelector(".hero__slash");
const heroContent = document.getElementById("heroContent");
const track = document.getElementById("marqueeTrack");
let lastY = window.scrollY, velocity = 0, marqueeX = 0, dir = 1;

function frame() {
  const y = window.scrollY;
  const max = root.scrollHeight - innerHeight;
  const delta = y - lastY;

  // barra de progreso
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  // nav: fondo + se oculta al bajar, aparece al subir
  nav.classList.toggle("is-scrolled", y > 40);
  if (!links.classList.contains("is-open") && Math.abs(delta) > 4) {
    nav.classList.toggle("is-hidden", delta > 0 && y > innerHeight * 0.8);
  }

  // parallax del hero
  if (!reduceMotion && y < innerHeight * 1.2) {
    heroBg.style.translate = `0 ${y * 0.3}px`;
    heroSlash.style.translate = `0 ${y * -0.25}px`;
    heroContent.style.translate = `0 ${y * 0.12}px`;
    heroContent.style.opacity = String(Math.max(0, 1 - y / (innerHeight * 0.75)));
  }

  // marquee: se acelera con la velocidad del scroll y cambia de dirección
  if (track && !reduceMotion) {
    if (delta !== 0) dir = delta > 0 ? 1 : -1;
    velocity = lerp(velocity, Math.min(Math.abs(delta), 60), 0.1);
    marqueeX -= (0.6 + velocity * 0.35) * dir;
    const half = track.scrollWidth / 2;
    if (marqueeX <= -half) marqueeX += half;
    if (marqueeX > 0) marqueeX -= half;
    track.style.transform = `translate3d(${marqueeX}px,0,0) skewX(${-velocity * 0.25 * dir}deg)`;
  }

  lastY = y;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ---------- Interacciones solo para computadora ---------- */
if (finePointer && !reduceMotion) {
  // Cursor personalizado
  const cursor = document.getElementById("cursor");
  const label = cursor.querySelector(".cursor__label");
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add("is-on"); }, { passive: true });
  document.addEventListener("mouseleave", () => cursor.classList.remove("is-on"));
  (function follow() {
    cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
    cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(follow);
  })();
  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => { label.textContent = el.dataset.cursor; cursor.classList.add("is-view"); });
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-view"));
  });
  document.querySelectorAll("a, button, summary").forEach((el) => {
    el.addEventListener("mouseenter", () => { cursor.classList.remove("is-view"); cursor.classList.add("is-link"); });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-link");
      if (el.closest("[data-cursor]")) cursor.classList.add("is-view");
    });
  });

  // Botones magnéticos
  document.querySelectorAll(".btn, .wa-float").forEach((btn) => {
    btn.classList.add("magnetic");
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => (btn.style.transform = ""));
  });

  // Tarjetas de catálogo con inclinación 3D y brillo
  document.querySelectorAll(".catalog").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", `${(px - 0.5) * 8}deg`);
      card.style.setProperty("--rx", `${(0.5 - py) * 8}deg`);
      card.style.setProperty("--mx", `${px * 100}%`);
      card.style.setProperty("--my", `${py * 100}%`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
  });
}

/* ---------- Clics en tarjetas ---------- */
// Toda la tarjeta de catálogo abre el PDF
document.querySelectorAll(".catalog").forEach((card) => {
  card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const link = card.querySelector(".catalog__actions a");
    if (link) window.open(link.href, "_blank", "noopener");
  });
});
// Cada producto de la galería abre WhatsApp preguntando por ese producto
document.querySelectorAll(".tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    const name = tile.querySelector("strong")?.textContent.trim() || "";
    const line = tile.querySelector("figcaption span")?.textContent.trim() || "";
    const msg = `Hola AgoFitness, me interesa: ${name} (${line}). ¿Qué tallas y colores tienen?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  });
});

/* ---------- Año del footer ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
