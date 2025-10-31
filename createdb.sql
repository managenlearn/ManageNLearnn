-- ====================================================
-- Script de creación de base de datos ManageNLearn
-- Ejecutar este archivo en phpMyAdmin o línea de comandos
-- ====================================================

-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS managenlearn 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE managenlearn;

-- ====================================================
-- Tabla: usuarios
-- Almacena información de los usuarios registrados
-- ====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primer_nombre VARCHAR(50) NOT NULL,
    segundo_nombre VARCHAR(50) DEFAULT NULL,
    apellidos VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    centro VARCHAR(200) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo_centro VARCHAR(150) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_correo (correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Tabla: proyectos
-- Almacena los proyectos de cada usuario
-- ====================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_entrega DATE NOT NULL,
    estado ENUM('pendiente', 'en-proceso', 'completado') DEFAULT 'pendiente',
    enlace VARCHAR(500) DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Tabla: eventos
-- Almacena los eventos de la agenda de cada usuario
-- ====================================================
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Tabla: opiniones
-- Almacena las opiniones/reseñas de los usuarios
-- ====================================================
CREATE TABLE IF NOT EXISTS opiniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Verificación de tablas creadas
-- ====================================================

-- Agregar tabla de estadísticas al schema existente
USE managenlearn;

-- ====================================================
-- Tabla de Eventos - ManageNLearn
-- Ejecutar en phpMyAdmin después de crear la base de datos
-- ====================================================

USE managenlearn;

-- Eliminar tabla anterior si existe (CUIDADO: borra todos los datos)
DROP TABLE IF EXISTS eventos;

-- Crear tabla de eventos con todos los campos necesarios
CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME,
    categoria ENUM('trabajo', 'personal', 'reunion', 'estudio', 'otro') DEFAULT 'otro',
    color VARCHAR(7) DEFAULT '#b3544d',
    completado TINYINT(1) DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación con tabla usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para mejorar rendimiento
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha),
    INDEX idx_completado (completado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Datos de prueba (opcional - comentar si no necesitas)
-- ====================================================

-- Insertar algunos eventos de ejemplo para el usuario con ID 1
-- Asegúrate de que exista un usuario con ID 1 primero

INSERT INTO eventos (usuario_id, titulo, descripcion, fecha, hora, categoria, color, completado) VALUES
(1, 'Reunión de equipo', 'Discutir avances del proyecto', '2025-11-01', '10:00:00', 'reunion', '#2196F3', 0),
(1, 'Entrega de proyecto', 'Presentar proyecto final', '2025-11-05', '15:30:00', 'trabajo', '#f44336', 0),
(1, 'Clase de programación', 'Aprender sobre APIs REST', '2025-11-03', '14:00:00', 'estudio', '#4CAF50', 0),
(1, 'Cita médica', 'Chequeo general', '2025-11-07', '09:00:00', 'personal', '#ff9800', 0),
(1, 'Reunión con cliente', 'Discutir requerimientos', '2025-11-02', '11:00:00', 'reunion', '#9C27B0', 1);

-- ====================================================
-- Verificar creación de tabla
-- ====================================================

-- Ver estructura de la tabla
DESCRIBE eventos;

-- Ver eventos insertados
SELECT * FROM eventos;

-- ====================================================
-- Consultas útiles para administración
-- ====================================================

-- Contar eventos por usuario
-- SELECT usuario_id, COUNT(*) as total_eventos 
-- FROM eventos 
-- GROUP BY usuario_id;

-- Ver eventos próximos (próximos 7 días)
-- SELECT * FROM eventos 
-- WHERE fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
-- ORDER BY fecha ASC;

-- Ver eventos completados
-- SELECT * FROM eventos 
-- WHERE completado = 1 
-- ORDER BY fecha DESC;

-- Ver eventos pendientes y urgentes (próximos 3 días)
-- SELECT * FROM eventos 
-- WHERE completado = 0 
-- AND fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
-- ORDER BY fecha ASC;

-- ====================================================
-- Notas importantes
-- ====================================================

/*
1. FORMATO DE FECHA: Usar 'YYYY-MM-DD' (ej: '2025-11-15')
2. FORMATO DE HORA: Usar 'HH:MM:SS' o 'HH:MM' (ej: '14:30:00' o '14:30')
3. CATEGORÍAS VÁLIDAS: 'trabajo', 'personal', 'reunion', 'estudio', 'otro'
4. COLOR: Formato hexadecimal con # (ej: '#b3544d')
5. COMPLETADO: 0 = pendiente, 1 = completado

RELACIÓN CON USUARIOS:
- ON DELETE CASCADE: Si se elimina un usuario, se eliminan automáticamente todos sus eventos
- Esto mantiene la integridad de la base de datos

ÍNDICES:
- idx_usuario: Acelera búsquedas por usuario
- idx_fecha: Acelera búsquedas y ordenamiento por fecha
- idx_completado: Acelera filtros de eventos completados/pendientes
*/

-- ====================================================
-- Tabla de Opiniones - ManageNLearn
-- Ejecutar en phpMyAdmin después de crear la base de datos
-- ====================================================

USE managenlearn;

-- Eliminar tabla anterior si existe (CUIDADO: borra todos los datos)
DROP TABLE IF EXISTS opiniones;

-- Crear tabla de opiniones actualizada
CREATE TABLE opiniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    texto TEXT NOT NULL,
    calificacion INT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación con tabla usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para mejorar rendimiento
    INDEX idx_usuario (usuario_id),
    INDEX idx_calificacion (calificacion),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Datos de prueba (opcional)
-- ====================================================

-- Insertar algunas opiniones de ejemplo
INSERT INTO opiniones (usuario_id, nombre, texto, calificacion) VALUES
(1, 'María González', 'Excelente plataforma para gestionar mi institución. Todo está organizado y es muy fácil de usar.', 5),
(1, 'Carlos Ramírez', 'Ha revolucionado la forma en que administramos nuestros proyectos. Altamente recomendado.', 5),
(1, 'Ana Martínez', 'Muy intuitivo y completo. El soporte técnico es excelente y siempre están dispuestos a ayudar.', 4);

-- ====================================================
-- Verificar creación de tabla
-- ====================================================

-- Ver estructura de la tabla
DESCRIBE opiniones;

-- Ver opiniones insertadas
SELECT * FROM opiniones;

-- ====================================================
-- Consultas útiles
-- ====================================================

-- Ver opiniones de un usuario específico
-- SELECT * FROM opiniones WHERE usuario_id = 1 ORDER BY fecha_creacion DESC;

-- Ver opiniones por calificación
-- SELECT nombre, texto, calificacion FROM opiniones WHERE calificacion = 5;

-- Promedio de calificaciones
-- SELECT AVG(calificacion) as promedio FROM opiniones;

-- Contar opiniones por calificación
-- SELECT calificacion, COUNT(*) as cantidad 
-- FROM opiniones 
-- GROUP BY calificacion 
-- ORDER BY calificacion DESC;

-- ====================================================
-- Notas importantes
-- ====================================================

/*
1. FORMATO DE CALIFICACIÓN: Solo acepta valores entre 1 y 5 (estrellas)
2. NOMBRE: Nombre público que se mostrará con la opinión
3. TEXTO: Contenido de la opinión/reseña
4. USUARIO_ID: Referencia al usuario que creó la opinión

RELACIÓN CON USUARIOS:
- ON DELETE CASCADE: Si se elimina un usuario, se eliminan automáticamente todas sus opiniones
- Esto mantiene la integridad de la base de datos

ÍNDICES:
- idx_usuario: Acelera búsquedas por usuario
- idx_calificacion: Acelera filtros por estrellas
- idx_fecha: Acelera ordenamiento por fecha
*/

-- ====================================================
-- Actualización de tabla proyectos - ManageNLearn
-- Ejecutar en phpMyAdmin
-- ====================================================

USE managenlearn;

-- Eliminar tabla anterior para recrearla con todos los campos
DROP TABLE IF EXISTS proyectos;

-- Crear tabla de proyectos con todos los campos necesarios
CREATE TABLE proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_entrega DATE NOT NULL,
    estado ENUM('pendiente', 'en-proceso', 'completado') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    enlace VARCHAR(500) DEFAULT NULL,
    progreso INT DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    etiquetas JSON DEFAULT NULL,
    notas TEXT DEFAULT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relación con tabla usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Índices para mejorar rendimiento
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_entrega (fecha_entrega),
    INDEX idx_prioridad (prioridad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Datos de prueba (opcional)
-- ====================================================

-- Insertar algunos proyectos de ejemplo para el usuario con ID 1
-- Asegúrate de que exista un usuario con ID 1 primero

INSERT INTO proyectos (usuario_id, nombre, descripcion, fecha_entrega, estado, prioridad, enlace, progreso, etiquetas, notas) VALUES
(1, 'Sistema de gestión escolar', 'Desarrollar un sistema completo para administrar estudiantes, profesores y materias', '2025-12-15', 'en-proceso', 'alta', 'https://github.com/tu-usuario/proyecto', 45, '["urgente", "importante", "backend"]', 'Reunión semanal los lunes a las 10am'),
(1, 'Diseño de landing page', 'Crear una landing page moderna y responsive para el nuevo producto', '2025-11-20', 'pendiente', 'media', 'https://figma.com/file/ejemplo', 0, '["diseño", "frontend", "urgente"]', 'Usar colores corporativos'),
(1, 'Investigación de mercado', 'Analizar tendencias del mercado para Q4 2025', '2025-11-10', 'en-proceso', 'alta', NULL, 70, '["investigación", "análisis"]', 'Enfocarse en competencia directa'),
(1, 'App móvil fitness', 'Aplicación para tracking de ejercicios y nutrición', '2025-12-30', 'pendiente', 'baja', 'https://trello.com/proyecto-fitness', 15, '["móvil", "salud", "react-native"]', NULL),
(1, 'Migración de base de datos', 'Migrar de MySQL a PostgreSQL', '2025-11-05', 'completado', 'alta', NULL, 100, '["backend", "base-de-datos"]', 'Completado exitosamente');

-- ====================================================
-- Verificar creación de tabla
-- ====================================================

-- Ver estructura de la tabla
DESCRIBE proyectos;

-- Ver proyectos insertados
SELECT * FROM proyectos;

-- ====================================================
-- Consultas útiles para administración
-- ====================================================

-- Contar proyectos por usuario
-- SELECT usuario_id, COUNT(*) as total_proyectos 
-- FROM proyectos 
-- GROUP BY usuario_id;

-- Ver proyectos por estado
-- SELECT estado, COUNT(*) as cantidad 
-- FROM proyectos 
-- WHERE usuario_id = 1 
-- GROUP BY estado;

-- Ver proyectos próximos a vencer (próximos 7 días)
-- SELECT nombre, fecha_entrega, DATEDIFF(fecha_entrega, CURDATE()) as dias_restantes
-- FROM proyectos 
-- WHERE estado != 'completado'
-- AND fecha_entrega BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
-- ORDER BY fecha_entrega ASC;

-- Ver proyectos vencidos
-- SELECT nombre, fecha_entrega, DATEDIFF(CURDATE(), fecha_entrega) as dias_vencido
-- FROM proyectos 
-- WHERE estado != 'completado' 
-- AND fecha_entrega < CURDATE()
-- ORDER BY fecha_entrega ASC;

-- Proyectos por prioridad
-- SELECT prioridad, COUNT(*) as cantidad 
-- FROM proyectos 
-- WHERE usuario_id = 1 AND estado != 'completado'
-- GROUP BY prioridad 
-- ORDER BY FIELD(prioridad, 'alta', 'media', 'baja');

-- ====================================================
-- Notas importantes
-- ====================================================

/*
CAMPOS AÑADIDOS:
1. prioridad: Nivel de importancia del proyecto (baja, media, alta)
2. progreso: Porcentaje de avance (0-100)
3. etiquetas: Array de etiquetas en formato JSON
4. notas: Campo de texto para notas adicionales

FORMATO JSON para etiquetas:
- MySQL 5.7+ soporta tipo JSON nativo
- Ejemplo: ["urgente", "importante", "frontend"]
- Se puede buscar dentro del JSON con funciones JSON de MySQL

VENTAJAS de usar JSON:
- No necesita tabla adicional para etiquetas
- Flexible para añadir/quitar etiquetas
- Fácil de consultar y actualizar

ÍNDICES:
- Mejoran significativamente la velocidad de búsqueda
- idx_usuario: Para filtrar proyectos por usuario
- idx_estado: Para filtrar por estado (pendiente, en-proceso, completado)
- idx_fecha_entrega: Para ordenar y filtrar por fecha
- idx_prioridad: Para filtrar por prioridad
*/

