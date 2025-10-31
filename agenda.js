// ========== VARIABLES GLOBALES ==========
let eventos = [];
let eventoEditando = null;
let colorSeleccionado = '#b3544d';
let filtroActual = 'todos';
let vistaActual = 'lista';
let mesActual = new Date().getMonth();
let anioActual = new Date().getFullYear();
let usuario = null;

// URL de la API
const API_URL = '../../api/agenda.php';

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando agenda...');
  if (verificarSesion()) {
    inicializarEventListeners();
    generarCalendario();
    cargarEventosDesdeAPI();
    actualizarEstadisticas();
    setInterval(actualizarContadores, 60000);
  }
});

// ========== VERIFICAR SESIÓN ==========
function verificarSesion() {
  usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuario) {
    alert('Debes iniciar sesión para acceder a la agenda');
    window.location.href = 'login.html';
    return false;
  }
  console.log('✅ Usuario autenticado:', usuario.correo);
  return true;
}

// ========== CARGAR EVENTOS DESDE API ==========
async function cargarEventosDesdeAPI() {
  try {
    console.log('📥 Cargando eventos desde API...');
    const response = await fetch(`${API_URL}?usuario_id=${usuario.id}`);
    const result = await response.json();
    
    if (result.success) {
      eventos = result.data || [];
      console.log(`✅ ${eventos.length} eventos cargados`);
      
      // Backup en localStorage
      localStorage.setItem(`eventos_${usuario.id}`, JSON.stringify(eventos));
      
      generarCalendario();
      cargarEventos();
      actualizarEstadisticas();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('⚠️ Error al cargar eventos:', error);
    mostrarNotificacion('⚠️ Error al cargar eventos. Usando datos locales.', 'warning');
    
    // Fallback a localStorage
    const eventosLocal = localStorage.getItem(`eventos_${usuario.id}`);
    eventos = eventosLocal ? JSON.parse(eventosLocal) : [];
    generarCalendario();
    cargarEventos();
    actualizarEstadisticas();
  }
}

// ========== INICIALIZAR EVENT LISTENERS ==========
function inicializarEventListeners() {
  // Formulario
  const formEvento = document.getElementById('formEvento');
  if (formEvento) {
    formEvento.addEventListener('submit', guardarEvento);
  }

  const btnCancelar = document.getElementById('btnCancelar');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', cancelarEdicion);
  }

  // Selector de color
  document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', function() {
      document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      colorSeleccionado = this.dataset.color;
      document.getElementById('inputColor').value = colorSeleccionado;
    });
  });

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filtroActual = this.dataset.filter;
      cargarEventos();
    });
  });

  // Vista
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      vistaActual = this.dataset.view;
      cargarEventos();
    });
  });

  // Navegación del calendario
  const btnAnterior = document.getElementById('btnMesAnterior');
  const btnSiguiente = document.getElementById('btnMesSiguiente');
  const btnHoy = document.getElementById('btnHoy');

  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      mesActual--;
      if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
      }
      generarCalendario();
    });
  }

  if (btnSiguiente) {
    btnSiguiente.addEventListener('click', () => {
      mesActual++;
      if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
      }
      generarCalendario();
    });
  }

  if (btnHoy) {
    btnHoy.addEventListener('click', () => {
      const hoy = new Date();
      mesActual = hoy.getMonth();
      anioActual = hoy.getFullYear();
      generarCalendario();
    });
  }
}

// ========== GUARDAR EVENTO ==========
async function guardarEvento(e) {
  e.preventDefault();
  console.log('💾 Guardando evento...');

  const titulo = document.getElementById('inputTitulo').value.trim();
  const descripcion = document.getElementById('inputDescripcion').value.trim();
  const fecha = document.getElementById('inputFecha').value;
  const hora = document.getElementById('inputHora').value;
  const categoria = document.getElementById('inputCategoria').value;

  if (!titulo || !fecha) {
    mostrarNotificacion('⚠️ El título y la fecha son obligatorios', 'warning');
    return;
  }

  const evento = {
    usuario_id: usuario.id,
    titulo: titulo,
    descripcion: descripcion,
    fecha: fecha,
    hora: hora || null,
    categoria: categoria,
    color: colorSeleccionado,
    completado: false
  };

  try {
    let response;
    
    if (eventoEditando) {
      // Actualizar evento existente
      evento.id = eventoEditando;
      response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento)
      });
      console.log('✏️ Actualizando evento:', evento.titulo);
    } else {
      // Crear nuevo evento
      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evento)
      });
      console.log('➕ Creando evento:', evento.titulo);
    }

    const result = await response.json();

    if (result.success) {
      mostrarNotificacion('✅ Evento guardado correctamente', 'success');
      limpiarFormulario();
      await cargarEventosDesdeAPI();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error al guardar evento:', error);
    mostrarNotificacion('❌ Error al guardar: ' + error.message, 'error');
  }
}

