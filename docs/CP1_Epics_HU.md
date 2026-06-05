# Épicas e Historias de Usuario
## Gestión Inteligente de Estacionamientos - Duoc UC Maipú | CP1

**Equipo:** Diego Gutierrez · Benjamin Mella · Genesis Hernandez  
**Fecha:** 05-06-2026 | **Versión:** 1.0  
**Metodología:** Scrum 2020 | **Estimación:** Story Points (Fibonacci: 1, 2, 3, 5, 8, 13)

---

## Épicas del Proyecto

| ID | Épica | Actor Principal | SP Total |
|----|-------|-----------------|----------|
| EP-01 | Autenticación y Control de Acceso por Rol | Todos | 13 |
| EP-02 | Panel de Ocupación en Tiempo Real | Guardia / Jefe Seguridad | 21 |
| EP-03 | Gestión de Espacios (Reservas y Bloqueos) | Jefe Seguridad | 18 |
| EP-04 | App del Conductor | Conductor | 16 |
| EP-05 | Super Admin - Enrolamiento y Gestión | Super Admin | 20 |
| EP-06 | Reportes y Dashboard Ejecutivo | Jefe Serv. Generales / Directivos | 15 |
| **TOTAL** | | | **103 SP** |

---

## EP-01: Autenticación y Control de Acceso por Rol

> **Como** cualquier usuario del sistema **quiero** poder iniciar sesión de forma segura **para** acceder solo a las funcionalidades que me corresponden según mi rol.

---

### HU-01-01 | Login de Usuario
**Como** usuario del sistema  
**quiero** poder ingresar con mi email y contraseña  
**para** acceder al sistema de forma segura

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] El formulario tiene campos de email y contraseña
- [ ] Si las credenciales son incorrectas muestra mensaje de error claro
- [ ] Si las credenciales son correctas redirige al dashboard según el rol
- [ ] La contraseña está oculta con opción de mostrar/ocultar
- [ ] El botón de login está deshabilitado si los campos están vacíos

---

### HU-01-02 | Redirección Automática por Rol
**Como** usuario autenticado  
**quiero** ser redirigido automáticamente al panel de mi rol  
**para** no tener que navegar manualmente hasta mis funciones

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] GUARDIA → `/dashboard/guardia`
- [ ] JEFE_SEGURIDAD → `/dashboard/seguridad`
- [ ] CONDUCTOR → `/dashboard/conductor`
- [ ] JEFE_SERVICIOS_GENERALES → `/dashboard/servicios`
- [ ] SUPER_ADMIN → `/dashboard/admin`
- [ ] DIRECTIVO → `/dashboard/ejecutivo`
- [ ] Si el usuario intenta acceder a una ruta no autorizada, redirige a su dashboard

---

### HU-01-03 | Cerrar Sesión
**Como** usuario autenticado  
**quiero** poder cerrar sesión  
**para** proteger mi cuenta en equipos compartidos

**Story Points:** 2

**Criterios de Aceptación:**
- [ ] Existe un botón de cerrar sesión visible en el header
- [ ] Al cerrar sesión se elimina el token y redirige al login
- [ ] No se puede acceder a páginas protegidas sin sesión activa

---

### HU-01-04 | Protección de Rutas por Rol
**Como** administrador del sistema  
**quiero** que cada ruta esté protegida por rol  
**para** evitar que usuarios accedan a funciones no autorizadas

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Las rutas `/dashboard/*` requieren sesión activa
- [ ] Cada sub-ruta valida que el rol del usuario tenga permiso
- [ ] Un conductor no puede acceder al panel de admin
- [ ] Se muestra página 403 si intenta acceder sin permiso

---

## EP-02: Panel de Ocupación en Tiempo Real

> **Como** guardia o jefe de seguridad **quiero** ver en tiempo real el estado de todos los espacios de estacionamiento **para** tener control visual de la ocupación y actuar ante incidencias.

---

### HU-02-01 | Ver Panel de Ocupación
**Como** guardia  
**quiero** ver un panel visual con los 110 espacios y su estado  
**para** saber en todo momento qué espacios están libres u ocupados

**Story Points:** 8

**Criterios de Aceptación:**
- [ ] El panel muestra los 110 espacios numerados y organizados por sector
- [ ] Cada espacio tiene un color según su estado:
  - 🟢 Verde = LIBRE
  - 🔴 Rojo = OCUPADO
  - 🟡 Amarillo = RESERVADO
  - ⚫ Gris = BLOQUEADO
