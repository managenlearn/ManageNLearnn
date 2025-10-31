<?php
/**
 * ====================================================
 * Archivo: agenda.php
 * Ubicación: C:\xampp\htdocs\ManageNLearn\api\agenda.php
 * Propósito: API REST para gestionar eventos de la agenda
 * ====================================================
 */

// Configuración de cabeceras para permitir peticiones desde el frontend
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir la conexión a la base de datos
require_once '../db.php';

/**
 * Función para enviar respuesta JSON
 */
function sendResponse($success, $message, $data = null) {
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // Obtener conexión a la base de datos
    $pdo = getConnection();
    
    // Determinar el método HTTP
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Obtener datos del cuerpo de la petición
    $input = json_decode(file_get_contents('php://input'), true);
    
    switch ($method) {
        
        // ========== GET: Obtener eventos del usuario ==========
        case 'GET':
            if (!isset($_GET['usuario_id'])) {
                sendResponse(false, 'Usuario ID es requerido', null);
            }
            
            $usuario_id = $_GET['usuario_id'];
            
            // Consulta para obtener todos los eventos del usuario
            $stmt = $pdo->prepare("
                SELECT 
                    id,
                    titulo,
                    descripcion,
                    fecha,
                    hora,
                    categoria,
                    color,
                    completado,
                    fecha_creacion
                FROM eventos 
                WHERE usuario_id = ? 
                ORDER BY fecha ASC, hora ASC
            ");
            
            $stmt->execute([$usuario_id]);
            $eventos = $stmt->fetchAll();
            
            // Convertir completado de 0/1 a false/true
            foreach ($eventos as &$evento) {
                $evento['completado'] = (bool)$evento['completado'];
            }
            
            sendResponse(true, 'Eventos cargados correctamente', $eventos);
            break;
        
        // ========== POST: Crear nuevo evento ==========
        case 'POST':
            // Validar datos requeridos
            if (!isset($input['usuario_id']) || !isset($input['titulo']) || !isset($input['fecha'])) {
                sendResponse(false, 'Datos incompletos. Se requiere: usuario_id, titulo, fecha', null);
            }
            
            $usuario_id = $input['usuario_id'];
            $titulo = $input['titulo'];
            $descripcion = $input['descripcion'] ?? '';
            $fecha = $input['fecha'];
            $hora = $input['hora'] ?? null;
            $categoria = $input['categoria'] ?? 'otro';
            $color = $input['color'] ?? '#b3544d';
            $completado = isset($input['completado']) ? (int)$input['completado'] : 0;
            
            // Validar formato de fecha
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
                sendResponse(false, 'Formato de fecha inválido. Use YYYY-MM-DD', null);
            }
            
            // Validar formato de hora si se proporciona
            if ($hora && !preg_match('/^\d{2}:\d{2}$/', $hora)) {
                sendResponse(false, 'Formato de hora inválido. Use HH:MM', null);
            }
            
            // Insertar nuevo evento
            $stmt = $pdo->prepare("
                INSERT INTO eventos (
                    usuario_id, 
                    titulo, 
                    descripcion, 
                    fecha, 
                    hora, 
                    categoria, 
                    color, 
                    completado
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $usuario_id,
                $titulo,
                $descripcion,
                $fecha,
                $hora,
                $categoria,
                $color,
                $completado
            ]);
            
            $evento_id = $pdo->lastInsertId();
            
            sendResponse(true, 'Evento creado correctamente', ['id' => $evento_id]);
            break;
        
        // ========== PUT: Actualizar evento existente ==========
        case 'PUT':
            // Validar datos requeridos
            if (!isset($input['id']) || !isset($input['usuario_id'])) {
                sendResponse(false, 'Se requiere ID del evento y usuario_id', null);
            }
            
            $id = $input['id'];
            $usuario_id = $input['usuario_id'];
            
            // Verificar que el evento pertenece al usuario
            $stmt = $pdo->prepare("SELECT id FROM eventos WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$id, $usuario_id]);
            
            if (!$stmt->fetch()) {
                sendResponse(false, 'Evento no encontrado o no tiene permisos', null);
            }
            
            // Preparar campos a actualizar
            $campos = [];
            $valores = [];
            
            if (isset($input['titulo'])) {
                $campos[] = "titulo = ?";
                $valores[] = $input['titulo'];
            }
            
            if (isset($input['descripcion'])) {
                $campos[] = "descripcion = ?";
                $valores[] = $input['descripcion'];
            }
            
            if (isset($input['fecha'])) {
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $input['fecha'])) {
                    sendResponse(false, 'Formato de fecha inválido', null);
                }
                $campos[] = "fecha = ?";
                $valores[] = $input['fecha'];
            }
            
            if (isset($input['hora'])) {
                if ($input['hora'] && !preg_match('/^\d{2}:\d{2}$/', $input['hora'])) {
                    sendResponse(false, 'Formato de hora inválido', null);
                }
                $campos[] = "hora = ?";
                $valores[] = $input['hora'];
            }
            
            if (isset($input['categoria'])) {
                $campos[] = "categoria = ?";
                $valores[] = $input['categoria'];
            }
            
            if (isset($input['color'])) {
                $campos[] = "color = ?";
                $valores[] = $input['color'];
            }
            
            if (isset($input['completado'])) {
                $campos[] = "completado = ?";
                $valores[] = (int)$input['completado'];
            }
            
            if (empty($campos)) {
                sendResponse(false, 'No hay datos para actualizar', null);
            }
            
            // Agregar ID al final de los valores
            $valores[] = $id;
            $valores[] = $usuario_id;
            
            // Construir y ejecutar query
            $sql = "UPDATE eventos SET " . implode(", ", $campos) . " WHERE id = ? AND usuario_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($valores);
            
            sendResponse(true, 'Evento actualizado correctamente', null);
            break;
        
        // ========== DELETE: Eliminar evento ==========
        case 'DELETE':
            // Validar datos requeridos
            if (!isset($input['id']) || !isset($input['usuario_id'])) {
                sendResponse(false, 'Se requiere ID del evento y usuario_id', null);
            }
            
            $id = $input['id'];
            $usuario_id = $input['usuario_id'];
            
            // Eliminar evento solo si pertenece al usuario
            $stmt = $pdo->prepare("DELETE FROM eventos WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$id, $usuario_id]);
            
            if ($stmt->rowCount() === 0) {
                sendResponse(false, 'Evento no encontrado o no tiene permisos', null);
            }
            
            sendResponse(true, 'Evento eliminado correctamente', null);
            break;
        
        default:
            sendResponse(false, 'Método no permitido', null);
            break;
    }
    
} catch (PDOException $e) {
    // Error de base de datos
    error_log("Error en agenda.php: " . $e->getMessage());
    sendResponse(false, 'Error en la base de datos: ' . $e->getMessage(), null);
    
} catch (Exception $e) {
    // Error general
    error_log("Error general en agenda.php: " . $e->getMessage());
    sendResponse(false, 'Error del servidor: ' . $e->getMessage(), null);
}

