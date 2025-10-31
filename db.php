<?php
/**
 * ====================================================
 * Archivo: db.php
 * Ubicación: C:\xampp\htdocs\ManageNLearn\db.php
 * Propósito: Proporcionar una conexión PDO a la base de datos
 * ====================================================
 */

/**
 * Función: getConnection()
 * 
 * Crea y devuelve una conexión PDO a la base de datos MySQL
 * 
 * ¿Por qué usar PDO?
 * - PDO (PHP Data Objects) es una interfaz moderna y segura
 * - Soporta prepared statements (consultas preparadas) que previenen SQL Injection
 * - Es independiente del motor de base de datos (MySQL, PostgreSQL, etc.)
 * - Maneja errores de forma estructurada con excepciones
 * 
 * @return PDO Objeto de conexión a la base de datos
 * @throws PDOException Si falla la conexión
 */
function getConnection() {
    // Configuración de la base de datos
    // IMPORTANTE: Cambia estos valores si tu configuración es diferente
    $host = 'localhost';        // Servidor de la base de datos (generalmente localhost en XAMPP)
    $dbname = 'managenlearn';   // Nombre de la base de datos
    $username = 'root';         // Usuario de MySQL (root es el predeterminado en XAMPP)
    $password = '';             // Contraseña de MySQL (vacía por defecto en XAMPP)
    $charset = 'utf8mb4';       // Charset para soportar emojis y caracteres especiales
    
    /**
     * DSN (Data Source Name): Cadena de conexión
     * Contiene: tipo de BD, host, nombre de BD y charset
     */
    $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
    
    /**
     * Opciones de PDO para mayor seguridad y funcionalidad
     */
    $options = [
        // Lanza excepciones en caso de error (en lugar de warnings silenciosos)
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        
        // Devuelve los resultados como arrays asociativos (clave => valor)
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        
        // Desactiva emulación de prepared statements para mayor seguridad
        // Usa prepared statements reales del servidor MySQL
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    try {
        /**
         * Crear nueva instancia de PDO
         * Si la conexión falla, se lanza una PDOException
         */
        $pdo = new PDO($dsn, $username, $password, $options);
        
        // Retornar el objeto PDO para ser usado en otros archivos
        return $pdo;
        
    } catch (PDOException $e) {
        /**
         * Si hay un error de conexión:
         * - En producción: NO mostrar detalles del error (seguridad)
         * - En desarrollo: Mostrar el error para depuración
         */
        
        // Para desarrollo (DESACTIVAR en producción):
        die("Error de conexión a la base de datos: " . $e->getMessage());
        
        // Para producción (ACTIVAR cuando el sitio esté público):
        // error_log("Error de conexión: " . $e->getMessage()); // Guardar en log
        // die("Error de conexión. Por favor, contacte al administrador.");
    }
}

/**
 * ====================================================
 * NOTAS IMPORTANTES:
 * ====================================================
 * 
 * 1. CAMBIAR CREDENCIALES:
 *    Si tu usuario no es 'root' o tienes contraseña:
 *    $username = 'tu_usuario';
 *    $password = 'tu_contraseña';
 * 
 * 2. SEGURIDAD EN PRODUCCIÓN:
 *    - Usa contraseñas fuertes para MySQL
 *    - No uses el usuario 'root'
 *    - Desactiva display_errors en php.ini
 *    - Usa variables de entorno para credenciales
 * 
 * 3. VERIFICAR CONEXIÓN:
 *    Puedes crear un archivo test_db.php con:
 *    <?php
 *    require_once 'db.php';
 *    try {
 *        $pdo = getConnection();
 *        echo "Conexión exitosa!";
 *    } catch (Exception $e) {
 *        echo "Error: " . $e->getMessage();
 *    }
 * 
 * 4. PREPARED STATEMENTS:
 *    Siempre usa prepared statements para prevenir SQL Injection:
 *    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE correo = ?");
 *    $stmt->execute([$correo]);
 *    NUNCA: "SELECT * FROM usuarios WHERE correo = '$correo'" (PELIGROSO)
 */
?>