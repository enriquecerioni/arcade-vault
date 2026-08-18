# SPEC 02 — Pantalla de Inicio (Home)

**Estado:** Implemented
**Depende de:** SPEC 01
**Fecha:** 2026-08-18

**Objetivo:** Portar la pantalla "Inicio" (`home.jsx`) de `references/templates/home-about` a Next.js como la nueva landing en `/`, moviendo la Biblioteca actual a `/biblioteca`, e integrar el link "Inicio" en el Nav.

## Alcance

**Incluye:**
- Nueva pantalla `Home` en `app/page.tsx` (pasa a ocupar la ruta `/`), portada desde `home.jsx`: hero con silueta pixeladas flotantes (`FloatingSilhouettes`), sección "¿Por qué Arcade Vault?" (feature grid de 4 tarjetas), sección "Juegos disponibles ahora" (mini-rail con `GAMES.slice(0, 6)` reales de `lib/data.ts`), sección de estadísticas, sección "Actividad en vivo" (ticker de puntajes recientes + top jugadores del día, portados literal como arrays mock del template), sección de precios (plan único gratis + FAQ), y CTA final.
- Hook `useReveal()` (IntersectionObserver) portado tal cual para animar secciones al hacer scroll (clase `.reveal` → `.in`).
- Mover la pantalla Biblioteca actual (contenido hoy en `app/page.tsx`) a una nueva ruta `app/biblioteca/page.tsx`, sin cambios de comportamiento.
- Nuevo archivo `app/styles/home.css` con el bloque `HOME PAGE` de `references/templates/home-about/styles.css` (líneas ~930–1069: `.home-hero`, `.home-title`, `.home-silos`, `.feature-grid`, `.mini-rail`, `.home-stats`, `.home-final`, `.reveal`, etc.), importado únicamente desde `app/page.tsx` (no en `globals.css`, ya que solo lo usa Home por ahora).
- `components/Nav.tsx` actualizado: nuevo link "Inicio" apuntando a `/`, link "Biblioteca" apuntando a `/biblioteca`, logo apunta a `/`, lógica `isActive` ajustada (Inicio activo solo en `/`; Biblioteca activa en `/biblioteca`, `/juego/*` y `/jugar/*`), tanto en el nav desktop como en el panel móvil.
- Actualización de links que hoy apuntan a `/` con la intención de "volver a la biblioteca", para que apunten a `/biblioteca`: botón "VOLVER AL VAULT" en Detalle (`app/juego/[id]/page.tsx`), botón "VOLVER AL VAULT" en el modal de fin de partida (`components/GamePlayer.tsx`), botón "VOLVER A LA BIBLIOTECA" en Salón (`app/salon/page.tsx`), y el redirect tras iniciar sesión/entrar como invitado en `app/login/page.tsx` (`router.push("/")` → `router.push("/biblioteca")`).
- Botones "EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS →" del Home navegan a `/biblioteca`. Botones "CREAR CUENTA" e "INSERTAR MONEDA →" navegan a `/login`. Click en una `MiniCard` navega a `/juego/[id]`. Botón "VER SALÓN →" navega a `/salon`.
- Verificación visual con Playwright MCP tras implementar: cargar `/` en un navegador, comparar layout/contenido contra `references/templates/home-about/arcade-vault-standalone.html` (o `home.jsx` renderizado), y confirmar navegación del Nav y de los CTAs.

**No incluye:**
- La pantalla "Acerca de" (`about.jsx`) — queda para un spec futuro, tal como lo pidió el usuario explícitamente.
- Cambios en el contenido o lógica interna de Biblioteca, Detalle, Reproductor, Salón o Auth — solo se mueve la ruta de Biblioteca, sin tocar su UI ni sus datos.
- Conectar el ticker de "actividad en vivo" o el top de jugadores a datos reales — se portan literal como mock estático del template, igual criterio que spec 01 con `seededScores`.
- Sistema de créditos funcional — el contador del Nav sigue siendo decorativo.
- Rediseño visual o reescritura en utilidades Tailwind del CSS portado.

## Modelo de datos

No se introducen estructuras de datos nuevas. La sección "Juegos disponibles ahora" reutiliza `GAMES` de `lib/data.ts` (ya existente, spec 01). Los arrays de la sección "Actividad en vivo" (ticker de puntajes recientes y top jugadores del día) se portan como constantes locales dentro de `components/Home.tsx`, tal como están hardcodeados en `home.jsx` — no se persisten ni se leen de `lib/data.ts`.

## Plan de implementación

