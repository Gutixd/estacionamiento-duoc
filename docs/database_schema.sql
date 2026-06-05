-- ════════════════════════════════════════════════════════════════
-- ESQUEMA COMPLETO DE BASE DE DATOS · Estacionamientos Duoc UC Maipú
-- Proyecto Supabase: estacionamiento-duoc (sa-east-1)
-- Generado para ser aplicado en el SQL Editor de Supabase
-- ════════════════════════════════════════════════════════════════

-- ── 1. LIMPIEZA DE OBJETOS PREVIOS (Evita conflictos) ────────────
DROP VIEW IF EXISTS v_estadisticas CASCADE;
DROP VIEW IF EXISTS v_ocupacion_sector CASCADE;

DROP TABLE IF EXISTS ocupacion_historica CASCADE;
DROP TABLE IF EXISTS solicitudes_acceso CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS bloqueos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS registros CASCADE;
DROP TABLE IF EXISTS espacios CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS conductores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS rol_usuario CASCADE;
DROP TYPE IF EXISTS estado_espacio CASCADE;
DROP TYPE IF EXISTS tipo_vehiculo_acceso CASCADE;
DROP TYPE IF EXISTS tipo_registro CASCADE;
DROP TYPE IF EXISTS estado_reserva CASCADE;
DROP TYPE IF EXISTS tipo_notificacion CASCADE;
DROP TYPE IF EXISTS estado_solicitud CASCADE;

-- ── 2. TIPOS PERSONALIZADOS (ENUMS) ─────────────────────────────
CREATE TYPE rol_usuario AS ENUM (
  'GUARDIA', 'JEFE_SEGURIDAD', 'CONDUCTOR', 'JEFE_SERVICIOS_GENERALES',
  'SUPER_ADMIN', 'DIRECTIVO', 'PROFESOR', 'COORDINACION'
);
CREATE TYPE estado_espacio AS ENUM ('LIBRE', 'OCUPADO', 'RESERVADO', 'BLOQUEADO');
CREATE TYPE tipo_vehiculo_acceso AS ENUM ('DOCENTE', 'ALUMNO', 'VISITA', 'FUNCIONARIO');
CREATE TYPE tipo_registro AS ENUM ('INGRESO', 'SALIDA');
CREATE TYPE estado_reserva AS ENUM ('PENDIENTE', 'ACTIVA', 'CANCELADA', 'EXPIRADA', 'COMPLETADA');
CREATE TYPE tipo_notificacion AS ENUM ('ALERTA', 'MENSAJE', 'SISTEMA', 'INCIDENCIA');
CREATE TYPE estado_solicitud AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- ── 3. CREACIÓN DE TABLAS ───────────────────────────────────────

-- Usuarios
CREATE TABLE usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar NOT NULL,
  email varchar UNIQUE NOT NULL,
  password_hash varchar NOT NULL,
  rol rol_usuario NOT NULL,
  cargo varchar,
  activo boolean DEFAULT true,
  ultimo_acceso timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Conductores
CREATE TABLE conductores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  rut varchar UNIQUE NOT NULL,
  telefono varchar,
  tipo_acceso tipo_vehiculo_acceso NOT NULL DEFAULT 'DOCENTE',
  tiene_espacio_fijo boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Vehículos
CREATE TABLE vehiculos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conductor_id uuid REFERENCES conductores(id) ON DELETE CASCADE,
  patente varchar UNIQUE NOT NULL,
  marca varchar,
  modelo varchar,
  color varchar,
  anio integer,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Espacios (110 en total)
CREATE TABLE espacios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer UNIQUE NOT NULL,
  sector varchar NOT NULL,
  estado estado_espacio NOT NULL DEFAULT 'LIBRE',
  conductor_asignado_id uuid REFERENCES conductores(id) ON DELETE SET NULL,
  vehiculo_actual_id uuid REFERENCES vehiculos(id) ON DELETE SET NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- Registros de Ingreso/Salida
