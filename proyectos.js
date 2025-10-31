// ====================================================
// Configuración de la API
// ====================================================
const API_URL = '../../api/proyectos.php';

// ====================================================
// Variables globales
// ====================================================
let vistaActual = 'lista';
let filtroActual = 'todos';
let ordenActual = 'fecha'; // 'fecha', 'prioridad', 'nombre'
let proyectoEnEdicion = null;
let proyectosCache = []; // Cache local de proyectos

// ====================================================
// Funciones de API
// ====================================================

/**
 * Realizar petición a la API
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // IMPORTANTE: Incluir cookies de sesión
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!result.success) {
      // Si es error de sesión, redirigir al login
      if (response.status === 401) {
        alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        window.location.href = '../../login.php'; // Ajusta la ruta a tu login
        return;
      }
      throw new Error(result.message);
    }

    return result;
  } catch (error) {
    console.error('Error en API:', error);
    mostrarNotificacion('Error: ' + error.message, 'error');
    throw error;
  }
}

/**
 * Obtener todos los proyectos
 */
async function obtenerProyectos() {
  try {
    const result = await apiRequest(`${API_URL}?action=obtener`);
    proyectosCache = result.data || [];
    return proyectosCache;
  } catch (error) {
    return [];
  }
}

/**
 * Crear nuevo proyecto
 */
async function crearProyecto(proyecto) {
  const result = await apiRequest(`${API_URL}?action=crear`, 'POST', proyecto);
  return result.data;
}

/**
 * Actualizar proyecto
 */
async function actualizarProyecto(id, proyecto) {
  await apiRequest(`${API_URL}?action=actualizar&id=${id}`, 'PUT', proyecto);
}

/**
 * Actualizar estado de proyecto
 */
async function actualizarEstadoProyecto(id, estado) {
  await apiRequest(`${API_URL}?action=actualizar_estado&id=${id}`, 'PUT', { estado });
}

/**
 * Actualizar progreso de proyecto
 */
async function actualizarProgresoProyecto(id, progreso) {
  await apiRequest(`${API_URL}?action=actualizar_progreso&id=${id}`, 'PUT', { progreso });
}

/**
 * Eliminar proyecto
 */
async function eliminarProyectoAPI(id) {
  await apiRequest(`${API_URL}?action=eliminar&id=${id}`, 'DELETE');
}

/**
 * Obtener estadísticas
 */
async function obtenerEstadisticas() {
  try {
    const result = await apiRequest(`${API_URL}?action=estadisticas`);
    return result.data;
  } catch (error) {
    return { total: 0, activos: 0, completados: 0, vencidos: 0 };
  }
}

// ====================================================
// Funciones de UI
// ====================================================

/**
 * Cargar y mostrar proyectos
 */
