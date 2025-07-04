document.addEventListener('DOMContentLoaded', () => {
    // Data produk HARINFOOD dengan satuan default
    let products = [
        { id: 'p01', name: 'Tepung Terigu', price: 10000, unit: 'kg' },
        { id: 'p02', name: 'Tepung Aci', price: 8500, unit: 'kg' },
        { id: 'p03', name: 'Gula', price: 13000, unit: 'kg' },
        { id: 'p04', name: 'Kopi Gula Aren', price: 15000, unit: 'pcs' },
        { id: 'p05', name: 'Susu Putih', price: 9000, unit: 'kotak' },
        { id: 'p06', name: 'Susu Coklat', price: 9500, unit: 'kotak' },
        { id: 'p07', name: 'Minyak Goreng', price: 18000, unit: 'liter' },
        { id: 'p08', name: 'Bumbu Ayam Bawang', price: 7000, unit: 'sachet' },
        { id: 'p09', name: 'Aida', price: 3000, unit: 'pcs' },
        { id: 'p10', name: 'Panir', price: 6000, unit: 'bungkus' },
        { id: 'p11', name: 'Tepung Beras', price: 9000, unit: 'kg' }
    ];

    let cart = []; // Keranjang belanja
    const productListDiv = document.getElementById('productList');
    const cartItemsTableBody = document.querySelector('#cartItems tbody');
    const grandTotalSpan = document.getElementById('grandTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    // Modal elements
    const addProductBtn = document.getElementById('addProductBtn');
    const addProductModal = document.getElementById('addProductModal');
    const closeButton = addProductModal.querySelector('.close-button');
    const saveNewProductBtn = document.getElementById('saveNewProductBtn');
    const cancelAddProductBtn = document.getElementById('cancelAddProductBtn');
    const newProductNameInput = document.getElementById('newProductName');
    const newProductPriceInput = document.getElementById('newProductPrice');
    const newProductUnitInput = document.getElementById('newProductUnit');
    const printDateTimeSpan = document.getElementById('printDateTime');


    // --- Fungsi Bantuan ---

    // Mengambil data keranjang dan harga/unit produk yang diubah dari LocalStorage
    const loadDataFromLocalStorage = () => {
        const storedCart = localStorage.getItem('harinfoodCart');
        if (storedCart) {
            cart = JSON.parse(storedCart);
        }
        const storedProducts = localStorage.getItem('harinfoodProducts');
        if (storedProducts) {
            const loadedProducts = JSON.parse(storedProducts);
            // Gabungkan produk default dengan produk yang dimuat dari localStorage
            const uniqueProducts = new Map(products.map(p => [p.id, p]));
            loadedProducts.forEach(lp => {
                uniqueProducts.set(lp.id, { ...uniqueProducts.get(lp.id), ...lp });
            });
            products = Array.from(uniqueProducts.values());
        }
    };

    // Menyimpan data keranjang dan harga/unit produk ke LocalStorage
    const saveCartToLocalStorage = () => {
        localStorage.setItem('harinfoodCart', JSON.stringify(cart));
    };

    const saveProductsToLocalStorage = () => {
        localStorage.setItem('harinfoodProducts', JSON.stringify(products));
    };

    // Format mata uang Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID').format(number);
    };

    // Fungsi untuk menghasilkan ID unik sederhana
    const generateUniqueId = () => {
        return 'p' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    };

    // --- Render Produk ---
    const renderProducts = () => {
        productListDiv.innerHTML = ''; // Bersihkan daftar produk yang ada
        // Sort products alphabetically by name
        const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name));

        sortedProducts.forEach(product => {
            const productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.dataset.productId = product.id;

            productItem.innerHTML = `
                <span class="product-name">${product.name}</span>
                <div class="product-info">
                    <span class="product-price" id="price-${product.id}">Rp ${formatRupiah(product.price)}</span>
                    <span class="product-unit" id="unit-${product.id}">${product.unit}</span>
                </div>
                <button class="edit-price-btn" data-product-id="${product.id}">Ubah Harga</button>
                <button class="edit-unit-btn" data-product-id="${product.id}">Ubah Satuan</button>
            `;

            // Event listener untuk menambah ke keranjang (klik pada item, kecuali tombol/input)
            productItem.addEventListener('click', (event) => {
                // Pastikan klik tidak terjadi pada tombol atau input
                if (!event.target.classList.contains('edit-price-btn') &&
                    !event.target.classList.contains('edit-unit-btn') &&
                    !event.target.classList.contains('price-input') &&
                    !event.target.classList.contains('unit-input')) {
                    addProductToCart(product.id);
                }
            });

            // Event listener untuk tombol "Ubah Harga"
            productItem.querySelector('.edit-price-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                toggleEditMode(product.id, 'price');
            });

            // Event listener untuk tombol "Ubah Satuan"
            productItem.querySelector('.edit-unit-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                toggleEditMode(product.id, 'unit');
            });

            productListDiv.appendChild(productItem);
        });
    };

    // --- Fungsi Ubah Harga/Satuan Manual ---
    const toggleEditMode = (productId, type) => {
        const productItem = productListDiv.querySelector(`.product-item[data-product-id="${productId}"]`);
        const product = products.find(p => p.id === productId);

        if (!product) return; // Product not found, should not happen

        let targetElement, inputClass, currentValue;
        let saveButton; // reference to the button that triggered the edit

        if (type === 'price') {
            targetElement = productItem.querySelector('.product-price');
            inputClass = 'price-input';
            currentValue = product.price;
            saveButton = productItem.querySelector('.edit-price-btn');
        } else if (type === 'unit') {
            targetElement = productItem.querySelector('.product-unit');
            inputClass = 'unit-input';
            currentValue = product.unit;
            saveButton = productItem.querySelector('.edit-unit-btn');
        } else {
            return; // Invalid type
        }

        if (targetElement.querySelector('input')) { // Jika sedang dalam mode edit
            const input = targetElement.querySelector('input');
            let newValue = input.value.trim();

            if (type === 'price') {
                newValue = parseInt(newValue);
                if (isNaN(newValue) || newValue < 0) {
                    alert('Harga tidak valid! Masukkan angka positif.');
                    newValue = product.price; // Kembali ke nilai sebelumnya
                }
                product.price = newValue;
                targetElement.innerHTML = `Rp ${formatRupiah(product.price)}`;
            } else if (type === 'unit') {
                if (newValue === '') {
                    alert('Satuan tidak boleh kosong!');
                    newValue = product.unit; // Kembali ke nilai sebelumnya
                }
                product.unit = newValue;
                targetElement.innerHTML = product.unit;
            }

            saveProductsToLocalStorage();
            saveButton.textContent = `Ubah ${type === 'price' ? 'Harga' : 'Satuan'}`;
            renderCart(); // Perbarui keranjang jika ada perubahan
        } else { // Jika belum dalam mode edit
            // Close any other active edit modes for this product to prevent multiple inputs
            if (productItem.querySelector('.price-input') && type === 'unit') {
                 toggleEditMode(productId, 'price'); // Close price edit if unit is being edited
            }
            if (productItem.querySelector('.unit-input') && type === 'price') {
                 toggleEditMode(productId, 'unit'); // Close unit edit if price is being edited
            }

            const inputType = (type === 'price') ? 'number' : 'text';
            const minAttr = (type === 'price') ? 'min="0"' : '';
            targetElement.innerHTML = `<input type="${inputType}" class="${inputClass}" value="${currentValue}" ${minAttr}>`;
            const input = targetElement.querySelector('input');
            input.focus();
            input.select();

            // Simpan saat Enter ditekan atau input kehilangan fokus
            input.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    toggleEditMode(productId, type);
                }
            });
            input.addEventListener('blur', () => {
                toggleEditMode(productId, type);
            });
            saveButton.textContent = `Simpan ${type === 'price' ? 'Harga' : 'Satuan'}`;
        }
    };

    // --- Manipulasi Keranjang ---

    const addProductToCart = (productId) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity++;
                // Update price and unit in cart in case they were changed in product list
                existingItem.price = product.price;
                existingItem.unit = product.unit;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    unit: product.unit // Add unit to cart item
                });
            }
            saveCartToLocalStorage();
            renderCart();
        }
    };

    const updateCartQuantity = (productId, newQuantity) => {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            newQuantity = parseInt(newQuantity);
            if (isNaN(newQuantity) || newQuantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = newQuantity;
            }
            saveCartToLocalStorage();
            renderCart();
        }
    };

    const removeProductFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCartToLocalStorage();
        renderCart();
    };

    const clearCart = () => {
        if (confirm('Yakin ingin membersihkan seluruh keranjang?')) {
            cart = [];
            saveCartToLocalStorage();
            renderCart();
            alert('Keranjang belanja telah dikosongkan!');
        }
    };

    // --- Render Keranjang ---
    const renderCart = () => {
        cartItemsTableBody.innerHTML = '';
        let grandTotal = 0; // Still calculate total for internal logic, even if not printed

        if (cart.length === 0) {
            cartItemsTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Keranjang kosong. Tambahkan produk!</td></tr>';
            grandTotalSpan.textContent = formatRupiah(0);
            return;
        }

        cart.forEach(item => {
            const currentProduct = products.find(p => p.id === item.id);
            const itemPrice = currentProduct ? currentProduct.price : item.price;
            const itemUnit = currentProduct ? currentProduct.unit : item.unit;

            const itemTotal = itemPrice * item.quantity;
            grandTotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="cart-item-name-only">${item.name}</span>
                </td>
                <td>
                    <input type="number" min="1" value="${item.quantity}" data-product-id="${item.id}" class="quantity-input no-print">
                    <span class="print-only">${item.quantity} ${itemUnit}</span> </td>
                <td class="no-print">Rp ${formatRupiah(itemTotal)}</td> <td class="no-print">
                    <button class="delete-item-btn" data-product-id="${item.id}">X</button>
                </td>
            `;
            cartItemsTableBody.appendChild(row);
        });

        grandTotalSpan.textContent = formatRupiah(grandTotal);

        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (event) => {
                const productId = event.target.dataset.productId;
                updateCartQuantity(productId, event.target.value);
            });
        });

        document.querySelectorAll('.delete-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                removeProductFromCart(productId);
            });
        });
    };

    // --- Fungsi Checkout dan Cetak ---
    const checkoutAndPrint = () => {
        if (cart.length === 0) {
            alert('Keranjang belanja masih kosong!');
            return;
        }

        // Set the current date and time for the print header
        const now = new Date();
        const dateTimeOptions = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false // Use 24-hour format
        };
        const dateTimeString = now.toLocaleDateString('id-ID', dateTimeOptions) + ' WIB';
        printDateTimeSpan.textContent = dateTimeString;

        window.print();

        setTimeout(() => {
            if (confirm('Apakah transaksi sudah selesai dan keranjang ingin dikosongkan?')) {
                 clearCart();
            }
        }, 500);
    };

    // --- Fungsi Modal Tambah Produk Baru ---
    const openAddProductModal = () => {
        addProductModal.style.display = 'flex';
        newProductNameInput.value = '';
        newProductPriceInput.value = '0';
        newProductUnitInput.value = '';
        newProductNameInput.focus();
    };

    const closeAddProductModal = () => {
        addProductModal.style.display = 'none';
    };

    const saveNewProduct = () => {
        const name = newProductNameInput.value.trim();
        const price = parseInt(newProductPriceInput.value);
        const unit = newProductUnitInput.value.trim();

        if (!name || isNaN(price) || price < 0 || !unit) {
            alert('Semua field harus diisi dengan benar (nama dan satuan tidak boleh kosong, harga harus angka positif).');
            return;
        }

        const newProduct = {
            id: generateUniqueId(),
            name: name,
            price: price,
            unit: unit
        };

        products.push(newProduct);
        saveProductsToLocalStorage();
        renderProducts();
        closeAddProductModal();
        alert(`Produk "${name}" berhasil ditambahkan!`);
    };

    // --- Event Listeners Utama ---
    checkoutBtn.addEventListener('click', checkoutAndPrint);
    clearCartBtn.addEventListener('click', clearCart);
    addProductBtn.addEventListener('click', openAddProductModal);
    closeButton.addEventListener('click', closeAddProductModal);
    cancelAddProductBtn.addEventListener('click', closeAddProductModal);
    saveNewProductBtn.addEventListener('click', saveNewProduct);

    // Close modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === addProductModal) {
            closeAddProductModal();
        }
    });

    // --- Inisialisasi Aplikasi ---
    loadDataFromLocalStorage();
    renderProducts();
    renderCart();
});
