// ========== JAVASCRIPT PARA SECCIÓN DE INICIO ==========

// Crear partículas flotantes
function crearParticulas() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  particlesContainer.innerHTML = ''; // Limpiar primero
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 50 + 20;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particlesContainer.appendChild(particle);
  }
}

// Reloj digital
function actualizarReloj() {
  const clockElement = document.getElementById('clock');
  const dateElement = document.getElementById('date');
  
  if (!clockElement || !dateElement) return;
  
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  
  clockElement.textContent = `${horas}:${minutos}:${segundos}`;
  
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = ahora.toLocaleDateString('es-ES', opciones);
}

// Contador animado
function animarContadores() {
  const contadores = document.querySelectorAll('.stat-number');
  
  contadores.forEach(contador => {
    const target = parseInt(contador.getAttribute('data-target'));
    if (isNaN(target)) return;
    
    const duracion = 2000;
    const incremento = target / (duracion / 16);
    let actual = 0;
    
    const animar = () => {
      actual += incremento;
      if (actual < target) {
        contador.textContent = Math.floor(actual);
        requestAnimationFrame(animar);
      } else {
        contador.textContent = target;
      }
    };
    
    animar();
  });
}

// Toggle tarjetas expandibles
function toggleTarjeta(elemento) {
  const tarjetas = document.querySelectorAll('.tarjeta-expandible');
  tarjetas.forEach(t => {
    if (t !== elemento) {
      t.classList.remove('activa');
    }
  });
  elemento.classList.toggle('activa');
}

// Hacer la función global para que funcione desde el HTML
window.toggleTarjeta = toggleTarjeta;

// Redirigir y colapsar
function redirigir(seccion, event) {
  if (event) {
    event.stopPropagation();
  }
  
  document.querySelectorAll('.tarjeta-expandible').forEach(t => t.classList.remove('activa'));
  
  // Redirigir a la página correspondiente
  const paginas = {
    'perfil': 'perfil.html',
    'proyectos': 'proyectos.html',
    'agenda': 'agenda.html',
    'estadisticas': 'estadisticas.html',
    'configuracion': 'configuracion.html',
    'soporte': 'soporte.html'
  };
  
  if (paginas[seccion]) {
    mostrarToast(`Navegando a: ${seccion}`);
    setTimeout(() => {
      window.location.href = paginas[seccion];
    }, 500);
  } else {
    mostrarToast(`Sección: ${seccion}`);
  }
}

// Hacer la función global
window.redirigir = redirigir;

// Consejos del día
const consejos = [
  'Organiza tus proyectos por prioridad para ser más eficiente.',
  'Revisa tu agenda cada mañana para planificar tu día.',
  'Actualiza tus estadísticas regularmente para tomar mejores decisiones.',
  'Comparte tus opiniones para ayudar a mejorar la plataforma.',
  'Usa las tarjetas expandibles para acceder rápidamente a cada sección.',
  'Configura notificaciones para no perderte ningún evento importante.',
  'Guarda enlaces útiles en tus proyectos para tener todo a mano.',
  'Explora las estadísticas para identificar áreas de mejora.'
];

let indiceTipActual = 0;

function cambiarTip() {
  indiceTipActual = (indiceTipActual + 1) % consejos.length;
  const tipText = document.getElementById('tipText');
  
  if (!tipText) return;
  
  tipText.style.animation = 'none';
  setTimeout(() => {
    tipText.textContent = consejos[indiceTipActual];
    tipText.style.animation = 'fadeIn 1s ease';
  }, 100);
  mostrarToast('💡 Nuevo consejo cargado');
}

// Hacer la función global
window.cambiarTip = cambiarTip;

// Enviar opinión
function enviarOpinion(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombreOpinion');
  const texto = document.getElementById('textoOpinion');
  const estrellas = document.getElementById('estrellasOpinion');
  
  if (!nombre || !texto || !estrellas) {
    mostrarToast('⚠️ Error al encontrar los campos del formulario');
    return;
  }
  
  if (!nombre.value || !texto.value || !estrellas.value) {
    mostrarToast('⚠️ Por favor completa todos los campos');
    return;
  }

  // Crear nueva opinión
  const listaOpiniones = document.getElementById('listaOpiniones');
  if (!listaOpiniones) {
    mostrarToast('⚠️ Error al agregar opinión');
    return;
  }
  
  const nuevaOpinion = document.createElement('div');
  nuevaOpinion.className = 'opinion-card';
  nuevaOpinion.style.animation = 'fadeInUp 0.5s ease';
  nuevaOpinion.innerHTML = `
    <div class="opinion-header">
      <span class="opinion-nombre">${escapeHtml(nombre.value)}</span>
      <span class="opinion-estrellas">${estrellas.value}</span>
    </div>
    <p class="opinion-texto">${escapeHtml(texto.value)}</p>
  `;
  
  listaOpiniones.insertBefore(nuevaOpinion, listaOpiniones.firstChild);

  // Limpiar formulario
  document.getElementById('formOpinion').reset();
  
  mostrarToast('✅ ¡Gracias por tu opinión!');
}

// Hacer la función global
window.enviarOpinion = enviarOpinion;

// Mostrar toast
function mostrarToast(mensaje) {
  // Eliminar toast anterior si existe
  const toastAnterior = document.querySelector('.toast');
  if (toastAnterior) {
    toastAnterior.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Hacer la función global
window.mostrarToast = mostrarToast;

// Escape HTML para prevenir XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ✅ CERRAR SESIÓN CORREGIDO - Ahora redirige a bienvenida.html
function cerrarSesion() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    mostrarToast('👋 Cerrando sesión...');
    setTimeout(() => {
      localStorage.removeItem('usuarioActivo');
      // ✅ CAMBIO IMPORTANTE: Redirigir a bienvenida en lugar de index
      window.location.href = 'bienvenida.html';
    }, 1000);
  }
}

// Hacer la función global
window.cerrarSesion = cerrarSesion;

// Efecto parallax en scroll
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrolled = window.pageYOffset;
      const particles = document.getElementById('particles');
      if (particles) {
        particles.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }
});

// Efecto de escritura en búsqueda
function inicializarBusqueda() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.length > 0) {
        searchInput.style.borderColor = '#a64c41';
      } else {
        searchInput.style.borderColor = 'transparent';
      }
    });
  }
}

// Función para crear burbujas decorativas
function crearBurbujas() {
  const burbujasContainer = document.querySelector('.burbujas-container');
  if (!burbujasContainer) {
    console.warn('No se encontró el contenedor de burbujas');
    return;
  }
  
  burbujasContainer.innerHTML = ''; // Limpiar burbujas existentes
  
  // Crear 15 burbujas
  for (let i = 0; i < 15; i++) {
    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja';
    
    // Tamaño aleatorio entre 30px y 120px
    const size = Math.random() * 90 + 30;
    burbuja.style.width = size + 'px';
    burbuja.style.height = size + 'px';
    
    // Posición horizontal aleatoria
    burbuja.style.left = Math.random() * 100 + '%';
    
    // Delay aleatorio para que no todas empiecen al mismo tiempo
    burbuja.style.animationDelay = Math.random() * 10 + 's';
    
    // Duración aleatoria
    const duracion = Math.random() * 10 + 15; // Entre 15 y 25 segundos
    burbuja.style.animationDuration = duracion + 's';
    
    burbujasContainer.appendChild(burbuja);
  }
  
  console.log('✨ Burbujas decorativas creadas');
}

// Inicialización principal
function inicializarInicio() {
  console.log('🚀 Inicializando sección de inicio...');
  
  // Crear partículas
  crearParticulas();
  
  // Crear burbujas
  crearBurbujas();
  
  // Inicializar reloj
  actualizarReloj();
  setInterval(actualizarReloj, 1000);
  
  // Animar contadores después de un pequeño delay
  setTimeout(() => {
    animarContadores();
  }, 500);
  
  // Cargar primer consejo
  const tipText = document.getElementById('tipText');
  if (tipText) {
    tipText.textContent = consejos[0];
  }
  
  // Inicializar búsqueda
  inicializarBusqueda();
  
  // Easter egg: triple click en el logo
  const logo = document.querySelector('.navbar h1');
  if (logo) {
    let clickCount = 0;
    logo.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 3) {
        mostrarToast('🎉 ¡Has encontrado el easter egg! ¡Eres increíble!');
        document.body.style.animation = 'pulse 0.5s ease';
        clickCount = 0;
      }
      setTimeout(() => { clickCount = 0; }, 1000);
    });
  }
  
  console.log('✅ Inicio cargado correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarInicio);
} else {
  inicializarInicio();
}