async function cargarProyectos() {
  const listaProyectos = document.getElementById('listaProyectos');
  const mensajeSinProyectos = document.getElementById('mensajeSinProyectos');
  const contadorProyectos = document.getElementById('contadorProyectos');
  
  // Mostrar loading
  listaProyectos.innerHTML = '<div style="text-align: center; padding: 40px;">Cargando proyectos...</div>';
  
  let proyectos = await obtenerProyectos();
  
  // Aplicar filtro
  if (filtroActual !== 'todos') {
    proyectos = proyectos.filter(p => p.estado === filtroActual);
  }
  
  // Aplicar orden
  proyectos = ordenarProyectos(proyectos);
  
  // Actualizar estadísticas
  await actualizarEstadisticas();
  
  if (proyectos.length === 0) {
    mensajeSinProyectos.style.display = 'flex';
    listaProyectos.innerHTML = '';
    contadorProyectos.textContent = `Proyectos ${filtroActual === 'todos' ? 'totales' : filtroActual}: 0`;
    return;
  }
  
  mensajeSinProyectos.style.display = 'none';
  const activos = proyectosCache.filter(p => p.estado !== 'completado').length;
  contadorProyectos.textContent = `Proyectos activos: ${activos}`;
  
  // Aplicar vista
  if (vistaActual === 'tarjetas') {
    listaProyectos.className = 'lista-proyectos vista-tarjetas';
  } else {
    listaProyectos.className = 'lista-proyectos vista-lista';
  }
  
  listaProyectos.innerHTML = proyectos.map((proyecto, index) => {
    const diasRestantes = calcularDiasRestantes(proyecto.fechaEntrega);
    const prioridad = proyecto.prioridad || 'media';
    const progreso = proyecto.progreso || 0;
    const etiquetas = proyecto.etiquetas || [];
    const notas = proyecto.notas || '';
    
    return `
      <li style="animation-delay: ${index * 0.1}s">
        <div class="proyecto-card ${proyecto.estado} prioridad-${prioridad}">
          <div class="proyecto-header-card">
            <div class="proyecto-badges">
              <span class="badge-estado ${proyecto.estado}">
                ${proyecto.estado === 'pendiente' ? '⏳' : proyecto.estado === 'en-proceso' ? '🔄' : '✅'} 
                ${proyecto.estado}
              </span>
              <span class="badge-prioridad ${prioridad}">
                ${prioridad === 'alta' ? '🔴' : prioridad === 'media' ? '🟡' : '🟢'} 
                ${prioridad}
              </span>
            </div>
            ${proyecto.estado === 'completado' ? '<div class="check-completado">✓</div>' : ''}
          </div>

          <h3 class="proyecto-nombre">
            <span class="proyecto-icono">📊</span>
            ${proyecto.nombre}
          </h3>
          
          <p class="proyecto-desc">${proyecto.descripcion}</p>
          
          ${etiquetas.length > 0 ? `
            <div class="proyecto-etiquetas">
              ${etiquetas.map(etiqueta => `<span class="etiqueta">#${etiqueta}</span>`).join('')}
            </div>
          ` : ''}
          
          <div class="proyecto-info-grid">
            <div class="info-item">
              <span class="info-icon">📅</span>
              <div>
                <div class="info-label">Fecha de entrega</div>
                <div class="info-value">${formatearFecha(proyecto.fechaEntrega)}</div>
              </div>
            </div>
            
            ${proyecto.estado !== 'completado' ? `
              <div class="info-item">
                <span class="info-icon">⏰</span>
                <div>
                  <div class="info-label">Tiempo restante</div>
                  <div class="info-value ${diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'urgente' : ''}">${diasRestantes < 0 ? `Vencido (${Math.abs(diasRestantes)} días)` : diasRestantes === 0 ? '¡Hoy!' : `${diasRestantes} días`}</div>
                </div>
              </div>
            ` : ''}
          </div>

          ${proyecto.estado !== 'completado' ? `
            <div class="progreso-container">
              <div class="progreso-header">
                <span class="progreso-label">Progreso</span>
                <span class="progreso-porcentaje">${progreso}%</span>
              </div>
              <div class="progreso-barra">
                <div class="progreso-fill" style="width: ${progreso}%"></div>
              </div>
            </div>
          ` : ''}

          ${notas ? `
            <div class="proyecto-notas">
              <div class="notas-header">📝 Notas</div>
              <div class="notas-contenido">${notas}</div>
            </div>
          ` : ''}

          ${proyecto.enlace ? `
            <div class="proyecto-enlace-box">
              <a href="${proyecto.enlace}" target="_blank" class="proyecto-link">
                🔗 Ver enlace útil
              </a>
            </div>
          ` : ''}

          <div class="acciones">
            ${proyecto.estado !== 'completado' ? `
              <button class="btn-progreso" onclick="actualizarProgreso(${proyecto.id})" title="Actualizar progreso">
                📈 Progreso
              </button>
            ` : ''}
            <button class="btn-cambiar-estado" onclick="cambiarEstado(${proyecto.id})" title="Cambiar estado">
              🔄 Estado
            </button>
            <button class="btn-editar" onclick="editarProyecto(${proyecto.id})" title="Editar proyecto">
              ✏️ Editar
            </button>
            <button class="btn-eliminar" onclick="eliminarProyecto(${proyecto.id})" title="Eliminar proyecto">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Ordenar proyectos
 */
function ordenarProyectos(proyectos) {
  const copia = [...proyectos];
  
  switch(ordenActual) {
    case 'fecha':
      return copia.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    case 'prioridad':
      const prioridadValor = { alta: 3, media: 2, baja: 1 };
      return copia.sort((a, b) => prioridadValor[b.prioridad || 'media'] - prioridadValor[a.prioridad || 'media']);
    case 'nombre':
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    default:
      return copia;
  }
}

/**
 * Cambiar orden de proyectos
 */
function cambiarOrden(nuevoOrden) {
  ordenActual = nuevoOrden;
  document.querySelectorAll('.orden-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-orden="${nuevoOrden}"]`).classList.add('active');
  cargarProyectos();
}

/**
 * Actualizar estadísticas
 */
async function actualizarEstadisticas() {
  const stats = await obtenerEstadisticas();
  
  document.getElementById('totalProyectos').textContent = stats.total;
  document.getElementById('proyectosActivos').textContent = stats.activos;
  document.getElementById('proyectosCompletados').textContent = stats.completados;
  document.getElementById('proyectosVencidos').textContent = stats.vencidos;
}

/**
 * Calcular días restantes
 */
function calcularDiasRestantes(fechaEntrega) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const partes = fechaEntrega.split('-');
  const fecha = new Date(partes[0], partes[1] - 1, partes[2]);
  fecha.setHours(0, 0, 0, 0);
  
  const diferencia = fecha - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  const partes = fecha.split('-');
  const fechaObj = new Date(partes[0], partes[1] - 1, partes[2]);
  
  const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
  return fechaObj.toLocaleDateString('es-ES', opciones);
}

