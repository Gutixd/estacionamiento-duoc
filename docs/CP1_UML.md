# Modelos UML - Gestión Inteligente de Estacionamientos
## Duoc UC Sede Maipú | BootcampCodecAI | Checkpoint 1

**Equipo:** Diego Gutierrez · Benjamin Mella · Genesis Hernandez  
**Fecha:** 05-06-2026 | **Versión:** 1.0

> 💡 Para visualizar los diagramas: abre este archivo en VS Code con la extensión "Markdown Preview Mermaid Support", o pégalos en https://mermaid.live

---

## 1. Diagrama de Casos de Uso

```mermaid
flowchart TD
    %% Actores
    G([👮 Guardia])
    JS([🔒 Jefe Seguridad])
    C([🚗 Conductor])
    JSG([🏢 Jefe Serv. Generales])
    SA([⚙️ Super Admin])
    D([📊 Directivos])

    %% Sistema
    subgraph SISTEMA["🅿️ Sistema de Gestión de Estacionamientos"]
        
        subgraph AUTH["Autenticación"]
            UC01[Iniciar Sesión]
            UC02[Cerrar Sesión]
        end

        subgraph PANEL["Panel Tiempo Real"]
            UC03[Ver Panel de Ocupación]
            UC04[Ver Estado de Espacios]
            UC05[Buscar Vehículo por Patente]
        end

        subgraph REGISTRO["Registro de Acceso"]
            UC06[Registrar Ingreso Vehículo]
            UC07[Registrar Salida Vehículo]
            UC08[Ver Historial de Ingresos]
        end

        subgraph GESTION["Gestión de Espacios"]
            UC09[Reservar Espacio]
            UC10[Bloquear Espacio]
            UC11[Liberar Espacio]
            UC12[Asignar Espacio Fijo]
        end

        subgraph COMUNICACION["Comunicación"]
            UC13[Enviar Alerta a Conductor]
            UC14[Contactar Guardia]
            UC15[Recibir Notificación]
        end

        subgraph CONDUCTOR_MOD["Módulo Conductor"]
            UC16[Ver Ocupación General]
            UC17[Registrar Mi Ingreso]
            UC18[Registrar Mi Salida]
            UC19[Ver Mi Espacio]
        end

        subgraph ADMIN["Administración"]
            UC20[Enrolar Conductor]
            UC21[Dar de Baja Conductor]
            UC22[Gestionar Usuarios]
            UC23[Asignar Roles]
        end

        subgraph REPORTES["Reportes y Analytics"]
            UC24[Ver Dashboard Ejecutivo]
            UC25[Ver Reportes de Tendencias]
            UC26[Exportar Reportes PDF/CSV]
            UC27[Ver KPIs de Ocupación]
        end

    end

    %% Relaciones Guardia
    G --> UC01
    G --> UC03
    G --> UC04
    G --> UC05
    G --> UC06
    G --> UC07
    G --> UC13

    %% Relaciones Jefe Seguridad
    JS --> UC01
    JS --> UC03
    JS --> UC09
    JS --> UC10
    JS --> UC11
    JS --> UC12
    JS --> UC08

    %% Relaciones Conductor
    C --> UC01
    C --> UC16
    C --> UC17
    C --> UC18
    C --> UC19
    C --> UC14
    C --> UC15

    %% Relaciones Jefe Servicios Generales
    JSG --> UC01
    JSG --> UC25
    JSG --> UC26
    JSG --> UC27
    JSG --> UC22

    %% Relaciones Super Admin
    SA --> UC01
    SA --> UC20
    SA --> UC21
    SA --> UC22
    SA --> UC23
    SA --> UC03

    %% Relaciones Directivos
    D --> UC01
    D --> UC24
    D --> UC27
```

---

## 2. Diagrama de Clases

