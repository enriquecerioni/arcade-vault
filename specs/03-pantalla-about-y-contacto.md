# SPEC 03 — Pantalla "Acerca de" y envío de correo de contacto

**Estado:** Implementado
**Depende de:** SPEC 02
**Fecha:** 2026-08-18

**Objetivo:** Portar la pantalla "Acerca de" (`about.jsx`) de `references/templates/home-about` a Next.js en la ruta `/acerca-de`, con el formulario de contacto enviando el mensaje por correo real usando Resend.

## Alcance

**Incluye:**
- Nueva pantalla `About` en `app/acerca-de/page.tsx`, portada literal desde `references/templates/home-about/about.jsx`: sección hero (kicker, título, misión, fila de 3 highlights con íconos pixel-art `HighlightIcon`), divider banner animado, y sección de contacto (intro + tips + formulario).
- Hook `useReveal()` (mismo patrón ya usado en `components/Home.tsx`, spec 02) para animar con `.reveal`/`.in` el divider y la sección de contacto al hacer scroll.
- Componente `components/About.tsx` (client component) con la lógica del formulario: estado `{ name, email, msg }`, validación de campos no vacíos + formato de email (regex simple), estado `shake` en error de validación (animación ya definida en el CSS del template), estado de envío (`idle` → `sending` → `success` / `error`).
- Nuevo archivo `app/styles/about.css` con el bloque `ABOUT PAGE` de `references/templates/home-about/styles.css` (líneas 1071–1744), importado únicamente desde `app/acerca-de/page.tsx`, mismo criterio que `app/styles/home.css` de spec 02.
- Link "Acerca de" agregado a `components/Nav.tsx` (desktop y panel móvil), apuntando a `/acerca-de`, con `isActive` extendido para reconocer esta ruta.
- Envío real de correo con Resend vía Route Handler `app/api/contact/route.ts`: recibe `POST` con `{ name, email, msg }`, valida en servidor (campos no vacíos + formato de email), y llama a `resend.emails.send(...)` con `from: "onboarding@resend.dev"`, `to: process.env.CONTACT_TO_EMAIL`, `reply_to: email` (para poder responder directo al remitente), asunto tipo `Nuevo mensaje de contacto — Arcade Vault` y cuerpo con nombre/email/mensaje.
- Instalación de la dependencia `resend` (`npm install resend`).
- Variables de entorno en `.env.local` (ya configurado en esta sesión, no versionado): `RESEND_API_KEY` y `CONTACT_TO_EMAIL`. Se agrega `.env.local.example` con placeholders (`RESEND_API_KEY=`, `CONTACT_TO_EMAIL=`) para que el repo documente qué variables hacen falta sin exponer valores reales.
- Estado de error en el formulario: si el `fetch` al Route Handler falla o responde con error (network, 4xx, 5xx), el formulario vuelve al estado editable (no pasa a `sent`), se re-habilita el botón, y se muestra un bloque de error con estética terminal/pixel consistente con el `terminal-success` existente (mismo contenedor `.terminal-success`, línea final en rojo/error en vez de verde) invitando a reintentar.
- Verificación con Playwright MCP tras implementar: cargar `/acerca-de`, completar y enviar el formulario con datos válidos, confirmar que aparece el estado `terminal-success` con el nombre ingresado, y confirmar que llega el correo a `CONTACT_TO_EMAIL` (o al menos que el Route Handler devuelve 200 y loguea el id de Resend). Probar también el caso de validación (campos vacíos → shake) y el caso de error de red/API simulando una key inválida.

**No incluye:**
- Persistencia de los mensajes de contacto en una base de datos o archivo — el mensaje solo se envía por correo, no se guarda.
- Rate limiting o protección antispam (captcha, honeypot) — fuera de alcance de esta spec.
- Verificación de dominio propio en Resend — se usa el remitente de pruebas `onboarding@resend.dev`.
- Notificaciones o confirmación por correo al usuario que llenó el formulario (solo se le hace `reply_to`, no se le envía un correo de confirmación aparte).
- Cambios en otras pantallas más allá de agregar el link "Acerca de" al Nav.

## Modelo de datos

No se introducen estructuras de datos persistentes. El formulario maneja un estado local `{ name: string, email: string, msg: string }` en `components/About.tsx`, y el Route Handler recibe/valida ese mismo shape en el body del `POST`. No hay modelos nuevos en `lib/data.ts` ni en `lib/storage.ts`.

## Plan de implementación

