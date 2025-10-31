<?php
/**
 * ====================================================
 * Archivo: estadisticas.php
 * Ubicación: C:\xampp\htdocs\ManageNLearn\api\estadisticas.php
 * Propósito: API REST para gestión de estadísticas
 * ====================================================
 */

// Headers para permitir CORS y definir tipo de respuesta JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Manejo de preflight requests (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir archivo de conexión a BD
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
 * Función para validar que el usuario existe
 */
function validarUsuario($pdo, $usuario_id) {
    $stmt = $pdo->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$usuario_id]);
    return $stmt->fetch() !== false;
}

try {
    // Obtener conexión a la base de datos
    $pdo = getConnection();
    
    // Obtener método HTTP
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Obtener datos del cuerpo de la petición
    $input = json_decode(file_get_contents('php://input'), true);
    
    // ====================================================
    // GET: Obtener estadísticas de un usuario
    // ====================================================
    if ($method === 'GET') {
        // Validar que se envió el usuario_id
        if (!isset($_GET['usuario_id'])) {
            sendResponse(false, 'Falta el parámetro usuario_id', null, 400);
        }
        
        $usuario_id = intval($_GET['usuario_id']);
        
        // Validar que el usuario existe
        if (!validarUsuario($pdo, $usuario_id)) {
            sendResponse(false, 'Usuario no encontrado', null, 404);
        }
        
        // Consultar estadísticas
        $stmt = $pdo->prepare("
            SELECT 
                ingresos_diarios,
                ingresos_semanales,
                ingresos_mensuales,
                crecimiento,
                proyectos_activos,
                proyectos_completados,
                productividad,
                fecha_actualizacion
            FROM estadisticas 
            WHERE usuario_id = ?
        ");
        $stmt->execute([$usuario_id]);
        $estadisticas = $stmt->fetch();
        
        // Si no existen estadísticas, crear registro inicial
        if (!$estadisticas) {
            $stmt = $pdo->prepare("
                INSERT INTO estadisticas (usuario_id) 
                VALUES (?)
            ");
            $stmt->execute([$usuario_id]);
            
            // Obtener las estadísticas recién creadas
            $stmt = $pdo->prepare("
                SELECT 
                    ingresos_diarios,
                    ingresos_semanales,
                    ingresos_mensuales,
                    crecimiento,
                    proyectos_activos,
                    proyectos_completados,
                    productividad,
                    fecha_actualizacion
                FROM estadisticas 
                WHERE usuario_id = ?
            ");
            $stmt->execute([$usuario_id]);
            $estadisticas = $stmt->fetch();
        }
        
        // Formatear datos para el frontend
        $datos = [
            'ventas' => [
                'ingresosDiarios' => floatval($estadisticas['ingresos_diarios']),
                'ingresosSemanales' => floatval($estadisticas['ingresos_semanales']),
                'ingresosMensuales' => floatval($estadisticas['ingresos_mensuales']),
                'crecimiento' => floatval($estadisticas['crecimiento'])
            ],
            'operaciones' => [
                'proyectosActivos' => intval($estadisticas['proyectos_activos']),
                'proyectosCompletados' => intval($estadisticas['proyectos_completados']),
                'productividad' => floatval($estadisticas['productividad'])
            ],
            'fecha_actualizacion' => $estadisticas['fecha_actualizacion']
        ];
        
        sendResponse(true, 'Estadísticas obtenidas correctamente', $datos);
    }
    
    // ====================================================
    // POST: Actualizar estadísticas de un usuario
    // ====================================================
    elseif ($method === 'POST') {
        // Validar que se enviaron los datos necesarios
        if (!isset($input['usuario_id'])) {
            sendResponse(false, 'Falta el parámetro usuario_id', null, 400);
        }
        
        $usuario_id = intval($input['usuario_id']);
        
        // Validar que el usuario existe
        if (!validarUsuario($pdo, $usuario_id)) {
            sendResponse(false, 'Usuario no encontrado', null, 404);
        }
        
        // Obtener datos a actualizar
        $ventas = $input['ventas'] ?? [];
        $operaciones = $input['operaciones'] ?? [];
        
        // Preparar valores (usar valores actuales si no se envían nuevos)
        $ingresos_diarios = isset($ventas['ingresosDiarios']) ? floatval($ventas['ingresosDiarios']) : null;
        $ingresos_semanales = isset($ventas['ingresosSemanales']) ? floatval($ventas['ingresosSemanales']) : null;
        $ingresos_mensuales = isset($ventas['ingresosMensuales']) ? floatval($ventas['ingresosMensuales']) : null;
        $crecimiento = isset($ventas['crecimiento']) ? floatval($ventas['crecimiento']) : null;
        $proyectos_activos = isset($operaciones['proyectosActivos']) ? intval($operaciones['proyectosActivos']) : null;
        $proyectos_completados = isset($operaciones['proyectosCompletados']) ? intval($operaciones['proyectosCompletados']) : null;
        $productividad = isset($operaciones['productividad']) ? floatval($operaciones['productividad']) : null;
        
        // Verificar si ya existen estadísticas
        $stmt = $pdo->prepare("SELECT id FROM estadisticas WHERE usuario_id = ?");
        $stmt->execute([$usuario_id]);
        $existe = $stmt->fetch();
        
        if ($existe) {
            // Actualizar estadísticas existentes (solo campos enviados)
            $campos = [];
            $valores = [];
            
            if ($ingresos_diarios !== null) {
                $campos[] = "ingresos_diarios = ?";
                $valores[] = $ingresos_diarios;
            }
            if ($ingresos_semanales !== null) {
                $campos[] = "ingresos_semanales = ?";
                $valores[] = $ingresos_semanales;
            }
            if ($ingresos_mensuales !== null) {
                $campos[] = "ingresos_mensuales = ?";
                $valores[] = $ingresos_mensuales;
            }
            if ($crecimiento !== null) {
                $campos[] = "crecimiento = ?";
                $valores[] = $crecimiento;
            }
            if ($proyectos_activos !== null) {
                $campos[] = "proyectos_activos = ?";
                $valores[] = $proyectos_activos;
            }
            if ($proyectos_completados !== null) {
                $campos[] = "proyectos_completados = ?";
                $valores[] = $proyectos_completados;
            }
            if ($productividad !== null) {
                $campos[] = "productividad = ?";
                $valores[] = $productividad;
            }
            
            if (count($campos) > 0) {
                $valores[] = $usuario_id;
                $sql = "UPDATE estadisticas SET " . implode(", ", $campos) . " WHERE usuario_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($valores);
            }
        } else {
            // Insertar nuevas estadísticas
            $stmt = $pdo->prepare("
                INSERT INTO estadisticas (
                    usuario_id, 
                    ingresos_diarios, 
                    ingresos_semanales, 
                    ingresos_mensuales, 
                    crecimiento,
                    proyectos_activos, 
                    proyectos_completados, 
                    productividad
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $usuario_id,
                $ingresos_diarios ?? 0,
                $ingresos_semanales ?? 0,
                $ingresos_mensuales ?? 0,
                $crecimiento ?? 0,
                $proyectos_activos ?? 0,
                $proyectos_completados ?? 0,
                $productividad ?? 0
            ]);
        }
        
        sendResponse(true, 'Estadísticas actualizadas correctamente');
    }
    
    // ====================================================
    // DELETE: Borrar estadísticas y guardar en historial
    // ====================================================
    elseif ($method === 'DELETE') {
        // Validar que se envió el usuario_id
        if (!isset($input['usuario_id'])) {
            sendResponse(false, 'Falta el parámetro usuario_id', null, 400);
        }
        
        $usuario_id = intval($input['usuario_id']);
        
        // Validar que el usuario existe
        if (!validarUsuario($pdo, $usuario_id)) {
            sendResponse(false, 'Usuario no encontrado', null, 404);
        }
        
        // Iniciar transacción
        $pdo->beginTransaction();
        
        try {
            // Obtener estadísticas actuales
            $stmt = $pdo->prepare("
                SELECT * FROM estadisticas WHERE usuario_id = ?
            ");
            $stmt->execute([$usuario_id]);
            $estadisticas = $stmt->fetch();
            
            if ($estadisticas) {
                // Guardar en historial
                $stmt = $pdo->prepare("
                    INSERT INTO historial_estadisticas (
                        usuario_id,
                        ingresos_diarios,
                        ingresos_semanales,
                        ingresos_mensuales,
                        crecimiento,
                        proyectos_activos,
                        proyectos_completados,
                        productividad
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $usuario_id,
                    $estadisticas['ingresos_diarios'],
                    $estadisticas['ingresos_semanales'],
                    $estadisticas['ingresos_mensuales'],
                    $estadisticas['crecimiento'],
                    $estadisticas['proyectos_activos'],
                    $estadisticas['proyectos_completados'],
                    $estadisticas['productividad']
                ]);
                
                // Resetear estadísticas a 0
                $stmt = $pdo->prepare("
                    UPDATE estadisticas SET
                        ingresos_diarios = 0,
                        ingresos_semanales = 0,
                        ingresos_mensuales = 0,
                        crecimiento = 0,
                        proyectos_activos = 0,
                        proyectos_completados = 0,
                        productividad = 0
                    WHERE usuario_id = ?
                ");
                $stmt->execute([$usuario_id]);
            }
            
            // Confirmar transacción
            $pdo->commit();
            
            sendResponse(true, 'Datos borrados y guardados en historial correctamente');
            
        } catch (Exception $e) {
            // Revertir cambios si hay error
            $pdo->rollBack();
            throw $e;
        }
    }
    
    // ====================================================
    // PUT: Obtener historial de estadísticas
    // ====================================================
    elseif ($method === 'PUT') {
        // Validar que se envió el usuario_id
        if (!isset($input['usuario_id'])) {
            sendResponse(false, 'Falta el parámetro usuario_id', null, 400);
        }
        
        $usuario_id = intval($input['usuario_id']);
        
        // Validar que el usuario existe
        if (!validarUsuario($pdo, $usuario_id)) {
            sendResponse(false, 'Usuario no encontrado', null, 404);
        }
        
        // Obtener historial (últimos 10 registros)
        $stmt = $pdo->prepare("
            SELECT 
                ingresos_diarios,
                ingresos_semanales,
                ingresos_mensuales,
                crecimiento,
                proyectos_activos,
                proyectos_completados,
                productividad,
                fecha_guardado
            FROM historial_estadisticas 
            WHERE usuario_id = ?
            ORDER BY fecha_guardado DESC
            LIMIT 10
        ");
        $stmt->execute([$usuario_id]);
        $historial = $stmt->fetchAll();
        
        // Formatear datos
        $historial_formateado = array_map(function($item) {
            return [
                'fecha' => date('d/m/Y H:i:s', strtotime($item['fecha_guardado'])),
                'datos' => [
                    'ventas' => [
                        'ingresosDiarios' => floatval($item['ingresos_diarios']),
                        'ingresosSemanales' => floatval($item['ingresos_semanales']),
                        'ingresosMensuales' => floatval($item['ingresos_mensuales']),
                        'crecimiento' => floatval($item['crecimiento'])
                    ],
                    'operaciones' => [
                        'proyectosActivos' => intval($item['proyectos_activos']),
                        'proyectosCompletados' => intval($item['proyectos_completados']),
                        'productividad' => floatval($item['productividad'])
                    ]
                ]
            ];
        }, $historial);
        
        sendResponse(true, 'Historial obtenido correctamente', $historial_formateado);
    }
    
    // ====================================================
    // Método no permitido
    // ====================================================
    else {
        sendResponse(false, 'Método no permitido', null, 405);
    }
    
} catch (PDOException $e) {
    // Error de base de datos
    sendResponse(false, 'Error de base de datos: ' . $e->getMessage(), null, 500);
    
} catch (Exception $e) {
    // Error general
    sendResponse(false, 'Error del servidor: ' . $e->getMessage(), null, 500);
}
?>