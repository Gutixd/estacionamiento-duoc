# 🅿️ Sistema Inteligente de Estacionamientos Duoc UC Maipú

Sistema de gestión de estacionamiento de 110 espacios con autenticación multi-rol, dashboard analítico en tiempo real y app móvil para guardias.

**Status:** Checkpoint 1 completado · Lista para Pitch 1

---

## 🚀 Despliegue rápido

### GitHub
```bash
https://github.com/Gutixd/estacionamiento-duoc.git
```

### Vercel (Click to Deploy)
1. Ve a [vercel.com](https://vercel.com)
2. Conecta el repositorio `Gutixd/estacionamiento-duoc`
3. Vercel desplegará automáticamente en: `estacionamiento-duoc.vercel.app`

---

## 📱 Acceso a las aplicaciones

### 🔐 Login (index.html)
**URL:** `https://estacionamiento-duoc.vercel.app/index.html`

**Cuentas demo predefinidas:**

| Rol | Correo | Contraseña | Acceso |
|---|---|---|---|
| 🛡️ Guardia | `guardia@duocuc.cl` | `guardia123` | App móvil guardia |
| 🎓 Coordinación | `coordinacion@duocuc.cl` | `coord2024` | Dashboard completo |
| 👨‍🏫 Profesor (Diego) | `dgutierrez@duocuc.cl` | `diego123` | Dashboard profesor |
| 👨‍🏫 Profesor (Benjamín) | `benmella@duocuc.cl` | `benj123` | Dashboard profesor |
| 👨‍🏫 Profesor (Génesis) | `ghernandez@duocuc.cl` | `genesis123` | Dashboard profesor |

---

## 🎨 Interfaces

### 1. **Login Premium** (index.html)
- Split-screen con foto real del estacionamiento Duoc UC Maipú
- Selección visual de 3 roles (guardia/profesor/coordinación)
- 5 cuentas demo con autocompletar
- Modal para profesores de primera vez solicitando acceso
- Sistema de aprobación de coordinación (localStorage)
- Dark theme Duoc Blue (#003087, #4f8ef7)

### 2. **Dashboard Coordinación/Profesor** (dashboard.html)
**KPIs en tiempo real:**
- 4 métricas: Libres, Ocupados, Reservados, Bloqueados
- Contador animado con cubic-bezier spring
- Ocupación porcentual actualizada cada 5 segundos

**Gráficos interactivos (Chart.js 4.4):**
- 🟠 **Donut**: Estado actual de 110 espacios
- 📈 **Línea**: Ocupación de últimas 24 horas (patrón realista)
- 📊 **Barras apiladas**: Distribución por sector (A/B/C/D)

**Mapa (Leaflet.js 1.9.4):**
- Ubicación real: Av. Santa Julia 1759, Maipú
- Zoom 16, marcador interactivo con popup
- Fondo oscuro (#0d1526) integrado

**Navegación multi-rol:**
- Coordinación: Todos los módulos + Gestión de usuarios
- Profesor: Dashboard, reservas, perfil

**Gestión de usuarios (coordinación):**
- Lista de usuarios del sistema con avatares
- Solicitudes pendientes con badge rojo
- Botones: Aprobar/Rechazar (genera contraseña temporal)
- Tabla de histórico de usuarios

**Sidebar persistente:**
- Logo Duoc UC con fondo blanco
- Navegación dinámica según rol
- Card de usuario con logout
- Indicador "EN VIVO" pulsante

### 3. **App Guardia Móvil** (guardia.html)
**Diseñado para celular (PWA-ready):**
- Header con foto de estacionamiento real (Unsplash filter + Duoc logo)
- Bottom navigation (4 tabs: Mapa, Buscar, Alertas, Perfil)
- Sticky header con live badge pulsante
- Integración de nombre/avatar del guardia logueado

**Mapa interactivo de 110 espacios:**
- Vista aérea realista: Sectores A/B/C/D (30+30+30+20)
- Calles de circulación con líneas de flujo
- Estados: Libre (verde), Ocupado (rojo), Reservado (naranja), Bloqueado (gris)
- Click en espacio → Bottom sheet con detalles

**Bottom Sheet dinámico:**
- Tarjeta del espacio (número, sector, estado)
- Si está ocupado: Foto del conductor, patente, hora de ingreso
- Botones de acción: Liberar, Ocupar, Reservar, Bloquear, Contactar
- Ripple effect en clicks

**Búsqueda en tiempo real:**
- Por patente o número de espacio
- Resultados con foto del conductor
- Historial de ingresos del día

**Alertas/Incidencias:**
- Maqueta de 3 incidencias activas
- Botón para reportar nuevas (toast notification)

**Perfil del guardia:**
- Avatar dinámico desde auth
- Datos del turno (hora inicio/fin, sector asignado)
- Estadísticas: registros, incidencias, duración turno

**Animaciones:**
- Counter animations (0 → número con easing)
- Fade-in + slide en elementos
- Spring bounce en abrir bottom sheet
- Flash verde/rojo en cambios de estado
- Shimmer en espacios libres
- Pulse en live badge

**Simulación en tiempo real:**
- Cambio de estado cada 5 segundos
- Conductor y patente aleatorios (24 nombres reales chilenos)
- Flash visual al cambiar estado

---

## 🔒 Sistema de autenticación

### Flujo usuario guardia:
1. Login con credenciales
2. Accede directamente a guardia.html
3. Nombre y foto actualizados automáticamente

### Flujo profesores/coordinadores:
1. **Primera vez:** Clic en "Solicitar acceso"
2. Llena formulario (email, nombre, cargo)
3. Solicitud queda pendiente en localStorage
4. Coordinador ve badge rojo "1" en menú Usuarios
5. Coordinador aprueba → se genera contraseña temporal (`duoc2024`)
6. Profesor ahora puede ingresar con su correo

### Almacenamiento:
- **localStorage `duoc_auth`**: Sesión JSON {email, role, name, cargo}
- **localStorage `duoc_pending`**: Array de solicitudes pendientes
- ✅ `.env.local` excluido de git (contiene credenciales Supabase)

---

## 📚 Tecnología

### Frontend
- **HTML5** — Estructura semántica
- **CSS3** — Dark theme, glassmorphism, animaciones
- **Vanilla JS** — Sin dependencias pesadas (apps nativas)
- **Google Fonts Inter** — Tipografía moderna

### Librerías
- **Chart.js 4.4.4** — Gráficos interactivos
- **Leaflet.js 1.9.4** — Mapas OpenStreetMap
- **Supabase.js 2.0** — Cliente realtime (patrón)

### Media
- **Unsplash CDN** — Fotos reales de estacionamientos
- **UI Avatars** — Generación dinámica de avatares
- **Imágenes locales:** Logo Duoc UC + Foto campus

### PWA
- **manifest.json** — Installable en celular
- **sw.js** — Service worker offline
- **Meta tags** — Apple webapp capable

---

## 📂 Estructura de archivos

```
.
├── index.html              # Login premium multi-rol
├── dashboard.html          # Dashboard coordinación/profesor
├── guardia.html            # App móvil guardia
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── vercel.json             # Configuración Vercel
├── .gitignore              # Excluye .env.local
├── .env.local              # (NO VERSIONADO) Credenciales Supabase
├── lib/
│   └── supabase.js         # Cliente Supabase (patrón Next.js)
├── docs/
│   ├── CP1_Requisitos.md   # 39 requisitos funcionales
│   ├── CP1_UML.md          # 6 diagramas UML
│   └── CP1_Epics_HU.md     # 6 epics, 27 user stories
└── README.md               # Este archivo
```

---

## 🎯 Requisitos Checkpoint 1 (39 requisitos)

### Autenticación (REQ-001 a REQ-005)
- ✅ Login con roles diferenciados
- ✅ Guardias acceso directo a app móvil
- ✅ Profesores/coordinadores a dashboard
- ✅ Session persistence en localStorage
- ✅ Logout disponible

### Espacios de estacionamiento (REQ-006 a REQ-020)
- ✅ 110 espacios en 4 sectores (A/B/C/D)
- ✅ 4 estados: Libre, Ocupado, Reservado, Bloqueado
- ✅ Vista aérea realista en app guardia
- ✅ Cambio de estado interactivo
- ✅ Simulación automática cada 5 segundos

### Dashboard Coordinación (REQ-021 a REQ-035)
- ✅ KPIs en tiempo real
- ✅ 3 gráficos (donut, línea, barras)
- ✅ Mapa interactivo del campus
- ✅ Gestión de usuarios
- ✅ Aprobación de solicitudes de acceso

### App Guardia (REQ-036 a REQ-039)
- ✅ Interface móvil-first
- ✅ Búsqueda de vehículos
- ✅ Reportar incidencias
- ✅ Perfil y logout

---

## 🎬 Cómo usar

### Local (desarrollo)
```bash
# 1. Clonar repositorio
git clone https://github.com/Gutixd/estacionamiento-duoc.git
cd estacionamiento-duoc

# 2. Abrir en navegador
# Opción A: Directamente (static files)
open index.html

# Opción B: Con servidor local (recomendado)
python -m http.server 8000
# Luego: http://localhost:8000
```

### En Vercel (producción)
1. Ve a [vercel.com](https://vercel.com)
2. New Project → Import Git Repository
3. Selecciona `Gutixd/estacionamiento-duoc`
4. Vercel auto-detecta la config en `vercel.json`
5. Deploy automático en cada push a `main`

---

## 🔄 Supabase Realtime (Patrón implementado)

El código soporta conexión en tiempo real a Supabase para sincronizar cambios de estado entre guardias. Actualmente usa simulación local (localStorage), pero está listo para:

```javascript
// En dashboard.html, función initSupabase()
var SUPABASE_URL = localStorage.getItem('supabase_url');
var SUPABASE_KEY = localStorage.getItem('supabase_key');
var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
client.channel('espacios-realtime').on('postgres_changes', ...).subscribe();
```

Para activar:
1. Crear proyecto en Supabase
2. Tabla `espacios` con columnas: id, sector, estado, conductor, patente
3. Guardar credenciales en localStorage antes de iniciar

---

## 🎨 Colores & Branding

```css
--bg:      #0a0f1e   /* Fondo oscuro premium */
--blue:    #003087   /* Duoc UC blue oficial */
--accent:  #4f8ef7   /* Accent azul claro */
--libre:   #22c55e   /* Verde espacios libres */
--ocupado: #ef4444   /* Rojo espacios ocupados */
--res:     #f59e0b   /* Naranja reservados */
--bloq:    #6b7280   /* Gris bloqueados */
```

---

## 📱 Responsive

- **Desktop:** Sidebar + header + content (3-column layout)
- **Tablet:** Sidebar colapsable, contenido responsivo
- **Mobile:** Full-width app, sidebar oculto (guardia optimizada)

---

## 📝 Próximas fases

- **CP2:** Integración Supabase real (tabla espacios + usuarios)
- **CP3:** API backend (Node.js/Express)
- **CP4:** App nativa iOS (React Native)
- **CP5:** Reportería avanzada + ML (predicción de ocupación pico)

---

## 👥 Equipo

- **Diego Gutiérrez** (CTO/Lead Developer)
- **Benjamín Mella** (Arquitectura)
- **Génesis Hernández** (UX/QA)

Bootcamp **CodecAI** · Duoc UC Maipú 2026

---

## 📄 Licencia

Este proyecto es propiedad intelectual de Duoc UC Maipú. Prohibida la reproducción sin autorización.

---

## 🚀 Instrucciones finales para Pitch 1

1. **Mostrar login:** Hacer clic en demo "Coordinación"
2. **Dashboard vivo:** Gráficos actualizan en tiempo real (simulación 5s)
3. **App guardia:** Hacer clic en "Mapa" → click en espacio E-25 → bottom sheet
4. **Aprobación:** Ir a "Usuarios" → mostrar badge rojo → aprobar solicitud
5. **Seguridad:** Explicar auth localStorage + credenciales Supabase en .env.local

---

**Última actualización:** 2026-06-05  
**GitHub:** https://github.com/Gutixd/estacionamiento-duoc  
**Live:** https://estacionamiento-duoc.vercel.app
