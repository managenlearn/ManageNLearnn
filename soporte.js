// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  verificarSesion();
  inicializarBusqueda();
  inicializarFormularioContacto();
  cargarTickets();
  inicializarCalificacion();
  actualizarEstadisticasSoporte();
  inicializarChatbot();
  cargarNotificacionesSoporte();
});

function verificarSesion() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    window.location.href = 'login.html';
  }
}

// ========== CAMBIAR TABS ==========
function cambiarTab(tab) {
  // Ocultar todos los contenidos
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  // Desactivar todos los botones
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activar el tab seleccionado
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
}

// ========== TOGGLE FAQ ==========
function toggleFaq(event) {
  event.stopPropagation();
  const faqItem = event.target.closest('.faq-item');
  const wasOpen = faqItem.classList.contains('open');
  
  // Cerrar todos los FAQs
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('open');
  });
  
  // Abrir el seleccionado si no estaba abierto
  if (!wasOpen) {
    faqItem.classList.add('open');
    
    // Registrar visualización
    registrarVisualizacionFAQ(event.target.textContent);
  }
}

function registrarVisualizacionFAQ(pregunta) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario.faqVistos) usuario.faqVistos = {};
  
  if (!usuario.faqVistos[pregunta]) {
    usuario.faqVistos[pregunta] = 0;
  }
  usuario.faqVistos[pregunta]++;
  
  localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
}

// ========== BÚSQUEDA EN FAQ MEJORADA ==========
function inicializarBusqueda() {
  const busquedaInput = document.getElementById('busquedaSoporte');
  
  if (busquedaInput) {
    busquedaInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      const faqItems = document.querySelectorAll('.faq-item');
      let resultadosEncontrados = 0;

      faqItems.forEach(item => {
        const pregunta = item.querySelector('.faq-pregunta').textContent.toLowerCase();
        const respuesta = item.querySelector('.faq-respuesta').textContent.toLowerCase();

        if (pregunta.includes(query) || respuesta.includes(query)) {
          item.style.display = 'block';
          resultadosEncontrados++;
          
          // Resaltar texto encontrado
          if (query.length > 2) {
            item.classList.add('destacado');
          } else {
            item.classList.remove('destacado');
          }
        } else {
          item.style.display = 'none';
        }
      });

      // Mostrar mensaje si no hay resultados
      mostrarResultadosBusqueda(resultadosEncontrados, query);

      // Si no hay búsqueda, mostrar todos
      if (query === '') {
        faqItems.forEach(item => {
          item.style.display = 'block';
          item.classList.remove('open', 'destacado');
        });
        ocultarResultadosBusqueda();
      }
    });
  }
}

function mostrarResultadosBusqueda(cantidad, query) {
  let mensajeDiv = document.getElementById('mensajeBusqueda');
  
  if (!mensajeDiv) {
    mensajeDiv = document.createElement('div');
    mensajeDiv.id = 'mensajeBusqueda';
    mensajeDiv.className = 'mensaje-busqueda';
    document.getElementById('faqContainer').prepend(mensajeDiv);
  }
  
  if (cantidad === 0 && query.length > 0) {
    mensajeDiv.innerHTML = `
      <span class="icono-busqueda">🔍</span>
      <div>
        <strong>No se encontraron resultados para "${query}"</strong>
        <p>Intenta con otros términos o contacta directamente con soporte</p>
      </div>
    `;
    mensajeDiv.style.display = 'flex';
  } else if (cantidad > 0 && query.length > 0) {
    mensajeDiv.innerHTML = `
      <span class="icono-busqueda">✅</span>
      <strong>Se encontraron ${cantidad} resultado${cantidad > 1 ? 's' : ''}</strong>
    `;
    mensajeDiv.style.display = 'flex';
  }
}

function ocultarResultadosBusqueda() {
  const mensajeDiv = document.getElementById('mensajeBusqueda');
  if (mensajeDiv) {
    mensajeDiv.style.display = 'none';
  }
}

// ========== FORMULARIO DE CONTACTO MEJORADO ==========
function inicializarFormularioContacto() {
  const btnEnviarTicket = document.getElementById('btnEnviarTicket');
  
  if (btnEnviarTicket) {
    btnEnviarTicket.addEventListener('click', enviarTicket);
  }
}

