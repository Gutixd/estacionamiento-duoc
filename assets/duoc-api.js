/* ════════════════════════════════════════════════════════════════
   DUOC ESTACIONAMIENTO · MÓDULO DE APIs
   ────────────────────────────────────────────────────────────────
   Integraciones:
   1. Supabase (DB + Realtime)        → datos en tiempo real
   2. API Patentes Chile (Boostr.cl)  → autocompletar marca/modelo
   3. QR Codes (api.qrserver.com)     → reservas con QR
   4. Predicción de ocupación (local) → analítica horas pico
   ════════════════════════════════════════════════════════════════ */

window.DuocAPI = (function () {
  "use strict";

  /* ── CONFIG SUPABASE ──────────────────────────────────────────
     La publishable key es SEGURA para el cliente: RLS protege los datos.
  */
  var SUPABASE_URL = 'https://xqcnlsovywhqtxzpsrfr.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_qV8FOywa3BkjQXry5PkT6Q_e7rlimzj';

  var _client = null;
  var _online = false;

  /* ── INIT CLIENTE SUPABASE ──────────────────────────────────── */
  function init() {
    try {
      if (window.supabase && window.supabase.createClient) {
        _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        _online = true;
        console.log('✅ Supabase conectado:', SUPABASE_URL);
      }
    } catch (e) {
      console.warn('⚠️ Supabase no disponible — modo simulación local:', e.message);
      _online = false;
    }
    return _online;
  }

  function isOnline() { return _online; }
  function client()   { return _client; }

  /* ══════════════════════════════════════════════════════════════
     1) ESPACIOS — leer todos / estadísticas / cambiar estado
     ══════════════════════════════════════════════════════════════ */
  async function getEspacios() {
    if (!_online) return null;
    var r = await _client.from('espacios').select('*').order('numero');
    if (r.error) { console.warn('getEspacios', r.error); return null; }
    return r.data;
  }

  async function getEstadisticas() {
    if (!_online) return null;
    var r = await _client.from('v_estadisticas').select('*').single();
    if (r.error) { console.warn('getEstadisticas', r.error); return null; }
    return r.data;
  }

  async function cambiarEstadoEspacio(numero, estado) {
    if (!_online) return null;
    // estado debe ser LIBRE | OCUPADO | RESERVADO | BLOQUEADO
    var r = await _client.rpc('cambiar_estado_espacio', {
      p_numero: numero,
      p_estado: estado.toUpperCase()
    });
    if (r.error) { console.warn('cambiarEstado', r.error); return null; }
    return r.data;
  }

  /* ── REALTIME: suscribirse a cambios de espacios ─────────────── */
  function suscribirEspacios(callback) {
    if (!_online) return null;
    return _client
      .channel('espacios-rt')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'espacios' },
        function (payload) { callback(payload.new); })
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') console.log('🔴 Realtime activo en espacios');
      });
  }

  /* ══════════════════════════════════════════════════════════════
     2) API PATENTES CHILE — Boostr.cl (gratis, beta)
        https://api.boostr.cl/vehicle/{patente}.json
        Fallback: búsqueda en la BD local de vehículos enrolados.
     ══════════════════════════════════════════════════════════════ */
  async function consultarPatente(patente) {
    patente = (patente || '').toUpperCase().replace(/\s|-/g, '');
    var resultado = { patente: patente, fuente: null, datos: null };

    // -- 2a. Intentar BD local (vehículos enrolados Duoc) primero
    if (_online) {
      try {
        var r = await _client.rpc('buscar_por_patente', { p_patente: patente });
        if (!r.error && r.data && r.data.length > 0) {
          resultado.fuente = 'duoc';
          resultado.datos  = r.data[0];
          return resultado;
        }
      } catch (e) { /* sigue al API externo */ }
    }

    // -- 2b. API externa Boostr.cl (autocompleta marca/modelo/color)
    try {
      var resp = await fetch('https://api.boostr.cl/vehicle/' + patente + '.json', {
        method: 'GET', headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        var json = await resp.json();
        if (json && json.data) {
          resultado.fuente = 'boostr';
          resultado.datos = {
            patente: patente,
            marca:   json.data.make  || json.data.brand || '—',
            modelo:  json.data.model || '—',
            anio:    json.data.year  || null,
            color:   json.data.color || '—'
          };
          return resultado;
        }
      }
    } catch (e) {
      console.warn('Boostr.cl no disponible (posible CORS):', e.message);
    }

    // -- 2c. Sin datos
    resultado.fuente = 'no_encontrado';
    return resultado;
  }

  /* ══════════════════════════════════════════════════════════════
     3) QR CODES — api.qrserver.com (GoQR.me, gratis, sin key)
        Genera la URL de imagen del QR para reservas.
     ══════════════════════════════════════════════════════════════ */
  function generarQR(token, size) {
    size = size || 220;
    var data = encodeURIComponent('DUOC-PARK:' + token);
    return 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size +
           '&bgcolor=26-34-54&color=255-255-255&margin=8&data=' + data;
  }

  function nuevoTokenReserva(espacioNum) {
    return 'E' + espacioNum + '-' + Date.now().toString(36).toUpperCase();
  }

  /* ══════════════════════════════════════════════════════════════
     4) PREDICCIÓN DE OCUPACIÓN (local, basado en histórico)
        Patrón inspirado en TomTom Parking Availability Trends.
        Lee ocupacion_historica de Supabase o usa curva por defecto.
     ══════════════════════════════════════════════════════════════ */
  var CURVA_DEFECTO = {
    6:5, 7:18, 8:45, 9:72, 10:85, 11:82, 12:60, 13:55,
    14:70, 15:78, 16:65, 17:50, 18:35, 19:20, 20:10
  };

  async function getHistorico() {
    if (_online) {
      try {
        var r = await _client.from('ocupacion_historica')
          .select('hora, porcentaje, ocupados')
          .eq('fecha', new Date().toISOString().slice(0, 10))
          .order('hora');
        if (!r.error && r.data && r.data.length > 0) return r.data;
      } catch (e) {}
    }
    // Fallback: curva por defecto
    return Object.keys(CURVA_DEFECTO).map(function (h) {
      return { hora: parseInt(h), porcentaje: CURVA_DEFECTO[h], ocupados: Math.round(CURVA_DEFECTO[h] * 1.1) };
    });
  }

  // Predice ocupación para una hora dada (0-23) con tendencia
  function predecirOcupacion(hora) {
    var base = CURVA_DEFECTO[hora] != null ? CURVA_DEFECTO[hora] : 30;
    var tendencia = (CURVA_DEFECTO[hora + 1] || base) > base ? 'subiendo' : 'bajando';
    var nivel = base >= 80 ? 'CRÍTICO' : base >= 60 ? 'ALTO' : base >= 35 ? 'MEDIO' : 'BAJO';
    return {
      hora: hora,
      porcentaje_estimado: base,
      probabilidad_cupo: Math.max(0, 100 - base),
      tendencia: tendencia,
      nivel: nivel,
      recomendacion: base >= 80
        ? 'Estacionamiento casi lleno. Considera llegar antes o usar transporte alternativo.'
        : base >= 60
        ? 'Ocupación alta. Posibles cupos limitados.'
        : 'Buena disponibilidad de cupos.'
    };
  }

  /* ══════════════════════════════════════════════════════════════
     5) SOLICITUDES DE ACCESO (profesores primera vez)
     ══════════════════════════════════════════════════════════════ */
  async function crearSolicitud(nombre, email, cargo) {
    if (!_online) return false;
    var r = await _client.from('solicitudes_acceso').insert({
      nombre: nombre, email: email, cargo: cargo, estado: 'PENDIENTE'
    });
    return !r.error;
  }

  async function getSolicitudesPendientes() {
    if (!_online) return [];
    var r = await _client.from('solicitudes_acceso')
      .select('*').eq('estado', 'PENDIENTE').order('created_at', { ascending: false });
    if (r.error) return [];
    return r.data;
  }

  async function aprobarSolicitud(id, passwordTemp) {
    if (!_online) return null;
    var r = await _client.rpc('aprobar_solicitud', {
      p_solicitud_id: id, p_password_temp: passwordTemp || 'duoc2024'
    });
    if (r.error) { console.warn('aprobar', r.error); return null; }
    return r.data;
  }

  /* ══════════════════════════════════════════════════════════════
     6) AUTENTICACIÓN (valida contra tabla usuarios)
     ══════════════════════════════════════════════════════════════ */
  async function login(email, password) {
    if (!_online) return null;
    var r = await _client.from('usuarios')
      .select('nombre, email, rol, cargo, password_hash, activo')
      .eq('email', email.toLowerCase())
      .single();
    if (r.error || !r.data) return null;
    if (!r.data.activo) return { error: 'inactivo' };
    if (r.data.password_hash !== 'demo:' + password) return null;
    // actualizar último acceso
    _client.from('usuarios').update({ ultimo_acceso: new Date().toISOString() })
      .eq('email', email.toLowerCase()).then(function(){});
    return {
      email: r.data.email, name: r.data.nombre,
      role: r.data.rol.toLowerCase(), cargo: r.data.cargo
    };
  }

  async function getUsuarios() {
    if (!_online) return [];
    var r = await _client.from('usuarios')
      .select('nombre, email, rol, cargo, activo, ultimo_acceso')
      .order('created_at');
    if (r.error) return [];
    return r.data;
  }

  /* ── EXPORT ───────────────────────────────────────────────────── */
  return {
    init: init, isOnline: isOnline, client: client,
    getEspacios: getEspacios, getEstadisticas: getEstadisticas,
    cambiarEstadoEspacio: cambiarEstadoEspacio, suscribirEspacios: suscribirEspacios,
    consultarPatente: consultarPatente,
    generarQR: generarQR, nuevoTokenReserva: nuevoTokenReserva,
    getHistorico: getHistorico, predecirOcupacion: predecirOcupacion,
    crearSolicitud: crearSolicitud, getSolicitudesPendientes: getSolicitudesPendientes,
    aprobarSolicitud: aprobarSolicitud,
    login: login, getUsuarios: getUsuarios
  };
})();
