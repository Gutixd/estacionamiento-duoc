# Requisitos del Sistema - Gestión Inteligente de Estacionamientos
## Duoc UC Sede Maipú | BootcampCodecAI | Checkpoint 1

**Equipo:** Diego Gutierrez (PM/Scrum Master) · Benjamin Mella (Full Stack/Arquitecto) · Genesis Hernandez (Full Stack/Frontend Lead)  
**Fecha:** 05-06-2026  
**Versión:** 1.0

---

## 1. Descripción General del Sistema

Sistema web de gestión de 110 espacios de estacionamiento para la Sede Duoc UC Maipú, con paneles en tiempo real, registro de vehículos, reservas, comunicación entre actores y reportes de tendencias.

---

## 2. Actores del Sistema

| ID | Actor | Descripción |
|----|-------|-------------|
| A1 | **Guardia** | Personal de portería que controla el acceso físico |
| A2 | **Jefe de Seguridad** | Supervisa guardias, gestiona reservas y bloqueos |
| A3 | **Conductor** | Docente/administrativo con beneficio de estacionamiento |
| A4 | **Jefe de Servicios Generales** | Administra recursos, accede a reportes ejecutivos |
| A5 | **Jefe de Servicios Digitales (Super Admin)** | Enrola vehículos, gestiona accesos y tecnología |
| A6 | **Directivos** | Acceso de solo lectura a dashboards ejecutivos |

---

## 3. Requisitos Funcionales

### 3.1 RF - Guardia (A1)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-G01 | El sistema debe mostrar un panel visual en tiempo real con los 110 espacios y su estado (libre/ocupado/reservado/bloqueado) | Alta |
| RF-G02 | El sistema debe actualizar automáticamente el estado de los espacios sin recargar la página | Alta |
| RF-G03 | El guardia debe poder registrar manualmente el ingreso de un vehículo (patente, espacio asignado, hora) | Alta |
| RF-G04 | El guardia debe poder registrar la salida de un vehículo | Alta |
| RF-G05 | El sistema debe mostrar la información del conductor de cada espacio ocupado (nombre, patente, teléfono) | Media |
| RF-G06 | El guardia debe poder enviar mensajes/alertas al conductor de un espacio específico | Media |
| RF-G07 | El panel debe mostrar contador de espacios libres y ocupados en tiempo real | Alta |
| RF-G08 | El guardia debe poder buscar un vehículo por patente | Media |

---

### 3.2 RF - Jefe de Seguridad (A2)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-JS01 | El jefe de seguridad debe poder ver el panel de ocupación en tiempo real | Alta |
| RF-JS02 | El sistema debe permitir reservar uno o más espacios para uso específico (visitas, eventos) | Alta |
| RF-JS03 | El sistema debe permitir bloquear espacios temporalmente (mantención, incidentes) | Alta |
| RF-JS04 | El jefe debe poder desbloquear/liberar espacios bloqueados o reservados | Alta |
| RF-JS05 | El sistema debe registrar historial de reservas y bloqueos con motivo y fecha | Media |
| RF-JS06 | El jefe debe poder asignar espacios fijos a conductores específicos | Media |
| RF-JS07 | El sistema debe generar alertas cuando la ocupación supere el 90% | Media |
| RF-JS08 | El jefe debe poder comunicarse con todos los guardias en turno | Baja |

---

### 3.3 RF - Conductor (A3)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-C01 | El conductor debe poder ver en tiempo real el nivel de ocupación general del estacionamiento (%) | Alta |
| RF-C02 | El conductor debe poder registrar su ingreso indicando su espacio asignado | Alta |
| RF-C03 | El conductor debe poder registrar su salida del estacionamiento | Alta |
| RF-C04 | El conductor debe ver el estado de su espacio asignado | Alta |
| RF-C05 | El conductor debe poder comunicarse con la guardia en caso de incidencia | Media |
| RF-C06 | El sistema debe notificar al conductor cuando su espacio está siendo utilizado por otro vehículo | Media |
| RF-C07 | El conductor debe poder actualizar su información de contacto (teléfono, correo) | Baja |
| RF-C08 | El conductor debe poder ver su historial de ingresos y salidas | Baja |

---

### 3.4 RF - Jefe de Servicios Generales (A4)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-JSG01 | El jefe debe acceder a reportes visuales de ocupación por día, semana y mes | Alta |
| RF-JSG02 | El sistema debe mostrar gráficos de tendencias de uso por horario | Alta |
| RF-JSG03 | El jefe debe poder exportar reportes en PDF o CSV | Media |
| RF-JSG04 | El sistema debe mostrar estadísticas de los conductores más frecuentes | Media |
| RF-JSG05 | El jefe debe poder ver el historial completo de incidencias | Media |
| RF-JSG06 | El sistema debe generar alertas automáticas de uso inusual o anomalías | Baja |
| RF-JSG07 | El jefe debe poder gestionar la lista completa de conductores enrolados | Media |

---