1. **Instalar Resend.** `npm install resend`. El sistema sigue compilando igual que antes.
2. **Estilos de About.** Crear `app/styles/about.css` con el bloque `ABOUT PAGE` portado literal de `references/templates/home-about/styles.css` (líneas 1071–1744).
3. **Componente About.** Crear `components/About.tsx` (client component) portando `about.jsx`: `useReveal`, `HighlightIcon`, y la función `About` con sus 2 secciones (hero + contacto), reemplazando el `onSubmit` mock por una llamada `fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })` con manejo de los estados `sending` / `success` / `error`.
4. **Ruta `/acerca-de`.** Crear `app/acerca-de/page.tsx` que importe `app/styles/about.css` y renderice `About`.
5. **Route Handler de contacto.** Crear `app/api/contact/route.ts`: exporta `POST`, valida `name`/`email`/`msg` (no vacíos, email con formato válido), instancia `new Resend(process.env.RESEND_API_KEY)`, envía el correo a `process.env.CONTACT_TO_EMAIL` con `reply_to` del remitente, devuelve `200` con `{ ok: true }` en éxito o `400`/`500` con `{ ok: false, error }` en fallo de validación o de Resend.
6. **Variables de entorno.** Confirmar `.env.local` con `RESEND_API_KEY` y `CONTACT_TO_EMAIL` (ya escrito en esta sesión). Crear `.env.local.example` con las mismas claves vacías, para que quede documentado en el repo qué variables configurar.
7. **Nav.** Agregar link "Acerca de" → `/acerca-de` en `components/Nav.tsx` (desktop + panel móvil), y extender `isActive` para reconocer esta ruta.
8. **Verificación.** `npm run lint` y `npm run build` sin errores. Con Playwright MCP: abrir `/acerca-de`, confirmar hero + highlights + formulario visibles, probar validación (submit vacío → shake), completar con datos válidos y confirmar transición a `terminal-success`, y confirmar en la Route Handler (logs o respuesta) que el envío a Resend fue exitoso. Confirmar que el Nav resalta "Acerca de" solo en `/acerca-de`.

## Criterios de aceptación

- [x] `npm run build` compila sin errores.
- [x] `npm run lint` pasa sin errores.
- [x] `/acerca-de` muestra el hero (kicker, título, misión, 3 highlights) y la sección de contacto (intro + tips + formulario).
- [x] El divider y la sección de contacto animan con `.reveal`/`.in` al hacer scroll.
- [x] Enviar el formulario con algún campo vacío dispara la animación `shake` y no envía el correo.
- [x] Enviar el formulario con un email de formato inválido (ej. `"foo"`) no envía el correo y muestra el mismo tratamiento de error de validación.
- [x] Enviar el formulario con datos válidos llama a `POST /api/contact`, el Route Handler envía el correo vía Resend a `CONTACT_TO_EMAIL`, y el formulario pasa al estado `terminal-success` con el nombre ingresado.
- [x] Si `POST /api/contact` falla (network o respuesta de error), el formulario se mantiene editable, el botón se re-habilita, y se muestra un bloque de error con estética terminal (no pasa a `terminal-success`).
- [x] El link "Acerca de" aparece en el Nav (desktop y panel móvil) y navega a `/acerca-de`, mostrándose activo solo en esa ruta.
- [x] `.env.local` contiene `RESEND_API_KEY` y `CONTACT_TO_EMAIL`, y no está versionado (ya cubierto por `.env*` en `.gitignore`). `.env.local.example` documenta ambas claves vacías.

## Decisiones tomadas y descartadas

- **Route Handler (`app/api/contact/route.ts`) en vez de Server Action** — patrón estándar de Next.js App Router para este caso, mantiene `RESEND_API_KEY` solo en servidor. Descartado: Server Action directa — funcionalmente equivalente, pero el Route Handler separa mejor la lógica de envío del componente cliente.
- **Remitente `onboarding@resend.dev`** — dominio de pruebas de Resend que funciona sin verificación adicional, evita bloquear la spec en configuración de DNS de un dominio propio. Descartado: dominio propio verificado — se puede migrar después sin cambiar la estructura del Route Handler, solo el valor de `from`.
- **`CONTACT_TO_EMAIL` por variable de entorno** — evita hardcodear el correo real en el código versionado. Se definió como `enriquecerioni39@gmail.com` en `.env.local` para esta sesión.
- **Ruta `/acerca-de` en vez de `/about`** — consistente con el resto de las rutas del sitio en español (`/biblioteca`, `/salon`, `/login`).
- **Validación de email con regex simple, agregada sobre el criterio "no vacío" del template original** — bajo costo, evita envíos fallidos obvios a Resend por direcciones claramente inválidas. Se aplica tanto en cliente (antes de disparar `shake`) como en servidor (el Route Handler no confía en la validación de cliente).
- **Estado de error visible en el formulario ante fallo de envío** — a diferencia del mock original (que siempre "tenía éxito"), ahora el envío es real y puede fallar (key inválida, Resend caído), por lo que el usuario necesita saber que su mensaje no llegó.
- **No se persisten los mensajes de contacto** — el alcance pedido por el usuario es únicamente el envío por correo; agregar persistencia sería una decisión de producto no solicitada.

## Riesgos identificados

- **`RESEND_API_KEY` inválida o cuenta de Resend sin crédito/límite alcanzado.** El envío fallaría en producción. Mitigación: el Route Handler captura el error de Resend y responde `500`, el formulario lo refleja como estado de error sin romper la UI.
- **Remitente de pruebas `onboarding@resend.dev` con límites de uso o de entrega (puede ir a spam en algunos proveedores).** Aceptado como parte del alcance; migrar a dominio propio verificado queda para una spec futura si se vuelve necesario.
- **`.env.local` con la API key real quedó escrito en el filesystem del proyecto durante esta sesión.** Mitigación: ya cubierto por `.env*` en `.gitignore`; se debe evitar pegar la key en specs, commits o mensajes que terminen versionados.