```mermaid
classDiagram

    class Usuario {
        +UUID id
        +String nombre
        +String email
        +String password_hash
        +Enum rol
        +Boolean activo
        +DateTime created_at
        +iniciarSesion()
        +cerrarSesion()
        +actualizarPerfil()
    }

    class Conductor {
        +UUID id
        +UUID usuario_id
        +String rut
        +String telefono
        +Boolean tiene_espacio_fijo
        +registrarIngreso()
        +registrarSalida()
        +verOcupacion()
    }

    class Vehiculo {
        +UUID id
        +UUID conductor_id
        +String patente
        +String marca
        +String modelo
        +String color
        +Boolean activo
        +getInfo()
    }

    class Espacio {
        +UUID id
        +Integer numero
        +String sector
        +Enum estado
        +UUID conductor_asignado_id
        +getEstado()
        +ocupar()
        +liberar()
        +reservar()
        +bloquear()
    }

    class Registro {
        +UUID id
        +UUID vehiculo_id
        +UUID espacio_id
        +UUID usuario_registro_id
        +DateTime hora_ingreso
        +DateTime hora_salida
        +Enum tipo
        +String observacion
        +registrarIngreso()
        +registrarSalida()
        +getDuracion()
    }

    class Reserva {
        +UUID id
        +UUID espacio_id
        +UUID creada_por_id
        +String motivo
        +DateTime fecha_inicio
        +DateTime fecha_fin
        +Enum estado
        +crear()
        +cancelar()
        +activar()
    }

    class Bloqueo {
        +UUID id
        +UUID espacio_id
        +UUID creado_por_id
        +String motivo
        +DateTime fecha_inicio
        +DateTime fecha_fin
        +Boolean activo
        +crear()
        +levantar()
    }

    class Notificacion {
        +UUID id
        +UUID remitente_id
        +UUID destinatario_id
        +UUID espacio_id
        +String mensaje
        +Boolean leida
        +DateTime created_at
        +Enum tipo
        +enviar()
        +marcarLeida()
    }

    class Reporte {
        +UUID id
        +UUID generado_por_id
        +Enum tipo
        +Date fecha_inicio
        +Date fecha_fin
        +JSON data
        +DateTime created_at
        +generar()
        +exportarPDF()
        +exportarCSV()
    }

    %% Roles (Enum en BD, aquí representado como clase abstracta)
    class Rol {
        <<enumeration>>
        GUARDIA
        JEFE_SEGURIDAD
        CONDUCTOR
        JEFE_SERVICIOS_GENERALES
        SUPER_ADMIN
        DIRECTIVO
    }

    class EstadoEspacio {
        <<enumeration>>
        LIBRE
        OCUPADO
        RESERVADO
        BLOQUEADO
    }

    %% Relaciones
    Usuario "1" --> "1" Rol : tiene
    Usuario "1" --> "0..1" Conductor : es
    Conductor "1" --> "1..*" Vehiculo : posee
    Vehiculo "1" --> "0..*" Registro : genera
    Espacio "1" --> "0..*" Registro : contiene
    Espacio "1" --> "0..*" Reserva : tiene
    Espacio "1" --> "0..*" Bloqueo : tiene
    Espacio "1" --> "1" EstadoEspacio : tiene
    Usuario "1" --> "0..*" Notificacion : envía
    Usuario "1" --> "0..*" Notificacion : recibe
    Usuario "1" --> "0..*" Reporte : genera
    Espacio "0..1" --> "0..1" Conductor : asignado_a
```

---

## 3. Diagrama Entidad-Relación (BD)

```mermaid
erDiagram

    USUARIOS {
        uuid id PK
        varchar nombre
        varchar email UK
        varchar password_hash
        enum rol
        boolean activo
        timestamp created_at
        timestamp updated_at
    }

    CONDUCTORES {
        uuid id PK
        uuid usuario_id FK
        varchar rut UK
        varchar telefono
        boolean tiene_espacio_fijo
        timestamp created_at
    }

    VEHICULOS {
        uuid id PK
        uuid conductor_id FK
        varchar patente UK
        varchar marca
        varchar modelo
        varchar color
        boolean activo
        timestamp created_at
    }

    ESPACIOS {
        uuid id PK
        integer numero UK
        varchar sector
        enum estado
        uuid conductor_asignado_id FK
        timestamp updated_at
    }

    REGISTROS {
        uuid id PK
        uuid vehiculo_id FK
        uuid espacio_id FK
        uuid registrado_por FK
        timestamp hora_ingreso
        timestamp hora_salida
        enum tipo
        text observacion
    }

    RESERVAS {
        uuid id PK
        uuid espacio_id FK
        uuid creada_por FK
        varchar motivo
        timestamp fecha_inicio
        timestamp fecha_fin
        enum estado
        timestamp created_at
    }

    BLOQUEOS {
        uuid id PK
        uuid espacio_id FK
        uuid creado_por FK
        varchar motivo
        timestamp fecha_inicio
        timestamp fecha_fin
        boolean activo
        timestamp created_at
    }

    NOTIFICACIONES {
        uuid id PK
        uuid remitente_id FK
        uuid destinatario_id FK
        uuid espacio_id FK
        text mensaje
        boolean leida
        enum tipo
        timestamp created_at
    }

    REPORTES {
        uuid id PK
        uuid generado_por FK
        enum tipo
        date fecha_inicio
        date fecha_fin
        jsonb data
        timestamp created_at
    }

    %% Relaciones
    USUARIOS ||--o| CONDUCTORES : "es"
    CONDUCTORES ||--|{ VEHICULOS : "posee"
    VEHICULOS ||--o{ REGISTROS : "genera"
    ESPACIOS ||--o{ REGISTROS : "registra"
    ESPACIOS ||--o{ RESERVAS : "tiene"
    ESPACIOS ||--o{ BLOQUEOS : "tiene"
    ESPACIOS }o--o| CONDUCTORES : "asignado a"
    USUARIOS ||--o{ NOTIFICACIONES : "envía"
    USUARIOS ||--o{ NOTIFICACIONES : "recibe"
    USUARIOS ||--o{ REPORTES : "genera"
    USUARIOS ||--o{ REGISTROS : "registra"
    USUARIOS ||--o{ RESERVAS : "crea"
    USUARIOS ||--o{ BLOQUEOS : "crea"
```