CREATE TABLE registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehiculo_id uuid REFERENCES vehiculos(id) ON DELETE SET NULL,
  espacio_id uuid REFERENCES espacios(id) ON DELETE SET NULL,
  registrado_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  patente varchar,
  hora_ingreso timestamp with time zone DEFAULT now(),
  hora_salida timestamp with time zone,
  tipo tipo_registro,
  observacion text
);

-- Reservas
CREATE TABLE reservas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  espacio_id uuid REFERENCES espacios(id) ON DELETE CASCADE,
  creada_por uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  motivo varchar,
  qr_token varchar,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  estado estado_reserva NOT NULL DEFAULT 'PENDIENTE',
  created_at timestamp with time zone DEFAULT now()
);

-- Bloqueos
CREATE TABLE bloqueos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  espacio_id uuid REFERENCES espacios(id) ON DELETE CASCADE,
  creado_por uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  motivo varchar,
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Notificaciones
CREATE TABLE notificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  remitente_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  destinatario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  espacio_id uuid REFERENCES espacios(id) ON DELETE SET NULL,
  mensaje text NOT NULL,
  leida boolean DEFAULT false,
  tipo tipo_notificacion NOT NULL DEFAULT 'MENSAJE',
  created_at timestamp with time zone DEFAULT now()
);

-- Reportes
CREATE TABLE reportes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  generado_por uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo varchar,
  fecha_inicio date,
  fecha_fin date,
  data jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Solicitudes de Acceso (Profesores primera vez)
CREATE TABLE solicitudes_acceso (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre varchar NOT NULL,
  email varchar UNIQUE NOT NULL,
  cargo varchar,
  estado estado_solicitud NOT NULL DEFAULT 'PENDIENTE',
  password_temp varchar,
  revisada_por uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Ocupación Histórica
CREATE TABLE ocupacion_historica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT current_date,
  hora integer NOT NULL,
  ocupados integer NOT NULL,
  libres integer NOT NULL,
  reservados integer NOT NULL,
  bloqueados integer NOT NULL,
  porcentaje integer NOT NULL
);

-- ── 4. DISPARADORES PARA marcas de tiempo (triggers) ─────────────
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_usuarios
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_espacios
BEFORE UPDATE ON espacios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ── 5. VISTAS ANALÍTICAS (Dashboards) ───────────────────────────

-- Conteo de estados y porcentaje de ocupación global
CREATE OR REPLACE VIEW v_estadisticas AS
SELECT 
  count(*) FILTER (WHERE estado = 'LIBRE') AS libres,
  count(*) FILTER (WHERE estado = 'OCUPADO') AS ocupados,
  count(*) FILTER (WHERE estado = 'RESERVADO') AS reservados,
  count(*) FILTER (WHERE estado = 'BLOQUEADO') AS bloqueados,
  round((count(*) FILTER (WHERE estado = 'OCUPADO')::numeric / count(*)::numeric) * 100, 2) AS porcentaje_ocupacion
FROM espacios;

-- Conteo por sector A, B, C y D
CREATE OR REPLACE VIEW v_ocupacion_sector AS
SELECT 
  sector,
  count(*) AS total,
  count(*) FILTER (WHERE estado = 'LIBRE') AS libres,
  count(*) FILTER (WHERE estado = 'OCUPADO') AS ocupados,
  count(*) FILTER (WHERE estado = 'RESERVADO') AS reservados,
  count(*) FILTER (WHERE estado = 'BLOQUEADO') AS bloqueados
FROM espacios
GROUP BY sector;

-- ── 6. FUNCIONES RPC (Lógica de Negocio) ────────────────────────

-- Cambiar el estado de un espacio por su número
CREATE OR REPLACE FUNCTION cambiar_estado_espacio(p_numero integer, p_estado estado_espacio)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE espacios
  SET estado = p_estado,
      updated_at = now()
  WHERE numero = p_numero;