### 3.5 RF - Super Admin / Jefe de Servicios Digitales (A5)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-SA01 | El Super Admin debe poder enrolar nuevos conductores (nombre, RUT, patente, teléfono, correo, rol) | Alta |
| RF-SA02 | El sistema debe permitir dar de baja a conductores | Alta |
| RF-SA03 | El Super Admin debe poder gestionar todos los usuarios del sistema (crear, editar, eliminar) | Alta |
| RF-SA04 | El sistema debe permitir configurar el número total de espacios y sus sectores | Media |
| RF-SA05 | El Super Admin debe poder asignar roles y permisos a los usuarios | Alta |
| RF-SA06 | El sistema debe mantener log completo de todas las acciones del sistema | Media |
| RF-SA07 | El Super Admin debe poder ver y gestionar todos los módulos del sistema | Alta |
| RF-SA08 | El sistema debe permitir carga masiva de conductores (CSV/Excel) | Baja |

---

### 3.6 RF - Directivos (A6)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-D01 | Los directivos deben acceder a un dashboard ejecutivo con KPIs de uso | Alta |
| RF-D02 | El dashboard debe mostrar: total espacios, % ocupación, tendencias mensuales | Alta |
| RF-D03 | Los directivos solo tienen acceso de solo lectura (no pueden modificar datos) | Alta |

---

## 4. Requisitos No Funcionales

### 4.1 Rendimiento
| ID | Requisito |
|----|-----------|
| RNF-R01 | El panel de ocupación debe actualizarse en tiempo real con latencia máxima de 3 segundos |
| RNF-R02 | El sistema debe soportar al menos 50 usuarios concurrentes |
| RNF-R03 | El tiempo de carga inicial de cualquier vista no debe superar los 3 segundos |

### 4.2 Seguridad
| ID | Requisito |
|----|-----------|
| RNF-S01 | El sistema debe usar autenticación segura (JWT con Supabase Auth) |
| RNF-S02 | Cada actor solo puede acceder a las vistas y funcionalidades de su rol |
| RNF-S03 | Todas las contraseñas deben estar encriptadas (bcrypt) |
| RNF-S04 | Las sesiones deben expirar automáticamente tras 8 horas de inactividad |
| RNF-S05 | Las comunicaciones deben estar cifradas (HTTPS/TLS) |

### 4.3 Usabilidad
| ID | Requisito |
|----|-----------|
| RNF-U01 | Las interfaces deben ser responsivas (mobile, tablet, desktop) |
| RNF-U02 | El diseño debe seguir principios de UX con feedback visual claro (colores: verde=libre, rojo=ocupado, amarillo=reservado, gris=bloqueado) |
| RNF-U03 | El sistema debe funcionar en Chrome, Firefox, Edge y Safari modernos |

### 4.4 Disponibilidad
| ID | Requisito |
|----|-----------|
| RNF-D01 | El sistema debe estar disponible 24/7 con 99% de uptime |
| RNF-D02 | El sistema debe tener un mecanismo de recuperación ante fallos |

### 4.5 Mantenibilidad
| ID | Requisito |
|----|-----------|
| RNF-M01 | El código debe seguir convenciones estándar (ESLint, Prettier) |
| RNF-M02 | El proyecto debe tener documentación técnica básica (README, variables de entorno) |

---

## 5. Restricciones del Proyecto

| ID | Restricción |
|----|-------------|
| REST-01 | Stack obligatorio: Next.js + React + Tailwind (Frontend), Supabase/PostgreSQL (Backend/BD), AWS (Hosting) |
| REST-02 | El sistema debe gestionar exactamente 110 espacios numerados |
| REST-03 | Plazo de entrega distribuido en 5 Checkpoints iterativos |
| REST-04 | El equipo es de 3 personas con metodología Scrum |

---

## 6. Criterios de Aceptación Globales

- ✅ Todos los actores pueden autenticarse con su rol específico
- ✅ El panel de ocupación refleja cambios en menos de 3 segundos
- ✅ Los 110 espacios son identificables individualmente en el sistema
- ✅ El registro de ingreso/salida queda guardado en la BD con timestamp
- ✅ Un conductor enrolado puede ver el estado del estacionamiento
- ✅ El Super Admin puede crear, editar y eliminar usuarios de cualquier rol

---

## 7. Glosario

| Término | Definición |
|---------|-----------|
| **Espacio** | Lugar físico numerado para estacionar un vehículo |
| **Conductor** | Usuario enrolado con beneficio de uso de estacionamiento |
| **Enrolar** | Registrar a un conductor y su vehículo en el sistema |
| **Patente** | Placa identificadora del vehículo |
| **Reserva** | Espacio apartado con anticipación para uso específico |
| **Bloqueo** | Espacio inhabilitado temporalmente (mantenimiento, seguridad) |
| **Real-time** | Actualización de datos sin necesidad de recargar la página |
| **KPI** | Indicador clave de rendimiento para dashboards ejecutivos |