function enviarTicket() {
  const asunto = document.getElementById('asuntoTicket').value.trim();
  const categoria = document.getElementById('categoriaTicket').value;
  const prioridad = document.getElementById('prioridadTicket').value;
  const mensaje = document.getElementById('mensajeTicket').value.trim();
  
  if (!asunto || !categoria || !mensaje) {
    mostrarNotificacion('error', '⚠️ Por favor completa todos los campos requeridos');
    return;
  }
  
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  
  if (!usuario.tickets) {
    usuario.tickets = [];
  }
  
  const nuevoTicket = {
    id: Date.now(),
    asunto,
    categoria,
    prioridad,
    mensaje,
    estado: 'abierto',
    fecha: new Date().toISOString(),
    respuestas: []
  };
  
  usuario.tickets.unshift(nuevoTicket);
  localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
  
  // Limpiar formulario
  document.getElementById('asuntoTicket').value = '';
  document.getElementById('mensajeTicket').value = '';
  
  mostrarNotificacion('success', '✅ Ticket enviado correctamente. Te responderemos pronto.');
  cargarTickets();
  
  // Simular respuesta automática después de 3 segundos
  setTimeout(() => simularRespuestaAutomatica(nuevoTicket.id), 3000);
}

function simularRespuestaAutomatica(ticketId) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const ticket = usuario.tickets.find(t => t.id === ticketId);
  
  if (ticket) {
    ticket.respuestas.push({
      tipo: 'sistema',
      mensaje: 'Gracias por contactarnos. Hemos recibido tu solicitud y nuestro equipo la está revisando. Te responderemos en las próximas 24-48 horas.',
      fecha: new Date().toISOString()
    });
    
    localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
    cargarTickets();
    mostrarNotificacion('info', '💬 Recibiste una respuesta automática');
  }
}

