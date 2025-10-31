document.addEventListener("DOMContentLoaded", () => {
// Cargar datos en perfil para editar
function cargarPerfil(usuario) {
  const formPerfil = document.getElementById("formPerfil");
  if (!formPerfil) return;
  
  formPerfil.primerNombrePerfil.value = usuario.primerNombre;
  formPerfil.segundoNombrePerfil.value = usuario.segundoNombre || "";
  formPerfil.apellidosPerfil.value = usuario.apellidos;
  formPerfil.edadPerfil.value = usuario.edad;
  formPerfil.correoPerfil.value = usuario.correo;

  formPerfil.centroPerfil.value = usuario.centro;
  formPerfil.paisPerfil.value = usuario.pais;
  formPerfil.departamentoPerfil.value = usuario.departamento;
  formPerfil.ciudadPerfil.value = usuario.ciudad;
  formPerfil.direccionPerfil.value = usuario.direccion;
  formPerfil.telefonoPerfil.value = usuario.telefono;
  formPerfil.correoCentroPerfil.value = usuario.correoCentro;
}

// Guardar perfil editado
const formPerfil = document.getElementById("formPerfil");
if (formPerfil) {
  formPerfil.addEventListener("submit", e => {
    e.preventDefault();
    let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));

    const data = new FormData(formPerfil);
    usuario.primerNombre = data.get("primerNombrePerfil").trim();
    usuario.segundoNombre = data.get("segundoNombrePerfil").trim();
    usuario.apellidos = data.get("apellidosPerfil").trim();
    usuario.edad = data.get("edadPerfil").trim();
    usuario.correo = data.get("correoPerfil").trim();

    usuario.centro = data.get("centroPerfil").trim();
    usuario.pais = data.get("paisPerfil").trim();
    usuario.departamento = data.get("departamentoPerfil").trim();
    usuario.ciudad = data.get("ciudadPerfil").trim();
    usuario.direccion = data.get("direccionPerfil").trim();
    usuario.telefono = data.get("telefonoPerfil").trim();
    usuario.correoCentro = data.get("correoCentroPerfil").trim();

    // Actualizar usuario en array usuarios
    let usuarios = JSON.parse(localStorage.getItem("usuarios"));
    const index = usuarios.findIndex(u => u.correo === usuario.correo);
    if(index !== -1){
      usuarios[index] = usuario;
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
      mensajeGuardado.style.color = "green";
      mensajeGuardado.textContent = "Perfil actualizado con éxito.";
      document.getElementById("nombreUsuario").textContent = usuario.primerNombre;
    } else {
      mensajeGuardado.style.color = "red";
      mensajeGuardado.textContent = "Error al actualizar perfil.";
    }
  });
}

function cargarProyectos(usuario) {
  if (!listaProyectos) return;
  
  listaProyectos.innerHTML = "";
  
  const mensajeSinProyectos = document.getElementById("mensajeSinProyectos");
  const contadorProyectos = document.getElementById("contadorProyectos");
  
  if(usuario.proyectos.length === 0){
    if (mensajeSinProyectos) mensajeSinProyectos.style.display = "block";
    if (contadorProyectos) contadorProyectos.textContent = "Proyectos activos: 0";
    return;
  }
  
  if (mensajeSinProyectos) mensajeSinProyectos.style.display = "none";
  if (contadorProyectos) contadorProyectos.textContent = `Proyectos activos: ${usuario.proyectos.length}`;
  
  usuario.proyectos.forEach(proy => {
    const li = document.createElement("li");
    li.className = "proyecto-item";
    li.innerHTML = `
      <div class="proyecto-card">
        <h3 class="proyecto-nombre">${proy.nombre}</h3>
        <p class="proyecto-desc">${proy.descripcion}</p>
        <p><strong>📅 Fecha entrega:</strong> ${proy.fecha}</p>
        <p><strong>📌 Estado:</strong> <span class="estado ${proy.estado.toLowerCase()}">${proy.estado}</span></p>
        ${proy.enlace ? `<p><a href="${proy.enlace}" target="_blank" class="proyecto-link">🔗 Enlace útil</a></p>` : ""}
        <button onclick="eliminarProyecto(${proy.id})" class="btn-eliminar">🗑 Eliminar</button>
      </div>
    `;
    listaProyectos.appendChild(li);
  });
}

function eliminarProyecto(id) {
  let usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
  usuario.proyectos = usuario.proyectos.filter(p => p.id !== id);
  actualizarUsuarioActivo(usuario);
  cargarProyectos(usuario);
  cargarEstadisticas(usuario);
  mensajeGuardado.style.color = "green";
  mensajeGuardado.textContent = "Proyecto eliminado.";
}

// Estadísticas con Chart.js
let chart;

