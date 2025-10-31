// ========== BIENVENIDA.JS ==========
// Script para la página de aterrizaje de ManageNLearn

// ========== VERIFICAR SI YA HAY SESIÓN ACTIVA ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando página de bienvenida...');
  
  // Si ya hay sesión activa, redirigir al dashboard
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  
  if (usuarioActivo) {
    console.log('✅ Usuario ya autenticado, redirigiendo al dashboard...');
    window.location.href = 'index.html'; // El index ahora muestra el dashboard
    return;
  }
  
  // Si no hay sesión, inicializar efectos visuales
  inicializarEfectosVisuales();
  console.log('✅ Página de bienvenida cargada correctamente');
});

// ========== CREAR PARTÍCULAS FLOTANTES ==========
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

// ========== CREAR BURBUJAS DECORATIVAS ==========
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
    
    // Delay aleatorio
    burbuja.style.animationDelay = Math.random() * 10 + 's';
    
    // Duración aleatoria entre 15 y 25 segundos
    const duracion = Math.random() * 10 + 15;
    burbuja.style.animationDuration = duracion + 's';
    
    burbujasContainer.appendChild(burbuja);
  }
  
  console.log('✨ Burbujas decorativas creadas');
}

// ========== EFECTO PARALLAX EN SCROLL ==========
function inicializarParallax() {
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
}

// ========== ANIMACIÓN DE ENTRADA SUAVE ==========
function animarEntrada() {
  const elements = document.querySelectorAll('.hero-content > *');
  
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'all 0.8s ease';
      
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }, index * 200);
  });
}

// ========== INICIALIZAR TODOS LOS EFECTOS VISUALES ==========
function inicializarEfectosVisuales() {
  crearParticulas();
  crearBurbujas();
  inicializarParallax();
  animarEntrada();
  
  // Easter egg: triple click en el logo
  const logo = document.querySelector('.navbar h1');
  if (logo) {
    let clickCount = 0;
    logo.addEventListener('click', () => {
      clickCount++;
      if (clickCount === 3) {
        mostrarMensajeEasterEgg();
        clickCount = 0;
      }
      setTimeout(() => { clickCount = 0; }, 1000);
    });
  }
}

// ========== EASTER EGG ==========
function mostrarMensajeEasterEgg() {
  const mensaje = document.createElement('div');
  mensaje.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #b3544d, #8a3a31);
    color: white;
    padding: 20px 30px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: slideIn 0.5s ease;
    font-weight: 600;
  `;
  mensaje.textContent = '🎉 ¡Has encontrado el easter egg! ¡Eres increíble!';
  
  document.body.appendChild(mensaje);
  
  setTimeout(() => {
    mensaje.style.animation = 'slideOut 0.5s ease';
    setTimeout(() => mensaje.remove(), 500);
  }, 3000);
}

// ========== SMOOTH SCROLL PARA ENLACES ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

console.log('✅ bienvenida.js cargado correctamente');

// ========== MODAL DEL EQUIPO ========== 
// Datos del equipo (PERSONALIZA ESTO CON LA INFORMACIÓN REAL)
const datosEquipo = {
  eva: {
    nombre: "Eva Medrano",
    nombreCompleto: "Eva María Medrano González",
    edad: "20 años",
    rol: "Líder de Proyecto",
    foto: "../assets/eva.png",
    papel: "Coordinadora general del proyecto ManageNLearn. Responsable de la planificación, gestión de recursos y toma de decisiones estratégicas.",
    descripcion: "Estudiante de Ingeniería de Sistemas con pasión por el desarrollo de soluciones tecnológicas educativas. Lidera el equipo con visión innovadora y compromiso con la excelencia."
  },
  salome: {
    nombre: "Salomé Vargas",
    nombreCompleto: "Salomé Vargas Restrepo",
    edad: "21 años",
    rol: "Supervisora",
    foto: "../assets/salome.png",
    papel: "Supervisora del desarrollo y control de calidad. Asegura que todos los componentes del sistema cumplan con los estándares establecidos y funcionen correctamente.",
    descripcion: "Especializada en gestión de proyectos y aseguramiento de calidad. Su atención al detalle garantiza la entrega de un producto de alta calidad que satisface las necesidades de los usuarios."
  },
  eileen: {
    nombre: "Eileen Hoyos",
    nombreCompleto: "Eileen Hoyos Martínez",
    edad: "19 años",
    rol: "Diseñadora",
    foto: "../assets/eileen.png",
    papel: "Diseñadora UX/UI principal. Crea interfaces intuitivas y atractivas que optimizan la experiencia del usuario en la plataforma ManageNLearn.",
    descripcion: "Diseñadora creativa con experiencia en interfaces de usuario. Su trabajo combina estética moderna con funcionalidad, creando experiencias digitales memorables y efectivas."
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
  document.body.style.overflow = 'hidden';
}

// Función para cerrar el modal
function cerrarModal(event) {
  const modal = document.getElementById('modalEquipo');
  if (!modal) return;
  
  if (!event || event.target === modal || event.target.classList.contains('modal-cerrar')) {
    modal.classList.remove('activo');
    document.body.style.overflow = '';
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