// También exportar para uso manual si es necesario
window.inicializarInicio = inicializarInicio;

// ========== MODAL DEL EQUIPO ========== 
// Agregar esto al FINAL de inicio.js

// Datos del equipo (PERSONALIZA ESTO CON LA INFORMACIÓN REAL)
const datosEquipo = {
  eva: {
    nombre: "Eva Medrano",
    nombreCompleto: "Eva María Medrano Garcés",
    edad: "16 años",
    rol: "Programadora",
    foto: "../assets/eva.png",
    papel: "Coordinadora general del proyecto ManageNLearn. Responsable de la planificación, programación y toma de decisiones estratégicas.",
    descripcion: "Estudiante de media técnica en promgramación de software con pasión por el desarrollo de soluciones tecnológicas educativas. Lidera el equipo con visión innovadora y compromiso con la excelencia."
  },
  salome: {
    nombre: "Salomé Vargas",
    nombreCompleto: "Salomé Vargas Sarrazola",
    edad: "17 años",
    rol: "Supervisora",
    foto: "../assets/salome.png",
    papel: "Supervisora del desarrollo y control de calidad. Asegura que todos los componentes del sistema cumplan con los estándares establecidos y funcionen correctamente.",
    descripcion: "Especializada en gestión de proyectos y aseguramiento de calidad. Su atención al detalle garantiza la entrega de un producto de alta calidad que satisface las necesidades de los usuarios."
  },
  eileen: {
    nombre: "Eileen Hoyos Vásquez",
    nombreCompleto: "Eileen Hoyos Martínez",
    edad: "16 años",
    rol: "Diseñadora",
    foto: "../assets/eileen.png",
    papel: "Diseñadora principal. Crea interfaces intuitivas y atractivas que optimizan la experiencia del usuario en la plataforma ManageNLearn.",
    descripcion: "Diseñadora por pasión. Su trabajo combina estética moderna con funcionalidad, creando experiencias digitales memorables y efectivas."
  }
};

// Función para abrir el modal
function abrirModal(persona) {
  const modal = document.getElementById('modalEquipo');
  const datos = datosEquipo[persona];
  
  if (!datos || !modal) return;
  
  // Rellenar el modal con los datos
  document.getElementById('modalFoto').src = datos.foto;
  document.getElementById('modalNombre').textContent = datos.nombre;
  document.getElementById('modalRol').textContent = datos.rol;
  document.getElementById('modalEdad').textContent = datos.edad;
  document.getElementById('modalNombreCompleto').textContent = datos.nombreCompleto;
  document.getElementById('modalPapel').textContent = datos.papel;
  document.getElementById('modalDescripcion').textContent = datos.descripcion;
  
  // Mostrar el modal con animación
  modal.classList.add('activo');
  document.body.style.overflow = 'hidden'; // Prevenir scroll del body
}

// Función para cerrar el modal
function cerrarModal(event) {
  const modal = document.getElementById('modalEquipo');
  if (!modal) return;
  
  // Si se hace click en el botón X o en el overlay (fondo oscuro)
  if (!event || event.target === modal || event.target.classList.contains('modal-cerrar')) {
    modal.classList.remove('activo');
    document.body.style.overflow = ''; // Restaurar scroll del body
  }
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    cerrarModal();
  }
});

// Hacer las funciones globales
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;

console.log('✅ Modal del equipo inicializado correctamente');

// ========== FUNCIONALIDADES AGREGADAS A inicio.js ==========
// AGREGAR ESTO AL FINAL DE TU inicio.js EXISTENTE

// ===== MEJORA 1: PARTÍCULAS CON VARIACIÓN DE OPACIDAD =====
function crearParticulasMejoradas() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  particlesContainer.innerHTML = '';
  
  for (let i = 0; i < 25; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 60 + 20;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.opacity = Math.random() * 0.4 + 0.2;
    
    particlesContainer.appendChild(particle);
  }
  
  console.log('✨ Partículas mejoradas creadas');
}

// ===== MEJORA 2: RELOJ CON EFECTOS DE TRANSICIÓN =====
function actualizarRelojMejorado() {
  const clockElement = document.getElementById('clock');
  const dateElement = document.getElementById('date');
  
  if (!clockElement || !dateElement) return;
  
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  
  const tiempoActual = `${horas}:${minutos}:${segundos}`;
  if (clockElement.textContent !== tiempoActual) {
    clockElement.style.transform = 'scale(1.05)';
    setTimeout(() => {
      clockElement.textContent = tiempoActual;
      clockElement.style.transform = 'scale(1)';
    }, 100);
  }
  
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateElement.textContent = ahora.toLocaleDateString('es-ES', opciones);
}

// ===== MEJORA 3: CONTADOR CON EASING FUNCTION =====
function animarContadoresMejorados() {
  const contadores = document.querySelectorAll('.stat-number');
  
  contadores.forEach(contador => {
    const target = parseInt(contador.getAttribute('data-target'));
    if (isNaN(target)) return;
    
    const duracion = 2000;
    const pasos = 60;
    let paso = 0;
    
    const animar = () => {
      paso++;
      const progreso = paso / pasos;
      const easing = 1 - Math.pow(1 - progreso, 3);
      const actual = target * easing;
      
      if (paso < pasos) {
        contador.textContent = Math.floor(actual);
        requestAnimationFrame(animar);
      } else {
        contador.textContent = target;
        contador.style.transform = 'scale(1.2)';
        setTimeout(() => {
          contador.style.transform = 'scale(1)';
        }, 200);
      }
    };
    
    animar();
  });
  
  console.log('🔢 Contadores animados con easing');
}

