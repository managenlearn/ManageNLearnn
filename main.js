// ========== INICIALIZACIÓN ==========
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Inicializando ManageNLearn...');
  
  verificarSesionActiva();
  inicializarTema();
});

// ========== VERIFICAR SESIÓN ACTIVA ==========
function verificarSesionActiva() {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
  
  const menuPrincipal = document.getElementById("menuPrincipal");
  const menuDashboard = document.getElementById("menuDashboard");
  const nombreUsuario = document.getElementById("nombreUsuario");

  if (usuarioActivo) {
    // Usuario logueado: mostrar menú dashboard
    if (menuPrincipal) menuPrincipal.style.display = "none";
    if (menuDashboard) menuDashboard.style.display = "flex";
    
    // Actualizar nombre del usuario
    if (nombreUsuario) {
      nombreUsuario.textContent = usuarioActivo.primerNombre || 
                                   usuarioActivo.primer_nombre || 
                                   "Usuario";
    }
    
    console.log('✅ Usuario logueado:', usuarioActivo.correo);
  } else {
    // Usuario NO logueado: mostrar menú principal
    if (menuPrincipal) menuPrincipal.style.display = "flex";
    if (menuDashboard) menuDashboard.style.display = "none";
    
    console.log('ℹ️ No hay usuario logueado');
  }
}

// ========== CERRAR SESIÓN ==========
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'bienvenida.html';
  }
}

// Hacer la función global
window.cerrarSesion = cerrarSesion;

// ========== TEMA CLARO/OSCURO ==========
function inicializarTema() {
  const temaToggle = document.getElementById("temaToggle");
  
  if (!temaToggle) return;

  // Cargar tema guardado
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado === "dark") {
    document.body.classList.add("dark");
    temaToggle.textContent = "Tema Claro";
  }

  // Toggle tema
  temaToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const esDark = document.body.classList.contains("dark");
    localStorage.setItem("tema", esDark ? "dark" : "light");
    temaToggle.textContent = esDark ? "Tema Claro" : "Tema Oscuro";
  });
}

console.log('✅ main.js cargado correctamente');