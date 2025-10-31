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