// ===== MEJORA 4: TOGGLE TARJETAS CON SCROLL AUTOMÁTICO =====
function toggleTarjetaMejorada(elemento) {
  const tarjetas = document.querySelectorAll('.tarjeta-expandible');
  const yaEstabaActiva = elemento.classList.contains('activa');
  
  tarjetas.forEach(t => {
    if (t !== elemento) {
      t.classList.remove('activa');
    }
  });
  
  if (!yaEstabaActiva) {
    elemento.classList.add('activa');
    setTimeout(() => {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  } else {
    elemento.classList.remove('activa');
  }
}

// Sobrescribir función global
window.toggleTarjeta = toggleTarjetaMejorada;

// ===== MEJORA 5: REDIRECCIÓN CON EFECTO FADE =====
function redirigirMejorado(seccion, event) {
  if (event) {
    event.stopPropagation();
  }
  
  document.querySelectorAll('.tarjeta-expandible').forEach(t => t.classList.remove('activa'));
  
  const paginas = {
    'perfil': 'perfil.html',
    'proyectos': 'proyectos.html',
    'agenda': 'agenda.html',
    'estadisticas': 'estadisticas.html',
    'configuracion': 'configuracion.html',
    'soporte': 'soporte.html'
  };
  
  if (paginas[seccion]) {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';
    
    mostrarToastMejorado(`🚀 Navegando a: ${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`, 'info');
    
    setTimeout(() => {
      window.location.href = paginas[seccion];
    }, 800);
  } else {
    mostrarToastMejorado(`📍 Sección: ${seccion}`, 'info');
  }
}

// Sobrescribir función global
window.redirigir = redirigirMejorado;

// ===== MEJORA 6: CONSEJOS AMPLIADOS =====
const consejosAmpliados = [
  '📊 Organiza tus proyectos por prioridad para ser más eficiente.',
  '📅 Revisa tu agenda cada mañana para planificar tu día.',
  '📈 Actualiza tus estadísticas regularmente para tomar mejores decisiones.',
  '💬 Comparte tus opiniones para ayudar a mejorar la plataforma.',
  '🎯 Usa las tarjetas expandibles para acceder rápidamente a cada sección.',
  '🔔 Configura notificaciones para no perderte ningún evento importante.',
  '🔗 Guarda enlaces útiles en tus proyectos para tener todo a mano.',
  '🔍 Explora las estadísticas para identificar áreas de mejora.',
  '⏰ Establece recordatorios para tus tareas más importantes.',
  '🎨 Personaliza tu tema para una experiencia más cómoda.',
  '📚 Aprovecha los tutoriales en la sección de soporte.',
  '💡 Usa atajos de teclado para ser más productivo.',
  '🌟 Marca tus proyectos favoritos para acceso rápido.',
  '📝 Mantén notas detalladas en cada proyecto.',
  '🤝 Colabora con tu equipo usando las herramientas integradas.'
];

function cambiarTipMejorado() {
  const tipText = document.getElementById('tipText');
  if (!tipText) return;
  
  const indiceActual = consejosAmpliados.indexOf(tipText.textContent);
  const nuevoIndice = (indiceActual + 1) % consejosAmpliados.length;
  
  tipText.style.transition = 'all 0.3s ease';
  tipText.style.transform = 'translateY(-20px)';
  tipText.style.opacity = '0';
  
  setTimeout(() => {
    tipText.textContent = consejosAmpliados[nuevoIndice];
    tipText.style.transform = 'translateY(0)';
    tipText.style.opacity = '1';
  }, 300);
  
  mostrarToastMejorado('💡 Nuevo consejo cargado', 'info');
}

// Sobrescribir función global
window.cambiarTip = cambiarTipMejorado;

// ===== MEJORA 7: VALIDACIÓN DE OPINIÓN MEJORADA =====
function enviarOpinionMejorada(event) {
  event.preventDefault();
  
  const nombre = document.getElementById('nombreOpinion');
  const texto = document.getElementById('textoOpinion');
  const estrellas = document.getElementById('estrellasOpinion');
  
  if (!nombre || !texto || !estrellas) {
    mostrarToastMejorado('⚠️ Error al encontrar los campos del formulario', 'error');
    return;
  }
  
  if (!nombre.value.trim() || !texto.value.trim() || !estrellas.value) {
    mostrarToastMejorado('⚠️ Por favor completa todos los campos', 'warning');
    
    const form = document.getElementById('formOpinion');
    form.style.animation = 'shake 0.5s';
    setTimeout(() => {
      form.style.animation = '';
    }, 500);
    
    return;
  }

  if (texto.value.trim().length < 10) {
    mostrarToastMejorado('⚠️ La opinión debe tener al menos 10 caracteres', 'warning');
    return;
  }

  const listaOpiniones = document.getElementById('listaOpiniones');
  if (!listaOpiniones) {
    mostrarToastMejorado('⚠️ Error al agregar opinión', 'error');
    return;
  }
  
  const nuevaOpinion = document.createElement('div');
  nuevaOpinion.className = 'opinion-card';
  nuevaOpinion.style.animation = 'fadeInUp 0.6s ease';
  nuevaOpinion.innerHTML = `
    <div class="opinion-header">
      <span class="opinion-nombre">${escapeHtml(nombre.value)}</span>
      <span class="opinion-estrellas">${estrellas.value}</span>
    </div>
    <p class="opinion-texto">${escapeHtml(texto.value)}</p>
  `;
  
  listaOpiniones.insertBefore(nuevaOpinion, listaOpiniones.firstChild);

  document.getElementById('formOpinion').reset();
  
  setTimeout(() => {
    nuevaOpinion.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
  
  mostrarToastMejorado('✅ ¡Gracias por tu opinión!', 'success');
}

// Sobrescribir función global
window.enviarOpinion = enviarOpinionMejorada;

// ===== MEJORA 8: TOAST CON TIPOS DE MENSAJE =====
function mostrarToastMejorado(mensaje, tipo = 'info') {
  const toastAnterior = document.querySelector('.toast');
  if (toastAnterior) {
    toastAnterior.remove();
  }
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  
  const colores = {
    'success': 'linear-gradient(135deg, #28a745, #20c997)',
    'error': 'linear-gradient(135deg, #dc3545, #c82333)',
    'warning': 'linear-gradient(135deg, #ffc107, #ff9800)',
    'info': 'linear-gradient(135deg, var(--primary-color), #8a3a31)'
  };
  
  toast.style.background = colores[tipo] || colores['info'];
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.5s ease';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Sobrescribir función global
window.mostrarToast = mostrarToastMejorado;

// ===== MEJORA 9: PARALLAX MEJORADO CON EFECTO EN RELOJ =====
let tickingMejorado = false;
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.pageYOffset;
  
  if (!tickingMejorado) {
    window.requestAnimationFrame(() => {
      const particles = document.getElementById('particles');
      if (particles) {
        particles.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
      
      const clock = document.querySelector('.clock-widget');
      if (clock && scrollY > 100) {
        clock.style.transform = `translateY(${Math.min(scrollY * 0.3, 50)}px)`;
        clock.style.opacity = Math.max(1 - (scrollY / 500), 0.5);
      } else if (clock) {
        clock.style.transform = 'translateY(0)';
        clock.style.opacity = '1';
      }
      
      lastScrollY = scrollY;
      tickingMejorado = false;
    });
    tickingMejorado = true;
  }
});

// ===== MEJORA 10: BÚSQUEDA CON ANIMACIÓN DEL ÍCONO =====
function inicializarBusquedaMejorada() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.length > 0) {
        searchInput.style.borderColor = '#b3544d';
        searchInput.style.boxShadow = '0 0 0 4px rgba(179, 84, 77, 0.1)';
      } else {
        searchInput.style.borderColor = 'transparent';
        searchInput.style.boxShadow = '';
      }
    });
    
    searchInput.addEventListener('focus', () => {
      const icon = document.querySelector('.search-icon');
      if (icon) {
        icon.style.transform = 'translateY(-50%) scale(1.2) rotate(15deg)';
      }
    });
    
    searchInput.addEventListener('blur', () => {
      const icon = document.querySelector('.search-icon');
      if (icon) {
        icon.style.transform = 'translateY(-50%) scale(1)';
      }
    });
  }
}

// ===== MEJORA 11: BURBUJAS CON MÁS VARIEDAD =====
function crearBurbujasMejoradas() {
  const burbujasContainer = document.querySelector('.burbujas-container');
  if (!burbujasContainer) {
    console.warn('No se encontró el contenedor de burbujas');
    return;
  }
  
  burbujasContainer.innerHTML = '';
  
  for (let i = 0; i < 20; i++) {
    const burbuja = document.createElement('div');
    burbuja.className = 'burbuja';
    
    const size = Math.random() * 100 + 30;
    burbuja.style.width = size + 'px';
    burbuja.style.height = size + 'px';
    burbuja.style.left = Math.random() * 100 + '%';
    burbuja.style.animationDelay = Math.random() * 10 + 's';
    const duracion = Math.random() * 10 + 15;
    burbuja.style.animationDuration = duracion + 's';
    burbuja.style.opacity = Math.random() * 0.4 + 0.4;
    
    burbujasContainer.appendChild(burbuja);
  }
  
  console.log('🫧 Burbujas mejoradas creadas');
}

// ===== MEJORA 12: INTERSECTION OBSERVER PARA ANIMACIONES =====
function inicializarObserverMejorado() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease';
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);
  
  const elementos = document.querySelectorAll('.stat-card, .tarjeta-expandible, .opinion-card');
  elementos.forEach(el => observer.observe(el));
  
  console.log('👁️ Observer mejorado inicializado');
}

// ===== MEJORA 13: CERRAR SESIÓN CON EFECTO =====
function cerrarSesionMejorada() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';
    
    mostrarToastMejorado('👋 Cerrando sesión...', 'info');
    
    setTimeout(() => {
      localStorage.removeItem('usuarioActivo');
      window.location.href = 'bienvenida.html';
    }, 1000);
  }
}

// Sobrescribir función global
window.cerrarSesion = cerrarSesionMejorada;

// ===== MEJORA 14: EASTER EGG MEJORADO =====
function inicializarEasterEgg() {
  const logo = document.querySelector('.navbar h1');
  if (logo) {
    let clickCount = 0;
    let clickTimer;
    
    logo.addEventListener('click', () => {
      clickCount++;
      
      clearTimeout(clickTimer);
      
      if (clickCount === 3) {
        mostrarToastMejorado('🎉 ¡Has encontrado el easter egg! ¡Eres increíble!', 'success');
        document.body.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
          document.body.style.animation = '';
        }, 600);
        clickCount = 0;
      }
      
      clickTimer = setTimeout(() => { 
        clickCount = 0; 
      }, 1000);
    });
  }
}

// ===== MEJORA 15: HOVER EN TARJETAS CON ANIMACIÓN DE ÍCONO =====
function inicializarHoverTarjetas() {
  const tarjetas = document.querySelectorAll('.tarjeta-expandible');
  tarjetas.forEach(tarjeta => {
    tarjeta.addEventListener('mouseenter', () => {
      const icon = tarjeta.querySelector('.tarjeta-icon');
      if (icon) {
        icon.style.animation = 'icon-spin 0.6s ease';
        setTimeout(() => {
          icon.style.animation = 'icon-bounce 2s ease-in-out infinite';
        }, 600);
      }
    });
  });
}

