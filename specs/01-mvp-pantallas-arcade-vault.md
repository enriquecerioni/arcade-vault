# SPEC 01 — MVP Pantallas Arcade Vault

**Estado:** Approved
**Depende de:** ninguno
**Fecha:** 2026-08-13

**Objetivo:** Portar las 5 pantallas de `references/templates` (Biblioteca, Detalle, Reproductor, Salón de la Fama, Auth) a Next.js 16 App Router + TypeScript como rutas reales, sin implementar ningún juego jugable de verdad.

## Alcance

**Incluye:**
- 5 rutas: `/` (Biblioteca), `/juego/[id]` (Detalle), `/jugar/[id]` (Reproductor), `/login` (Auth), `/salon` (Salón de la Fama).
- `Nav` compartido (desktop + panel móvil) integrado en `app/layout.tsx`, con contador de créditos estático y estado de sesión (usuario logueado vs. botón "Iniciar Sesión").
- Datos mock de juegos, jugadores y puntajes simulados (`GAMES`, `CATS`, `PLAYERS`, `seededScores`), portados literal desde `data.jsx` a un módulo TypeScript.
- Auth simulada: formulario login/registro que acepta cualquier nombre (sin validar contraseña ni email), botón "Jugar como invitado", botones sociales Google/GitHub decorativos (no funcionales). Sesión guardada en `localStorage` (`av_user`).
- Reproductor con simulación placeholder: HUD (jugador, puntaje, vidas, nivel), pausa, botón fin, marco CRT decorativo/animado (sin juego jugable real), bucle que incrementa el puntaje automáticamente con valores random cada 220ms mientras no está en pausa ni terminado, subida de nivel cada 2500 puntos, modal de fin de partida con guardado de puntaje (`localStorage` `av_scores`).
- Estilos: `styles.css` del template portado tal cual como hoja global adicional (clases `av-nav`, `card`, `btn`, animaciones CRT/neón, etc.), coexistiendo con Tailwind v4 ya configurado.
- Persistencia en `localStorage`: `av_user` (sesión) y `av_scores` (historial de puntajes guardados por el jugador). Sin versionado de esquema — es mock, se puede reventar y regenerar libremente en este MVP.

**No incluye:**
- Ningún juego jugable real (Bloque Buster, Caída, Serpentina, etc.) — el reproductor es una simulación visual, no una implementación de gameplay.
- Backend, API, base de datos o autenticación real (contraseñas, OAuth funcional, verificación de email).
- Conectar los puntajes guardados por el jugador (`av_scores`) a los leaderboards de Detalle o Salón de la Fama — esas tablas siguen mostrando datos simulados fijos (`seededScores`), igual que en el template. Se deja como posible spec futuro.
- Sistema de créditos funcional (el contador "CRÉDITOS · 03" en el Nav es decorativo/estático).
- Rediseño visual o reescritura de estilos en utilidades Tailwind — se porta el CSS del template tal cual.
- Responsive/accesibilidad más allá de lo que el template ya trae (panel móvil con hamburguesa).

## Modelo de datos

Módulo `lib/data.ts` (TypeScript), portado desde `data.jsx`:

```ts
export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
  cover: string;   // clase CSS de fondo, p.ej. "cover-bricks"
  color: "cyan" | "magenta" | "green" | "yellow";
  best: number;
  plays: string;    // p.ej. "12.4K"
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string; // "DD/MM/AAAA"
}

export const GAMES: Game[];
export const CATS: string[]; // ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"]
export const PLAYERS: string[];
export function seededScores(seed: number, count?: number): ScoreRow[];
```

Módulo `lib/storage.ts` (helpers de `localStorage`, client-only):

```ts
export interface User { name: string; }
export interface SavedScore { game: string; score: number; name: string; at: number; }

export function getUser(): User | null;
export function setUser(u: User | null): void;
export function appendScore(entry: { game: string; score: number; name: string }): void;
```

Tipo de ruta implícito de Next.js App Router (sin objeto `route` custom como en el template): cada pantalla es un segmento real (`app/page.tsx`, `app/juego/[id]/page.tsx`, `app/jugar/[id]/page.tsx`, `app/login/page.tsx`, `app/salon/page.tsx`).

## Plan de implementación

1. **Datos y utilidades base.** Crear `lib/data.ts` (mock de juegos/jugadores/scores) y `lib/storage.ts` (helpers de sesión y puntajes en `localStorage`). Sistema queda compilando sin UI nueva todavía.
2. **Estilos globales.** Copiar `references/templates/styles.css` a `app/styles/arcade.css` (o equivalente) e importarlo desde `app/layout.tsx` junto a Tailwind, sin tocar `globals.css` existente. Verificar que la fuente/paleta neón se vea en cualquier página placeholder.
3. **Nav + layout raíz.** Crear `components/Nav.tsx` (client component) con lógica de sesión vía `lib/storage.ts` y navegación con `next/link` + `usePathname` para resaltar la sección activa. Integrarlo en `app/layout.tsx` junto al footer del template. Panel móvil con hamburguesa incluido.
4. **Biblioteca (`/`).** `app/page.tsx` + `components/GameCard.tsx`: grilla de juegos con búsqueda por texto y filtro por categoría (chips), efecto tilt en hover, estado "sin resultados". Al elegir un juego navega a `/juego/[id]`.
5. **Detalle (`/juego/[id]`).** Portada, tags, descripción, stats (partidas, mejor global, dificultad), leaderboard simulado (`seededScores`), botones "Jugar ahora" (→ `/jugar/[id]`) y "Volver al Vault". `notFound()` si el `id` no existe en `GAMES`.
6. **Auth (`/login`).** Tabs "Iniciar sesión"/"Crear cuenta", formulario que guarda `{ name }` vía `lib/storage.ts` y redirige a `/`. Botón invitado (login con `user = null`). Botones sociales decorativos sin `onClick` funcional real (o `disabled`).
7. **Reproductor (`/jugar/[id]`).** HUD, marco CRT animado, bucle de puntaje simulado (`useEffect` + `setInterval`), pausa, subida de nivel, modal de fin con input de iniciales y `appendScore`. Botón "Salir" vuelve a `/juego/[id]`. `notFound()` si el `id` no existe.
8. **Salón de la Fama (`/salon`).** Tabs por juego, podio (oro/plata/bronce), tabla completa con `seededScores`, fila destacada "tu mejor marca" si hay sesión iniciada.
9. **Verificación final.** `npm run lint` y `npm run build` sin errores; recorrido manual de las 5 pantallas en navegador (ver Criterios de aceptación).