1. **Mover Biblioteca a `/biblioteca`.** Crear `app/biblioteca/page.tsx` con el contenido actual de `app/page.tsx` (sin cambios de lógica). El sistema queda compilando con Biblioteca accesible en la nueva ruta.
2. **Estilos de Home.** Crear `app/styles/home.css` con el bloque `HOME PAGE` portado literal de `references/templates/home-about/styles.css`.
3. **Componente Home.** Crear `components/Home.tsx` (client component) portando `home.jsx`: `useReveal`, `FloatingSilhouettes`, `MiniCard`, `FeatureIcon`, y la función `Home` con sus 6 secciones (hero, why, games preview, stats, actividad, pricing, CTA final). Usa `next/link` (o `useRouter`) para la navegación en vez del prop `navigate` del template. La sección de juegos usa `GAMES.slice(0, 6)` de `lib/data.ts`.
4. **Ruta `/`.** Reemplazar `app/page.tsx` para que renderice `Home` (importando `app/styles/home.css` ahí) en vez del contenido de Biblioteca.
5. **Nav.** Actualizar `components/Nav.tsx`: agregar link "Inicio" → `/`, cambiar link "Biblioteca" → `/biblioteca`, logo → `/`, y ajustar `isActive` para distinguir Inicio de Biblioteca (desktop + panel móvil).
6. **Links legacy hacia biblioteca.** Actualizar a `/biblioteca`: `app/juego/[id]/page.tsx` ("VOLVER AL VAULT"), `components/GamePlayer.tsx` ("VOLVER AL VAULT" en modal de fin), `app/salon/page.tsx` ("VOLVER A LA BIBLIOTECA"), `app/login/page.tsx` (los dos `router.push("/")`).
7. **Verificación.** `npm run lint` y `npm run build` sin errores. Con Playwright MCP: abrir `/` en navegador, confirmar que se ven las 6 secciones del Home, que el scroll-reveal anima las secciones, que los CTAs navegan a las rutas correctas, y comparar visualmente contra `references/templates/home-about/arcade-vault-standalone.html`. Confirmar también que `/biblioteca` sigue funcionando igual que antes y que el Nav resalta "Inicio"/"Biblioteca" correctamente en cada ruta.

## Criterios de aceptación

- [x] `npm run build` compila sin errores.
- [x] `npm run lint` pasa sin errores.
- [x] `/` muestra la pantalla de Inicio con sus 6 secciones (hero, por qué Arcade Vault, juegos disponibles, estadísticas, actividad en vivo, precios) y el CTA final.
- [x] Las secciones con clase `reveal` aparecen animadas (fade + translateY) al hacer scroll hasta ellas.
- [x] La sección "Juegos disponibles ahora" muestra 6 juegos reales de `lib/data.ts`; click en una tarjeta navega a `/juego/[id]` con el id correcto.
- [x] Botones "EXPLORAR JUEGOS" y "VER TODOS LOS JUEGOS →" navegan a `/biblioteca`.
- [x] Botones "CREAR CUENTA" e "INSERTAR MONEDA →" navegan a `/login`.
- [x] Botón "VER SALÓN →" navega a `/salon`.
- [x] `/biblioteca` muestra la grilla de juegos con búsqueda y filtro por categoría, igual que antes en `/`.
- [x] El Nav muestra "Inicio" activo solo en `/`, y "Biblioteca" activo en `/biblioteca`, `/juego/*` y `/jugar/*` (desktop y panel móvil).
- [x] El logo del Nav navega a `/`.
- [x] "VOLVER AL VAULT" en Detalle y en el modal de fin de partida navegan a `/biblioteca`.
- [x] "VOLVER A LA BIBLIOTECA" en Salón navega a `/biblioteca`.
- [x] Iniciar sesión o entrar como invitado en `/login` redirige a `/biblioteca`.
- [x] Verificación visual con Playwright MCP confirma que `/` luce equivalente al `home.jsx`/`arcade-vault-standalone.html` de referencia (hero, silos flotantes, tipografía pixel/neón, secciones en el orden correcto).

## Decisiones tomadas y descartadas

- **Home ocupa `/`, Biblioteca se mueve a `/biblioteca`** — fiel al `nav.jsx` del template, que trata Inicio y Biblioteca como secciones distintas. Descartado: dejar Home en `/inicio` y Biblioteca en `/` — habría dejado a Home como pantalla secundaria en vez de landing real, contradiciendo el propósito de la pantalla.
- **Links "volver a biblioteca" (Detalle, Reproductor, Salón, post-login) apuntan a `/biblioteca`, no a `/`** — preservan su intención original (volver a la grilla de juegos) tras el cambio de rutas, en vez de reinterpretarlos como "volver a Home".
- **CSS de Home en archivo aparte (`app/styles/home.css`), no en `globals.css`** — solo la ruta `/` lo necesita hoy; se evita cargarlo en rutas que no lo usan. Mismo criterio de "portar CSS del template literal" de spec 01, pero con mejor alcance de carga.
- **Datos de "actividad en vivo" portados literal como mock, sin adaptarlos a `lib/data.ts`** — evita inventar puntajes/nombres no confirmados por el template; es contenido decorativo, igual criterio que `seededScores` en spec 01.
- **Sección de juegos del Home sí usa `GAMES` real de `lib/data.ts`** — a diferencia del ticker de actividad, esta sección enlaza a `/juego/[id]` real, por lo que debe usar juegos que existan de verdad en el sitio.
- **No se implementa "Acerca de" en este spec** — pedido explícito del usuario; queda para un spec separado.

## Riesgos identificados

- **Romper links existentes al mover Biblioteca de `/` a `/biblioteca`.** Cualquier referencia a `/` como "biblioteca" que no se detecte en el plan de implementación quedaría rota (llevaría a Home en vez de a la grilla de juegos). Mitigación: paso 6 del plan lista explícitamente los 4 puntos conocidos; verificación final navega cada pantalla para confirmar que no quedó ninguna referencia suelta.
- **IntersectionObserver y `document.querySelectorAll(".reveal")` en Server Components.** `Home` debe ser `"use client"` igual que `Nav`/`GamePlayer`, y el `useEffect` de `useReveal` debe ejecutarse solo en cliente para evitar errores de hidratación.