// ===== MEJORA 16: ANIMACIÓN SHAKE AL CSS =====
function agregarShakeCSS() {
  if (!document.querySelector('#shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== INICIALIZACIÓN MEJORADA =====
function inicializarInicioMejorado() {
  console.log('🚀 Inicializando mejoras de inicio...');
  
  crearParticulasMejoradas();
  crearBurbujasMejoradas();
  
  actualizarRelojMejorado();
  setInterval(actualizarRelojMejorado, 1000);
  
  setTimeout(() => {
    animarContadoresMejorados();
  }, 500);
  
  const tipText = document.getElementById('tipText');
  if (tipText) {
    tipText.textContent = consejosAmpliados[0];
  }
  
  inicializarBusquedaMejorada();
  inicializarObserverMejorado();
  inicializarEasterEgg();
  inicializarHoverTarjetas();
  agregarShakeCSS();
  
  console.log('✅ Mejoras de inicio cargadas correctamente');
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarInicioMejorado);
} else {
  inicializarInicioMejorado();
}

// Exportar para uso manual
window.inicializarInicioMejorado = inicializarInicioMejorado;

console.log('✨ Mejoras adicionales de inicio.js cargadas');

// ========== FUNCIONALIDADES WOW SUPER MEJORADAS ==========
// AGREGAR ESTO AL FINAL DE TU inicio.js

// ===== 🎵 SISTEMA DE SONIDOS =====
const sonidosMejorados = {
  click: () => reproducirTono(800, 0.1, 0.3),
  hover: () => reproducirTono(600, 0.05, 0.1),
  success: () => {
    reproducirTono(523, 0.1, 0.15);
    setTimeout(() => reproducirTono(659, 0.1, 0.15), 100);
    setTimeout(() => reproducirTono(784, 0.15, 0.2), 200);
  },
  error: () => {
    reproducirTono(200, 0.1, 0.2);
    setTimeout(() => reproducirTono(150, 0.15, 0.3), 100);
  },
  celebration: () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => reproducirTono(400 + i * 100, 0.1, 0.15), i * 100);
    }
  },
  start: () => {
    reproducirTono(440, 0.1, 0.15);
    setTimeout(() => reproducirTono(554, 0.1, 0.15), 150);
    setTimeout(() => reproducirTono(659, 0.15, 0.2), 300);
  },
  levelup: () => {
    reproducirTono(523, 0.1, 0.1);
    setTimeout(() => reproducirTono(659, 0.1, 0.1), 100);
    setTimeout(() => reproducirTono(784, 0.1, 0.1), 200);
    setTimeout(() => reproducirTono(1047, 0.2, 0.3), 300);
  },
  win: () => {
    const notas = [523, 587, 659, 784, 880, 988, 1047];
    notas.forEach((nota, i) => {
      setTimeout(() => reproducirTono(nota, 0.1, 0.15), i * 80);
    });
  }
};

function reproducirTono(frecuencia, duracion, volumen) {
  try {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gainNode = audio.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audio.destination);
    
    oscillator.frequency.value = frecuencia;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volumen, audio.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audio.currentTime + duracion);
    
    oscillator.start(audio.currentTime);
    oscillator.stop(audio.currentTime + duracion);
  } catch (e) {
    console.log('Audio no disponible');
  }
}

function reproducirSonido(tipo) {
  if (sonidosMejorados[tipo]) {
    sonidosMejorados[tipo]();
  }
}

// ===== 🎮 JUEGO DE ESTRELLA SUPER MEJORADO =====
let juegoActivo = false;
let nivelActual = 1;
let puntosJuego = 0;
let vidasJuego = 3;
let velocidadEstrella = 2000;
let estrellasPausadas = false;

