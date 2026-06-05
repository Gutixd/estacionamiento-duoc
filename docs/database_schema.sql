-- ════════════════════════════════════════════════════════════════
-- ESQUEMA BASE DE DATOS · Estacionamientos Duoc UC Maipú
-- Proyecto Supabase: estacionamiento-duoc (sa-east-1)
-- Generado: Checkpoint 1 · BootcampCodecAI
-- ════════════════════════════════════════════════════════════════
-- Este archivo documenta el esquema completo ya aplicado en Supabase.
-- Para recrear en otro proyecto: ejecutar en orden.
-- ════════════════════════════════════════════════════════════════

-- ── ENUMS ──────────────────────────────────────────────────────
CREATE TYPE rol_usuario AS ENUM (
  'GUARDIA','JEFE_SEGURIDAD','CONDUCTOR','JEFE_SERVICIOS_GENERALES',
  'SUPER_ADMIN','DIRECTIVO','PROFESOR','COORDINACION');
CREATE TYPE estado_espacio       AS ENUM ('LIBRE','OCUPADO','RESERVADO','BLOQUEADO');
CREATE TYPE tipo_vehiculo_acceso AS ENUM ('DOCENTE','ALUMNO','VISITA','FUNCIONARIO');
CREATE TYPE tipo_registro        AS ENUM ('INGRESO','SALIDA');
CREATE TYPE estado_reserva       AS ENUM ('PENDIENTE','ACTIVA','CANCELADA','EXPIRADA','COMPLETADA');
CREATE TYPE tipo_notificacion    AS ENUM ('ALERTA','MENSAJE','SISTEMA','INCIDENCIA');
CREATE TYPE estado_solicitud     AS ENUM ('PENDIENTE','APROBADA','RECHAZADA');

-- ── TABLAS ──────────────────────────────────────────────────────
-- usuarios, conductores, vehiculos, espacios, registros,
-- reservas, bloqueos, notificaciones, reportes,
-- solicitudes_acceso, ocupacion_historica
-- (ver migraciones 01-05 en Supabase para DDL completo)

-- ── TABLAS PRINCIPALES (resumen) ───────────────────────────────
-- usuarios(id, nombre, email UK, password_hash, rol, cargo, activo, ultimo_acceso, timestamps)
-- conductores(id, usuario_id FK, rut UK, telefono, tipo_acceso, tiene_espacio_fijo)
-- vehiculos(id, conductor_id FK, patente UK, marca, modelo, anio, color, vin, tasacion, api_validado, activo)
-- espacios(id, numero UK, sector, estado, conductor_asignado_id FK, vehiculo_actual_id FK, updated_at)
-- registros(id, vehiculo_id FK, espacio_id FK, registrado_por FK, patente, hora_ingreso, hora_salida, tipo, observacion)
-- reservas(id, espacio_id FK, creada_por FK, motivo, qr_token, fecha_inicio, fecha_fin, estado)
-- bloqueos(id, espacio_id FK, creado_por FK, motivo, fecha_inicio, fecha_fin, activo)
-- notificaciones(id, remitente_id FK, destinatario_id FK, espacio_id FK, mensaje, tipo, leida)
-- reportes(id, generado_por FK, tipo, fecha_inicio, fecha_fin, data JSONB)
-- solicitudes_acceso(id, nombre, email, cargo, estado, password_temp, revisada_por FK)
-- ocupacion_historica(id, fecha, hora, ocupados, libres, reservados, bloqueados, porcentaje)

-- ── VISTAS ──────────────────────────────────────────────────────
-- v_estadisticas      → conteo libres/ocupados/reservados/bloqueados + % ocupación
-- v_ocupacion_sector  → totales por sector A/B/C/D

-- ── FUNCIONES RPC ───────────────────────────────────────────────
-- cambiar_estado_espacio(p_numero, p_estado)  → actualiza espacio
-- buscar_por_patente(p_patente)               → datos vehículo + conductor + espacio
-- aprobar_solicitud(p_solicitud_id, p_pass)   → crea usuario desde solicitud
-- set_updated_at()                            → trigger updated_at

-- ── REALTIME ────────────────────────────────────────────────────
-- Tablas publicadas: espacios, reservas, notificaciones, registros

-- ── SEED ────────────────────────────────────────────────────────
-- 110 espacios (A:1-30, B:31-60, C:61-90, D:91-110)
-- 7 usuarios demo (guardia, coordinación, 3 profesores, seguridad, directivo)
-- 3 conductores + 3 vehículos enrolados
-- 15 registros de ocupación histórica (curva del día)
-- 1 solicitud de acceso pendiente