function cargarEstadisticas(usuario) {
  const ctx = document.getElementById("estadisticasChart");
  if (!ctx) return;

  const datos = {
    labels: usuario.proyectos.map(p => p.nombre),
    datasets: [{
      label: 'Cantidad de proyectos',
      data: usuario.proyectos.map(() => 1), // simplemente un 1 por proyecto para demo
      backgroundColor: usuario.proyectos.map(() => '#b3544d'),
      borderWidth: 1
    }]
  };

  if(chart){
    chart.destroy();
  }
  
  chart = new Chart(ctx, {
    type: 'bar',
    data: datos,
    options: {
      scales: {
        y: { beginAtZero: true, precision:0 }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}


// Variables globales
let eventos = [];

// Inicializar la agenda
function inicializarAgenda() {
  cargarEventos();

  // Establecer fecha mínima como hoy
  const inputFecha = document.querySelector('input[name="fechaEvento"]');
  if (inputFecha) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    inputFecha.setAttribute('min', `${yyyy}-${mm}-${dd}`);
  }

  // Listener del formulario
  const formAgenda = document.getElementById('formAgenda');
  if (formAgenda) {
    formAgenda.addEventListener('submit', function (e) {
      e.preventDefault();
      agregarEvento();
    });
  }

  renderizarEventos();
}

// Agregar evento
function agregarEvento() {
  const inputEvento = document.querySelector('input[name="evento"]');
  const inputFecha = document.querySelector('input[name="fechaEvento"]');

  if (!inputEvento || !inputFecha) return;

  const titulo = inputEvento.value.trim();
  const fecha = inputFecha.value;

  if (!titulo) {
    alert('Por favor, escribe el nombre del evento.');
    inputEvento.focus();
    return;
  }
  if (!fecha) {
    alert('Por favor, selecciona una fecha.');
    inputFecha.focus();
    return;
  }

  const nuevoEvento = {
    id: Date.now(),
    titulo,
    fecha
  };

  eventos.push(nuevoEvento);
  guardarEventos();
  renderizarEventos();

  // limpiar
  inputEvento.value = '';
  inputFecha.value = '';
  inputEvento.focus();

  mostrarNotificacion('✅ Evento agregado correctamente');
}

// Eliminar evento por id
function eliminarEvento(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
  eventos = eventos.filter(ev => ev.id !== id);
  guardarEventos();
  renderizarEventos();
  mostrarNotificacion('🗑️ Evento eliminado');
}

// Ordenar eventos por fecha
function ordenarEventos() {
  return eventos.slice().sort((a, b) => {
    const da = crearFechaLocal(a.fecha);
    const db = crearFechaLocal(b.fecha);
    return da - db;
  });
}

// Crear objeto Date desde yyyy-mm-dd
function crearFechaLocal(isoDate) {
  const partes = isoDate.split('-');
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

// Calcular días restantes
function calcularDiasRestantes(fechaEvento) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = crearFechaLocal(fechaEvento);
  fecha.setHours(0, 0, 0, 0);
  const diferencia = fecha - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

// Etiquetas de días
function obtenerEtiquetaDias(dias) {
  if (dias < 0) {
    return { texto: `Hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`, clase: 'pasado' };
  } else if (dias === 0) {
    return { texto: '¡HOY!', clase: 'hoy' };
  } else if (dias === 1) {
    return { texto: 'Mañana', clase: 'futuro' };
  } else {
    return { texto: `En ${dias} días`, clase: 'futuro' };
  }
}

// Renderizar lista
function renderizarEventos() {
  const listaEventos = document.getElementById('listaEventos');
  if (!listaEventos) return;

  const ordenados = ordenarEventos();

  if (ordenados.length === 0) {
    listaEventos.innerHTML = `
      <li class="mensaje-vacio">
        <h3>📝 No hay eventos programados</h3>
        <p>Agrega tu primer evento usando el formulario de arriba</p>
      </li>
    `;
    return;
  }

  const html = ordenados.map(ev => {
    const dias = calcularDiasRestantes(ev.fecha);
    const etiqueta = obtenerEtiquetaDias(dias);
    return `
      <li class="evento-item">
        <div class="evento-info">
          <div class="evento-titulo">${escapeHtml(ev.titulo)}</div>
          <div class="evento-fecha">${formatearFecha(ev.fecha)}</div>
        </div>
        <div class="dias-restantes ${etiqueta.clase}">${etiqueta.texto}</div>
        <button class="btn-eliminar" onclick="eliminarEvento(${ev.id})">🗑️ Eliminar</button>
      </li>
    `;
  }).join('');

  listaEventos.innerHTML = html;
}

// Formato de fecha
function formatearFecha(fecha) {
  const fechaObj = crearFechaLocal(fecha);
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return fechaObj.toLocaleDateString('es-ES', opciones);
}

// LocalStorage
function cargarEventos() {
  const raw = localStorage.getItem('agendaEventos');
  eventos = raw ? JSON.parse(raw) : [];
}
function guardarEventos() {
  localStorage.setItem('agendaEventos', JSON.stringify(eventos));
}

// Notificación
function mostrarNotificacion(mensaje) {
  const notificacion = document.createElement('div');
  notificacion.className = 'notificacion';
  notificacion.textContent = mensaje;
  document.body.appendChild(notificacion);
  setTimeout(() => notificacion.remove(), 3000);
}

// Escape básico
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}

// Inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarAgenda);
} else {
  inicializarAgenda();
}


// FAQ functionality
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".faq-pregunta").forEach(btn => {
    btn.addEventListener("click", () => {
      const respuesta = btn.nextElementSibling;
      respuesta.style.display = respuesta.style.display === "block" ? "none" : "block";
    });
  });
});