function iniciarJuegoEstrellaMejorado() {
  if (juegoActivo) return;
  
  juegoActivo = true;
  nivelActual = 1;
  puntosJuego = 0;
  vidasJuego = 3;
  velocidadEstrella = 2000;
  estrellasPausadas = false;
  
  const juegoHTML = `
    <div id="juego-estrella-mejorado" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 550px; background: linear-gradient(135deg, rgba(238, 173, 167, 0.98), rgba(248, 196, 191, 0.98)); border-radius: 20px; z-index: 10003; backdrop-filter: blur(10px); overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: fadeIn 0.5s ease;">
      <div style="padding: 20px; text-align: center; color: white; background: rgba(179, 84, 77, 0.3);">
        <h3 style="margin: 0 0 10px 0; font-size: 24px;">⭐ Atrapa las Estrellas</h3>
        <div style="display: flex; justify-content: space-around; font-size: 14px; margin-top: 10px;">
          <div>💎 Puntos: <span id="puntos-juego" style="font-weight: 700;">0</span></div>
          <div>📊 Nivel: <span id="nivel-juego" style="font-weight: 700;">1</span></div>
          <div>❤️ Vidas: <span id="vidas-juego" style="font-weight: 700;">3</span></div>
        </div>
        <div id="barra-progreso" style="width: 100%; height: 8px; background: rgba(255,255,255,0.3); border-radius: 10px; margin-top: 10px; overflow: hidden;">
          <div id="progreso-nivel" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffd700, #ffed4e); transition: width 0.3s ease; box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);"></div>
        </div>
      </div>
      <div id="area-juego-mejorado" style="position: relative; width: 100%; height: 380px; background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));"></div>
      <div style="padding: 15px; display: flex; gap: 10px;">
        <button onclick="pausarJuego()" id="btn-pausar" style="flex: 1; padding: 12px; background: white; color: #b3544d; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">⏸️ Pausar</button>
        <button onclick="cerrarJuegoMejorado()" style="flex: 1; padding: 12px; background: #d4726b; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.3s ease;">❌ Cerrar</button>
      </div>
      <div id="mensaje-pausa" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 30px 50px; border-radius: 15px; font-size: 24px; display: none; z-index: 10;">⏸️ PAUSADO</div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', juegoHTML);
  
  if (!document.getElementById('animaciones-juego')) {
    const style = document.createElement('style');
    style.id = 'animaciones-juego';
    style.textContent = `
      #juego-estrella-mejorado button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
      @keyframes explode { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
      @keyframes collect { 0% { transform: scale(1) rotate(0deg); opacity: 1; } 100% { transform: scale(0) rotate(360deg); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }
  
  crearEstrellaMejorada();
  reproducirSonido('start');
}

function crearEstrellaMejorada() {
  if (!juegoActivo || estrellasPausadas) return;
  
  const area = document.getElementById('area-juego-mejorado');
  if (!area) return;
  
  const tipos = [
    { emoji: '⭐', puntos: 10, color: '#ffd700' },
    { emoji: '💎', puntos: 25, color: '#00bfff' },
    { emoji: '🌟', puntos: 50, color: '#ff69b4' },
    { emoji: '☄️', puntos: -10, color: '#ff4444' }
  ];
  
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const estrella = document.createElement('div');
  
  estrella.textContent = tipo.emoji;
  estrella.style.position = 'absolute';
  estrella.style.fontSize = '35px';
  estrella.style.cursor = 'pointer';
  estrella.style.left = Math.random() * 440 + 'px';
  estrella.style.top = Math.random() * 330 + 'px';
  estrella.style.transition = 'all 0.3s ease';
  estrella.style.filter = `drop-shadow(0 0 10px ${tipo.color})`;
  
  estrella.addEventListener('click', () => {
    puntosJuego += tipo.puntos;
    
    if (tipo.puntos < 0) {
      vidasJuego--;
      estrella.style.animation = 'explode 0.5s ease';
      reproducirSonido('error');
      if (vidasJuego <= 0) { finalizarJuego(); return; }
    } else {
      estrella.style.animation = 'collect 0.5s ease';
      reproducirSonido('success');
    }
    
    document.getElementById('puntos-juego').textContent = puntosJuego;
    document.getElementById('vidas-juego').textContent = vidasJuego;
    document.getElementById('progreso-nivel').style.width = ((puntosJuego % 100) / 100 * 100) + '%';
    
    if (puntosJuego >= nivelActual * 100 && tipo.puntos > 0) subirNivel();
    
    setTimeout(() => estrella.remove(), 500);
    crearEstrellaMejorada();
  });
  
  area.appendChild(estrella);
  setTimeout(() => {
    if (estrella.parentNode && juegoActivo) {
      estrella.style.opacity = '0';
      setTimeout(() => { if (estrella.parentNode) { estrella.remove(); crearEstrellaMejorada(); } }, 300);
    }
  }, velocidadEstrella);
}

function subirNivel() {
  nivelActual++;
  velocidadEstrella = Math.max(800, velocidadEstrella - 200);
  document.getElementById('nivel-juego').textContent = nivelActual;
  reproducirSonido('levelup');
  mostrarToast(`🎉 ¡Nivel ${nivelActual}!`, 'success');
}

function pausarJuego() {
  estrellasPausadas = !estrellasPausadas;
  const btn = document.getElementById('btn-pausar');
  const msg = document.getElementById('mensaje-pausa');
  if (estrellasPausadas) {
    btn.textContent = '▶️ Reanudar';
    msg.style.display = 'block';
  } else {
    btn.textContent = '⏸️ Pausar';
    msg.style.display = 'none';
    crearEstrellaMejorada();
  }
}

function finalizarJuego() {
  juegoActivo = false;
  const area = document.getElementById('area-juego-mejorado');
  if (area) {
    area.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center;">
      <div style="font-size: 60px; margin-bottom: 20px;">😢</div>
      <h2 style="margin: 10px 0;">GAME OVER</h2>
      <p style="font-size: 18px; margin: 10px 0;">Puntuación: <strong>${puntosJuego}</strong></p>
      <p style="font-size: 16px; margin: 10px 0;">Nivel: <strong>${nivelActual}</strong></p>
      <button onclick="reiniciarJuego()" style="margin-top: 20px; padding: 15px 40px; background: white; color: #b3544d; border: none; border-radius: 25px; cursor: pointer; font-weight: 600; font-size: 16px;">🔄 Jugar de Nuevo</button>
    </div>`;
  }
  reproducirSonido('error');
}

window.reiniciarJuego = () => { cerrarJuegoMejorado(); setTimeout(() => iniciarJuegoEstrellaMejorado(), 300); };
window.cerrarJuegoMejorado = () => {
  juegoActivo = false;
  const juego = document.getElementById('juego-estrella-mejorado');
  if (juego) { juego.style.animation = 'fadeOut 0.5s ease'; setTimeout(() => juego.remove(), 500); }
  if (puntosJuego > 0) mostrarToast(`🎮 Juego cerrado - Puntos: ${puntosJuego}`, 'info');
};
window.pausarJuego = pausarJuego;

// ===== 🎨 MODO PINTURA MEJORADO =====
let modoPinturaActivo = false, canvas = null, ctx = null, colorActual = '#e09791', grosorActual = 3, herramientaActual = 'pincel';

function activarModoPinturaMejorado() {
  if (modoPinturaActivo) { desactivarModoPintura(); return; }
  modoPinturaActivo = true;
  
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'canvas-pintura';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10001;cursor:crosshair';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }
  
  canvas.style.display = 'block';
  crearPanelHerramientas();
  
  let dibujando = false;
  canvas.onmousedown = (e) => { dibujando = true; ctx.beginPath(); ctx.moveTo(e.clientX, e.clientY); };
  canvas.onmousemove = (e) => {
    if (!dibujando) return;
    if (herramientaActual === 'pincel') {
      ctx.strokeStyle = colorActual; ctx.lineWidth = grosorActual; ctx.lineCap = 'round';
      ctx.lineTo(e.clientX, e.clientY); ctx.stroke();
    } else if (herramientaActual === 'borrador') {
      ctx.clearRect(e.clientX - grosorActual, e.clientY - grosorActual, grosorActual * 2, grosorActual * 2);
    } else if (herramientaActual === 'spray') {
      for (let i = 0; i < 10; i++) {
        const ox = (Math.random() - 0.5) * grosorActual * 2, oy = (Math.random() - 0.5) * grosorActual * 2;
        ctx.fillStyle = colorActual; ctx.fillRect(e.clientX + ox, e.clientY + oy, 2, 2);
      }
    }
  };
  canvas.onmouseup = () => dibujando = false;
  
  mostrarToast('🎨 Modo pintura activado', 'success');
  reproducirSonido('click');
}

function crearPanelHerramientas() {
  if (document.getElementById('panel-herramientas')) return;
  
  const colores = ['#e09791','#b3544d','#f8c4bf','#000000','#ffffff','#ff6b6b','#4ecdc4','#45b7d1','#f9ca24','#6c5ce7','#00b894','#fdcb6e'];
  const coloresHTML = colores.map(c => `<div onclick="cambiarColor('${c}')" style="width:35px;height:35px;background:${c};border-radius:8px;cursor:pointer;border:2px solid ${c==='#ffffff'?'#ddd':'transparent'};transition:all 0.3s" class="color-option"></div>`).join('');
  
  const panelHTML = `<div id="panel-herramientas" style="position:fixed;top:80px;left:20px;background:white;padding:20px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:10002;min-width:250px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px"><h4 style="margin:0;color:#b3544d;font-size:16px">🎨 Herramientas</h4><button onclick="toggleModoPintura()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#999">✕</button></div>
    <div style="margin-bottom:15px"><label style="display:block;margin-bottom:8px;font-size:13px;color:#666">Color:</label><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">${coloresHTML}</div>
    <input type="color" id="color-personalizado" value="${colorActual}" onchange="cambiarColor(this.value)" style="width:100%;height:40px;margin-top:10px;border:2px solid #ddd;border-radius:8px;cursor:pointer"></div>
    <div style="margin-bottom:15px"><label style="display:block;margin-bottom:8px;font-size:13px;color:#666">Herramienta:</label><div style="display:flex;gap:8px">
      <button onclick="cambiarHerramienta('pincel')" id="btn-pincel" style="flex:1;padding:10px;background:linear-gradient(135deg,#e09791,#b3544d);color:white;border:none;border-radius:8px;cursor:pointer;font-size:20px">🖌️</button>
      <button onclick="cambiarHerramienta('borrador')" id="btn-borrador" style="flex:1;padding:10px;background:#f0f0f0;color:#666;border:none;border-radius:8px;cursor:pointer;font-size:20px">🧹</button>
      <button onclick="cambiarHerramienta('spray')" id="btn-spray" style="flex:1;padding:10px;background:#f0f0f0;color:#666;border:none;border-radius:8px;cursor:pointer;font-size:20px">💨</button>
    </div></div>
    <div style="margin-bottom:15px"><label style="display:block;margin-bottom:8px;font-size:13px;color:#666">Grosor: <span id="valor-grosor">3</span>px</label><input type="range" min="1" max="50" value="3" id="slider-grosor" oninput="cambiarGrosor(this.value)" style="width:100%;cursor:pointer"></div>
    <div style="display:flex;gap:8px"><button onclick="limpiarLienzo()" style="flex:1;padding:10px;background:#ff6b6b;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">🗑️ Limpiar</button>
    <button onclick="guardarDibujo()" style="flex:1;padding:10px;background:#4ecdc4;color:white;border:none;border-radius:8px;cursor:pointer;font-weight:600;font-size:13px">💾 Guardar</button></div></div>`;
  
  document.body.insertAdjacentHTML('beforeend', panelHTML);
}

window.cambiarColor = (c) => { colorActual = c; const el = document.getElementById('color-personalizado'); if(el) el.value = c; reproducirSonido('click'); };
window.cambiarHerramienta = (h) => {
  herramientaActual = h;
  ['pincel','borrador','spray'].forEach(k => {
    const btn = document.getElementById(`btn-${k}`);
    if(btn) { btn.style.background = k===h ? 'linear-gradient(135deg,#e09791,#b3544d)' : '#f0f0f0'; btn.style.color = k===h ? 'white' : '#666'; }
  });
  reproducirSonido('click');
};
window.cambiarGrosor = (v) => { grosorActual = parseInt(v); const el = document.getElementById('valor-grosor'); if(el) el.textContent = v; };
window.limpiarLienzo = () => { if(ctx && confirm('¿Limpiar todo?')) { ctx.clearRect(0,0,canvas.width,canvas.height); mostrarToast('🧹 Limpiado','success'); reproducirSonido('success'); } };
window.guardarDibujo = () => { if(canvas) { const a = document.createElement('a'); a.download = `dibujo-${Date.now()}.png`; a.href = canvas.toDataURL(); a.click(); mostrarToast('💾 Guardado','success'); reproducirSonido('success'); } };
function desactivarModoPintura() { modoPinturaActivo = false; if(canvas) canvas.style.display = 'none'; const p = document.getElementById('panel-herramientas'); if(p) p.remove(); mostrarToast('🎨 Desactivado','info'); }
window.toggleModoPintura = activarModoPinturaMejorado;

// ===== 🎨 FIX TEMAS =====
window.aplicarTemaSeguro = (tema) => {
  const body = document.body;
  localStorage.setItem('temaPreferido', tema);
  body.className = ''; body.style.filter = '';
  let est = document.getElementById('estilo-tema');
  if (!est) { est = document.createElement('style'); est.id = 'estilo-tema'; document.head.appendChild(est); }
  
  const temas = {
    claro: { bg: 'linear-gradient(135deg,#eee5db,#f5f5f5)', color: '#000', css: '' },
    oscuro: { bg: 'linear-gradient(135deg,#1a1a1a,#2d2d2d)', color: '#fff', css: '.navbar,.stat-card,.tarjeta-expandible,.tips-card,.opinion-card{background:rgba(45,45,45,0.9)!important;color:white!important}.navbar h1,.stat-card h3,.tarjeta-titulo{color:#e09791!important}#boton-flotante,#menu-flotante{filter:none!important;opacity:1!important}' },
    sepia: { bg: 'linear-gradient(135deg,#f4e8d8,#e8d5c4)', color: '#3e2723', css: '.main-content,.navbar,.stat-card,.tarjeta-expandible,.tips-card,.opinion-card{filter:sepia(0.4)!important}#boton-flotante,#menu-flotante,#selector-tema,#panel-herramientas,#grafica-actividad,#juego-estrella-mejorado,#canvas-pintura{filter:none!important;opacity:1!important}' },
    'alto-contraste': { bg: '#000', color: '#fff', css: '.navbar,.stat-card,.tarjeta-expandible,.tips-card,.opinion-card{background:#000!important;color:#fff!important;border:2px solid #fff!important}.navbar h1,.stat-card h3,.tarjeta-titulo{color:#fff!important}#boton-flotante,#menu-flotante{filter:none!important;opacity:1!important}' }
  };
  
  const t = temas[tema];
  body.style.background = t.bg; body.style.color = t.color; est.textContent = t.css;
  mostrarToast(`🎨 Tema "${tema}" aplicado`, 'success');
  reproducirSonido('success');
  const sel = document.getElementById('selector-tema');
  if (sel) sel.style.display = 'none';
};

// ===== OTRAS FUNCIONES =====
function activarConfeti() {
  const colors = ['#e09791','#f8c4bf','#eeada7','#b3544d','#d4726b','#ffd700','#ff69b4'];
  for (let i = 0; i < 150; i++) {
    const c = document.createElement('div');
    c.style.cssText = `position:fixed;width:12px;height:12px;background:${colors[Math.floor(Math.random()*colors.length)]};left:${Math.random()*100}%;top:-20px;z-index:10005;pointer-events:none;border-radius:${Math.random()>0.5?'50%':'0'}`;
    document.body.appendChild(c);
    c.animate([{transform:'translateY(0) rotate(0deg)',opacity:1},{transform:`translateY(${window.innerHeight+20}px) rotate(${Math.random()*720}deg)`,opacity:0}],{duration:Math.random()*2000+2500,easing:'cubic-bezier(0.25,0.46,0.45,0.94)'}).onfinish = () => c.remove();
  }
  reproducirSonido('celebration');
  mostrarToast('🎉 Confeti!','success');
}

let particulasClickActivas = false;
function activarParticulasClick() {
  particulasClickActivas = !particulasClickActivas;
  if (particulasClickActivas) {
    document.addEventListener('click', crearParticulaClick);
    mostrarToast('✨ Partículas activadas','success');
  } else {
    document.removeEventListener('click', crearParticulaClick);
    mostrarToast('✨ Partículas desactivadas','info');
  }
}
function crearParticulaClick(e) {
  if (!particulasClickActivas) return;
  const cols = ['#e09791','#f8c4bf','#eeada7','#b3544d'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;background:${cols[Math.floor(Math.random()*cols.length)]};border-radius:50%;pointer-events:none;z-index:10004`;
    document.body.appendChild(p);
    const ang = (Math.PI * 2 * i) / 8, vel = 50 + Math.random() * 50, x = Math.cos(ang) * vel, y = Math.sin(ang) * vel;
    p.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${x}px,${y}px) scale(0)`,opacity:0}],{duration:600,easing:'cubic-bezier(0,0.5,0.5,1)'}).onfinish = () => p.remove();
  }
}



let estadisticasSesion = {clicksTotales:0,tiempoInicio:Date.now(),funcionesUsadas:[],seccionesVisitadas:['inicio']};
function registrarAccion(a) { if (!estadisticasSesion.funcionesUsadas.includes(a)) estadisticasSesion.funcionesUsadas.push(a); estadisticasSesion.clicksTotales++; }
function mostrarEstadisticas() {
  const t = Math.floor((Date.now()-estadisticasSesion.tiempoInicio)/1000), m = Math.floor(t/60), s = t%60;
  mostrarToast(`⏱️ ${m}m ${s}s | 👆 ${estadisticasSesion.clicksTotales} clicks | 🎯 ${estadisticasSesion.funcionesUsadas.length} funciones`,'info');
}

function mostrarContadorRegresivo() {
  if (document.getElementById('contador-especial')) return;
  
  const html = `<div id="contador-especial" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,rgba(238,173,167,0.98),rgba(248,196,191,0.98));padding:50px 70px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);z-index:10002;text-align:center;backdrop-filter:blur(10px);animation:fadeIn 0.5s ease">
    <h3 style="color:white;font-size:28px;margin-bottom:20px;text-shadow:0 2px 10px rgba(0,0,0,0.3)">🎉 ¡Próximo evento especial!</h3>
    <div id="tiempo-restante" style="font-size:56px;font-weight:bold;color:#fff;font-family:'Courier New',monospace;text-shadow:0 4px 15px rgba(0,0,0,0.3);margin:20px 0">7d 00:00:00</div>
    <p style="color:rgba(255,255,255,0.9);margin:15px 0;font-size:16px">Faltan <span id="dias-restantes">7</span> días</p>
    <button onclick="cerrarContador()" style="margin-top:25px;background:white;color:#b3544d;border:none;padding:12px 35px;border-radius:25px;cursor:pointer;font-weight:600;font-size:16px;transition:all 0.3s ease;box-shadow:0 5px 15px rgba(0,0,0,0.2)">Cerrar</button>
  </div>`;
  
  document.body.insertAdjacentHTML('beforeend', html);
  reproducirSonido('start');
  
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 7);
  
  const int = setInterval(() => {
    const dif = fecha - new Date();
    if (dif <= 0) {
      clearInterval(int);
      document.getElementById('tiempo-restante').textContent = '¡LLEGÓ! 🎊';
      activarConfeti();
      reproducirSonido('win');
      return;
    }
    const d = Math.floor(dif/(1000*60*60*24)), h = Math.floor((dif%(1000*60*60*24))/(1000*60*60)), m = Math.floor((dif%(1000*60*60))/(1000*60)), s = Math.floor((dif%(1000*60))/1000);
    document.getElementById('tiempo-restante').textContent = `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    document.getElementById('dias-restantes').textContent = d;
  }, 1000);
}

