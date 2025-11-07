document.addEventListener('DOMContentLoaded', () => {
    // --- FUNÇÕES DE PERSISTÊNCIA ---
    const saveCart = () => localStorage.setItem('shoppingCart', JSON.stringify(cart));
    const loadCart = () => JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // --- ESTADO DA APLICAÇÃO ---
    let cart = loadCart();
    let hoveredProductCard = null;
    let focusedProductIndex = -1;
    let isEmailValid = false;
    let isPasswordValid = false;

    // --- SELETORES DO DOM ---
    const productGrid = document.querySelector('.product-grid');
    const productCards = document.querySelectorAll('.product-card');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.querySelector('.cart-empty-message');
    const totalPriceElement = document.getElementById('total-price');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const searchInput = document.getElementById('search-input');

    // Seletores do Checkout
    const checkoutForm = document.getElementById('checkout-form');
    const emailInput = document.getElementById('checkout-email');
    const passwordInput = document.getElementById('checkout-password');
    const emailError = document.getElementById('email-error');
    const passwordStrengthBar = document.getElementById('password-strength-bar');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const checkoutBtn = document.getElementById('checkout-btn');

    // --- FUNÇÕES DE VALIDAÇÃO DO CHECKOUT ---
    const validateEmail = () => {
        const email = emailInput.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isEmailValid = emailRegex.test(email);
        if (email.length === 0) {
            emailInput.classList.remove('valid', 'invalid');
            emailError.textContent = '';
        } else if (isEmailValid) {
            emailInput.classList.add('valid');
            emailInput.classList.remove('invalid');
            emailError.textContent = '';
        } else {
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
            emailError.textContent = 'Formato de e-mail inválido.';
        }
        validateForm();
    };

    const checkPasswordStrength = () => {
        const password = passwordInput.value;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const strengthLevels = {
            0: { text: '', color: '', width: '0%' },
            1: { text: 'Muito Fraca', color: '#dc3545', width: '20%' },
            2: { text: 'Fraca', color: '#ffc107', width: '40%' },
            3: { text: 'Média', color: '#ffc107', width: '60%' },
            4: { text: 'Forte', color: '#28a745', width: '80%' },
            5: { text: 'Muito Forte', color: '#28a745', width: '100%' }
        };

        const { text, color, width } = strengthLevels[score] || strengthLevels[0];
        passwordStrengthBar.style.width = width;
        passwordStrengthBar.style.backgroundColor = color;
        passwordStrengthText.textContent = text;
        passwordStrengthText.style.color = color;

        isPasswordValid = password.length >= 8;
        validateForm();
    };

    const validateForm = () => {
        const isCartNotEmpty = cart.length > 0;
        checkoutBtn.disabled = !(isEmailValid && isPasswordValid && isCartNotEmpty);
    };

    // --- FUNÇÕES DE NAVEGAÇÃO E FOCO (PRODUTOS) ---
    const getVisibleProducts = () => Array.from(productCards).filter(card => card.style.display !== 'none');

    const updateProductFocus = () => {
        const visibleProducts = getVisibleProducts();
        visibleProducts.forEach((card, index) => {
            const isFocused = index === focusedProductIndex;
            card.classList.toggle('product-focused', isFocused);
            if (isFocused) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    };

    // --- FUNÇÕES DO CARRINHO ---
    const findProductInCart = (productId) => cart.find(item => item.id === productId);

    const getProductInfoFromCard = (productCard) => {
        const { productId } = productCard.dataset;
        const name = productCard.querySelector('h3').textContent;
        const price = parseFloat(productCard.querySelector('.price').textContent.replace('R$', '').replace(',', '.'));
        const image = productCard.querySelector('img').src;
        return { id: productId, name, price, image };
    };

    const addToCart = (productCard) => {
        const product = getProductInfoFromCard(productCard);
        const quantity = parseInt(productCard.querySelector('.quantity-input').value);
        const existingProduct = findProductInCart(product.id);
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        saveCart();
        renderCart();
        showConfirmation(productCard.querySelector('.add-to-cart-btn'));
        productCard.querySelector('.quantity-input').value = '1';
    };

    const updateCartItemQuantity = (productId, newQuantity) => {
        const productInCart = findProductInCart(productId);
        if (!productInCart) return;
        if (newQuantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            productInCart.quantity = newQuantity;
        }
        saveCart();
        renderCart();
    };

    const calculateTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const renderCart = () => {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            if (cartEmptyMessage) cartItemsContainer.appendChild(cartEmptyMessage);
            if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
        } else {
            if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
            cart.forEach(item => {
                const li = document.createElement('li');
                li.className = 'cart-item';
                li.dataset.productId = item.id;
                li.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="cart-item-controls">
                        <button class="cart-quantity-btn decrease-cart">-</button>
                        <input type="text" class="cart-quantity-input" value="${item.quantity}" readonly>
                        <button class="cart-quantity-btn increase-cart">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(li);
            });
        }
        totalPriceElement.textContent = `R$ ${calculateTotal().toFixed(2).replace('.', ',')}`;
        validateForm();
    };

    const clearCart = () => {
        cart = [];
        saveCart();
        renderCart();
    };

    const showConfirmation = (button) => {
        if (button.classList.contains('added')) return;
        const originalText = button.textContent;
        button.textContent = 'Adicionado!';
        button.classList.add('added');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('added');
        }, 1500);
    };

    // --- EVENT LISTENERS ---

    /**
     * Escuta eventos de teclado em todo o documento para navegação e atalhos.
     * - Setas (Esquerda/Direita): Navega entre os produtos visíveis.
     * - +/-: Altera a quantidade do produto focado.
     * - Ctrl+Enter: Adiciona o produto focado ao carrinho.
     * - Escape: Limpa o foco do produto, limpa a busca e remove o foco de qualquer input.
     */

    // NAVEGAÇÃO POR TECLADO (RESTAURADA E CORRIGIDA)
    document.addEventListener('keydown', (e) => {
        const isInputFocused = document.activeElement.tagName === 'INPUT';

        if (e.key === 'Escape') {
            e.preventDefault();
            if (focusedProductIndex !== -1) {
                focusedProductIndex = -1;
                updateProductFocus();
            }
            document.activeElement.blur();
            return;
        }

        if (isInputFocused) return; // Ignora outras teclas se estiver digitando

        const visibleProducts = getVisibleProducts();
        if (visibleProducts.length === 0) return;

        let activeCard = focusedProductIndex > -1 ? visibleProducts[focusedProductIndex] : hoveredProductCard;

        switch (e.key) {
            case 'ArrowRight':
                e.preventDefault();
                focusedProductIndex = (focusedProductIndex + 1) % visibleProducts.length;
                updateProductFocus();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                focusedProductIndex = (focusedProductIndex - 1 + visibleProducts.length) % visibleProducts.length;
                updateProductFocus();
                break;
            case 'Enter':
                if (e.ctrlKey && activeCard) {
                    e.preventDefault();
                    addToCart(activeCard);
                }
                break;
            case '+':
            case '=':
                if (activeCard) {
                    e.preventDefault();
                    const input = activeCard.querySelector('.quantity-input');
                    input.value = parseInt(input.value) + 1;
                }
                break;
            case '-':
                if (activeCard) {
                    e.preventDefault();
                    const input = activeCard.querySelector('.quantity-input');
                    const currentValue = parseInt(input.value);
                    if (currentValue > 1) input.value = currentValue - 1;
                }
                break;
        }
    });

    // LISTENERS DE HOVER PARA NAVEGAÇÃO
    /**
     * Rastreia o card de produto sobre o qual o mouse está posicionado.
     * Isso permite que os atalhos de teclado (+, -, Enter) funcionem no card mesmo sem foco explícito das setas.
     */
    productGrid.addEventListener('mouseover', (e) => {
        hoveredProductCard = e.target.closest('.product-card');
    });
    /**
     * Limpa a referência ao card quando o mouse sai da grade de produtos.
     */
    productGrid.addEventListener('mouseout', () => {
        hoveredProductCard = null;
    });

    // LISTENERS DE CLIQUE NOS PRODUTOS (CORRIGIDO)
    /**
    * Gerencia todos os eventos de clique dentro da grade de produtos.
    * Usa delegação de eventos para lidar com cliques nos botões de quantidade e no botão 'Adicionar ao Carrinho'.
    */
    productGrid.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;

        if (e.target.classList.contains('increase')) {
            const input = productCard.querySelector('.quantity-input');
            input.value = parseInt(input.value) + 1;
        } else if (e.target.classList.contains('decrease')) {
            const input = productCard.querySelector('.quantity-input');
            const currentValue = parseInt(input.value);
            if (currentValue > 1) {
                input.value = currentValue - 1;
            }
        } else if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(productCard);
        }
    });

    // LISTENERS DO CARRINHO
    /**
    * Gerencia cliques nos controles de quantidade dos itens dentro do carrinho.
    * Usa delegação de eventos para aumentar, diminuir ou remover itens.
    */
    cartItemsContainer.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;
        const productId = cartItem.dataset.productId;
        let { quantity } = findProductInCart(productId);
        if (e.target.classList.contains('increase-cart')) quantity++;
        if (e.target.classList.contains('decrease-cart')) quantity--;
        updateCartItemQuantity(productId, quantity);
    });
    /**
       * Limpa todos os itens do carrinho ao clicar no botão 'Limpar Carrinho'.
       */
    clearCartBtn.addEventListener('click', clearCart);

    // LISTENER DA BUSCA
     /**
     * Filtra os produtos exibidos na loja em tempo real conforme o usuário digita no campo de busca.
     */
    searchInput.addEventListener('input', () => {
        focusedProductIndex = -1;
        updateProductFocus();
        const searchTerm = searchInput.value.toLowerCase().trim();
        productCards.forEach(card => {
            const cardText = (card.querySelector('h3').textContent + card.querySelector('.details p').textContent).toLowerCase();
            card.style.display = cardText.includes(searchTerm) ? '' : 'none';
        });
    });

    // LISTENERS DO FORMULÁRIO DE CHECKOUT
       /**
     * Valida o formato do e-mail em tempo real a cada tecla digitada.
     */
    emailInput.addEventListener('input', validateEmail);
      /**
     * Verifica a força da senha em tempo real a cada tecla digitada.
     */
    passwordInput.addEventListener('input', checkPasswordStrength);
      /**
     * Gerencia a submissão do formulário de checkout.
     * Impede o envio (preventDefault) e, se o formulário for válido, simula a compra.
     */
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (isEmailValid && isPasswordValid && cart.length > 0) {
            alert('Compra finalizada com sucesso! (Simulação)');
            clearCart();
            emailInput.value = '';
            passwordInput.value = '';
            validateEmail();
            checkPasswordStrength();
            emailInput.classList.remove('valid', 'invalid');
        } else {
            alert('Por favor, preencha todos os campos corretamente e adicione itens ao carrinho.');
        }
    });

    // --- RENDERIZAÇÃO INICIAL ---
    renderCart();
});