## Criterios de aceptación

- [ ] `npm run build` compila sin errores.
- [ ] `npm run lint` pasa sin errores.
- [ ] `/` muestra la grilla de juegos, filtra por búsqueda de texto y por categoría (chips), y muestra estado "sin resultados" cuando no hay coincidencias.
- [ ] Click en una tarjeta de juego navega a `/juego/[id]` con el `id` correcto.
- [ ] `/juego/[id]` muestra info del juego y un leaderboard con 10 filas simuladas; `/juego/id-inexistente` devuelve 404.
- [ ] Botón "Jugar ahora" en Detalle navega a `/jugar/[id]`.
- [ ] `/jugar/[id]` incrementa el puntaje automáticamente cada ~220ms mientras no está en pausa; "Pausa" detiene el incremento y "Reanudar" lo reactiva.
- [ ] Botón "Fin" en el reproductor abre modal con puntaje final, input de iniciales y "Guardar puntuación"; al guardar, la entrada queda en `localStorage` bajo `av_scores` y se muestra confirmación en pantalla.
- [ ] "Jugar de nuevo" reinicia puntaje/vidas/nivel sin salir de la pantalla; "Volver al Vault" navega a `/`.
- [ ] `/login` permite loguearse con cualquier nombre (guarda `av_user` en `localStorage` y redirige a `/`) y también permite entrar como invitado.
- [ ] Con sesión iniciada, el Nav muestra el nombre de usuario y un botón para cerrar sesión que limpia `av_user` y vuelve al estado sin sesión.
- [ ] `/salon` muestra podio (top 3) y tabla completa por cada juego seleccionado en las tabs; con sesión iniciada aparece la fila "tu mejor marca".
- [ ] Recargar la página (F5) en cualquier ruta preserva la sesión (si había) leyendo `av_user` de `localStorage`.
- [ ] El panel de navegación móvil (hamburguesa) abre/cierra y permite navegar a Biblioteca, Salón de la Fama y Login/Cuenta.

## Decisiones tomadas y descartadas

- **Next.js App Router real en vez de router por hash** — el template usa un router custom basado en `location.hash` porque es React sin build. El proyecto ya es Next.js con App Router, así que se usan rutas de archivo reales (`/juego/[id]`, `/jugar/[id]`, etc.) en vez de portar el hash router. Descartado: mantener el patrón SPA de una sola página con estado de "route" — no aprovecharía el App Router ni el SEO/deep-linking nativo.
- **CSS del template portado literal, no reescrito en Tailwind** — el diseño neón/CRT ya está resuelto visualmente en `styles.css`; reescribirlo en utilidades Tailwind es trabajo extra sin beneficio para el MVP. Tailwind queda disponible para código nuevo, pero no se usa para replicar este look.
- **Mock de datos hardcodeado en el código, sin capa de abstracción para un futuro backend** — no se sobre-diseña una capa de "repositorio" para datos que hoy son estáticos; si se conecta una API real, será un spec aparte que refactorice `lib/data.ts`.
- **Reproductor puramente decorativo, sin lógica de juego** — cumple el pedido explícito de "no implementar ningún juego"; el bucle de puntaje aleatorio y el HUD son simulación visual, igual que en el template.
- **Leaderboards no conectados al puntaje guardado por el jugador** — se mantiene el comportamiento del template (los `seededScores` son fijos por juego, independientes de lo que el jugador guarda) para no inventar lógica de ranking no pedida. Se deja `av_scores` en `localStorage` disponible para un spec futuro que sí lo integre.
- **Auth simulada sin backend** — igual que el template: cualquier nombre "loguea", sin verificación real. Botones sociales quedan visualmente presentes pero no funcionales.
- **Sin versionado de `localStorage`** — al ser datos mock sin backend real detrás, no se justifica una estrategia de migración de esquema en este MVP.

## Riesgos identificados

- **Uso de `localStorage` en componentes de servidor por defecto de Next.js.** Los componentes que leen/escriben `av_user`/`av_scores` deben ser Client Components (`"use client"`), igual que `Nav`, `Auth` y `GamePlayer`. Mitigación: marcar explícitamente esos archivos y evitar acceder a `localStorage` durante el render en servidor.
- **Hidratación inconsistente por leer `localStorage` en el primer render.** El template lee `av_user` en el estado inicial de `App` (posible mismatch SSR/CSR). Mitigación: inicializar el estado de sesión en `null`/vacío y poblarlo en un `useEffect` tras montar, aceptando un parpadeo inicial mínimo — comportamiento igual de aceptable que el del template original.