window.cerrarContador = () => {
  const c = document.getElementById('contador-especial');
  if (c) { c.style.animation = 'fadeOut 0.5s ease'; setTimeout(() => c.remove(), 500); }
  reproducirSonido('click');
};

function crearSelectorTema() {
  if (document.getElementById('selector-tema')) return;
  
  const html = `<div id="selector-tema" style="position:fixed;bottom:120px;right:30px;background:white;padding:20px;border-radius:15px;box-shadow:0 10px 30px rgba(0,0,0,0.2);z-index:9999;display:none;animation:slideInRight 0.5s ease;min-width:220px">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
      <h4 style="margin:0;color:#b3544d;font-size:16px">🎨 Temas</h4>
      <button onclick="toggleSelectorTema()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>
    </div>
    <div class="tema-option" onclick="aplicarTemaSeguro('claro')" style="padding:12px;margin:8px 0;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#eee5db,#f5f5f5);transition:all 0.3s ease;display:flex;align-items:center;gap:10px"><span style="font-size:20px">☀️</span><span>Tema Claro</span></div>
    <div class="tema-option" onclick="aplicarTemaSeguro('oscuro')" style="padding:12px;margin:8px 0;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#222,#1a1a1a);color:white;transition:all 0.3s ease;display:flex;align-items:center;gap:10px"><span style="font-size:20px">🌙</span><span>Tema Oscuro</span></div>
    <div class="tema-option" onclick="aplicarTemaSeguro('sepia')" style="padding:12px;margin:8px 0;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#f4e8d8,#e8d5c4);transition:all 0.3s ease;display:flex;align-items:center;gap:10px"><span style="font-size:20px">📜</span><span>Modo Sepia</span></div>
    <div class="tema-option" onclick="aplicarTemaSeguro('alto-contraste')" style="padding:12px;margin:8px 0;border-radius:10px;cursor:pointer;background:linear-gradient(135deg,#000,#333);color:white;transition:all 0.3s ease;display:flex;align-items:center;gap:10px"><span style="font-size:20px">⚡</span><span>Alto Contraste</span></div>
  </div>`;
  
  document.body.insertAdjacentHTML('beforeend', html);
  
  if (!document.getElementById('tema-hover')) {
    const s = document.createElement('style');
    s.id = 'tema-hover';
    s.textContent = '.tema-option:hover{transform:translateX(-5px) scale(1.05);box-shadow:0 5px 15px rgba(0,0,0,0.2)}';
    document.head.appendChild(s);
  }
}