/**
 * Cambiar vista
 */
function cambiarVista() {
  vistaActual = vistaActual === 'lista' ? 'tarjetas' : 'lista';
  document.getElementById('vistaIcon').textContent = vistaActual === 'lista' ? '📋' : '🎴';
  document.getElementById('vistaText').textContent = vistaActual === 'lista' ? 'Vista Lista' : 'Vista Tarjetas';
  cargarProyectos();
}

// ====================================================
// Event Listeners de Filtros
// ====================================================
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    filtroActual = this.dataset.filtro;
    cargarProyectos();
  });
});

// ====================================================
// Formulario de Proyecto
// ====================================================
document.getElementById('formProyecto').addEventListener('submit', async function(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const etiquetas = formData.get('etiquetasProyecto')
    .split(',')
    .map(e => e.trim())
    .filter(e => e.length > 0);
  
  const proyecto = {
    nombre: formData.get('nombreProyecto').trim(),
    descripcion: formData.get('descripcionProyecto').trim(),
    fechaEntrega: formData.get('fechaEntrega'),
    estado: formData.get('estadoProyecto'),
    prioridad: formData.get('prioridadProyecto'),
    enlace: formData.get('enlaceProyecto').trim(),
    etiquetas: etiquetas,
    notas: formData.get('notasProyecto').trim(),
    progreso: 0
  };
  
  try {
    if (proyectoEnEdicion !== null) {
      // EDITAR proyecto existente
      await actualizarProyecto(proyectoEnEdicion, proyecto);
      mostrarNotificacion('✅ Proyecto actualizado exitosamente', 'success');
      
      proyectoEnEdicion = null;
      document.getElementById('btnSubmit').innerHTML = '<span>➕</span> Agregar Proyecto';
      document.getElementById('btnCancelar').style.display = 'none';
    } else {
      // CREAR nuevo proyecto
      await crearProyecto(proyecto);
      mostrarNotificacion('🎉 Proyecto creado exitosamente', 'success');
    }
    
    e.target.reset();
    await cargarProyectos();
    
    // Scroll a la lista
    document.getElementById('listaProyectos').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    // El error ya se muestra en apiRequest
  }
});

/**
 * Cancelar edición
 */
function cancelarEdicion() {
  proyectoEnEdicion = null;
  document.getElementById('formProyecto').reset();
  document.getElementById('btnSubmit').innerHTML = '<span>➕</span> Agregar Proyecto';
  document.getElementById('btnCancelar').style.display = 'none';
  mostrarNotificacion('Edición cancelada', 'info');
}

/**
 * Eliminar proyecto
 */
async function eliminarProyecto(id) {
  if (confirm('¿Eliminar este proyecto?')) {
    try {
      await eliminarProyectoAPI(id);
      await cargarProyectos();
      mostrarNotificacion('🗑️ Proyecto eliminado', 'info');
    } catch (error) {
      // El error ya se muestra en apiRequest
    }
  }
}

/**
 * Editar proyecto
 */
async function editarProyecto(id) {
  const proyecto = proyectosCache.find(p => p.id === id);
  
  if (proyecto) {
    proyectoEnEdicion = id;
    
    const form = document.getElementById('formProyecto');
    form.nombreProyecto.value = proyecto.nombre;
    form.descripcionProyecto.value = proyecto.descripcion;
    form.fechaEntrega.value = proyecto.fechaEntrega;
    form.estadoProyecto.value = proyecto.estado;
    form.prioridadProyecto.value = proyecto.prioridad || 'media';
    form.enlaceProyecto.value = proyecto.enlace || '';
    form.etiquetasProyecto.value = (proyecto.etiquetas || []).join(', ');
    form.notasProyecto.value = proyecto.notas || '';
    
    document.getElementById('btnSubmit').innerHTML = '<span>💾</span> Guardar Cambios';
    document.getElementById('btnCancelar').style.display = 'inline-flex';
    
    // Scroll al formulario
    form.scrollIntoView({ behavior: 'smooth' });
    mostrarNotificacion('✏️ Modo edición activado', 'info');
  }
}

