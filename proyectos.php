<?php
/**
 * ====================================================
 * Archivo: proyectos.php
 * Ubicación: C:\xampp\htdocs\ManageNLearn\proyectos.php
 * Propósito: API REST para gestión de proyectos
 * ====================================================
 */

// Habilitar visualización de errores para desarrollo
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Headers para permitir CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivo de conexión
require_once '../db.php';

/**
 * Función para enviar respuesta JSON
 */
function sendResponse($success, $message, $data = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Función para validar sesión de usuario
 */
function validarSesion() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Verificar si hay usuario en sesión
    if (!isset($_SESSION['usuario_id'])) {
        sendResponse(false, 'Sesión no válida. Por favor inicia sesión.', null, 401);
    }
    
    return $_SESSION['usuario_id'];
}

/**
 * Obtener método HTTP y acción
 */
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    // Obtener conexión a la base de datos
    $pdo = getConnection();
    
    // Validar sesión para todas las acciones excepto OPTIONS
    $usuario_id = validarSesion();
    
    // ====================================================
    // RUTAS DE LA API
    // ====================================================
    
    switch ($method) {
        
        // ============================================
        // GET - Obtener proyectos
        // ============================================
        case 'GET':
            if ($action === 'obtener') {
                // Obtener todos los proyectos del usuario
                $stmt = $pdo->prepare("
                    SELECT 
                        id,
                        nombre,
                        descripcion,
                        fecha_entrega AS fechaEntrega,
                        estado,
                        prioridad,
                        enlace,
                        progreso,
                        etiquetas,
                        notas,
                        fecha_creacion AS fechaCreacion
                    FROM proyectos 
                    WHERE usuario_id = ? 
                    ORDER BY fecha_entrega ASC
                ");
                
                $stmt->execute([$usuario_id]);
                $proyectos = $stmt->fetchAll();
                
                // Convertir etiquetas de JSON a array
                foreach ($proyectos as &$proyecto) {
                    $proyecto['etiquetas'] = json_decode($proyecto['etiquetas'] ?? '[]');
                    $proyecto['id'] = (int)$proyecto['id'];
                    $proyecto['progreso'] = (int)$proyecto['progreso'];
                }
                
                sendResponse(true, 'Proyectos obtenidos exitosamente', $proyectos);
                
            } elseif ($action === 'obtener_uno' && isset($_GET['id'])) {
                // Obtener un proyecto específico
                $id = $_GET['id'];
                
                $stmt = $pdo->prepare("
                    SELECT 
                        id,
                        nombre,
                        descripcion,
                        fecha_entrega AS fechaEntrega,
                        estado,
                        prioridad,
                        enlace,
                        progreso,
                        etiquetas,
                        notas,
                        fecha_creacion AS fechaCreacion
                    FROM proyectos 
                    WHERE id = ? AND usuario_id = ?
                ");
                
                $stmt->execute([$id, $usuario_id]);
                $proyecto = $stmt->fetch();
                
                if ($proyecto) {
                    $proyecto['etiquetas'] = json_decode($proyecto['etiquetas'] ?? '[]');
                    $proyecto['id'] = (int)$proyecto['id'];
                    $proyecto['progreso'] = (int)$proyecto['progreso'];
                    sendResponse(true, 'Proyecto obtenido exitosamente', $proyecto);
                } else {
                    sendResponse(false, 'Proyecto no encontrado', null, 404);
                }
                
            } elseif ($action === 'estadisticas') {
                // Obtener estadísticas de proyectos
                $stmt = $pdo->prepare("
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN estado != 'completado' THEN 1 ELSE 0 END) as activos,
                        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                        SUM(CASE WHEN estado != 'completado' AND fecha_entrega < CURDATE() THEN 1 ELSE 0 END) as vencidos
                    FROM proyectos 
                    WHERE usuario_id = ?
                ");
                
                $stmt->execute([$usuario_id]);
                $stats = $stmt->fetch();
                
                sendResponse(true, 'Estadísticas obtenidas', [
                    'total' => (int)$stats['total'],
                    'activos' => (int)$stats['activos'],
                    'completados' => (int)$stats['completados'],
                    'vencidos' => (int)$stats['vencidos']
                ]);
                
            } else {
                sendResponse(false, 'Acción GET no válida', null, 400);
            }
            break;
        
        // ============================================
        // POST - Crear nuevo proyecto
        // ============================================
        case 'POST':
            if ($action === 'crear') {
                // Obtener datos JSON
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Validar campos requeridos
                if (empty($input['nombre']) || empty($input['descripcion']) || empty($input['fechaEntrega'])) {
                    sendResponse(false, 'Faltan campos requeridos', null, 400);
                }
                
                // Preparar etiquetas como JSON
                $etiquetas = json_encode($input['etiquetas'] ?? []);
                
                // Insertar proyecto
                $stmt = $pdo->prepare("
                    INSERT INTO proyectos (
                        usuario_id, 
                        nombre, 
                        descripcion, 
                        fecha_entrega, 
                        estado, 
                        prioridad,
                        enlace,
                        progreso,
                        etiquetas,
                        notas
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $usuario_id,
                    $input['nombre'],
                    $input['descripcion'],
                    $input['fechaEntrega'],
                    $input['estado'] ?? 'pendiente',
                    $input['prioridad'] ?? 'media',
                    $input['enlace'] ?? null,
                    $input['progreso'] ?? 0,
                    $etiquetas,
                    $input['notas'] ?? null
                ]);
                
                $proyecto_id = $pdo->lastInsertId();
                
                sendResponse(true, 'Proyecto creado exitosamente', ['id' => $proyecto_id], 201);
                
            } else {
                sendResponse(false, 'Acción POST no válida', null, 400);
            }
            break;
        
        // ============================================
        // PUT - Actualizar proyecto
        // ============================================
        case 'PUT':
            if ($action === 'actualizar' && isset($_GET['id'])) {
                $id = $_GET['id'];
                
                // Obtener datos JSON
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Verificar que el proyecto pertenece al usuario
                $stmt = $pdo->prepare("SELECT id FROM proyectos WHERE id = ? AND usuario_id = ?");
                $stmt->execute([$id, $usuario_id]);
                
                if (!$stmt->fetch()) {
                    sendResponse(false, 'Proyecto no encontrado o no autorizado', null, 404);
                }
                
                // Preparar etiquetas como JSON
                $etiquetas = json_encode($input['etiquetas'] ?? []);
                
                // Actualizar proyecto
                $stmt = $pdo->prepare("
                    UPDATE proyectos SET
                        nombre = ?,
                        descripcion = ?,
                        fecha_entrega = ?,
                        estado = ?,
                        prioridad = ?,
                        enlace = ?,
                        progreso = ?,
                        etiquetas = ?,
                        notas = ?
                    WHERE id = ? AND usuario_id = ?
                ");
                
                $stmt->execute([
                    $input['nombre'],
                    $input['descripcion'],
                    $input['fechaEntrega'],
                    $input['estado'],
                    $input['prioridad'] ?? 'media',
                    $input['enlace'] ?? null,
                    $input['progreso'] ?? 0,
                    $etiquetas,
                    $input['notas'] ?? null,
                    $id,
                    $usuario_id
                ]);
                
                sendResponse(true, 'Proyecto actualizado exitosamente');
                
            } elseif ($action === 'actualizar_estado' && isset($_GET['id'])) {
                $id = $_GET['id'];
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Actualizar solo el estado
                $stmt = $pdo->prepare("
                    UPDATE proyectos 
                    SET estado = ?,
                        progreso = CASE WHEN ? = 'completado' THEN 100 ELSE progreso END
                    WHERE id = ? AND usuario_id = ?
                ");
                
                $stmt->execute([
                    $input['estado'],
                    $input['estado'],
                    $id,
                    $usuario_id
                ]);
                
                sendResponse(true, 'Estado actualizado exitosamente');
                
            } elseif ($action === 'actualizar_progreso' && isset($_GET['id'])) {
                $id = $_GET['id'];
                $input = json_decode(file_get_contents('php://input'), true);
                
                // Actualizar progreso
                $stmt = $pdo->prepare("
                    UPDATE proyectos 
                    SET progreso = ?,
                        estado = CASE WHEN ? >= 100 THEN 'completado' ELSE estado END
                    WHERE id = ? AND usuario_id = ?
                ");
                
                $stmt->execute([
                    $input['progreso'],
                    $input['progreso'],
                    $id,
                    $usuario_id
                ]);
                
                sendResponse(true, 'Progreso actualizado exitosamente');
                
            } else {
                sendResponse(false, 'Acción PUT no válida', null, 400);
            }
            break;
        
        // ============================================
        // DELETE - Eliminar proyecto
        // ============================================
        case 'DELETE':
            if ($action === 'eliminar' && isset($_GET['id'])) {
                $id = $_GET['id'];
                
                // Eliminar proyecto
                $stmt = $pdo->prepare("DELETE FROM proyectos WHERE id = ? AND usuario_id = ?");
                $stmt->execute([$id, $usuario_id]);
                
                if ($stmt->rowCount() > 0) {
                    sendResponse(true, 'Proyecto eliminado exitosamente');
                } else {
                    sendResponse(false, 'Proyecto no encontrado', null, 404);
                }
                
            } else {
                sendResponse(false, 'Acción DELETE no válida', null, 400);
            }
            break;
        
        // ============================================
        // Método no permitido
        // ============================================
        default:
            sendResponse(false, 'Método no permitido', null, 405);
            break;
    }
    
} catch (PDOException $e) {
    // Error de base de datos
    error_log("Error en proyectos.php: " . $e->getMessage());
    sendResponse(false, 'Error en la base de datos', null, 500);
    
} catch (Exception $e) {
    // Otros errores
    error_log("Error general en proyectos.php: " . $e->getMessage());
    sendResponse(false, 'Error interno del servidor', null, 500);
}

/**
 * ====================================================
 * DOCUMENTACIÓN DE LA API
 * ====================================================
 * 
 * ENDPOINTS DISPONIBLES:
 * 
 * 1. GET /proyectos.php?action=obtener
 *    - Obtiene todos los proyectos del usuario
 *    - Requiere: Sesión activa
 *    - Retorna: Array de proyectos
 * 
 * 2. GET /proyectos.php?action=obtener_uno&id={id}
 *    - Obtiene un proyecto específico
 *    - Requiere: Sesión activa, ID del proyecto
 *    - Retorna: Objeto de proyecto
 * 
 * 3. GET /proyectos.php?action=estadisticas
 *    - Obtiene estadísticas de proyectos
 *    - Requiere: Sesión activa
 *    - Retorna: Objeto con total, activos, completados, vencidos
 * 
 * 4. POST /proyectos.php?action=crear
 *    - Crea un nuevo proyecto
 *    - Requiere: Sesión activa, datos del proyecto en JSON
 *    - Body: { nombre, descripcion, fechaEntrega, estado?, prioridad?, enlace?, etiquetas?, notas? }
 *    - Retorna: ID del proyecto creado
 * 
 * 5. PUT /proyectos.php?action=actualizar&id={id}
 *    - Actualiza un proyecto completo
 *    - Requiere: Sesión activa, ID del proyecto, datos en JSON
 *    - Body: { nombre, descripcion, fechaEntrega, estado, prioridad, enlace, progreso, etiquetas, notas }
 * 
 * 6. PUT /proyectos.php?action=actualizar_estado&id={id}
 *    - Actualiza solo el estado de un proyecto
 *    - Requiere: Sesión activa, ID del proyecto
 *    - Body: { estado }
 * 
 * 7. PUT /proyectos.php?action=actualizar_progreso&id={id}
 *    - Actualiza el progreso de un proyecto
 *    - Requiere: Sesión activa, ID del proyecto
 *    - Body: { progreso }
 * 
 * 8. DELETE /proyectos.php?action=eliminar&id={id}
 *    - Elimina un proyecto
 *    - Requiere: Sesión activa, ID del proyecto
 * 
 * ====================================================
 * NOTAS DE SEGURIDAD:
 * ====================================================
 * 
 * - Todas las consultas usan prepared statements (prevención de SQL Injection)
 * - Se valida la sesión en cada petición
 * - Se verifica que el proyecto pertenezca al usuario antes de modificarlo
 * - Los errores no exponen información sensible al cliente
 * - Se registran errores en el log del servidor
 * 
 * ====================================================
 */
?>