window.toggleSelectorTema = () => {
  crearSelectorTema();
  const s = document.getElementById('selector-tema');
  if (s.style.display === 'none' || s.style.display === '') {
    s.style.display = 'block';
    reproducirSonido('click');
  } else {
    s.style.display = 'none';
  }
};

window.toggleGraficaActividad = () => mostrarToast('📊 Gráfica - En desarrollo', 'info');

// ===== 🎪 BOTÓN FLOTANTE =====
function crearBotonFlotanteMejorado() {
  const html = `<div id="boton-flotante" style="position:fixed;bottom:30px;right:30px;z-index:10007;filter:none!important;opacity:1!important">
    <button id="btn-principal-flotante" onclick="toggleMenuFlotante()" style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#e09791,#b3544d);border:3px solid white;color:white;font-size:30px;cursor:pointer;box-shadow:0 10px 30px rgba(179,84,77,0.6);transition:all 0.3s ease;animation:float-button 3s ease-in-out infinite;position:relative;overflow:hidden">
      <span style="position:relative;z-index:1">✨</span>
    </button>
    <div id="menu-flotante" style="position:absolute;bottom:90px;right:0;background:white;padding:20px;border-radius:20px;box-shadow:0 15px 40px rgba(0,0,0,0.25);display:none;min-width:260px;animation:slideInUp 0.4s ease">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
        <h4 style="margin:0;color:#b3544d;font-size:16px;font-weight:700">⚡ Funciones Especiales</h4>
        <button onclick="toggleMenuFlotante()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#999">×</button>
      </div>
      <p style="font-size:11px;color:#999;margin:10px 0 8px 0;font-weight:600;text-transform:uppercase">Efectos Visuales</p>
      <div class="menu-item" onclick="activarConfeti();registrarAccion('confeti');toggleMenuFlotante()"><span style="font-size:22px">🎉</span><div><strong>Confeti</strong><small style="display:block;color:#999">Celebra con estilo</small></div></div>
      <div class="menu-item" onclick="activarParticulasClick();registrarAccion('particulas');toggleMenuFlotante()"><span style="font-size:22px">✨</span><div><strong>Partículas Click</strong><small style="display:block;color:#999">Efecto mágico</small></div></div>
      
      <p style="font-size:11px;color:#999;margin:15px 0 8px 0;font-weight:600;text-transform:uppercase">Herramientas</p>
      <div class="menu-item" onclick="mostrarContadorRegresivo();registrarAccion('contador');toggleMenuFlotante()"><span style="font-size:22px">⏰</span><div><strong>Contador</strong><small style="display:block;color:#999">Cuenta regresiva</small></div></div>
      <div class="menu-item" onclick="toggleSelectorTema();registrarAccion('temas');toggleMenuFlotante()"><span style="font-size:22px">🎨</span><div><strong>Temas</strong><small style="display:block;color:#999">Personaliza</small></div></div>
      <div class="menu-item" onclick="toggleModoPintura();registrarAccion('pintura');toggleMenuFlotante()"><span style="font-size:22px">🖌️</span><div><strong>Modo Pintura</strong><small style="display:block;color:#999">Dibuja libremente</small></div></div>
      <p style="font-size:11px;color:#999;margin:15px 0 8px 0;font-weight:600;text-transform:uppercase">Juegos</p>
      <div class="menu-item" onclick="iniciarJuegoEstrellaMejorado();registrarAccion('juego');toggleMenuFlotante()"><span style="font-size:22px">🎮</span><div><strong>Juego Estrella</strong><small style="display:block;color:#999">¡Atrapa puntos!</small></div></div>
      <div class="menu-item" onclick="mostrarEstadisticas();registrarAccion('stats');toggleMenuFlotante()"><span style="font-size:22px">📈</span><div><strong>Estadísticas</strong><small style="display:block;color:#999">Tu actividad</small></div></div>
    </div>
  </div>`;
  
  const ant = document.getElementById('boton-flotante');
  if (ant) ant.remove();
  document.body.insertAdjacentHTML('beforeend', html);
  
  if (!document.getElementById('estilos-menu-flotante')) {
    const s = document.createElement('style');
    s.id = 'estilos-menu-flotante';
    s.textContent = `
      @keyframes float-button{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
      @keyframes slideInUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes fadeOut{from{opacity:1}to{opacity:0}}
      #btn-principal-flotante:hover{transform:scale(1.15) rotate(15deg);box-shadow:0 15px 40px rgba(179,84,77,0.7)}
      .menu-item{padding:14px;margin:6px 0;border-radius:12px;cursor:pointer;transition:all 0.3s ease;font-size:14px;display:flex;align-items:center;gap:12px;background:#f8f9fa}
      .menu-item:hover{background:linear-gradient(135deg,#f8c4bf,#eeada7);transform:translateX(-5px);color:white;box-shadow:0 5px 15px rgba(179,84,77,0.3)}
      .menu-item:hover small{color:rgba(255,255,255,0.9)!important}
      #boton-flotante,#boton-flotante *{filter:none!important;opacity:1!important}
    `;
    document.head.appendChild(s);
  }
}

window.toggleMenuFlotante = () => {
  const m = document.getElementById('menu-flotante');
  if (m) {
    if (m.style.display === 'none' || m.style.display === '') {
      m.style.display = 'block';
      reproducirSonido('click');
    } else {
      m.style.display = 'none';
    }
  }
};

// ===== 🚀 INICIALIZACIÓN =====
function inicializarFuncionalidadesWOWSuperMejoradas() {
  console.log('🚀 Inicializando funcionalidades WOW SUPER MEJORADAS...');
  
  crearBotonFlotanteMejorado();
  
  setTimeout(() => {
    document.querySelectorAll('.btn-accion, .stat-card, .tarjeta-expandible').forEach(el => {
      el.addEventListener('click', () => reproducirSonido('click'));
    });
  }, 1000);
  
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'c') { e.preventDefault(); activarConfeti(); registrarAccion('confeti-teclado'); }
    if (e.ctrlKey && e.key === 't') { e.preventDefault(); toggleSelectorTema(); registrarAccion('temas-teclado'); }
    if (e.ctrlKey && e.key === 'p') { e.preventDefault(); toggleModoPintura(); registrarAccion('pintura-teclado'); }
    if (e.ctrlKey && e.key === 'g') { e.preventDefault(); iniciarJuegoEstrellaMejorado(); registrarAccion('juego-teclado'); }
    if (e.ctrlKey && e.key === 'e') { e.preventDefault(); mostrarEstadisticas(); }
  });
  
  const tema = localStorage.getItem('temaPreferido');
  if (tema) aplicarTemaSeguro(tema);
  
  setTimeout(() => {
    mostrarToast('✨ ¡Funciones especiales listas! Haz clic en el botón flotante', 'success');
  }, 2000);
  
  console.log('✅ Funcionalidades WOW SUPER MEJORADAS cargadas');
  console.log('💡 Atajos: Ctrl+C (Confeti) | Ctrl+T (Temas) | Ctrl+P (Pintura) | Ctrl+G (Juego) | Ctrl+E (Estadísticas)');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarFuncionalidadesWOWSuperMejoradas);
} else {
  inicializarFuncionalidadesWOWSuperMejoradas();
}

window.iniciarJuegoEstrellaMejorado = iniciarJuegoEstrellaMejorado;
window.activarConfeti = activarConfeti;
window.activarParticulasClick = activarParticulasClick;
window.mostrarEstadisticas = mostrarEstadisticas;
window.registrarAccion = registrarAccion;
window.toggleGraficaActividad = toggleGraficaActividad;
window.mostrarContadorRegresivo = mostrarContadorRegresivo;

console.log('🎉 ¡CÓDIGO WOW SUPER MEJORADO CARGADO EXITOSAMENTE!')

