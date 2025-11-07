// ============================================================
// 📜 SCRIPTS PRINCIPAIS - PADARIA MIRIBEL
// ============================================================

document.addEventListener('DOMContentLoaded', function() {

  // ------------------------------
  // BOTÃO "VOLTAR AO TOPO"
  // ------------------------------
  const backToTopButton = document.getElementById("btn-back-to-top");

  window.onscroll = function() {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
      backToTopButton.style.opacity = "1";
      backToTopButton.style.visibility = "visible";
    } else {
      backToTopButton.style.opacity = "0";
      backToTopButton.style.visibility = "hidden";    
    }
  };

  backToTopButton.onclick = function(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ------------------------------
  // MODAL DE PRODUTO
  // ------------------------------
  const modalOverlay = document.getElementById('product-modal-overlay');
  const infoButtons = document.querySelectorAll('.btn-info');
  const closeModalButton = document.getElementById('close-modal-button');

  if (modalOverlay && infoButtons.length > 0 && closeModalButton) {
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductImage = document.getElementById('modal-product-image');
    const modalProductDescription = document.getElementById('modal-product-description');

    // Abre o modal com os dados do produto
    infoButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();

        // Encontra o card de produto pai
        const productItem = this.closest('.product-item');
        
        // Pega os dados do produto
        const productName = productItem.querySelector('h4').textContent;
        const productImageSrc = productItem.querySelector('img').src;
        const productDescription = productItem.querySelector('p').textContent;

        // Preenche o modal
        modalProductName.textContent = productName;
        modalProductImage.src = productImageSrc;
        modalProductDescription.textContent = productDescription;

        // Mostra o modal
        modalOverlay.classList.add('show-modal');
      });
    });

    // Fecha o modal clicando no botão 'X'
    closeModalButton.addEventListener('click', function() {
      modalOverlay.classList.remove('show-modal');
    });

    // Fecha o modal clicando fora (no overlay)
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('show-modal');
      }
    });
  }
});