// Tarjetas expandibles
function toggleExpand(elemento) {
  const tarjetas = document.querySelectorAll('.tarjeta-expandible');
  tarjetas.forEach(t => {
    if (t !== elemento) {
      t.classList.remove('activa');
    }
  });
  elemento.classList.toggle('activa');
}

function redirigirYColapsar(seccion, event) {
  event.stopPropagation(); // Evita que se vuelva a abrir la tarjeta

  // Cerrar todas las tarjetas
  document.querySelectorAll('.tarjeta-expandible').forEach(t => t.classList.remove('activa'));

  // Mostrar la sección correspondiente
  mostrarSeccion(seccion);


    // Crear partículas flotantes
    function crearParticulas() {
      const particlesContainer = document.getElementById('particles');
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
      const ahora = new Date();
      const horas = String(ahora.getHours()).padStart(2, '0');
      const minutos = String(ahora.getMinutes()).padStart(2, '0');
      const segundos = String(ahora.getSeconds()).padStart(2, '0');
      
      document.getElementById('clock').textContent = `${horas}:${minutos}:${segundos}`;
      
      const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      document.getElementById('date').textContent = ahora.toLocaleDateString('es-ES', opciones);
    }

    // Contador animado
    function animarContadores() {
      const contadores = document.querySelectorAll('.stat-number');
      
      contadores.forEach(contador => {
        const target = parseInt(contador.getAttribute('data-target'));
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

    // Redirigir y colapsar
    function redirigir(seccion, event) {
      event.stopPropagation();
      document.querySelectorAll('.tarjeta-expandible').forEach(t => t.classList.remove('activa'));
      mostrarToast(`Navegando a: ${seccion}`);
    }

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
      tipText.style.animation = 'none';
      setTimeout(() => {
        tipText.textContent = consejos[indiceTipActual];
        tipText.style.animation = 'fadeIn 1s ease';
      }, 100);
      mostrarToast('💡 Nuevo consejo cargado');
    }

    // Enviar opinión
    function enviarOpinion(event) {
      event.preventDefault();
      
      const nombre = document.getElementById('nombreOpinion').value;
      const texto = document.getElementById('textoOpinion').value;
      const estrellas = document.getElementById('estrellasOpinion').value;

      if (!nombre || !texto || !estrellas) {
        mostrarToast('⚠️ Por favor completa todos los campos');
        return;
      }

      // Crear nueva opinión
      const listaOpiniones = document.getElementById('listaOpiniones');
      const nuevaOpinion = document.createElement('div');
      nuevaOpinion.className = 'opinion-card';
      nuevaOpinion.style.animation = 'fadeInUp 0.5s ease';
      nuevaOpinion.innerHTML = `
        <div class="opinion-header">
          <span class="opinion-nombre">${escapeHtml(nombre)}</span>
          <span class="opinion-estrellas">${estrellas}</span>
        </div>
        <p class="opinion-texto">${escapeHtml(texto)}</p>
      `;
      
      listaOpiniones.insertBefore(nuevaOpinion, listaOpiniones.firstChild);

      // Limpiar formulario
      document.getElementById('formOpinion').reset();
      
      mostrarToast('✅ ¡Gracias por tu opinión!');
    }

    // Mostrar toast
    function mostrarToast(mensaje) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = mensaje;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    // Escape HTML
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    // Cerrar sesión
    function cerrarSesion() {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        mostrarToast('👋 Cerrando sesión...');
        setTimeout(() => {
          alert('Sesión cerrada exitosamente');
        }, 1000);
      }
    }

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
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.length > 0) {
        searchInput.style.borderColor = '#a64c41';
      } else {
        searchInput.style.borderColor = 'transparent';
      }
    });

    // Inicialización
    document.addEventListener('DOMContentLoaded', () => {
      crearParticulas();
      actualizarReloj();
      setInterval(actualizarReloj, 1000);
      
      // Animar contadores después de un pequeño delay
      setTimeout(() => {
        animarContadores();
      }, 500);
      
      // Cargar primer consejo
      document.getElementById('tipText').textContent = consejos[0];
    });

    // Easter egg: doble click en el logo
    let clickCount = 0;
    document.querySelector('.navbar h1').addEventListener('click', () => {
      clickCount++;
      if (clickCount === 3) {
        mostrarToast('🎉 ¡Has encontrado el easter egg! ¡Eres increíble!');
        document.body.style.animation = 'pulse 0.5s ease';
        clickCount = 0;
      }
      setTimeout(() => { clickCount = 0; }, 1000);
    });

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

// Llamar la función cuando se inicialice
// Si ya tienes una función inicializarInicio(), agrégala ahí
// Si no, puedes usar:
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', crearBurbujas);
} else {
  crearBurbujas();
}

// También exportar para uso manual
window.crearBurbujas = crearBurbujas;

});