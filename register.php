<?php
/**
 * ====================================================
 * Archivo: api/register.php
 * Propósito: Registrar nuevos usuarios en la base de datos
 * Método HTTP: POST
 * ====================================================
 */

/**
 * Configurar headers CORS (Cross-Origin Resource Sharing)
 * Permite que el frontend (JavaScript) haga peticiones a este endpoint
 */
header('Content-Type: application/json; charset=utf-8'); // Respuesta en formato JSON
header('Access-Control-Allow-Origin: *');                // Permitir peticiones desde cualquier origen
header('Access-Control-Allow-Methods: POST');            // Solo método POST permitido
header('Access-Control-Allow-Headers: Content-Type');    // Permitir header Content-Type

/**
 * Manejar peticiones OPTIONS (preflight)
 * Los navegadores envían OPTIONS antes de POST para verificar permisos CORS
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Responder OK
    exit();                  // Terminar ejecución
}

/**
 * Verificar que el método sea POST
 * Este endpoint solo acepta POST, rechazar otros métodos
 */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 Method Not Allowed
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST.'
    ]);
    exit();
}

/**
 * Incluir archivo de conexión a la base de datos
 * require_once asegura que se incluya solo una vez
 */
require_once '../db.php';

try {
    /**
     * Obtener conexión PDO a la base de datos
     */
    $pdo = getConnection();
    
    /**
     * Leer datos JSON del cuerpo de la petición
     * file_get_contents('php://input') obtiene el cuerpo raw de la petición
     * json_decode convierte JSON a objeto PHP
     */
    $input = file_get_contents('php://input');
    $data = json_decode($input, true); // true = devolver array asociativo
    
    /**
     * Validar que se recibieron datos
     */
    if (!$data) {
        http_response_code(400); // 400 Bad Request
        echo json_encode([
            'success' => false,
            'message' => 'No se recibieron datos o el JSON es inválido.'
        ]);
        exit();
    }
    
    /**
     * Extraer y sanitizar datos del usuario
     * trim() elimina espacios en blanco al inicio y final
     * filter_var() valida y sanitiza el correo electrónico
     */
    $primerNombre = trim($data['primerNombre'] ?? '');
    $segundoNombre = trim($data['segundoNombre'] ?? '');
    $apellidos = trim($data['apellidos'] ?? '');
    $edad = intval($data['edad'] ?? 0);
    $correo = filter_var(trim($data['correo'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $data['password'] ?? '';
    $centro = trim($data['centro'] ?? '');
    $pais = trim($data['pais'] ?? '');
    $departamento = trim($data['departamento'] ?? '');
    $ciudad = trim($data['ciudad'] ?? '');
    $direccion = trim($data['direccion'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $correoCentro = filter_var(trim($data['correoCentro'] ?? ''), FILTER_SANITIZE_EMAIL);
    
    /**
     * Validar campos obligatorios
     * Verificar que no estén vacíos
     */
    if (empty($primerNombre) || empty($apellidos) || empty($correo) || 
        empty($password) || empty($centro) || empty($pais) || 
        empty($departamento) || empty($ciudad) || empty($direccion) || 
        empty($telefono) || empty($correoCentro) || $edad <= 0) {
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Todos los campos obligatorios deben ser completados.'
        ]);
        exit();
    }
    
    /**
     * Validar formato de correo electrónico
     * FILTER_VALIDATE_EMAIL verifica que sea un email válido
     */
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El correo electrónico no es válido.'
        ]);
        exit();
    }
    
    /**
     * Validar formato de correo del centro
     */
    if (!filter_var($correoCentro, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'El correo del centro educativo no es válido.'
        ]);
        exit();
    }
    
    /**
     * Verificar si el correo ya existe en la base de datos
     * Usar prepared statement para prevenir SQL Injection
     */
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $stmtCheck->execute([$correo]);
    
    if ($stmtCheck->rowCount() > 0) {
        // El correo ya está registrado
        http_response_code(409); // 409 Conflict
        echo json_encode([
            'success' => false,
            'message' => 'Este correo electrónico ya está registrado.'
        ]);
        exit();
    }
    
    /**
     * Hashear la contraseña
     * PASSWORD_DEFAULT usa bcrypt (algoritmo seguro)
     * NUNCA guardar contraseñas en texto plano
     */
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    /**
     * Insertar nuevo usuario en la base de datos
     * Usar prepared statement con placeholders (?)
     */
    $sql = "INSERT INTO usuarios (
                primer_nombre, segundo_nombre, apellidos, edad, correo, password,
                centro, pais, departamento, ciudad, direccion, telefono, correo_centro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
    /**
     * Ejecutar la consulta con los valores
     * El orden de los valores debe coincidir con los placeholders
     */
    $stmt->execute([
        $primerNombre,
        $segundoNombre,
        $apellidos,
        $edad,
        $correo,
        $passwordHash,
        $centro,
        $pais,
        $departamento,
        $ciudad,
        $direccion,
        $telefono,
        $correoCentro
    ]);
    
    /**
     * Obtener el ID del usuario recién insertado
     * lastInsertId() devuelve el último ID AUTO_INCREMENT
     */
    $userId = $pdo->lastInsertId();
    
    /**
     * Respuesta exitosa
     */
    http_response_code(201); // 201 Created
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado exitosamente.',
        'userId' => $userId
    ]);
    
} catch (PDOException $e) {
    /**
     * Error de base de datos
     */
    http_response_code(500); // 500 Internal Server Error
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar usuario.',
        'error' => $e->getMessage() // En producción, NO enviar el error real
    ]);
    
} catch (Exception $e) {
    /**
     * Otros errores
     */
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servidor.',
        'error' => $e->getMessage()
    ]);
}
?>