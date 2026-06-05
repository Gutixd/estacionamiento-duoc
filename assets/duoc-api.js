/* ════════════════════════════════════════════════════════════════
   DUOC ESTACIONAMIENTO · MÓDULO DE APIs
   ────────────────────────────────────────────────────────────────
   Integraciones:
   1. Supabase (DB + Realtime)        → datos en tiempo real
   2. API Patentes Chile (Boostr.cl)  → autocompletar marca/modelo
   3. QR Codes (api.qrserver.com)     → reservas con QR
   4. Predicción de ocupación (local) → analítica horas pico
   ════════════════════════════════════════════════════════════════ */

/* ── HELPER GLOBAL: FOTO DE PERFIL (personas imagen.png) ──────────
   La imagen es un grid 3x2 con 6 avatares. Recortamos uno según el
   hash del nombre para asignar una foto consistente a cada persona.
   Inyecta la CSS base una sola vez.
*/
(function injectPersonaCSS() {
  if (document.getElementById('persona-av-css')) return;
  var st = document.createElement('style');
  st.id = 'persona-av-css';
  st.textContent =
    '.persona-av{display:inline-block;vertical-align:middle;box-sizing:border-box;background-clip:padding-box;background-image:url("./personas imagen.png");' +
    'background-size:300% 200%;background-repeat:no-repeat;background-color:#e2e8f0;}' +
    '.persona-av.pa0{background-position:0% 0%}' +
    '.persona-av.pa1{background-position:50% 0%}' +
    '.persona-av.pa2{background-position:100% 0%}' +
    '.persona-av.pa3{background-position:0% 100%}' +
    '.persona-av.pa4{background-position:50% 100%}' +
    '.persona-av.pa5{background-position:100% 100%}';
  (document.head || document.documentElement).appendChild(st);
})();

window.personaIndex = function (name) {
  var s = String(name || ''); var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 6;
  return h;
};