/**
 * ====================================================
 * ESTRUCTURA DE LA TABLA eventos (SQL)
 * ====================================================
 * 
 * CREATE TABLE eventos (
 *     id INT AUTO_INCREMENT PRIMARY KEY,
 *     usuario_id INT NOT NULL,
 *     titulo VARCHAR(200) NOT NULL,
 *     descripcion TEXT,
 *     fecha DATE NOT NULL,
 *     hora TIME,
 *     categoria ENUM('trabajo', 'personal', 'reunion', 'estudio', 'otro') DEFAULT 'otro',
 *     color VARCHAR(7) DEFAULT '#b3544d',
 *     completado TINYINT(1) DEFAULT 0,
 *     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *     FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
 *     INDEX idx_usuario (usuario_id),
 *     INDEX idx_fecha (fecha)
 * ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 * 
 * ====================================================
 * EJEMPLOS DE USO DESDE JAVASCRIPT
 * ====================================================
 * 
 * // 1. OBTENER EVENTOS
 * fetch('http://localhost/ManageNLearn/api/agenda.php?usuario_id=1')
 *   .then(res => res.json())
 *   .then(data => console.log(data));
 * 
 * // 2. CREAR EVENTO
 * fetch('http://localhost/ManageNLearn/api/agenda.php', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     usuario_id: 1,
 *     titulo: 'Reunión importante',
 *     descripcion: 'Discutir proyecto',
 *     fecha: '2025-11-15',
 *     hora: '10:30',
 *     categoria: 'reunion',
 *     color: '#2196F3',
 *     completado: false
 *   })
 * });
 * 
 * // 3. ACTUALIZAR EVENTO
 * fetch('http://localhost/ManageNLearn/api/agenda.php', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     id: 5,
 *     usuario_id: 1,
 *     completado: true
 *   })
 * });
 * 
 * // 4. ELIMINAR EVENTO
 * fetch('http://localhost/ManageNLearn/api/agenda.php', {
 *   method: 'DELETE',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     id: 5,
 *     usuario_id: 1
 *   })
 * });
 */
?>