// ========== SISTEMA DE OPINIONES CON API ==========

const OpinionesManager = {
  apiUrl: '../../api/opiniones.php',
  usuario: null,

  // ========== INICIALIZAR ==========
  init() {
    this.usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    this.cargarOpiniones();
    this.inicializarFormulario();
  },

  // ========== CARGAR OPINIONES DESDE API ==========
  async cargarOpiniones() {
    try {
      console.log('📥 Cargando opiniones desde API...');
      const response = await fetch(this.apiUrl);
      const result = await response.json();

      if (result.success) {
        this.mostrarOpiniones(result.data);
        console.log(`✅ ${result.data.length} opiniones cargadas`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('⚠️ Error al cargar opiniones:', error);
      this.mostrarMensaje('⚠️ Error al cargar opiniones. Intenta recargar la página.', 'warning');
    }
  },

  // ========== MOSTRAR OPINIONES EN EL DOM ==========
  mostrarOpiniones(opiniones) {
    const container = document.getElementById('listaOpiniones');
    if (!container) return;

    if (opiniones.length === 0) {
      container.innerHTML = `
        <div class="sin-opiniones">
          <div class="sin-opiniones-icon">📭</div>
          <p>Aún no hay opiniones. ¡Sé el primero en compartir tu experiencia!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = opiniones.map(opinion => `
      <div class="opinion-card" data-id="${opinion.id}">
        <div class="opinion-header">
          <div>
            <span class="opinion-nombre">${this.escapeHtml(opinion.nombre)}</span>
            ${this.usuario && this.usuario.id === opinion.usuario_id ? 
              '<span class="opinion-badge">Tu opinión</span>' : ''}
          </div>
          <span class="opinion-estrellas">${opinion.estrellas}</span>
        </div>
        <p class="opinion-texto">${this.escapeHtml(opinion.texto)}</p>
        <div class="opinion-footer">
          <span class="opinion-fecha">${this.formatearFecha(opinion.fecha_creacion)}</span>
          ${this.usuario && this.usuario.id === opinion.usuario_id ? `
            <button class="btn-eliminar-opinion" onclick="OpinionesManager.eliminarOpinion(${opinion.id})">
              🗑️ Eliminar
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  },

  // ========== INICIALIZAR FORMULARIO ==========
  inicializarFormulario() {
    const form = document.getElementById('formOpinion');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.enviarOpinion(e);
    });

    // Agregar selector de estrellas interactivo si no existe
    this.crearSelectorEstrellas();
  },

  // ========== CREAR SELECTOR DE ESTRELLAS ==========
  crearSelectorEstrellas() {
    const select = document.getElementById('estrellasOpinion');
    if (!select) return;

    // Reemplazar select con estrellas clicables
    const container = select.parentElement;
    const estrellas = document.createElement('div');
    estrellas.className = 'estrellas-selector';
    estrellas.innerHTML = `
      <div class="estrellas-clickables">
        ${[1, 2, 3, 4, 5].map(num => `
          <span class="estrella" data-value="${num}">⭐</span>
        `).join('')}
      </div>
      <input type="hidden" id="calificacionHidden" name="calificacion" value="">
    `;

    select.style.display = 'none';
    container.appendChild(estrellas);

    // Agregar eventos de clic
    const estrellasEl = estrellas.querySelectorAll('.estrella');
    estrellasEl.forEach((estrella, index) => {
      estrella.addEventListener('click', () => {
        const valor = index + 1;
        document.getElementById('calificacionHidden').value = valor;
        
        // Resaltar estrellas
        estrellasEl.forEach((e, i) => {
          if (i < valor) {
            e.classList.add('activa');
          } else {
            e.classList.remove('activa');
          }
        });
      });

      // Efecto hover
      estrella.addEventListener('mouseenter', () => {
        estrellasEl.forEach((e, i) => {
          if (i <= index) {
            e.style.transform = 'scale(1.2)';
          }
        });
      });

      estrella.addEventListener('mouseleave', () => {
        estrellasEl.forEach(e => {
          e.style.transform = 'scale(1)';
        });
      });
    });
  },

  // ========== ENVIAR OPINIÓN ==========
  async enviarOpinion(event) {
    event.preventDefault();

    if (!this.usuario) {
      this.mostrarMensaje('⚠️ Debes iniciar sesión para dejar una opinión', 'warning');
      return;
    }

    const nombre = document.getElementById('nombreOpinion').value.trim();
    const texto = document.getElementById('textoOpinion').value.trim();
    const calificacion = parseInt(document.getElementById('calificacionHidden')?.value || 
                                  document.getElementById('estrellasOpinion')?.value || 0);

    // Validaciones
    if (!nombre || nombre.length < 3) {
      this.mostrarMensaje('⚠️ El nombre debe tener al menos 3 caracteres', 'warning');
      return;
    }

    if (!texto || texto.length < 10) {
      this.mostrarMensaje('⚠️ La opinión debe tener al menos 10 caracteres', 'warning');
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      this.mostrarMensaje('⚠️ Por favor selecciona una calificación', 'warning');
      return;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: this.usuario.id,
          nombre: nombre,
          texto: texto,
          calificacion: calificacion
        })
      });

      const result = await response.json();

      if (result.success) {
        this.mostrarMensaje('✅ ¡Gracias por tu opinión!', 'success');
        
        // Limpiar formulario
        document.getElementById('formOpinion').reset();
        document.getElementById('calificacionHidden').value = '';
        document.querySelectorAll('.estrella').forEach(e => e.classList.remove('activa'));
        
        // Recargar opiniones
        await this.cargarOpiniones();
        
        // Scroll a las opiniones
        document.getElementById('listaOpiniones').scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error al enviar opinión:', error);
      this.mostrarMensaje('❌ Error al enviar opinión: ' + error.message, 'error');
    }
  },

  // ========== ELIMINAR OPINIÓN ==========
  async eliminarOpinion(id) {
    if (!confirm('¿Estás seguro de eliminar tu opinión?')) return;

    if (!this.usuario) {
      this.mostrarMensaje('⚠️ Debes iniciar sesión', 'warning');
      return;
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          usuario_id: this.usuario.id
        })
      });

      const result = await response.json();

      if (result.success) {
        this.mostrarMensaje('✅ Opinión eliminada', 'success');
        await this.cargarOpiniones();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      this.mostrarMensaje('❌ Error al eliminar: ' + error.message, 'error');
    }
  },

  // ========== UTILIDADES ==========
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  mostrarMensaje(mensaje, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.textContent = mensaje;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      z-index: 10000;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
      animation: slideInRight 0.4s ease;
    `;
    
    const colores = {
      success: 'background: linear-gradient(135deg, #28a745, #20c997); color: white;',
      error: 'background: linear-gradient(135deg, #dc3545, #ff6b81); color: white;',
      warning: 'background: linear-gradient(135deg, #ffc107, #ff8b3d); color: white;',
      info: 'background: linear-gradient(135deg, #17a2b8, #00d2ff); color: white;'
    };
    
    toast.style.cssText += colores[tipo];
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
};

// ========== ESTILOS ADICIONALES ==========
const estilosOpiniones = document.createElement('style');
estilosOpiniones.textContent = `
  .estrellas-selector {
    margin-top: 10px;
  }

  .estrellas-clickables {
    display: flex;
    gap: 8px;
    font-size: 32px;
  }

  .estrella {
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0.3;
    filter: grayscale(100%);
  }

  .estrella:hover,
  .estrella.activa {
    opacity: 1;
    filter: grayscale(0%);
    transform: scale(1.2);
  }

  .opinion-badge {
    display: inline-block;
    background: #4CAF50;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-left: 10px;
  }

  .opinion-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #e0e0e0;
  }

  body.dark .opinion-footer {
    border-top-color: #444;
  }

  .opinion-fecha {
    font-size: 13px;
    color: #999;
    font-style: italic;
  }

  .btn-eliminar-opinion {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .btn-eliminar-opinion:hover {
    background: #c82333;
    transform: scale(1.05);
  }

  .sin-opiniones {
    text-align: center;
    padding: 60px 20px;
    color: #666;
  }

  body.dark .sin-opiniones {
    color: #aaa;
  }

  .sin-opiniones-icon {
    font-size: 80px;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(estilosOpiniones);

// ========== INICIALIZAR AL CARGAR LA PÁGINA ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => OpinionesManager.init());
} else {
  OpinionesManager.init();
}

// Exportar para uso global
window.OpinionesManager = OpinionesManager;

console.log('✅ Sistema de opiniones cargado correctamente');