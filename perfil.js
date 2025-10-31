// ===== REEMPLAZA TODO EL CONTENIDO DE perfil.js CON ESTO =====

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando perfil premium...');
  
  if (!verificarSesion()) return;
  
  cargarPerfil();
  actualizarEstadisticas();
  inicializarTema();
  inicializarSubidaFoto();
  
  console.log('✅ Perfil premium cargado correctamente');
});

// ========== VERIFICAR SESIÓN ==========
function verificarSesion() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    alert('Debes iniciar sesión para acceder al perfil');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ========== CARGAR PERFIL ==========
function cargarPerfil() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  
  if (!usuario) return;

  console.log('📋 Cargando datos del perfil:', usuario);

  // Llenar información de la tarjeta
  const inicial = (usuario.primerNombre || usuario.primer_nombre || 'U').charAt(0).toUpperCase();
  const avatarElement = document.getElementById('avatarInicial');
  const avatarImg = document.getElementById('avatarImg');
  
  // Cargar foto si existe
  if (usuario.fotoPerfil) {
    avatarImg.src = usuario.fotoPerfil;
    avatarImg.style.display = 'block';
    avatarElement.style.display = 'none';
    document.getElementById('btnEliminarFoto').style.display = 'block';
  } else {
    avatarElement.textContent = inicial;
    avatarElement.style.display = 'flex';
    avatarImg.style.display = 'none';
    document.getElementById('btnEliminarFoto').style.display = 'none';
  }
  
  const nombreCompleto = `${usuario.primerNombre || usuario.primer_nombre || ''} ${usuario.segundoNombre || usuario.segundo_nombre || ''} ${usuario.apellidos || ''}`.trim();
  document.getElementById('nombreCompleto').textContent = nombreCompleto || 'Usuario';
  document.getElementById('correoUsuario').textContent = usuario.correo || 'correo@ejemplo.com';

  // Llenar formulario
  document.getElementById('primerNombrePerfil').value = usuario.primerNombre || usuario.primer_nombre || '';
  document.getElementById('segundoNombrePerfil').value = usuario.segundoNombre || usuario.segundo_nombre || '';
  document.getElementById('apellidosPerfil').value = usuario.apellidos || '';
  document.getElementById('edadPerfil').value = usuario.edad || '';
  document.getElementById('correoPerfil').value = usuario.correo || '';
  document.getElementById('centroPerfil').value = usuario.centro || '';
  document.getElementById('paisPerfil').value = usuario.pais || '';
  document.getElementById('departamentoPerfil').value = usuario.departamento || '';
  document.getElementById('ciudadPerfil').value = usuario.ciudad || '';
  document.getElementById('telefonoPerfil').value = usuario.telefono || '';
  document.getElementById('direccionPerfil').value = usuario.direccion || '';
  document.getElementById('correoCentroPerfil').value = usuario.correoCentro || usuario.correo_centro || '';
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function actualizarEstadisticas() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) return;

  // Cargar proyectos (si existen)
  const claveProyectos = `proyectos_${usuario.id || usuario.correo}`;
  const proyectos = JSON.parse(localStorage.getItem(claveProyectos)) || [];
  
  // Cargar eventos (si existen)
  const claveEventos = `eventos_${usuario.id || usuario.correo}`;
  const eventos = JSON.parse(localStorage.getItem(claveEventos)) || [];

  // Animación de conteo
  animarContador('statProyectos', proyectos.length);
  animarContador('statEventos', eventos.length);
}

// ========== ANIMACIÓN DE CONTADOR ==========
function animarContador(elementId, targetValue) {
  const element = document.getElementById(elementId);
  const duration = 1000;
  const increment = targetValue / (duration / 16);
  let current = 0;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= targetValue) {
      element.textContent = targetValue;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ========== INICIALIZAR SUBIDA DE FOTO ==========
function inicializarSubidaFoto() {
  const btnCambiarFoto = document.getElementById('btnCambiarFoto');
  const inputFoto = document.getElementById('inputFoto');
  const avatarOverlay = document.querySelector('.avatar-overlay');
  const btnEliminarFoto = document.getElementById('btnEliminarFoto');
  
  // Click en botón
  btnCambiarFoto.addEventListener('click', () => {
    inputFoto.click();
  });
  
  // Click en overlay
  if (avatarOverlay) {
    avatarOverlay.addEventListener('click', () => {
      inputFoto.click();
    });
  }
  
  // Cuando se selecciona una foto
  inputFoto.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validar que sea imagen
    if (!file.type.startsWith('image/')) {
      mostrarMensaje('error', '⚠️ Por favor selecciona un archivo de imagen válido');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      mostrarMensaje('error', '⚠️ La imagen es muy grande. Máximo 5MB');
      return;
    }
    
    // Leer y mostrar la imagen
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const imagenBase64 = event.target.result;
      
      // Mostrar imagen
      const avatarImg = document.getElementById('avatarImg');
      const avatarInicial = document.getElementById('avatarInicial');
      
      avatarImg.src = imagenBase64;
      avatarImg.style.display = 'block';
      avatarInicial.style.display = 'none';
      
      // Guardar en localStorage
      const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
      usuario.fotoPerfil = imagenBase64;
      localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
      
      // Mostrar botón eliminar
      btnEliminarFoto.style.display = 'block';
      
      mostrarMensaje('exito', '✅ Foto actualizada correctamente');
      
      // Animar el avatar
      avatarImg.style.animation = 'none';
      setTimeout(() => {
        avatarImg.style.animation = 'avatarPulse 2s ease-in-out infinite';
      }, 10);
    };
    
    reader.readAsDataURL(file);
  });
  
  // Eliminar foto
  btnEliminarFoto.addEventListener('click', () => {
    if (confirm('¿Deseas eliminar tu foto de perfil?')) {
      const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
      delete usuario.fotoPerfil;
      localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
      
      cargarPerfil();
      mostrarMensaje('exito', '✅ Foto eliminada correctamente');
    }
  });
}