- [ ] Al pasar el cursor sobre un espacio ocupado muestra: patente, conductor, hora de ingreso
- [ ] El panel es responsivo y visible en pantallas grandes (TV/monitor de guardia)

---

### HU-02-02 | Actualización en Tiempo Real
**Como** guardia  
**quiero** que el panel se actualice automáticamente sin recargar la página  
**para** tener información siempre actualizada

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] El panel se actualiza en menos de 3 segundos tras un cambio
- [ ] No es necesario recargar la página para ver cambios
- [ ] Se muestra un indicador visual cuando hay una actualización en vivo
- [ ] Funciona correctamente con múltiples clientes conectados simultáneamente

---

### HU-02-03 | Contador de Espacios Disponibles
**Como** guardia  
**quiero** ver un resumen con el total de espacios libres y ocupados  
**para** tener un control rápido sin contar uno por uno

**Story Points:** 2

**Criterios de Aceptación:**
- [ ] Se muestra: total ocupados / total disponibles / total bloqueados
- [ ] El contador se actualiza en tiempo real junto con el panel
- [ ] Se muestra el porcentaje de ocupación (ej: "75% ocupado")

---

### HU-02-04 | Buscar Vehículo por Patente
**Como** guardia  
**quiero** buscar un vehículo por su patente  
**para** ubicar rápidamente el espacio de un conductor ante una incidencia

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] Existe un campo de búsqueda por patente en el panel
- [ ] La búsqueda es en tiempo real (sin botón de enviar)
- [ ] Muestra: nombre del conductor, espacio asignado, hora de ingreso
- [ ] Si no se encuentra la patente muestra mensaje "Vehículo no encontrado"

---

### HU-02-05 | Alerta de Alta Ocupación
**Como** jefe de seguridad  
**quiero** recibir una alerta cuando la ocupación supere el 90%  
**para** tomar decisiones preventivas a tiempo

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] El sistema muestra una alerta visual cuando la ocupación ≥ 90%
- [ ] La alerta incluye el porcentaje actual y espacios restantes
- [ ] La alerta desaparece cuando la ocupación baja del umbral

---

## EP-03: Gestión de Espacios (Reservas y Bloqueos)

> **Como** jefe de seguridad **quiero** poder reservar y bloquear espacios **para** gestionar eventos especiales, mantenimiento e incidencias de seguridad.

---

### HU-03-01 | Reservar un Espacio
**Como** jefe de seguridad  
**quiero** reservar un espacio específico con motivo y rango de fechas  
**para** apartar cupos para visitas, autoridades o eventos especiales

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Se puede seleccionar un espacio libre del panel y marcarlo como reservado
- [ ] El formulario solicita: motivo, fecha/hora inicio, fecha/hora fin
- [ ] El espacio cambia a color amarillo (RESERVADO) inmediatamente
- [ ] La reserva queda registrada en el historial con fecha y responsable
- [ ] No se puede reservar un espacio que ya está OCUPADO o BLOQUEADO

---

### HU-03-02 | Bloquear un Espacio
**Como** jefe de seguridad  
**quiero** bloquear un espacio temporalmente  
**para** indicar que está fuera de servicio por mantenimiento o seguridad

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] Se puede seleccionar un espacio y bloquearlo con un motivo
- [ ] El espacio cambia a color gris (BLOQUEADO) inmediatamente
- [ ] El bloqueo queda registrado con fecha y responsable
- [ ] Un espacio bloqueado no puede ser usado ni reservado

---

### HU-03-03 | Liberar Espacio Reservado o Bloqueado
**Como** jefe de seguridad  
**quiero** poder liberar un espacio reservado o bloqueado  
**para** devolver la disponibilidad cuando ya no sea necesario

**Story Points:** 2

**Criterios de Aceptación:**
- [ ] Al seleccionar un espacio RESERVADO o BLOQUEADO aparece opción "Liberar"
- [ ] Al liberar, el espacio vuelve a estado LIBRE
- [ ] El historial registra quién liberó el espacio y a qué hora

---

### HU-03-04 | Asignar Espacio Fijo a Conductor
**Como** jefe de seguridad  
**quiero** asignar un espacio fijo a un conductor específico  
**para** que siempre use el mismo espacio y sea fácil de ubicar

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] Se puede buscar un conductor y asignarle un espacio disponible
- [ ] El espacio asignado queda vinculado al conductor en la BD
- [ ] En el panel se visualiza el nombre del conductor en su espacio fijo
- [ ] Solo puede haber un conductor por espacio fijo