// ========== GESTIÓN DE TICKETS ==========
function cargarTickets() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const contenedorTickets = document.getElementById('listaTickets');
  
  if (!contenedorTickets) return;
  
  if (!usuario.tickets || usuario.tickets.length === 0) {
    contenedorTickets.innerHTML = '<p class="sin-tickets">No tienes tickets aún. Crea uno para contactar con soporte.</p>';
    return;
  }
  
  const estadosIconos = {
    'abierto': '🔓',
    'en-progreso': '⏳',
    'cerrado': '✅'
  };
  
  const prioridadColors = {
    'baja': '#4CAF50',
    'media': '#FF9800',
    'alta': '#f44336'
  };
  
  contenedorTickets.innerHTML = usuario.tickets.map(ticket => {
    const fecha = new Date(ticket.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <div class="ticket-card">
        <div class="ticket-header">
          <div class="ticket-info">
            <span class="ticket-id">#${ticket.id}</span>
            <span class="ticket-categoria">${ticket.categoria}</span>
          </div>
          <span class="ticket-estado ${ticket.estado}">
            ${estadosIconos[ticket.estado]} ${ticket.estado}
          </span>
        </div>
        
        <h4 class="ticket-asunto">${ticket.asunto}</h4>
        
        <div class="ticket-meta">
          <span class="ticket-fecha">📅 ${fecha}</span>
          <span class="ticket-prioridad" style="color: ${prioridadColors[ticket.prioridad]}">
            🎯 Prioridad ${ticket.prioridad}
          </span>
        </div>
        
        <p class="ticket-mensaje">${ticket.mensaje}</p>
        
        ${ticket.respuestas.length > 0 ? `
          <div class="ticket-respuestas">
            <div class="respuestas-header">💬 ${ticket.respuestas.length} Respuesta${ticket.respuestas.length > 1 ? 's' : ''}</div>
            ${ticket.respuestas.map(resp => `
              <div class="respuesta-item ${resp.tipo}">
                <div class="respuesta-header">
                  <strong>${resp.tipo === 'sistema' ? '🤖 Sistema' : '👤 Soporte'}</strong>
                  <span>${new Date(resp.fecha).toLocaleString('es-ES')}</span>
                </div>
                <p>${resp.mensaje}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="ticket-acciones">
          <button class="btn-ticket-accion" onclick="verDetalleTicket(${ticket.id})">
            👁️ Ver detalle
          </button>
          ${ticket.estado !== 'cerrado' ? `
            <button class="btn-ticket-accion cerrar" onclick="cerrarTicket(${ticket.id})">
              ✅ Cerrar ticket
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function verDetalleTicket(ticketId) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  const ticket = usuario.tickets.find(t => t.id === ticketId);
  
  if (ticket) {
    alert(`Ticket #${ticket.id}\n\nAsunto: ${ticket.asunto}\nCategoría: ${ticket.categoria}\nEstado: ${ticket.estado}\nPrioridad: ${ticket.prioridad}\n\nMensaje:\n${ticket.mensaje}`);
  }
}

function cerrarTicket(ticketId) {
  if (confirm('¿Deseas cerrar este ticket? Ya no podrás reabrirlo.')) {
    const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    const ticket = usuario.tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      ticket.estado = 'cerrado';
      localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
      cargarTickets();
      mostrarNotificacion('success', '✅ Ticket cerrado correctamente');
    }
  }
}

// ========== CALIFICACIÓN DE SOPORTE ==========
function inicializarCalificacion() {
  const estrellas = document.querySelectorAll('.estrella-calificacion');
  
  estrellas.forEach((estrella, index) => {
    estrella.addEventListener('click', () => calificarSoporte(index + 1));
    
    estrella.addEventListener('mouseenter', () => {
      resaltarEstrellas(index + 1);
    });
  });
  
  const contenedorEstrellas = document.getElementById('calificacionEstrellas');
  if (contenedorEstrellas) {
    contenedorEstrellas.addEventListener('mouseleave', () => {
      const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
      const calificacionGuardada = usuario.calificacionSoporte || 0;
      resaltarEstrellas(calificacionGuardada);
    });
  }
  
  // Cargar calificación guardada
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (usuario.calificacionSoporte) {
    resaltarEstrellas(usuario.calificacionSoporte);
  }
}

function resaltarEstrellas(cantidad) {
  const estrellas = document.querySelectorAll('.estrella-calificacion');
  estrellas.forEach((estrella, index) => {
    if (index < cantidad) {
      estrella.classList.add('activa');
    } else {
      estrella.classList.remove('activa');
    }
  });
}

function calificarSoporte(calificacion) {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  usuario.calificacionSoporte = calificacion;
  localStorage.setItem('usuarioActivo', JSON.stringify(usuario));
  
  resaltarEstrellas(calificacion);
  mostrarNotificacion('success', `⭐ Gracias por calificar nuestro soporte con ${calificacion} estrella${calificacion > 1 ? 's' : ''}`);
}

// ========== ESTADÍSTICAS DE SOPORTE ==========
function actualizarEstadisticasSoporte() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  
  const totalTickets = usuario.tickets ? usuario.tickets.length : 0;
  const ticketsAbiertos = usuario.tickets ? usuario.tickets.filter(t => t.estado === 'abierto').length : 0;
  const ticketsCerrados = usuario.tickets ? usuario.tickets.filter(t => t.estado === 'cerrado').length : 0;
  const faqsVistos = usuario.faqVistos ? Object.keys(usuario.faqVistos).length : 0;
  
  const elementoTotal = document.getElementById('statTotalTickets');
  const elementoAbiertos = document.getElementById('statTicketsAbiertos');
  const elementoCerrados = document.getElementById('statTicketsCerrados');
  const elementoFaqs = document.getElementById('statFaqsVistos');
  
  if (elementoTotal) animarContador(elementoTotal, totalTickets);
  if (elementoAbiertos) animarContador(elementoAbiertos, ticketsAbiertos);
  if (elementoCerrados) animarContador(elementoCerrados, ticketsCerrados);
  if (elementoFaqs) animarContador(elementoFaqs, faqsVistos);
}

function animarContador(elemento, valorFinal) {
  const duracion = 1000;
  const incremento = valorFinal / (duracion / 16);
  let valorActual = 0;
  
  const timer = setInterval(() => {
    valorActual += incremento;
    if (valorActual >= valorFinal) {
      elemento.textContent = valorFinal;
      clearInterval(timer);
    } else {
      elemento.textContent = Math.floor(valorActual);
    }
  }, 16);
}

// ========== CHATBOT SIMPLE ==========
function inicializarChatbot() {
  const btnChatbot = document.getElementById('btnAbrirChatbot');
  const chatbotContainer = document.getElementById('chatbotContainer');
  const btnCerrarChatbot = document.getElementById('btnCerrarChatbot');
  const btnEnviarMensajeChatbot = document.getElementById('btnEnviarMensajeChatbot');
  const inputChatbot = document.getElementById('inputChatbot');
  
  if (btnChatbot) {
    btnChatbot.addEventListener('click', () => {
      chatbotContainer.classList.add('activo');
      agregarMensajeChatbot('bot', '¡Hola! 👋 Soy el asistente virtual de ManageNLearn. ¿En qué puedo ayudarte?');
    });
  }
  
  if (btnCerrarChatbot) {
    btnCerrarChatbot.addEventListener('click', () => {
      chatbotContainer.classList.remove('activo');
    });
  }
  
  if (btnEnviarMensajeChatbot) {
    btnEnviarMensajeChatbot.addEventListener('click', enviarMensajeChatbot);
  }
  
  if (inputChatbot) {
    inputChatbot.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        enviarMensajeChatbot();
      }
    });
  }
}

function enviarMensajeChatbot() {
  const input = document.getElementById('inputChatbot');
  const mensaje = input.value.trim();
  
  if (!mensaje) return;
  
  agregarMensajeChatbot('usuario', mensaje);
  input.value = '';
  
  // Simular respuesta del bot
  setTimeout(() => {
    const respuesta = generarRespuestaChatbot(mensaje);
    agregarMensajeChatbot('bot', respuesta);
  }, 1000);
}