// ========== GUARDAR CAMBIOS ==========
document.getElementById('formPerfil').addEventListener('submit', function(e) {
  e.preventDefault();
  console.log('💾 Guardando cambios del perfil...');

  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));

  if (!usuario) {
    mostrarMensaje('error', 'No se encontró la sesión del usuario');
    return;
  }

  // Validar campos requeridos
  const camposRequeridos = [
    { id: 'primerNombrePerfil', nombre: 'Primer nombre' },
    { id: 'apellidosPerfil', nombre: 'Apellidos' },
    { id: 'edadPerfil', nombre: 'Edad' },
    { id: 'correoPerfil', nombre: 'Correo electrónico' },
    { id: 'centroPerfil', nombre: 'Centro educativo' },
    { id: 'paisPerfil', nombre: 'País' },
    { id: 'departamentoPerfil', nombre: 'Departamento' },
    { id: 'ciudadPerfil', nombre: 'Ciudad' },
    { id: 'telefonoPerfil', nombre: 'Teléfono' },
    { id: 'direccionPerfil', nombre: 'Dirección' },
    { id: 'correoCentroPerfil', nombre: 'Correo del centro' }
  ];

  for (const campo of camposRequeridos) {
    const valor = document.getElementById(campo.id).value.trim();
    if (!valor) {
      mostrarMensaje('error', `⚠️ El campo "${campo.nombre}" es requerido`);
      document.getElementById(campo.id).focus();
      return;
    }
  }

  // Validar edad
  const edad = parseInt(document.getElementById('edadPerfil').value);
  if (edad < 1 || edad > 120) {
    mostrarMensaje('error', '⚠️ La edad debe estar entre 1 y 120 años');
    return;
  }

  // Actualizar datos con animación
  const btnGuardar = e.target.querySelector('.btn-primary');
  btnGuardar.textContent = '💾 Guardando...';
  btnGuardar.disabled = true;

  setTimeout(() => {
    usuario.primerNombre = document.getElementById('primerNombrePerfil').value.trim();
    usuario.segundoNombre = document.getElementById('segundoNombrePerfil').value.trim();
    usuario.apellidos = document.getElementById('apellidosPerfil').value.trim();
    usuario.edad = edad;
    usuario.correo = document.getElementById('correoPerfil').value.trim();
    usuario.centro = document.getElementById('centroPerfil').value.trim();
    usuario.pais = document.getElementById('paisPerfil').value.trim();
    usuario.departamento = document.getElementById('departamentoPerfil').value.trim();
    usuario.ciudad = document.getElementById('ciudadPerfil').value.trim();
    usuario.telefono = document.getElementById('telefonoPerfil').value.trim();
    usuario.direccion = document.getElementById('direccionPerfil').value.trim();
    usuario.correoCentro = document.getElementById('correoCentroPerfil').value.trim();

    // Guardar en localStorage
    localStorage.setItem('usuarioActivo', JSON.stringify(usuario));

    // Mostrar mensaje de éxito con confetti
    mostrarMensaje('exito', '🎉 ¡Perfil actualizado correctamente!');

    // Actualizar UI
    cargarPerfil();

    // Restaurar botón
    btnGuardar.textContent = '💾 Guardar Cambios';
    btnGuardar.disabled = false;

    // Scroll al top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Efecto de confetti
    crearConfetti();
  }, 800);
});

// ========== EFECTO CONFETTI ==========
function crearConfetti() {
  const colors = ['#eeada7', '#f8c4bf', '#b3544d', '#e09791'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.top = '-10px';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    confetti.style.opacity = '1';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.transition = 'all 3s ease-out';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.style.top = '100vh';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.opacity = '0';
    }, 50);
    
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

// ========== CANCELAR EDICIÓN ==========
function cancelarEdicion() {
  if (confirm('¿Descartar los cambios no guardados?')) {
    cargarPerfil();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ========== MOSTRAR MENSAJE ==========
function mostrarMensaje(tipo, texto) {
  const mensaje = document.getElementById('mensajePerfil');
  mensaje.innerHTML = `<span style="font-size: 20px;">${tipo === 'exito' ? '✅' : '⚠️'}</span> ${texto}`;
  mensaje.className = `mensaje ${tipo}`;
  mensaje.style.display = 'flex';

  setTimeout(() => {
    mensaje.style.opacity = '0';
    setTimeout(() => {
      mensaje.style.display = 'none';
      mensaje.style.opacity = '1';
    }, 300);
  }, 4000);
}

// ========== INICIALIZAR TEMA ==========
function inicializarTema() {
  const temaToggle = document.getElementById('temaToggle');
  
  if (!temaToggle) return;

  const temaGuardado = localStorage.getItem('tema');
  if (temaGuardado === 'dark') {
    document.body.classList.add('dark');
    temaToggle.textContent = 'Tema Claro';
  }

  temaToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const esDark = document.body.classList.contains('dark');
    localStorage.setItem('tema', esDark ? 'dark' : 'light');
    temaToggle.textContent = esDark ? 'Tema Claro' : 'Tema Oscuro';
  });
}

// ========== CERRAR SESIÓN ==========
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'index.html';
  }
}

// ========== ANIMACIÓN DE ENTRADA ==========
window.addEventListener('load', () => {
  const elementos = document.querySelectorAll('.perfil-card, .perfil-form-container, .form-section');
  elementos.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    setTimeout(() => {
      el.style.transition = 'all 0.6s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, index * 100);
  });
});

console.log('✅ perfil.js premium cargado correctamente');