END;
$$;

-- Buscar un vehículo por su patente y traer los datos del conductor y el espacio
CREATE OR REPLACE FUNCTION buscar_por_patente(p_patente text)
RETURNS TABLE (
  patente varchar,
  marca varchar,
  modelo varchar,
  color varchar,
  anio integer,
  tipo_acceso varchar,
  conductor_nombre varchar,
  conductor_rut varchar,
  conductor_telefono varchar,
  espacio_numero integer,
  espacio_sector varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.patente,
    v.marca,
    v.modelo,
    v.color,
    v.anio,
    c.tipo_acceso::varchar,
    u.nombre AS conductor_nombre,
    c.rut AS conductor_rut,
    c.telefono AS conductor_telefono,
    e.numero AS espacio_numero,
    e.sector AS espacio_sector
  FROM vehiculos v
  JOIN conductores c ON v.conductor_id = c.id
  JOIN usuarios u ON c.usuario_id = u.id
  LEFT JOIN espacios e ON e.conductor_asignado_id = c.id OR e.vehiculo_actual_id = v.id
  WHERE UPPER(v.patente) = UPPER(p_patente) AND v.activo = true;
END;
$$;

-- Aprobar solicitud de acceso de profesor (crea usuario y conductor)
CREATE OR REPLACE FUNCTION aprobar_solicitud(p_solicitud_id uuid, p_password_temp varchar)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_nombre varchar;
  v_email varchar;
  v_cargo varchar;
  v_nuevo_usuario_id uuid;
BEGIN
  -- Obtener datos de la solicitud
  SELECT nombre, email, cargo 
  INTO v_nombre, v_email, v_cargo
  FROM solicitudes_acceso
  WHERE id = p_solicitud_id AND estado = 'PENDIENTE';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitud no encontrada o ya procesada';
  END IF;
  
  -- Crear el usuario
  INSERT INTO usuarios (nombre, email, password_hash, rol, cargo, activo)
  VALUES (v_nombre, LOWER(v_email), 'demo:' || p_password_temp, 'PROFESOR', v_cargo, true)
  RETURNING id INTO v_nuevo_usuario_id;
  
  -- Crear conductor asociado de tipo DOCENTE
  INSERT INTO conductores (usuario_id, rut, telefono, tipo_acceso, tiene_espacio_fijo)
  VALUES (v_nuevo_usuario_id, '99.999.999-K', '+56900000000', 'DOCENTE', false);
  
  -- Actualizar estado de la solicitud a APROBADA
  UPDATE solicitudes_acceso
  SET estado = 'APROBADA',
      password_temp = p_password_temp
  WHERE id = p_solicitud_id;
  
  RETURN v_nuevo_usuario_id;
END;
$$;

-- ── 7. DATOS SEMILLA (Seed Data) ────────────────────────────────

-- Generar automáticamente los 110 espacios en sus respectivos sectores
DO $$
DECLARE
  i integer;
  sec varchar;
BEGIN
  FOR i IN 1..110 LOOP
    IF i <= 30 THEN
      sec := 'A';
    ELSIF i <= 60 THEN
      sec := 'B';
    ELSIF i <= 90 THEN
      sec := 'C';
    ELSE
      sec := 'D';
    END IF;
    
    INSERT INTO espacios (numero, sector, estado)
    VALUES (i, sec, 'LIBRE')
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;
END;
$$;

-- Usuarios administrativos y profesores de prueba
INSERT INTO usuarios (nombre, email, password_hash, rol, cargo, activo) VALUES
('Roberto Silva', 'guardia@duocuc.cl', 'demo:guardia123', 'GUARDIA', 'Guardia de Portería', true),
('María González', 'coordinacion@duocuc.cl', 'demo:coord2024', 'COORDINACION', 'Coordinadora de Sede', true),
('Diego Gutiérrez', 'dgutierrez@duocuc.cl', 'demo:diego123', 'PROFESOR', 'Docente Ingeniería', true),
('Benjamín Mella', 'benmella@duocuc.cl', 'demo:benj123', 'PROFESOR', 'Docente TI', true),
('Génesis Hernández', 'ghernandez@duocuc.cl', 'demo:genesis123', 'PROFESOR', 'Docente Diseño', true),
('Jefe de Seguridad', 'seguridad@duocuc.cl', 'demo:seguridad123', 'JEFE_SEGURIDAD', 'Supervisor de Seguridad', true),
('Directivo Maipú', 'directivo@duocuc.cl', 'demo:directivo123', 'DIRECTIVO', 'Director de Sede', true)
ON CONFLICT (email) DO NOTHING;

-- Crear usuarios de conductores mock
INSERT INTO usuarios (id, nombre, email, password_hash, rol, cargo, activo) VALUES
('a3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'Carlos Rojas', 'carlos.rojas@duocuc.cl', 'demo:carlos123', 'CONDUCTOR', 'Docente', true),
('b3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'Ana Sepúlveda', 'ana.sepulveda@duocuc.cl', 'demo:ana123', 'CONDUCTOR', 'Docente', true),
('c3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'Jorge Martínez', 'jorge.martinez@duocuc.cl', 'demo:jorge123', 'CONDUCTOR', 'Administrativo', true)
ON CONFLICT (email) DO NOTHING;

-- Crear conductores mock asociados
INSERT INTO conductores (id, usuario_id, rut, telefono, tipo_acceso, tiene_espacio_fijo) VALUES
('d3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'a3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', '12.345.678-9', '+56912345678', 'DOCENTE', false),
('e3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'b3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', '13.456.789-0', '+56923456789', 'DOCENTE', false),
('f3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'c3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', '14.567.890-1', '+56934567890', 'FUNCIONARIO', false)
ON CONFLICT (rut) DO NOTHING;

-- Crear vehículos mock enrolados
INSERT INTO vehiculos (id, conductor_id, patente, marca, modelo, color, anio, activo) VALUES
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'd3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'BBCD45', 'Hyundai', 'Accent', 'Gris', 2018, true),
('2a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'e3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'GHJK12', 'Toyota', 'Yaris', 'Rojo', 2020, true),
('3a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'f3c1e2a4-1a2b-3c4d-5e6f-7a8b9c0d1e2f', 'RTYU89', 'Chevrolet', 'Sail', 'Blanco', 2019, true)
ON CONFLICT (patente) DO NOTHING;

-- Solicitud de acceso pendiente inicial
INSERT INTO solicitudes_acceso (nombre, email, cargo, estado) VALUES
('Patricia Muñoz', 'patricia.munoz@duocuc.cl', 'Docente Adjunto TI', 'PENDIENTE')
ON CONFLICT (email) DO NOTHING;

-- Ocupación histórica mock para tendencias
INSERT INTO ocupacion_historica (fecha, hora, ocupados, libres, reservados, bloqueados, porcentaje) VALUES
(current_date, 6,  5,   102, 3, 0, 5),
(current_date, 7,  20,  87,  3, 0, 18),
(current_date, 8,  50,  57,  3, 0, 45),
(current_date, 9,  79,  28,  3, 0, 72),
(current_date, 10, 93,  14,  3, 0, 85),
(current_date, 11, 90,  17,  3, 0, 82),
(current_date, 12, 66,  41,  3, 0, 60),
(current_date, 13, 60,  47,  3, 0, 55),
(current_date, 14, 77,  30,  3, 0, 70),
(current_date, 15, 86,  21,  3, 0, 78),
(current_date, 16, 71,  36,  3, 0, 65),
(current_date, 17, 55,  52,  3, 0, 50),
(current_date, 18, 38,  69,  3, 0, 35),
(current_date, 19, 22,  85,  3, 0, 20),
(current_date, 20, 11,  96,  3, 0, 10);