/**
 * Cambiar estado
 */
async function cambiarEstado(id) {
  const proyecto = proyectosCache.find(p => p.id === id);
  
  if (proyecto) {
    const estadoActual = proyecto.estado;
    let nuevoEstado;
    
    if (estadoActual === 'pendiente') nuevoEstado = 'en-proceso';
    else if (estadoActual === 'en-proceso') nuevoEstado = 'completado';
    else nuevoEstado = 'pendiente';
    
    try {
      await actualizarEstadoProyecto(id, nuevoEstado);
      
      if (nuevoEstado === 'completado') {
        celebrarCompletado();
      }
      
      await cargarProyectos();
      mostrarNotificacion(`Estado cambiado a: ${nuevoEstado}`, 'success');
    } catch (error) {
      // El error ya se muestra en apiRequest
    }
  }
}

/**
 * Actualizar progreso
 */
async function actualizarProgreso(id) {
  const proyecto = proyectosCache.find(p => p.id === id);
  
  if (proyecto) {
    const nuevoProgreso = prompt(`Ingresa el progreso (0-100%) para "${proyecto.nombre}":`, proyecto.progreso || 0);
    
    if (nuevoProgreso !== null) {
      const progreso = Math.min(100, Math.max(0, parseInt(nuevoProgreso) || 0));
      
      try {
        await actualizarProgresoProyecto(id, progreso);
        
        if (progreso === 100) {
          celebrarCompletado();
        }
        
        await cargarProyectos();
        mostrarNotificacion(`Progreso actualizado a ${progreso}%`, 'success');
      } catch (error) {
        // El error ya se muestra en apiRequest
      }
    }
  }
}

/**
 * Celebrar completado
 */
function celebrarCompletado() {
  for (let i = 0; i < 50; i++) {
    crearConfetti();
  }
}

/**
 * Crear confetti
 */