---

## 4. Diagrama de Secuencia - Ingreso de Vehículo

```mermaid
sequenceDiagram
    actor C as Conductor
    actor G as Guardia
    participant APP as App Web
    participant API as Supabase API
    participant DB as PostgreSQL
    participant RT as Realtime Channel

    C->>APP: Llega al estacionamiento
    G->>APP: Busca patente del vehículo
    APP->>API: GET /vehiculos?patente=ABC123
    API->>DB: SELECT * FROM vehiculos WHERE patente='ABC123'
    DB-->>API: datos vehículo + conductor
    API-->>APP: vehiculo { id, conductor, espacio_asignado }
    APP-->>G: Muestra info conductor

    G->>APP: Registra ingreso (vehiculo_id, espacio_id)
    APP->>API: POST /registros { vehiculo_id, espacio_id, hora_ingreso }
    API->>DB: INSERT INTO registros (...)
    API->>DB: UPDATE espacios SET estado='OCUPADO' WHERE id=espacio_id
    DB-->>API: OK

    API->>RT: BROADCAST evento 'espacio_actualizado'
    RT-->>APP: Notificación en tiempo real (todos los clientes)
    APP-->>G: Panel actualizado ✅
    APP-->>C: Vista conductor actualizada ✅
```

---

## 5. Diagrama de Secuencia - Reserva de Espacio

```mermaid
sequenceDiagram
    actor JS as Jefe Seguridad
    participant APP as App Web
    participant API as Supabase API
    participant DB as PostgreSQL
    participant RT as Realtime Channel

    JS->>APP: Selecciona espacio libre en panel
    JS->>APP: Ingresa motivo y rango de fechas
    APP->>API: POST /reservas { espacio_id, motivo, fecha_inicio, fecha_fin }
    API->>DB: Verifica espacio disponible
    DB-->>API: Espacio libre ✅

    API->>DB: INSERT INTO reservas (...)
    API->>DB: UPDATE espacios SET estado='RESERVADO' WHERE id=espacio_id
    DB-->>API: OK

    API->>RT: BROADCAST 'espacio_actualizado'
    RT-->>APP: Panel actualizado en todos los clientes
    APP-->>JS: Confirmación de reserva ✅
```

---

## 6. Diagrama de Secuencia - Autenticación por Rol

```mermaid
sequenceDiagram
    actor U as Usuario
    participant APP as App Web (Next.js)
    participant AUTH as Supabase Auth
    participant DB as PostgreSQL

    U->>APP: Ingresa email + contraseña
    APP->>AUTH: signInWithPassword({ email, password })
    AUTH->>DB: Verifica credenciales
    DB-->>AUTH: Usuario válido + rol

    AUTH-->>APP: session { access_token, user }
    APP->>DB: SELECT rol FROM usuarios WHERE id = user.id
    DB-->>APP: rol = 'GUARDIA' | 'CONDUCTOR' | etc.

    alt rol = GUARDIA
        APP-->>U: Redirige a /dashboard/guardia
    else rol = CONDUCTOR
        APP-->>U: Redirige a /dashboard/conductor
    else rol = SUPER_ADMIN
        APP-->>U: Redirige a /dashboard/admin
    else rol = JEFE_SEGURIDAD
        APP-->>U: Redirige a /dashboard/seguridad
    else rol = JEFE_SERVICIOS_GENERALES
        APP-->>U: Redirige a /dashboard/servicios
    else rol = DIRECTIVO
        APP-->>U: Redirige a /dashboard/ejecutivo
    end
```

---

## 7. Resumen de Entidades y Estados

### Estados de un Espacio
```
LIBRE → OCUPADO       (ingreso vehículo)
LIBRE → RESERVADO     (jefe crea reserva)
LIBRE → BLOQUEADO     (jefe crea bloqueo)
OCUPADO → LIBRE       (salida vehículo)
RESERVADO → LIBRE     (reserva cancelada/expirada)
RESERVADO → OCUPADO   (vehículo ingresa en reserva)
BLOQUEADO → LIBRE     (bloqueo levantado)
```

### Roles y sus Dashboards
| Rol | Dashboard | Acceso |
|-----|-----------|--------|
| GUARDIA | `/dashboard/guardia` | Panel + Registro ingreso/salida |
| JEFE_SEGURIDAD | `/dashboard/seguridad` | Panel + Reservas + Bloqueos |
| CONDUCTOR | `/dashboard/conductor` | Ocupación + Mi espacio + Mensajes |
| JEFE_SERVICIOS_GENERALES | `/dashboard/servicios` | Reportes + Gestión |
| SUPER_ADMIN | `/dashboard/admin` | Todo |
| DIRECTIVO | `/dashboard/ejecutivo` | Solo lectura - KPIs |