// ========== GENERAR CALENDARIO ==========
function generarCalendario() {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const mesActualEl = document.getElementById('mesActual');
  if (mesActualEl) {
    mesActualEl.textContent = `${meses[mesActual]} ${anioActual}`;
  }
  
  const primerDia = new Date(anioActual, mesActual, 1);
  const ultimoDia = new Date(anioActual, mesActual + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const primerDiaSemana = primerDia.getDay();
  
  const grid = document.getElementById('calendarioGrid');
  if (!grid) return;
  
  // Limpiar días anteriores (mantener encabezados)
  const diasAnteriores = grid.querySelectorAll('.calendario-dia');
  diasAnteriores.forEach(dia => dia.remove());
  
  // Días del mes anterior
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;
  const ultimoDiaMesAnterior = new Date(anioMesAnterior, mesAnterior + 1, 0).getDate();
  
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    const dia = ultimoDiaMesAnterior - i;
    crearDiaCalendario(dia, mesAnterior, anioMesAnterior, true);
  }
  
  // Días del mes actual
  const hoy = new Date();
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const esHoy = dia === hoy.getDate() && 
                  mesActual === hoy.getMonth() && 
                  anioActual === hoy.getFullYear();
    crearDiaCalendario(dia, mesActual, anioActual, false, esHoy);
  }
  
  // Días del mes siguiente
  const diasMostrados = primerDiaSemana + diasEnMes;
  const diasFaltantes = diasMostrados % 7 === 0 ? 0 : 7 - (diasMostrados % 7);
  const mesSiguiente = mesActual === 11 ? 0 : mesActual + 1;
  const anioMesSiguiente = mesActual === 11 ? anioActual + 1 : anioActual;
  
  for (let dia = 1; dia <= diasFaltantes; dia++) {
    crearDiaCalendario(dia, mesSiguiente, anioMesSiguiente, true);
  }
}

// ========== CREAR DÍA EN CALENDARIO ==========
function crearDiaCalendario(dia, mes, anio, otroMes = false, esHoy = false) {
  const divDia = document.createElement('div');
  divDia.className = 'calendario-dia';
  
  if (otroMes) divDia.classList.add('otro-mes');
  if (esHoy) divDia.classList.add('hoy');
  
  const numero = document.createElement('div');
  numero.className = 'dia-numero';
  numero.textContent = dia;
  divDia.appendChild(numero);
  
  const fechaBuscada = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  const eventosDelDia = eventos.filter(e => e.fecha === fechaBuscada);
  
  if (eventosDelDia.length > 0) {
    const contenedorEventos = document.createElement('div');
    contenedorEventos.className = 'dia-eventos';
    
    eventosDelDia.slice(0, 3).forEach(evento => {
      const eventoMini = document.createElement('div');
      eventoMini.className = 'evento-mini';
      eventoMini.style.background = evento.color;
      eventoMini.style.color = 'white';
      eventoMini.textContent = evento.titulo;
      eventoMini.title = evento.titulo;
      contenedorEventos.appendChild(eventoMini);
    });
    
    divDia.appendChild(contenedorEventos);
    
    if (eventosDelDia.length > 3) {
      const badge = document.createElement('div');
      badge.className = 'evento-badge';
      badge.textContent = `+${eventosDelDia.length - 3}`;
      divDia.appendChild(badge);
    }
  }
  
  divDia.addEventListener('click', () => {
    document.getElementById('inputFecha').value = fechaBuscada;
    
    if (eventosDelDia.length > 0) {
      mostrarEventosDelDia(fechaBuscada, eventosDelDia);
    }
    
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
  });
  
  document.getElementById('calendarioGrid').appendChild(divDia);
}

