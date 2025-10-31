<?php
/**
 * ====================================================
 * Archivo: api/login.php
 * Propósito: Autenticar usuarios y crear sesión
 * Método HTTP: POST
 * ====================================================
 */

// IMPORTANTE: Iniciar sesión ANTES de cualquier header
session_start();

// Configurar headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost'); // Más específico para seguridad
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true'); // IMPORTANTE: Permitir cookies

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST.'
    ]);
    exit();
}

require_once '../db.php';

try {
    $pdo = getConnection();
    
    // Leer datos JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Datos inválidos.'
        ]);
        exit();
    }
    
    // Extraer credenciales
    $correo = filter_var(trim($data['correo'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = $data['password'] ?? '';
    
    // Validar campos
    if (empty($correo) || empty($password)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Correo y contraseña son obligatorios.'
        ]);
        exit();
    }
    
    // Buscar usuario por correo
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
    $stmt->execute([$correo]);
    $user = $stmt->fetch();
    
    // Verificar si el usuario existe
    if (!$user) {
        http_response_code(401); // 401 Unauthorized
        echo json_encode([
            'success' => false,
            'message' => 'Correo o contraseña incorrectos.'
        ]);
        exit();
    }
    
    // Verificar la contraseña
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Correo o contraseña incorrectos.'
        ]);
        exit();
    }
    
    // ✅ CREAR SESIÓN EN EL SERVIDOR
    $_SESSION['usuario_id'] = $user['id'];
    $_SESSION['usuario_nombre'] = $user['primer_nombre'];
    $_SESSION['usuario_correo'] = $user['correo'];
    
    // Autenticación exitosa - NO devolver la contraseña
    unset($user['password']);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso.',
        'user' => $user
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error en el servidor.',
        'error' => $e->getMessage()
    ]);
}
?>