function agregarMensajeChatbot(tipo, texto) {
  const contenedor = document.getElementById('chatbotMensajes');
  const mensajeDiv = document.createElement('div');
  mensajeDiv.className = `mensaje-chatbot ${tipo}`;
  mensajeDiv.innerHTML = `
    <div class="mensaje-chatbot-contenido">
      ${tipo === 'bot' ? '🤖' : '👤'} ${texto}
    </div>
  `;
  
  contenedor.appendChild(mensajeDiv);
  contenedor.scrollTop = contenedor.scrollHeight;
}

function generarRespuestaChatbot(mensaje) {
  const mensajeLower = mensaje.toLowerCase();
  
  if (mensajeLower.includes('hola') || mensajeLower.includes('buenos') || mensajeLower.includes('saludos')) {
    return '¡Hola! 😊 ¿En qué puedo asistirte hoy?';
  }
  
  if (mensajeLower.includes('contraseña') || mensajeLower.includes('password')) {
    return 'Para recuperar tu contraseña, ve a la página de inicio de sesión y haz clic en "Olvidé mi contraseña". ¿Necesitas ayuda con algo más?';
  }
  
  if (mensajeLower.includes('proyecto')) {
    return 'Para crear un proyecto, ve a la sección "Proyectos" en el menú y haz clic en "Agregar Proyecto". Puedes gestionar prioridades, fechas y estados. ¿Te ayudo con algo específico?';
  }
  
  if (mensajeLower.includes('perfil') || mensajeLower.includes('editar')) {
    return 'Puedes editar tu perfil desde "Mi perfil" en el menú principal. Allí podrás actualizar tu foto, información personal e institucional. ¿Algo más?';
  }
  
  if (mensajeLower.includes('tema') || mensajeLower.includes('oscuro') || mensajeLower.includes('claro')) {
    return 'En la sección "Configuración" puedes cambiar entre tema claro y oscuro. ¡Elige el que más te guste! ¿Necesitas más ayuda?';
  }
  
  if (mensajeLower.includes('ticket') || mensajeLower.includes('soporte')) {
    return 'Puedes crear un ticket de soporte en la pestaña "Mis Tickets" de esta sección. Nuestro equipo te responderá en 24-48 horas. ¿Quieres que te guíe?';
  }
  
  if (mensajeLower.includes('gracias') || mensajeLower.includes('thank')) {
    return '¡De nada! 😊 Estoy aquí para ayudarte cuando lo necesites. ¿Hay algo más en lo que pueda asistirte?';
  }
  
  if (mensajeLower.includes('adios') || mensajeLower.includes('chao') || mensajeLower.includes('bye')) {
    return '¡Hasta luego! 👋 No dudes en contactarme si necesitas ayuda. ¡Que tengas un excelente día!';
  }
  
  return 'Entiendo tu consulta. Te recomiendo revisar nuestra sección de Preguntas Frecuentes o crear un ticket de soporte para asistencia personalizada. ¿Puedo ayudarte con algo más?';
}

// ========== NOTIFICACIONES DE SOPORTE ==========
function cargarNotificacionesSoporte() {
  const usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  
  // Verificar tickets con respuestas nuevas
  if (usuario.tickets) {
    const ticketsConRespuestas = usuario.tickets.filter(t => t.respuestas && t.respuestas.length > 0 && t.estado !== 'cerrado');
    
    if (ticketsConRespuestas.length > 0) {
      const notifElement = document.getElementById('notificacionTickets');
      if (notifElement) {
        notifElement.textContent = ticketsConRespuestas.length;
        notifElement.style.display = 'flex';
      }
    }
  }
}

// ========== ABRIR CHAT (FUNCIÓN ORIGINAL MEJORADA) ==========
function abrirChat() {
  const chatbotContainer = document.getElementById('chatbotContainer');
  if (chatbotContainer) {
    chatbotContainer.classList.add('activo');
    agregarMensajeChatbot('bot', '¡Hola! 👋 Te conectaste desde el botón de chat en vivo. ¿En qué puedo ayudarte?');
  } else {
    mostrarNotificacion('info', '💬 Usa nuestro chatbot flotante o contacta por WhatsApp/Email');
  }
}

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(tipo, mensaje) {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion-soporte ${tipo}`;
  
  const iconos = {
    'success': '✅',
    'error': '❌',
    'info': 'ℹ️',
    'warning': '⚠️'
  };
  
  notificacion.innerHTML = `${iconos[tipo]} ${mensaje}`;
  document.body.appendChild(notificacion);
  
  setTimeout(() => notificacion.classList.add('show'), 100);
  setTimeout(() => {
    notificacion.classList.remove('show');
    setTimeout(() => notificacion.remove(), 300);
  }, 4000);
}

// ========== CERRAR SESIÓN ==========
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'index.html';
  }
}

console.log('✅ Soporte ultra mejorado cargado correctamente');