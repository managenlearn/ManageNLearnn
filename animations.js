// ========== FRASES DINÁMICAS ==========
document.addEventListener("DOMContentLoaded", function() {
  const frases = [
    "Organiza, visualiza y lidera tu institución.",
    "Tu equipo, tus proyectos, tu visión… en un solo lugar.",
    "Haz que cada recurso cuente.",
    "Convierte el caos en claridad educativa."
  ];

  let indice = 0;
  const fraseContainer = document.getElementById('fraseDinamica');

  if (!fraseContainer) return;
  
  const fraseElement = fraseContainer.querySelector('span');
  if (!fraseElement) return;

  // Mostrar la primera frase
  fraseElement.textContent = frases[0];
  fraseElement.style.opacity = "1";

  // Cambiar frases cada 4 segundos
  setInterval(() => {
    fraseElement.style.opacity = "0";
    
    setTimeout(() => {
      indice = (indice + 1) % frases.length;
      fraseElement.textContent = frases[indice];
      fraseElement.style.opacity = "1";
    }, 600);
  }, 4000);
});

// ========== EFECTOS HOVER PARA BOTONES ==========
document.addEventListener("DOMContentLoaded", function() {
  const buttons = document.querySelectorAll("button, .btn, .btn-principal, .btn-secundario");
  
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", function() {
      this.style.transform = "translateY(-2px)";
    });
    
    btn.addEventListener("mouseleave", function() {
      this.style.transform = "translateY(0)";
    });
  });
});

console.log('✅ animation.js cargado correctamente');