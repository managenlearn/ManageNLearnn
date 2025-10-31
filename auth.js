/**
 * ====================================================
 * Archivo: js/auth.js
 * Propósito: Manejar autenticación con API PHP
 * ====================================================
 */

// Configuración de la API
const API_URL = 'http://localhost/ManageNLearn/api';

/**
 * Función para registrar usuario
 */
async function registrarUsuario(formData) {
    try {
        const response = await fetch(`${API_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                primerNombre: formData.get('primerNombre'),
                segundoNombre: formData.get('segundoNombre'),
                apellidos: formData.get('apellidos'),
                edad: parseInt(formData.get('edad')),
                correo: formData.get('correo'),
                password: formData.get('password'),
                centro: formData.get('centro'),
                pais: formData.get('pais'),
                departamento: formData.get('departamento'),
                ciudad: formData.get('ciudad'),
                direccion: formData.get('direccion'),
                telefono: formData.get('telefono'),
                correoCentro: formData.get('correoCentro')
            })
        });

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error en registro:', error);
        return {
            success: false,
            message: 'Error de conexión con el servidor. Verifica que XAMPP esté ejecutando Apache y MySQL.'
        };
    }
}

/**
 * Función para iniciar sesión
 */
async function iniciarSesionAPI(correo, password) {
    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: correo,
                password: password
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Guardar usuario en localStorage
            localStorage.setItem('usuarioActivo', JSON.stringify(data.user));
        }
        
        return data;

    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            message: 'Error de conexión. Verifica que el servidor esté corriendo.'
        };
    }
}

/**
 * Verificar si hay sesión activa
 */
function verificarSesion() {
    const usuario = localStorage.getItem('usuarioActivo');
    return usuario ? JSON.parse(usuario) : null;
}

/**
 * Cerrar sesión
 */
function cerrarSesionAPI() {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'login.html';
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registrarUsuario,
        iniciarSesionAPI,
        verificarSesion,
        cerrarSesionAPI
    };
}