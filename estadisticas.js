// ========== ESTADÍSTICAS APP - VERSIÓN WOW MEJORADA ==========

const app = {
  charts: {},
  editandoCampo: null,
  editandoCategoria: null,
  datos: null,
  datosAnteriores: null, // Para calcular crecimiento
  historial: [],
  usuario: null,
  apiUrl: '../../api/estadisticas.php',
  
  datosIniciales: {
    ventas: { 
      ingresosDiarios: 0, 
      ingresosSemanales: 0, 
      ingresosMensuales: 0, 
      crecimiento: 0 // Se calcula automáticamente
    },
    operaciones: { 
      proyectosActivos: 0, 
      proyectosCompletados: 0, 
      productividad: 0 // Se calcula automáticamente
    }
  },
  
  async init() {
    if (!this.verificarSesion()) return;
    await this.cargarEstadisticas();
    this.cargarDatosAnteriores();
    this.calcularMetricasAutomaticas();
    this.actualizarUI();
    this.crearGrafico('ventas');
    console.log('✅ App inicializada correctamente');
  },

  verificarSesion() {
    this.usuario = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (!this.usuario) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  
  // ========== CÁLCULOS AUTOMÁTICOS ==========
  
  calcularMetricasAutomaticas() {
    // Calcular Crecimiento (comparando mes actual vs anterior)
    const mesActual = this.datos.ventas.ingresosMensuales;
    const mesAnterior = this.datosAnteriores ? this.datosAnteriores.ventas.ingresosMensuales : 0;
    
    if (mesAnterior > 0) {
      const crecimiento = ((mesActual - mesAnterior) / mesAnterior) * 100;
      this.datos.ventas.crecimiento = Math.round(crecimiento * 10) / 10; // 1 decimal
    } else if (mesActual > 0) {
      this.datos.ventas.crecimiento = 100; // 100% si no había datos previos
    } else {
      this.datos.ventas.crecimiento = 0;
    }
    
    // Calcular Productividad (% basado en proyectos completados)
    // Si hay proyectos completados y ninguno activo = 100%
    // Si hay solo activos = 0%
    // Si hay ambos = (completados / total) * 100
    const completados = this.datos.operaciones.proyectosCompletados;
    const activos = this.datos.operaciones.proyectosActivos;
    const total = completados + activos;
    
    if (total > 0) {
      // Productividad basada en qué tan bien se completan los proyectos
      this.datos.operaciones.productividad = Math.round((completados / total) * 100);
    } else {
      this.datos.operaciones.productividad = 0;
    }
    
    console.log('📊 Métricas automáticas calculadas:', {
      crecimiento: this.datos.ventas.crecimiento,
      productividad: this.datos.operaciones.productividad,
      detalles: { completados, activos, total }
    });
  },
  
  cargarDatosAnteriores() {
    // Cargar datos del mes anterior para comparación
    const key = `estadisticasManage_anterior_${this.usuario.id}`;
    const datosGuardados = localStorage.getItem(key);
    
    if (datosGuardados) {
      this.datosAnteriores = JSON.parse(datosGuardados);
    } else {
      this.datosAnteriores = JSON.parse(JSON.stringify(this.datosIniciales));
    }
  },
  
  guardarDatosAnteriores() {
    // Guardar datos actuales como "anteriores" para próxima comparación
    const key = `estadisticasManage_anterior_${this.usuario.id}`;
    localStorage.setItem(key, JSON.stringify(this.datos));
  },
  
  // ========== API ==========
  
  async cargarEstadisticas() {
    try {
      const response = await fetch(`${this.apiUrl}?usuario_id=${this.usuario.id}`);
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API no responde correctamente');
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.datos = result.data;
      } else {
        this.datos = JSON.parse(JSON.stringify(this.datosIniciales));
      }
    } catch (error) {
      console.error('⚠️ Error al cargar desde API:', error);
      // Fallback a localStorage
      const key = `estadisticasManage_${this.usuario.id}`;
      this.datos = JSON.parse(localStorage.getItem(key)) || JSON.parse(JSON.stringify(this.datosIniciales));
    }
  },
  
  async guardarEstadisticas() {
    // Recalcular métricas antes de guardar
    this.calcularMetricasAutomaticas();
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: this.usuario.id,
          ventas: this.datos.ventas,
          operaciones: this.datos.operaciones
        })
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API no responde correctamente');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('❌ Error al guardar:', result.message);
        return false;
      }
      
      // Backup en localStorage
      const key = `estadisticasManage_${this.usuario.id}`;
      localStorage.setItem(key, JSON.stringify(this.datos));
      
      this.mostrarNotificacion('✅ Datos guardados correctamente', 'success');
      return true;
      
    } catch (error) {
      console.error('⚠️ Error de conexión:', error);
      // Guardar solo localmente
      const key = `estadisticasManage_${this.usuario.id}`;
      localStorage.setItem(key, JSON.stringify(this.datos));
      this.mostrarNotificacion('💾 Guardado localmente', 'info');
      return false;
    }
  },
  
  // ========== TABS ==========
  
  cambiarTab(tipo, event) {
    document.querySelectorAll('.stats-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.stats-tab').forEach(el => el.classList.remove('active'));
    document.getElementById('stats-' + tipo).classList.add('active');
    
    if (event && event.target) {
      event.target.classList.add('active');
    }
    
    // Destruir gráfico anterior
    if (this.charts[tipo]) {
      this.charts[tipo].destroy();
      delete this.charts[tipo];
    }
    
    // Crear nuevo gráfico
    setTimeout(() => this.crearGrafico(tipo), 100);
  },
  
  // ========== EDITAR ==========
  
  editarStat(categoria, campo, nombre) {
    this.editandoCategoria = categoria;
    this.editandoCampo = campo;
    document.getElementById('tituloModal').textContent = '✏️ Editar: ' + nombre;
    document.getElementById('labelEditar').textContent = nombre + ':';
    document.getElementById('inputEditar').value = this.datos[categoria][campo];
    document.getElementById('inputEditar').focus();
    document.getElementById('modalEditar').classList.add('active');
  },
  
  cerrarModal() {
    document.getElementById('modalEditar').classList.remove('active');
    document.getElementById('inputEditar').value = '';
  },
  
  async guardarCambio() {
    const input = document.getElementById('inputEditar');
    const valor = parseFloat(input.value);
    
    if (isNaN(valor) || valor < 0) {
      this.mostrarNotificacion('⚠️ Ingresa un número válido', 'warning');
      input.focus();
      return;
    }
    
    this.datos[this.editandoCategoria][this.editandoCampo] = valor;
    
    const guardado = await this.guardarEstadisticas();
    if (guardado) {
      this.actualizarUI();
      this.cerrarModal();
    }
  },
  
  // ========== RESET ==========
  
  mostrarModalReset() {
    document.getElementById('modalReset').classList.add('active');
  },
  
  cerrarModalReset() {
    document.getElementById('modalReset').classList.remove('active');
  },
  
  async borrarDatos() {
    try {
      // Guardar en historial antes de borrar
      this.historial.unshift({
        fecha: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        datos: JSON.parse(JSON.stringify(this.datos))
      });
      
      // Guardar historial en localStorage
      const historialKey = `historialEstadisticas_${this.usuario.id}`;
      localStorage.setItem(historialKey, JSON.stringify(this.historial));
      
      // Guardar datos actuales como "anteriores" para cálculo de crecimiento
      this.guardarDatosAnteriores();
      
      // Intentar guardar en API
      const response = await fetch(this.apiUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: this.usuario.id })
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (!result.success) {
          console.error('Error al borrar en API:', result.message);
        }
      }
      
      // Resetear datos locales
      this.datos = JSON.parse(JSON.stringify(this.datosIniciales));
      this.calcularMetricasAutomaticas();
      
      const key = `estadisticasManage_${this.usuario.id}`;
      localStorage.setItem(key, JSON.stringify(this.datos));
      
      this.actualizarUI();
      this.cerrarModalReset();
      this.mostrarNotificacion('✅ Datos reseteados y guardados en historial', 'success');
      
    } catch (error) {
      console.error('Error al resetear:', error);
      this.mostrarNotificacion('⚠️ Error al resetear datos', 'error');
    }
  },
  
  // ========== HISTORIAL ==========
  
  async mostrarHistorial() {
    try {
      // Intentar cargar desde API
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: this.usuario.id })
      });
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        if (result.success) {
          this.historial = result.data;
        }
      }
    } catch (error) {
      console.error('Error al cargar historial desde API:', error);
    }
    
    // Fallback a localStorage
    if (!this.historial || this.historial.length === 0) {
      const historialKey = `historialEstadisticas_${this.usuario.id}`;
      this.historial = JSON.parse(localStorage.getItem(historialKey)) || [];
    }
    
    const contenido = document.getElementById('historialContenido');
    
    if (this.historial.length === 0) {
      contenido.innerHTML = `
        <div class="empty-history">
          <div class="empty-history-icon">📭</div>
          <p>No hay datos en el historial</p>
        </div>
      `;
    } else {
      contenido.innerHTML = this.historial.map(item => `
        <div class="history-item">
          <div class="history-date">🕒 ${item.fecha}</div>
          <div class="history-data">
            <div class="history-data-item">
              <span class="history-data-label">Ingresos Diarios</span>
              <span class="history-data-value">$${item.datos.ventas.ingresosDiarios.toLocaleString()}</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Ingresos Semanales</span>
              <span class="history-data-value">$${item.datos.ventas.ingresosSemanales.toLocaleString()}</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Ingresos Mensuales</span>
              <span class="history-data-value">$${item.datos.ventas.ingresosMensuales.toLocaleString()}</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Crecimiento</span>
              <span class="history-data-value">${item.datos.ventas.crecimiento >= 0 ? '+' : ''}${item.datos.ventas.crecimiento}%</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Proyectos Activos</span>
              <span class="history-data-value">${item.datos.operaciones.proyectosActivos}</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Proyectos Completados</span>
              <span class="history-data-value">${item.datos.operaciones.proyectosCompletados}</span>
            </div>
            <div class="history-data-item">
              <span class="history-data-label">Productividad</span>
              <span class="history-data-value">${item.datos.operaciones.productividad}%</span>
            </div>
          </div>
        </div>
      `).join('');
    }
    
    document.getElementById('modalHistorial').classList.add('active');
  },
  
  cerrarHistorial() {
    document.getElementById('modalHistorial').classList.remove('active');
  },
  
  // ========== UI ==========
  
  actualizarUI() {
    // Actualizar valores
    document.getElementById('val-ingresosDiarios').textContent = 
      '$' + this.datos.ventas.ingresosDiarios.toLocaleString();
    document.getElementById('val-ingresosSemanales').textContent = 
      '$' + this.datos.ventas.ingresosSemanales.toLocaleString();
    document.getElementById('val-ingresosMensuales').textContent = 
      '$' + this.datos.ventas.ingresosMensuales.toLocaleString();
    
    // Crecimiento con color
    const crecimientoEl = document.getElementById('val-crecimiento');
    const crecimiento = this.datos.ventas.crecimiento;
    crecimientoEl.textContent = (crecimiento >= 0 ? '+' : '') + crecimiento + '%';
    crecimientoEl.style.color = crecimiento >= 0 ? '#28a745' : '#dc3545';
    
    document.getElementById('val-proyectosActivos').textContent = 
      this.datos.operaciones.proyectosActivos;
    document.getElementById('val-proyectosCompletados').textContent = 
      this.datos.operaciones.proyectosCompletados;
    document.getElementById('val-productividad').textContent = 
      this.datos.operaciones.productividad + '%';
    
    // Actualizar gráficos
    Object.keys(this.charts).forEach(tipo => {
      if (this.charts[tipo]) {
        this.charts[tipo].destroy();
        delete this.charts[tipo];
      }
    });
    
    const activeTab = document.querySelector('.stats-content.active');
    if (activeTab) {
      const tipo = activeTab.id.replace('stats-', '');
      setTimeout(() => this.crearGrafico(tipo), 100);
    }
  },
  
  // ========== GRÁFICOS ==========
  
  crearGrafico(tipo) {
    const canvas = document.getElementById('chart' + tipo.charAt(0).toUpperCase() + tipo.slice(1));
    if (!canvas) return;
    
    if (this.charts[tipo]) {
      this.charts[tipo].destroy();
      delete this.charts[tipo];
    }
    
    const configs = {
      ventas: {
        type: 'bar',
        data: {
          labels: ['Diarios', 'Semanales', 'Mensuales'],
          datasets: [{
            label: 'Ingresos ($)',
            data: [
              this.datos.ventas.ingresosDiarios,
              this.datos.ventas.ingresosSemanales,
              this.datos.ventas.ingresosMensuales
            ],
            backgroundColor: [
              'rgba(179, 84, 77, 0.9)',
              'rgba(224, 151, 145, 0.9)',
              'rgba(238, 173, 167, 0.9)'
            ],
            borderColor: [
              'rgb(179, 84, 77)',
              'rgb(224, 151, 145)',
              'rgb(238, 173, 167)'
            ],
            borderWidth: 3,
            borderRadius: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { 
              display: true,
              labels: { 
                font: { size: 14, weight: 'bold' },
                padding: 20
              }
            },
            title: {
              display: true,
              text: '💰 Ingresos por Período',
              font: { size: 20, weight: 'bold' },
              color: '#b3544d',
              padding: 20
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                },
                font: { size: 12, weight: '600' }
              },
              grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
              ticks: { font: { size: 12, weight: '600' } },
              grid: { display: false }
            }
          }
        }
      },
      operaciones: {
        type: 'doughnut',
        data: {
          labels: ['Completados', 'En Proceso'],
          datasets: [{
            data: [
              this.datos.operaciones.proyectosCompletados,
              this.datos.operaciones.proyectosActivos
            ],
            backgroundColor: [
              'rgba(40, 167, 69, 0.9)',
              'rgba(179, 84, 77, 0.9)'
            ],
            borderColor: [
              'rgb(40, 167, 69)',
              'rgb(179, 84, 77)'
            ],
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { 
                font: { size: 14, weight: 'bold' },
                padding: 20
              }
            },
            title: {
              display: true,
              text: '📊 Estado de Proyectos',
              font: { size: 20, weight: 'bold' },
              color: '#b3544d',
              padding: 20
            }
          }
        }
      }
    };
    
    try {
      this.charts[tipo] = new Chart(canvas.getContext('2d'), configs[tipo]);
    } catch (error) {
      console.error('Error al crear gráfico:', error);
    }
  },
  
  // ========== NOTIFICACIONES ==========
  
  mostrarNotificacion(mensaje, tipo = 'info') {
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
};

// ========== INICIALIZAR ==========
window.onload = function() {
  app.init();
};

// ========== ATAJOS DE TECLADO ==========
document.addEventListener('keydown', (e) => {
  // ESC para cerrar modales
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
  
  // Enter en el modal de editar
  if (e.key === 'Enter' && document.getElementById('modalEditar').classList.contains('active')) {
    app.guardarCambio();
  }
});

console.log('✅ Estadísticas WOW cargadas correctamente');