// ========== MOSTRAR EVENTOS DEL DÍA ==========
function mostrarEventosDelDia(fecha, eventosDelDia) {
  const fechaObj = new Date(fecha + 'T00:00:00');
  const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  alert(`📅 Eventos del ${fechaFormateada}:\n\n` + 
        eventosDelDia.map((e, i) => `${i + 1}. ${e.titulo}${e.hora ? ' - ' + e.hora : ''}`).join('\n'));
}

// ========== CARGAR EVENTOS EN LISTA ==========
function cargarEventos() {
  const container = document.getElementById('eventosContainer');
  if (!container) return;
  
  let eventosFiltrados = filtrarEventos();
  eventosFiltrados.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  if (eventosFiltrados.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No hay eventos</h3>
        <p>Comienza agregando tu primer evento</p>
      </div>
    `;
    return;
  }

  if (vistaActual === 'grid') {
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    container.style.gap = '20px';
  } else {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '15px';
  }

  container.innerHTML = eventosFiltrados.map(evento => crearCardEvento(evento)).join('');
}

// ========== FILTRAR EVENTOS ==========
function filtrarEventos() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  switch(filtroActual) {
    case 'proximos':
      return eventos.filter(e => {
        const fechaEvento = new Date(e.fecha + 'T00:00:00');
        const diff = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
        return diff >= 0 && diff <= 7 && !e.completado;
      });
    case 'completados':
      return eventos.filter(e => e.completado);
    case 'pendientes':
      return eventos.filter(e => !e.completado);
    default:
      return eventos;
  }
}

// ========== CREAR CARD DE EVENTO ==========
function crearCardEvento(evento) {
  const categorias = {
    trabajo: '💼 Trabajo',
    personal: '👤 Personal',
    reunion: '🤝 Reunión',
    estudio: '📚 Estudio',
    otro: '📌 Otro'
  };

  const fechaEvento = new Date(evento.fecha + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasRestantes = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
  
  let countdownHTML = '';

  if (!evento.completado) {
    if (diasRestantes < 0) {
      countdownHTML = `<span class="countdown urgente">⚠️ Vencido hace ${Math.abs(diasRestantes)} días</span>`;
    } else if (diasRestantes === 0) {
      countdownHTML = `<span class="countdown urgente">🔥 ¡Hoy!</span>`;
    } else if (diasRestantes === 1) {
      countdownHTML = `<span class="countdown proximo">⏰ Mañana</span>`;
    } else if (diasRestantes <= 7) {
      countdownHTML = `<span class="countdown proximo">📅 En ${diasRestantes} días</span>`;
    } else {
      countdownHTML = `<span class="countdown lejano">📆 En ${diasRestantes} días</span>`;
    }
  }

  const fechaFormateada = fechaEvento.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return `
    <div class="evento-card ${evento.completado ? 'completado' : ''}" style="border-left-color: ${evento.color};">
      ${evento.completado ? '<span class="badge-completado">✓ Completado</span>' : ''}
      
      <div class="evento-header">
        <div>
          <h3 class="evento-titulo">${evento.titulo}</h3>
          <span class="evento-categoria" style="background: ${evento.color}20; color: ${evento.color};">
            ${categorias[evento.categoria]}
          </span>
        </div>
      </div>

      ${evento.descripcion ? `<p class="evento-descripcion">${evento.descripcion}</p>` : ''}

      <div class="evento-info">
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span>${fechaFormateada}</span>
        </div>
        ${evento.hora ? `
          <div class="info-item">
            <span class="info-icon">⏰</span>
            <span>${evento.hora}</span>
          </div>
        ` : ''}
      </div>

      ${countdownHTML}

      <div class="evento-acciones">
        <button class="btn-accion btn-editar" onclick="editarEvento(${evento.id})">
          ✏️ Editar
        </button>
        ${!evento.completado ? `
          <button class="btn-accion btn-completar" onclick="marcarCompletado(${evento.id})">
            ✓ Completar
          </button>
        ` : ''}
        <button class="btn-accion btn-eliminar" onclick="eliminarEvento(${evento.id})">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  `;
}

// ========== EDITAR EVENTO ==========
function editarEvento(id) {
  const evento = eventos.find(e => e.id === id);
  if (!evento) return;

  eventoEditando = id;
  document.getElementById('inputTitulo').value = evento.titulo;
  document.getElementById('inputDescripcion').value = evento.descripcion || '';
  document.getElementById('inputFecha').value = evento.fecha;
  document.getElementById('inputHora').value = evento.hora || '';
  document.getElementById('inputCategoria').value = evento.categoria;
  colorSeleccionado = evento.color;
  
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('selected');
    if (option.dataset.color === evento.color) {
      option.classList.add('selected');
    }
  });

  document.getElementById('formTitle').innerHTML = '✏️ Editar Evento';
  document.getElementById('btnSubmit').innerHTML = '💾 Guardar Cambios';
  document.getElementById('btnCancelar').style.display = 'block';

  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// ========== MARCAR COMPLETADO ==========
async function marcarCompletado(id) {
  const evento = eventos.find(e => e.id === id);
  if (!evento) return;

  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        usuario_id: usuario.id,
        completado: !evento.completado
      })
    });

    const result = await response.json();

    if (result.success) {
      mostrarNotificacion('✅ Evento actualizado', 'success');
      await cargarEventosDesdeAPI();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    mostrarNotificacion('❌ Error al actualizar: ' + error.message, 'error');
  }
}

// ========== ELIMINAR EVENTO ==========
async function eliminarEvento(id) {
  if (!confirm('¿Estás seguro de eliminar este evento?')) return;

  try {
    const response = await fetch(API_URL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        usuario_id: usuario.id
      })
    });

    const result = await response.json();

    if (result.success) {
      mostrarNotificacion('✅ Evento eliminado', 'success');
      await cargarEventosDesdeAPI();
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    mostrarNotificacion('❌ Error al eliminar: ' + error.message, 'error');
  }
}

// ========== CANCELAR EDICIÓN ==========
function cancelarEdicion() {
  limpiarFormulario();
}

// ========== LIMPIAR FORMULARIO ==========
function limpiarFormulario() {
  document.getElementById('formEvento').reset();
  eventoEditando = null;
  colorSeleccionado = '#b3544d';
  
  document.querySelectorAll('.color-option').forEach(option => {
    option.classList.remove('selected');
  });
  document.querySelector('.color-option').classList.add('selected');

  document.getElementById('formTitle').innerHTML = '➕ Nuevo Evento';
  document.getElementById('btnSubmit').innerHTML = '➕ Agregar Evento';
  document.getElementById('btnCancelar').style.display = 'none';
}

// ========== ACTUALIZAR ESTADÍSTICAS ==========
function actualizarEstadisticas() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const total = eventos.length;
  const completados = eventos.filter(e => e.completado).length;
  
  const proximos = eventos.filter(e => {
    const fechaEvento = new Date(e.fecha + 'T00:00:00');
    const diff = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7 && !e.completado;
  }).length;

  const urgentes = eventos.filter(e => {
    const fechaEvento = new Date(e.fecha + 'T00:00:00');
    const diff = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3 && !e.completado;
  }).length;

  const totalEl = document.getElementById('totalEventos');
  const proximosEl = document.getElementById('eventosProximos');
  const completadosEl = document.getElementById('eventosCompletados');
  const urgentesEl = document.getElementById('eventosUrgentes');

  if (totalEl) totalEl.textContent = total;
  if (proximosEl) proximosEl.textContent = proximos;
  if (completadosEl) completadosEl.textContent = completados;
  if (urgentesEl) urgentesEl.textContent = urgentes;
}

// ========== ACTUALIZAR CONTADORES ==========
function actualizarContadores() {
  generarCalendario();
  cargarEventos();
  actualizarEstadisticas();
}

// ========== NOTIFICACIONES ==========
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notif = document.createElement('div');
  notif.className = `notificacion-toast ${tipo}`;
  notif.textContent = mensaje;
  notif.style.cssText = `
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
  
  notif.style.cssText += colores[tipo];
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.animation = 'slideOutRight 0.4s ease';
    setTimeout(() => notif.remove(), 400);
  }, 3000);
}

// Animaciones CSS necesarias
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ========== CERRAR SESIÓN ==========
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    localStorage.removeItem('usuarioActivo');
    window.location.href = 'index.html';
  }
}

console.log('✅ Agenda con API cargada correctamente');