// Devuelve HTML de un avatar circular con foto de persona
window.personaAvatar = function (name, sizePx, borderColor) {
  var idx = window.personaIndex(name);
  var border = borderColor ? ('border:2px solid ' + borderColor + ';') : '';
  return '<div class="persona-av pa' + idx + '" title="' + (name||'') + '" ' +
    'style="width:' + sizePx + 'px;height:' + sizePx + 'px;border-radius:50%;' + border + '"></div>';
};

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
    try {
      var r = await _client.from('espacios')
        .select(`
          numero,
          sector,
          estado,
          conductor_asignado:conductor_asignado_id (
            rut,
            tipo_acceso,
            usuarios:usuario_id (nombre, email)
          ),
          vehiculo_actual:vehiculo_actual_id (patente, marca, modelo)
        `)
        .order('numero');
      
      if (r.error) throw r.error;

      return r.data.map(function(row) {
        var cond = row.conductor_asignado || {};
        var user = cond.usuarios || {};
        var veh  = row.vehiculo_actual || {};
        return {
          numero: row.numero,
          sector: row.sector,
          estado: row.estado,
          conductor: user.nombre || null,
          patente: veh.patente || null
        };
      });
    } catch(e) {
      console.warn('getEspacios error', e);
      return null;
    }
  }

  async function getEstadisticas() {
    if (!_online) return null;
    var r = await _client.from('v_estadisticas').select('*').single();
    if (r.error) { console.warn('getEstadisticas', r.error); return null; }
    return r.data;
  }

  async function cambiarEstadoEspacio(numero, estado) {
    if (!_online) return null;
    var estadoUpper = estado.toUpperCase();
    if (estadoUpper === 'LIBRE' || estadoUpper === 'BLOQUEADO') {
      await _client.from('espacios')
        .update({ conductor_asignado_id: null, vehiculo_actual_id: null })
        .eq('numero', numero);
    }
    var r = await _client.rpc('cambiar_estado_espacio', {
      p_numero: numero,
      p_estado: estadoUpper
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
      .select('id, nombre, email, rol, cargo, password_hash, activo')
      .eq('email', email.toLowerCase())
      .single();
    if (r.error || !r.data) return null;
    if (!r.data.activo) return { error: 'inactivo' };
    if (r.data.password_hash !== 'demo:' + password) return null;
    // actualizar último acceso
    _client.from('usuarios').update({ ultimo_acceso: new Date().toISOString() })
      .eq('email', email.toLowerCase()).then(function(){});
    return {
      id: r.data.id,
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

  /* ══════════════════════════════════════════════════════════════
     7) RESERVAS — cargar reservas de un usuario / crear / cancelar
     ══════════════════════════════════════════════════════════════ */
  async function getReservasUsuario(usuarioEmail) {
    if (!_online) return null;
    try {
      var userRes = await _client.from('usuarios').select('id').eq('email', usuarioEmail.toLowerCase()).single();
      if (userRes.error || !userRes.data) return null;
      var userId = userRes.data.id;

      var r = await _client.from('reservas')
        .select('id, motivo, qr_token, fecha_inicio, fecha_fin, estado, espacios(numero, sector)')
        .eq('creada_por', userId)
        .in('estado', ['PENDIENTE', 'ACTIVA'])
        .order('created_at', { ascending: false });
      
      if (r.error) { console.warn('getReservasUsuario error', r.error); return null; }
      
      // Mapear al formato esperado en el frontend
      return r.data.map(function(row) {
        var esp = row.espacios || {};
        var horaStr = '';
        try {
          var dIni = new Date(row.fecha_inicio);
          var dFin = new Date(row.fecha_fin);
          var hIni = dIni.getHours().toString().padStart(2, '0') + ':' + dIni.getMinutes().toString().padStart(2, '0');
          var hFin = dFin.getHours().toString().padStart(2, '0') + ':' + dFin.getMinutes().toString().padStart(2, '0');
          horaStr = hIni + '–' + hFin;
        } catch(e) {
          horaStr = '08:00–12:00';
        }
        var fechaStr = '';
        try {
          var dIni = new Date(row.fecha_inicio);
          fechaStr = dIni.getDate().toString().padStart(2,'0') + '-' + (dIni.getMonth()+1).toString().padStart(2,'0') + '-' + dIni.getFullYear();
        } catch(e) {
          fechaStr = '05-06-2026';
        }
        return {
          id: row.id,
          espacio: 'E-' + esp.numero,
          sector: esp.sector || 'A',
          fecha: fechaStr,
          hora: horaStr,
          estado: row.estado.toLowerCase()
        };
      });
    } catch(e) {
      console.warn('getReservasUsuario exception', e);
      return null;
    }
  }

  async function getConductorYVehiculoPorEmail(email, patenteInput) {
    if (!_online) return null;
    try {
      var userRes = await _client.from('usuarios').select('id, nombre').eq('email', email.toLowerCase()).single();
      if (userRes.error || !userRes.data) return null;
      var userId = userRes.data.id;

      var condRes = await _client.from('conductores').select('id').eq('usuario_id', userId).single();
      if (condRes.error || !condRes.data) return null;
      var conductorId = condRes.data.id;

      var vehId = null;
      if (patenteInput) {
        var patenteLimpia = patenteInput.toUpperCase().replace(/\s|-/g, '');
        var vehRes = await _client.from('vehiculos').select('id').eq('patente', patenteLimpia).single();
        if (!vehRes.error && vehRes.data) {
          vehId = vehRes.data.id;
        } else {
          var insertVeh = await _client.from('vehiculos').insert({
            conductor_id: conductorId,
            patente: patenteLimpia,
            marca: 'Toyota',
            modelo: 'Yaris',
            color: 'Gris',
            anio: 2020,
            activo: true
          }).select();
          if (!insertVeh.error && insertVeh.data && insertVeh.data.length > 0) {
            vehId = insertVeh.data[0].id;
          }
        }
      }
      return { userId: userId, conductorId: conductorId, vehiculoId: vehId, nombreConductor: userRes.data.nombre };
    } catch(e) {
      console.warn('getConductorYVehiculoPorEmail error', e);
      return null;
    }
  }

  async function getEspacioDetalle(numeroSpace) {
    if (!_online) return null;
    try {
      var r = await _client.from('espacios')
        .select(`
          numero,
          sector,
          estado,
          conductor_asignado:conductor_asignado_id (
            rut,
            tipo_acceso,
            usuarios:usuario_id (nombre, email)
          ),
          vehiculo_actual:vehiculo_actual_id (patente, marca, modelo)
        `)
        .eq('numero', numeroSpace)
        .single();
      
      if (r.error || !r.data) return null;
      
      var cond = r.data.conductor_asignado || {};
      var user = cond.usuarios || {};
      var veh  = r.data.vehiculo_actual || {};
      
      return {
        numero: r.data.numero,
        sector: r.data.sector,
        estado: r.data.estado,
        conductor: user.nombre || null,
        patente: veh.patente || null
      };
    } catch(e) {
      console.warn('getEspacioDetalle error', e);
      return null;
    }
  }

  async function crearReserva(usuarioEmail, numeroEspacio, motivo, fecha, horaInicio, horaFin, patente) {
    if (!_online) return { success: true, offline: true };
    try {
      var info = await getConductorYVehiculoPorEmail(usuarioEmail, patente);
      if (!info) throw new Error('No se pudo encontrar el conductor asociado');
      var userId = info.userId;
      var conductorId = info.conductorId;
      var vehiculoId = info.vehiculoId;

      var espRes = await _client.from('espacios').select('id, estado').eq('numero', numeroEspacio).single();
      if (espRes.error || !espRes.data) throw new Error('Espacio no encontrado');
      var espacioId = espRes.data.id;

      if (espRes.data.estado !== 'LIBRE') {
        throw new Error('El espacio no está disponible');
      }

      var qrToken = 'E' + numeroEspacio + '-' + Date.now().toString(36).toUpperCase();
      var fInicio = new Date(fecha + 'T' + horaInicio + ':00');
      var fFin = new Date(fecha + 'T' + horaFin + ':00');

      var insertRes = await _client.from('reservas').insert({
        espacio_id: espacioId,
        creada_por: userId,
        motivo: motivo || 'Reserva Docente',
        qr_token: qrToken,
        fecha_inicio: fInicio.toISOString(),
        fecha_fin: fFin.toISOString(),
        estado: 'ACTIVA'
      }).select();

      if (insertRes.error) throw insertRes.error;

      var updateEsp = await _client.from('espacios')
        .update({
          estado: 'RESERVADO',
          conductor_asignado_id: conductorId,
          vehiculo_actual_id: vehiculoId
        })
        .eq('numero', numeroEspacio);
      
      if (updateEsp.error) throw updateEsp.error;

      return { success: true, data: insertRes.data[0] };
    } catch (e) {
      console.warn('crearReserva error:', e.message);
      return { success: false, error: e.message };
    }
  }

  async function cancelarReserva(reservaId, numeroEspacio) {
    if (!_online) return { success: true, offline: true };
    try {
      var r = await _client.from('reservas').update({ estado: 'CANCELADA' }).eq('id', reservaId);
      if (r.error) throw r.error;
      
      var updateEsp = await _client.from('espacios')
        .update({
          estado: 'LIBRE',
          conductor_asignado_id: null,
          vehiculo_actual_id: null
        })
        .eq('numero', numeroEspacio);
      
      if (updateEsp.error) throw updateEsp.error;
      return { success: true };
    } catch(e) {
      console.warn('cancelarReserva error:', e.message);
      return { success: false, error: e.message };
    }
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
    login: login, getUsuarios: getUsuarios,
    getReservasUsuario: getReservasUsuario, crearReserva: crearReserva, cancelarReserva: cancelarReserva,
    getEspacioDetalle: getEspacioDetalle
  };
})();
