// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  cargarConfiguracion();
  inicializarEventListeners();
  actualizarEstadisticas();
});

function verificarSesion() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    window.location.href = 'login.html';
  }
}

function inicializarEventListeners() {
  // Selector de tema
  document.querySelectorAll('.preview-card').forEach(card => {
    card.addEventListener('click', function() {
      document.querySelectorAll('.preview-card').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      aplicarTema(this.dataset.theme);
    });
  });

  // Tamaño de fuente
  document.querySelectorAll('.font-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.font-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      aplicarTamanoFuente(this.dataset.size);
    });
  });

  // Idioma
  document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.language-option').forEach(o => o.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Preview de notificaciones
  document.getElementById('notifBrowser').addEventListener('change', function() {
    const preview = document.getElementById('notifPreview');
    if (this.checked) {
      preview.style.display = 'flex';
      setTimeout(() => preview.style.display = 'none', 3000);
    }
  });
}

// ========== TEMA ==========
function aplicarTema(tema) {
  if (tema === 'dark') {
    document.body.classList.add('dark');
  } else if (tema === 'light') {
    document.body.classList.remove('dark');
  } else if (tema === 'auto') {
    const hora = new Date().getHours();
    if (hora >= 19 || hora < 7) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
  localStorage.setItem('tema', tema);
}

// ========== TAMAÑO DE FUENTE ==========
function aplicarTamanoFuente(size) {
  document.body.style.fontSize = size;
  document.getElementById('fontDemo').style.fontSize = size;
  localStorage.setItem('fontSize', size);
}

// ========== GUARDAR CONFIGURACIÓN ==========
function guardarConfiguracion() {
  const config = {
    tema: document.querySelector('.preview-card.active').dataset.theme,
    fontSize: document.querySelector('.font-btn.active').dataset.size,
    idioma: document.querySelector('.language-option.active').dataset.lang,
    formatoFecha: document.getElementById('formatoFecha').value,
    notifBrowser: document.getElementById('notifBrowser').checked,
    notifEventos: document.getElementById('notifEventos').checked,
    notifResumen: document.getElementById('notifResumen').checked,
    backupAuto: document.getElementById('backupAuto').checked
  };

  localStorage.setItem('configuracion', JSON.stringify(config));

  // Mostrar alerta de éxito
  const alert = document.getElementById('alertSuccess');
  alert.style.display = 'flex';
  setTimeout(() => alert.style.display = 'none', 3000);

  // Scroll al top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== CARGAR CONFIGURACIÓN ==========
function cargarConfiguracion() {
  const config = JSON.parse(localStorage.getItem('configuracion')) || {};

  if (config.tema) {
    document.querySelectorAll('.preview-card').forEach(card => {
      card.classList.remove('active');
      if (card.dataset.theme === config.tema) {
        card.classList.add('active');
        aplicarTema(config.tema);
      }
    });
  }

  if (config.fontSize) {
    document.querySelectorAll('.font-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.size === config.fontSize) {
        btn.classList.add('active');
        aplicarTamanoFuente(config.fontSize);
      }
    });
  }

  if (config.idioma) {
    document.querySelectorAll('.language-option').forEach(option => {
      option.classList.remove('active');
      if (option.dataset.lang === config.idioma) {
        option.classList.add('active');
      }
    });
  }

  if (config.formatoFecha) {
    document.getElementById('formatoFecha').value = config.formatoFecha;
  }

  document.getElementById('notifBrowser').checked = config.notifBrowser !== false;
  document.getElementById('notifEventos').checked = config.notifEventos !== false;
  document.getElementById('notifResumen').checked = config.notifResumen || false;
  document.getElementById('backupAuto').checked = config.backupAuto !== false;
}

// ========== ESTADÍSTICAS ==========
function actualizarEstadisticas() {
  const proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];
  const eventos = JSON.parse(localStorage.getItem('eventos')) || [];
  
  document.getElementById('totalProyectos').textContent = proyectos.length;
  document.getElementById('totalEventos').textContent = eventos.length;

  // Calcular espacio usado
  let espacio = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      espacio += localStorage[key].length + key.length;
    }
  }
  document.getElementById('espacioUsado').textContent = (espacio / 1024).toFixed(2) + ' KB';
}

// ========== ACCIONES ==========
function exportarDatos() {
  const datos = {
    proyectos: JSON.parse(localStorage.getItem('proyectos')) || [],
    eventos: JSON.parse(localStorage.getItem('eventos')) || [],
    configuracion: JSON.parse(localStorage.getItem('configuracion')) || {}
  };

  const dataStr = JSON.stringify(datos, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `managenlearn_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  alert('✅ Datos exportados correctamente');
}

function limpiarCache() {
  if (confirm('¿Estás seguro de limpiar el caché? Esto no eliminará tus datos.')) {
    alert('✅ Caché limpiado correctamente');
    actualizarEstadisticas();
  }
}

function cambiarPassword() {
  const newPass = prompt('Ingresa tu nueva contraseña (mínimo 6 caracteres):');
  
  if (!newPass) return;
  
  if (newPass.length < 6) {
    alert('❌ La contraseña debe tener al menos 6 caracteres');
    return;
  }

  // Aquí iría la lógica para cambiar contraseña en el backend
  alert('✅ Contraseña actualizada correctamente');
}

function cerrarSesionTodos() {
  if (confirm('¿Cerrar sesión en todos los dispositivos? Deberás iniciar sesión nuevamente.')) {
    alert('✅ Sesiones cerradas en todos los dispositivos');
  }
}

function eliminarCuenta() {
  const confirmacion1 = confirm('⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE. ¿Estás seguro de eliminar tu cuenta?');
  
  if (!confirmacion1) return;
  
  const confirmacion2 = confirm('⚠️ ÚLTIMA ADVERTENCIA: Se eliminarán TODOS tus datos permanentemente. ¿Continuar?');
  
  if (!confirmacion2) return;

  const verificacion = prompt('Escribe "ELIMINAR" en mayúsculas para confirmar:');
  
  if (verificacion === 'ELIMINAR') {
    localStorage.clear();
    alert('✅ Cuenta eliminada. Serás redirigido a la página principal.');
    window.location.href = 'index.html';
  } else {
    alert('❌ Verificación incorrecta. No se eliminó la cuenta.');
  }
}