---

### HU-03-05 | Ver Historial de Reservas y Bloqueos
**Como** jefe de seguridad  
**quiero** ver el historial de todas las reservas y bloqueos  
**para** tener trazabilidad de las acciones realizadas

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Existe una tabla con todas las reservas y bloqueos pasados
- [ ] Se puede filtrar por fecha, espacio o responsable
- [ ] Cada registro muestra: espacio, motivo, fechas, estado, responsable

---

## EP-04: App del Conductor

> **Como** conductor **quiero** ver el estado del estacionamiento y registrar mi ingreso/salida **para** gestionarme mejor y comunicarme con la guardia si necesito ayuda.

---

### HU-04-01 | Ver Nivel de Ocupación General
**Como** conductor  
**quiero** ver el porcentaje de ocupación actual del estacionamiento  
**para** decidir si vale la pena ir a la sede o ir más temprano

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] La vista del conductor muestra el % de ocupación actual
- [ ] Muestra: espacios libres disponibles y total
- [ ] El dato se actualiza en tiempo real
- [ ] Se muestra visualmente (barra de progreso o indicador)

---

### HU-04-02 | Registrar Mi Ingreso
**Como** conductor  
**quiero** registrar mi ingreso al estacionamiento desde la app  
**para** que la guardia y el sistema sepan que estoy presente

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] El conductor puede seleccionar su vehículo y espacio al ingresar
- [ ] Se registra la hora de ingreso automáticamente
- [ ] El espacio cambia a OCUPADO en el panel en tiempo real
- [ ] Si el conductor tiene espacio fijo, aparece pre-seleccionado

---

### HU-04-03 | Registrar Mi Salida
**Como** conductor  
**quiero** registrar mi salida del estacionamiento  
**para** liberar mi espacio y que el sistema lo marque disponible

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] El conductor puede registrar su salida con un botón
- [ ] Se registra la hora de salida automáticamente
- [ ] El espacio vuelve a estado LIBRE en tiempo real
- [ ] Solo puede registrar salida si tiene un ingreso activo

---

### HU-04-04 | Ver Mi Espacio Asignado
**Como** conductor  
**quiero** ver el estado actual de mi espacio asignado  
**para** saber si está libre o si hay alguna novedad

**Story Points:** 2

**Criterios de Aceptación:**
- [ ] La vista muestra el número y sector de su espacio asignado
- [ ] Muestra el estado actual del espacio (libre, ocupado, reservado, bloqueado)
- [ ] Si está ocupado por otro vehículo, muestra una alerta

---

### HU-04-05 | Contactar a la Guardia
**Como** conductor  
**quiero** enviar un mensaje a la guardia  
**para** reportar incidencias como bloqueo de mi espacio o problemas de acceso

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] El conductor puede enviar un mensaje de texto a la guardia
- [ ] El mensaje incluye automáticamente: nombre del conductor, patente, espacio
- [ ] La guardia recibe la notificación en su panel
- [ ] El conductor puede ver si su mensaje fue leído

---

## EP-05: Super Admin - Enrolamiento y Gestión

> **Como** Super Admin **quiero** gestionar todos los usuarios, vehículos y configuraciones del sistema **para** mantener la plataforma funcionando y actualizada.

---

### HU-05-01 | Enrolar Nuevo Conductor
**Como** Super Admin  
**quiero** registrar un nuevo conductor en el sistema  
**para** que pueda acceder al estacionamiento y usar la plataforma

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] El formulario solicita: nombre, RUT, email, teléfono, patente, marca/modelo del vehículo
- [ ] Se genera automáticamente una contraseña temporal
- [ ] Se envía email de bienvenida con credenciales (o se muestra en pantalla)
- [ ] El conductor queda activo inmediatamente tras el registro
- [ ] No se puede registrar un RUT o email ya existente

---

### HU-05-02 | Dar de Baja a un Conductor
**Como** Super Admin  
**quiero** desactivar a un conductor del sistema  
**para** retirar el beneficio de estacionamiento cuando ya no corresponda

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] Se puede buscar un conductor y desactivarlo
- [ ] Al desactivar, el conductor no puede iniciar sesión
- [ ] Su espacio asignado queda liberado automáticamente
- [ ] El historial del conductor se mantiene en la BD (no se elimina)

---

