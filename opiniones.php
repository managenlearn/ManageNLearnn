<?php
/**
 * ====================================================
 * Archivo: opiniones.php
 * Ubicación: C:\xampp\htdocs\ManageNLearn\api\opiniones.php
 * Propósito: API REST para gestionar opiniones/reseñas
 * ====================================================
 */

// Configuración de cabeceras
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
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
        
        // ========== GET: Obtener todas las opiniones ==========
        case 'GET':
            // Obtener todas las opiniones ordenadas por fecha (más recientes primero)
            $stmt = $pdo->prepare("
                SELECT 
                    o.id,
                    o.usuario_id,
                    o.nombre,
                    o.texto,
                    o.calificacion,
                    o.fecha_creacion,
                    u.primer_nombre,
                    u.apellidos
                FROM opiniones o
                LEFT JOIN usuarios u ON o.usuario_id = u.id
                ORDER BY o.fecha_creacion DESC
            ");
            
            $stmt->execute();
            $opiniones = $stmt->fetchAll();
            
            // Convertir calificación a formato de estrellas
            foreach ($opiniones as &$opinion) {
                $estrellas = str_repeat('⭐', (int)$opinion['calificacion']);
                $opinion['estrellas'] = $estrellas;
            }
            
            sendResponse(true, 'Opiniones cargadas correctamente', $opiniones);
            break;
        
        // ========== POST: Crear nueva opinión ==========
        case 'POST':
            // Validar datos requeridos
            if (!isset($input['usuario_id']) || !isset($input['nombre']) || 
                !isset($input['texto']) || !isset($input['calificacion'])) {
                sendResponse(false, 'Datos incompletos. Se requiere: usuario_id, nombre, texto, calificacion', null);
            }
            
            $usuario_id = $input['usuario_id'];
            $nombre = trim($input['nombre']);
            $texto = trim($input['texto']);
            $calificacion = (int)$input['calificacion'];
            
            // Validar nombre
            if (empty($nombre) || strlen($nombre) < 3) {
                sendResponse(false, 'El nombre debe tener al menos 3 caracteres', null);
            }
            
            // Validar texto
            if (empty($texto) || strlen($texto) < 10) {
                sendResponse(false, 'La opinión debe tener al menos 10 caracteres', null);
            }
            
            // Validar calificación (1-5 estrellas)
            if ($calificacion < 1 || $calificacion > 5) {
                sendResponse(false, 'La calificación debe estar entre 1 y 5 estrellas', null);
            }
            
            // Verificar que el usuario existe
            $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
            $stmt->execute([$usuario_id]);
            if (!$stmt->fetch()) {
                sendResponse(false, 'Usuario no encontrado', null);
            }
            
            // Insertar nueva opinión
            $stmt = $pdo->prepare("
                INSERT INTO opiniones (
                    usuario_id, 
                    nombre, 
                    texto, 
                    calificacion
                ) VALUES (?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $usuario_id,
                $nombre,
                $texto,
                $calificacion
            ]);
            
            $opinion_id = $pdo->lastInsertId();
            
            sendResponse(true, 'Opinión creada correctamente', ['id' => $opinion_id]);
            break;
        
        // ========== DELETE: Eliminar opinión ==========
        case 'DELETE':
            // Validar datos requeridos
            if (!isset($input['id']) || !isset($input['usuario_id'])) {
                sendResponse(false, 'Se requiere ID de la opinión y usuario_id', null);
            }
            
            $id = $input['id'];
            $usuario_id = $input['usuario_id'];
            
            // Verificar que la opinión existe y pertenece al usuario
            $stmt = $pdo->prepare("SELECT id FROM opiniones WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$id, $usuario_id]);
            
            if (!$stmt->fetch()) {
                sendResponse(false, 'Opinión no encontrada o no tiene permisos para eliminarla', null);
            }
            
            // Eliminar opinión
            $stmt = $pdo->prepare("DELETE FROM opiniones WHERE id = ? AND usuario_id = ?");
            $stmt->execute([$id, $usuario_id]);
            
            sendResponse(true, 'Opinión eliminada correctamente', null);
            break;
        
        default:
            sendResponse(false, 'Método no permitido', null);
            break;
    }
    
} catch (PDOException $e) {
    // Error de base de datos
    error_log("Error en opiniones.php: " . $e->getMessage());
    sendResponse(false, 'Error en la base de datos: ' . $e->getMessage(), null);
    
} catch (Exception $e) {
    // Error general
    error_log("Error general en opiniones.php: " . $e->getMessage());
    sendResponse(false, 'Error del servidor: ' . $e->getMessage(), null);
}

/**
 * ====================================================
 * EJEMPLOS DE USO DESDE JAVASCRIPT
 * ====================================================
 * 
 * // 1. OBTENER TODAS LAS OPINIONES
 * fetch('http://localhost/ManageNLearn/api/opiniones.php')
 *   .then(res => res.json())
 *   .then(data => {
 *     console.log('Opiniones:', data.data);
 *     // data.data contiene array de opiniones
 *   });
 * 
 * // 2. CREAR NUEVA OPINIÓN
 * fetch('http://localhost/ManageNLearn/api/opiniones.php', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     usuario_id: 1,
 *     nombre: 'Juan Pérez',
 *     texto: 'Excelente plataforma, muy fácil de usar y completa.',
 *     calificacion: 5
 *   })
 * })
 * .then(res => res.json())
 * .then(data => console.log(data));
 * 
 * // 3. ELIMINAR OPINIÓN (solo el dueño)
 * fetch('http://localhost/ManageNLearn/api/opiniones.php', {
 *   method: 'DELETE',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     id: 5,
 *     usuario_id: 1
 *   })
 * })
 * .then(res => res.json())
 * .then(data => console.log(data));
 * 
 * ====================================================
 * FORMATO DE CALIFICACIÓN
 * ====================================================
 * 
 * En el frontend puedes enviar:
 * - calificacion: 5 (como número)
 * - O puedes enviar estrellas "⭐⭐⭐⭐⭐" y convertir
 * 
 * Para convertir estrellas a número:
 * const estrellas = "⭐⭐⭐⭐⭐";
 * const calificacion = estrellas.length / 2; // o usar match
 */
?>