function crearConfetti() {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.style.left = Math.random() * 100 + '%';
  confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
  confetti.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f'][Math.floor(Math.random() * 5)];
  document.body.appendChild(confetti);
  
  setTimeout(() => confetti.remove(), 5000);
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
  const notificacion = document.createElement('div');
  notificacion.className = `notificacion notificacion-${tipo}`;
  notificacion.textContent = mensaje;
  
  document.body.appendChild(notificacion);
  
  setTimeout(() => notificacion.classList.add('show'), 100);
  setTimeout(() => {
    notificacion.classList.remove('show');
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

/**
 * Buscar proyectos
 */
function buscarProyectos() {
  const termino = document.getElementById('buscador').value.toLowerCase();
  
  if (termino === '') {
    cargarProyectos();
    return;
  }
  
  const resultados = proyectosCache.filter(p => 
    p.nombre.toLowerCase().includes(termino) ||
    p.descripcion.toLowerCase().includes(termino) ||
    (p.etiquetas && p.etiquetas.some(e => e.toLowerCase().includes(termino)))
  );
  
  mostrarResultadosBusqueda(resultados, termino);
}

/**
 * Mostrar resultados de búsqueda
 */
function mostrarResultadosBusqueda(proyectos, termino) {
  const listaProyectos = document.getElementById('listaProyectos');
  
  if (proyectos.length === 0) {
    listaProyectos.innerHTML = `
      <div class="mensaje-vacio" style="display: flex;">
        <div class="empty-icon">🔍</div>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otro término de búsqueda</p>
      </div>
    `;
    return;
  }
  
  // Aplicar orden a los resultados
  proyectos = ordenarProyectos(proyectos);
  
  listaProyectos.className = vistaActual === 'tarjetas' ? 'lista-proyectos vista-tarjetas' : 'lista-proyectos vista-lista';
  
  listaProyectos.innerHTML = proyectos.map((proyecto, index) => {
    const diasRestantes = calcularDiasRestantes(proyecto.fechaEntrega);
    const prioridad = proyecto.prioridad || 'media';
    const progreso = proyecto.progreso || 0;
    const etiquetas = proyecto.etiquetas || [];
    const notas = proyecto.notas || '';
    
    return `
      <li style="animation-delay: ${index * 0.1}s">
        <div class="proyecto-card ${proyecto.estado} prioridad-${prioridad}">
          <div class="proyecto-header-card">
            <div class="proyecto-badges">
              <span class="badge-estado ${proyecto.estado}">
                ${proyecto.estado === 'pendiente' ? '⏳' : proyecto.estado === 'en-proceso' ? '🔄' : '✅'} 
                ${proyecto.estado}
              </span>
              <span class="badge-prioridad ${prioridad}">
                ${prioridad === 'alta' ? '🔴' : prioridad === 'media' ? '🟡' : '🟢'} 
                ${prioridad}
              </span>
            </div>
            ${proyecto.estado === 'completado' ? '<div class="check-completado">✓</div>' : ''}
          </div>

          <h3 class="proyecto-nombre">
            <span class="proyecto-icono">📊</span>
            ${proyecto.nombre}
          </h3>
          
          <p class="proyecto-desc">${proyecto.descripcion}</p>
          
          ${etiquetas.length > 0 ? `
            <div class="proyecto-etiquetas">
              ${etiquetas.map(etiqueta => `<span class="etiqueta">#${etiqueta}</span>`).join('')}
            </div>
          ` : ''}
          
          <div class="proyecto-info-grid">
            <div class="info-item">
              <span class="info-icon">📅</span>
              <div>
                <div class="info-label">Fecha de entrega</div>
                <div class="info-value">${formatearFecha(proyecto.fechaEntrega)}</div>
              </div>
            </div>
            
            ${proyecto.estado !== 'completado' ? `
              <div class="info-item">
                <span class="info-icon">⏰</span>
                <div>
                  <div class="info-label">Tiempo restante</div>
                  <div class="info-value ${diasRestantes < 0 ? 'vencido' : diasRestantes <= 3 ? 'urgente' : ''}">${diasRestantes < 0 ? `Vencido (${Math.abs(diasRestantes)} días)` : diasRestantes === 0 ? '¡Hoy!' : `${diasRestantes} días`}</div>
                </div>
              </div>
            ` : ''}
          </div>

          ${proyecto.estado !== 'completado' ? `
            <div class="progreso-container">
              <div class="progreso-header">
                <span class="progreso-label">Progreso</span>
                <span class="progreso-porcentaje">${progreso}%</span>
              </div>
              <div class="progreso-barra">
                <div class="progreso-fill" style="width: ${progreso}%"></div>
              </div>
            </div>
          ` : ''}

          ${notas ? `
            <div class="proyecto-notas">
              <div class="notas-header">📝 Notas</div>
              <div class="notas-contenido">${notas}</div>
            </div>
          ` : ''}

          ${proyecto.enlace ? `
            <div class="proyecto-enlace-box">
              <a href="${proyecto.enlace}" target="_blank" class="proyecto-link">
                🔗 Ver enlace útil
              </a>
            </div>
          ` : ''}

          <div class="acciones">
            ${proyecto.estado !== 'completado' ? `
              <button class="btn-progreso" onclick="actualizarProgreso(${proyecto.id})" title="Actualizar progreso">
                📈 Progreso
              </button>
            ` : ''}
            <button class="btn-cambiar-estado" onclick="cambiarEstado(${proyecto.id})" title="Cambiar estado">
              🔄 Estado
            </button>
            <button class="btn-editar" onclick="editarProyecto(${proyecto.id})" title="Editar proyecto">
              ✏️ Editar
            </button>
            <button class="btn-eliminar" onclick="eliminarProyecto(${proyecto.id})" title="Eliminar proyecto">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </li>
    `;
  }).join('');
}

/**
 * Exportar proyectos
 */
async function exportarProyectos() {
  const proyectos = await obtenerProyectos();
  const dataStr = JSON.stringify(proyectos, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `proyectos_${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  mostrarNotificacion('📥 Proyectos exportados exitosamente', 'success');
}

/**
 * Cerrar sesión
 */
function cerrarSesion() {
  if (confirm('¿Deseas cerrar sesión?')) {
    window.location.href = '/ManageNLearn/logout.php';
  }
}

// ====================================================
// Event Listeners
// ====================================================
document.getElementById('buscador').addEventListener('input', buscarProyectos);

// Cargar proyectos al iniciar
cargarProyectos();