### HU-05-03 | Gestionar Todos los Usuarios
**Como** Super Admin  
**quiero** ver y gestionar todos los usuarios del sistema  
**para** mantener actualizado el directorio de accesos

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Existe una tabla paginada con todos los usuarios
- [ ] Se puede filtrar por rol, estado (activo/inactivo), nombre
- [ ] Se puede editar el rol o datos de cualquier usuario
- [ ] Se puede activar/desactivar usuarios desde la tabla

---

### HU-05-04 | Asignar y Cambiar Roles
**Como** Super Admin  
**quiero** asignar o modificar el rol de un usuario  
**para** dar acceso correcto a las funcionalidades que necesita

**Story Points:** 3

**Criterios de Aceptación:**
- [ ] Se puede cambiar el rol de cualquier usuario desde su perfil
- [ ] El cambio de rol tiene efecto inmediato (próximo login)
- [ ] Se registra en el log quién hizo el cambio y cuándo

---

### HU-05-05 | Ver Log de Acciones del Sistema
**Como** Super Admin  
**quiero** ver un registro de todas las acciones importantes del sistema  
**para** tener trazabilidad y detectar irregularidades

**Story Points:** 4

**Criterios de Aceptación:**
- [ ] El log registra: ingreso/salida vehículos, reservas, bloqueos, cambios de usuario
- [ ] Se puede filtrar por fecha, usuario, tipo de acción
- [ ] El log es de solo lectura (no se puede modificar)

---

## EP-06: Reportes y Dashboard Ejecutivo

> **Como** Jefe de Servicios Generales o Directivo **quiero** acceder a reportes y dashboards visuales **para** tomar decisiones basadas en datos de uso del estacionamiento.

---

### HU-06-01 | Dashboard con KPIs Principales
**Como** directivo  
**quiero** ver un dashboard con los indicadores clave de uso  
**para** tener visibilidad del estado del estacionamiento de un vistazo

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] El dashboard muestra: % ocupación actual, ingresos del día, espacios bloqueados, reservas activas
- [ ] Los KPIs se muestran con tarjetas visuales con iconos y colores
- [ ] El dashboard es de solo lectura para directivos

---

### HU-06-02 | Gráfico de Tendencias de Ocupación
**Como** Jefe de Servicios Generales  
**quiero** ver gráficos de ocupación por día, semana y mes  
**para** identificar patrones de uso y optimizar la gestión

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Existe un gráfico de línea/barra con ocupación histórica
- [ ] Se puede filtrar por rango de fechas
- [ ] El gráfico muestra el promedio de ocupación por hora del día
- [ ] Se identifican los días/horarios de mayor y menor demanda

---

### HU-06-03 | Exportar Reporte PDF o CSV
**Como** Jefe de Servicios Generales  
**quiero** exportar los reportes en PDF o CSV  
**para** compartirlos con la dirección o archivarlos

**Story Points:** 5

**Criterios de Aceptación:**
- [ ] Existe un botón "Exportar PDF" y "Exportar CSV" en la vista de reportes
- [ ] El PDF incluye el rango de fechas seleccionado y los gráficos
- [ ] El CSV incluye todos los registros tabulados del período

---

## Resumen de Story Points por Sprint

| Sprint | Épica(s) | SP |
|--------|----------|----|
| Sprint 1 (CP1-CP2) | EP-01 + EP-02 parcial | 25 |
| Sprint 2 (CP2-CP3) | EP-02 completo + EP-03 | 34 |
| Sprint 3 (CP3-CP4) | EP-04 + EP-05 parcial | 29 |
| Sprint 4 (CP4-CP5) | EP-05 completo + EP-06 | 15 |
| **TOTAL** | | **103 SP** |

---

## Backlog Priorizado (MoSCoW)

### Must Have (obligatorio para MVP)
- HU-01-01, HU-01-02, HU-01-03, HU-01-04
- HU-02-01, HU-02-02, HU-02-03
- HU-03-01, HU-03-02, HU-03-03
- HU-04-01, HU-04-02, HU-04-03
- HU-05-01, HU-05-02, HU-05-03

### Should Have (importante pero no crítico)
- HU-02-04, HU-02-05
- HU-03-04, HU-03-05
- HU-04-04, HU-04-05
- HU-05-04, HU-05-05
- HU-06-01

### Could Have (deseable si hay tiempo)
- HU-06-02, HU-06-03

### Won't Have (fuera del alcance actual)
- App móvil nativa
- Integración con barreras físicas en tiempo real
- Reconocimiento de patentes por cámara
