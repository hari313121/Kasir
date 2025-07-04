let products = [
    { id: 1, name: 'Tepung Terigu', price: 10000, unit: 'kg' },
    { id: 2, name: 'Tepung Aci', price: 8000, unit: 'kg' },
    { id: 3, name: 'Gula', price: 13000, unit: 'kg' },
    { id: 4, name: 'Kopi Gula Aren', price: 5000, unit: 'pcs' },
    { id: 5, name: 'Susu Putih', price: 7000, unit: 'pcs' },
    { id: 6, name: 'Susu Coklat', price: 7500, unit: 'pcs' },
    { id: 7, name: 'Minyak', price: 15000, unit: 'L' },
    { id: 8, name: 'Bumbu Ayam Bawang', price: 3000, unit: 'pcs' },
    { id: 9, name: 'Aida', price: 2000, unit: 'pcs' },
    { id: 10, name: 'Panir', price: 9000, unit: 'kg' },
    { id: 11, name: 'Tepung Beras', price: 9500, unit: 'kg' },
];

let cart = [];
let selectedProductForEdit = null;
let nextProductId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
let receiptFooterText = "Terima kasih atas pelayanannya";

let printHeaderSettings = {
    shopName: "HARINFOOD",
    phoneNumber: "081235368643",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:MM:SS"
};

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

function loadProducts() {
    const productGrid = document.querySelector('.product-grid');
    productGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.innerHTML = `
            <h3>${product.name}</h3>
            <p class="price">${formatRupiah(product.price)} / ${product.unit}</p>
            <div class="product-actions">
                <button class="add-btn" onclick="addToCart(${product.id})"><i class="fas fa-plus"></i></button>
                <button class="edit-btn" onclick="openEditModal(${product.id})"><i class="fas fa-edit"></i></button>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ ...product, qty: 1 });
        }
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let totalAmount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="6" style="text-align: center;">Keranjang kosong.</td></tr>';
    } else {
        cart.forEach((item, index) => {
            const subtotal = item.price * item.qty;
            totalAmount += subtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>
                    <input type="number" value="${item.qty}" min="1" onchange="updateCartItemQty(${index}, this.value)">
                </td>
                <td>${item.unit}</td>
                <td>${formatRupiah(item.price)}</td>
                <td>${formatRupiah(subtotal)}</td>
                <td><button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });
    }

    document.getElementById('total-amount').textContent = formatRupiah(totalAmount);
}

// Fungsi baru untuk memperbarui kuantitas item di keranjang
function updateCartItemQty(index, newQty) {
    let quantity = parseInt(newQty);
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1; // Pastikan kuantitas minimal 1
    }
    cart[index].qty = quantity;
    updateCartDisplay(); // Perbarui tampilan keranjang setelah perubahan
}


function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartDisplay();
}

// --- Fungsionalitas Edit Produk ---
function openEditModal(productId) {
    selectedProductForEdit = products.find(p => p.id === productId);
    if (selectedProductForEdit) {
        document.getElementById('editProductId').value = selectedProductForEdit.id;
        document.getElementById('editProductNameInput').value = selectedProductForEdit.name;
        document.getElementById('editProductPrice').value = selectedProductForEdit.price;
        document.getElementById('editProductUnit').value = selectedProductForEdit.unit;
        document.getElementById('editProductModal').style.display = 'flex';
    }
}

function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
    selectedProductForEdit = null;
}

function saveProductChanges() {
    if (selectedProductForEdit) {
        const productId = parseInt(document.getElementById('editProductId').value);
        const newName = document.getElementById('editProductNameInput').value.trim();
        const newPrice = parseFloat(document.getElementById('editProductPrice').value);
        const newUnit = document.getElementById('editProductUnit').value.trim();

        if (newName === '' || isNaN(newPrice) || newPrice < 0 || newUnit === '') {
            alert('Nama produk tidak boleh kosong, harga harus angka positif, dan Satuan tidak boleh kosong.');
            return;
        }

        const allowedUnits = ['L', 'pcs', 'pack', 'kg'];
        if (!allowedUnits.includes(newUnit)) {
            alert(`Satuan harus salah satu dari: ${allowedUnits.join(', ')}`);
            return;
        }

        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            products[productIndex].name = newName;
            products[productIndex].price = newPrice;
            products[productIndex].unit = newUnit;
        }

        cart.forEach(item => {
            if (item.id === productId) {
                item.name = newName;
                item.price = newPrice;
                item.unit = newUnit;
            }
        });

        loadProducts();
        updateCartDisplay();
        closeEditModal();
    }
}

// --- Fungsionalitas Tambah Produk Baru ---
function openAddProductModal() {
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
    document.getElementById('newProductUnit').value = 'pcs';
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
}

function addNewProduct() {
    const newName = document.getElementById('newProductName').value.trim();
    const newPrice = parseFloat(document.getElementById('newProductPrice').value);
    const newUnit = document.getElementById('newProductUnit').value;

    if (newName === '' || isNaN(newPrice) || newPrice < 0 || newUnit === '') {
        alert('Nama produk tidak boleh kosong, harga harus angka positif, dan Satuan tidak boleh kosong.');
        return;
    }

    const newProduct = {
        id: nextProductId++,
        name: newName,
        price: newPrice,
        unit: newUnit
    };

    products.push(newProduct);
    loadProducts();
    closeAddProductModal();
}

// --- Fungsionalitas Cetak Struk ---
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang belanja masih kosong!');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Struk Belanja</title>');
    printWindow.document.write('<link rel="stylesheet" href="style.css">');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div id="print-area">');

    // Header Struk yang bisa diubah
    printWindow.document.write('<div class="print-header">');
    printWindow.document.write(`<h2>${printHeaderSettings.shopName}</h2>`);
    printWindow.document.write(`<p>Telp: ${printHeaderSettings.phoneNumber}</p>`);
    printWindow.document.write('</div>');

    // Informasi Tanggal dan Jam yang bisa diubah formatnya
    const now = new Date();
    let formattedDate = '';
    switch (printHeaderSettings.dateFormat) {
        case "DD/MM/YYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
            break;
        case "YYYY-MM-DD":
            formattedDate = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
            break;
        case "DD MMMMYYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            break;
        case "DD-MM-YYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
            break;
        default:
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let formattedTime = '';
    switch (printHeaderSettings.timeFormat) {
        case "HH:MM:SS":
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            break;
        case "HH:MM":
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            break;
        default:
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    printWindow.document.write('<div class="print-info">');
    printWindow.document.write(`<p>Tanggal: ${formattedDate}</p>`);
    printWindow.document.write(`<p>Jam: ${formattedTime}</p>`);
    printWindow.document.write('</div>');

    printWindow.document.write('<hr style="border: 0.5px dashed #000; margin: 5px 0;">');
    printWindow.document.write('<table><tbody>');

    cart.forEach(item => {
        printWindow.document.write(`<tr><td>${item.name}</td><td>${item.qty} ${item.unit}</td></tr>`);
    });

    printWindow.document.write('</tbody></table>');
    printWindow.document.write('<hr style="border: 0.5px dashed #000; margin: 5px 0;">');

    // Footer Struk
    printWindow.document.write(`<p class="thank-you">${receiptFooterText}</p>`);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();
    printWindow.print();

    cart = [];
    updateCartDisplay();
}

// --- Fungsionalitas Kirim via WhatsApp ---
function sendViaWhatsApp() {
    if (cart.length === 0) {
        alert('Keranjang belanja masih kosong! Tidak ada yang bisa dikirim.');
        return;
    }

    let whatsappText = "";

    // Header
    whatsappText += `${printHeaderSettings.shopName}\n`;
    whatsappText += `Telp: ${printHeaderSettings.phoneNumber}\n`;

    // Tanggal dan Jam
    const now = new Date();
    let formattedDate = '';
    switch (printHeaderSettings.dateFormat) {
        case "DD/MM/YYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
            break;
        case "YYYY-MM-DD":
            formattedDate = now.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
            break;
        case "DD MMMMYYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            break;
        case "DD-MM-YYYY":
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
            break;
        default:
            formattedDate = now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    let formattedTime = '';
    switch (printHeaderSettings.timeFormat) {
        case "HH:MM:SS":
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            break;
        case "HH:MM":
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            break;
        default:
            formattedTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    whatsappText += `Tanggal: ${formattedDate}\n`;
    whatsappText += `Jam: ${formattedTime}\n`;
    whatsappText += "-----------------------------\n";

    // Item Produk
    cart.forEach(item => {
        const maxNameLength = 20;
        const namePart = item.name.substring(0, maxNameLength).padEnd(maxNameLength, ' ');
        const qtyUnit = `${item.qty} ${item.unit}`;
        whatsappText += `${namePart} ${qtyUnit}\n`;
    });

    whatsappText += "-----------------------------\n";
    whatsappText += `Total: ${document.getElementById('total-amount').textContent}\n\n`;

    // Footer
    whatsappText += `${receiptFooterText}`;

    const encodedText = encodeURIComponent(whatsappText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');

    alert('Struk telah disiapkan di WhatsApp. Silakan pilih kontak dan kirim!');
}


// --- Fungsionalitas Edit Footer Struk ---
function openEditFooterModal() {
    document.getElementById('footerText').value = receiptFooterText;
    document.getElementById('editFooterModal').style.display = 'flex';
}

function closeEditFooterModal() {
    document.getElementById('editFooterModal').style.display = 'none';
}

function saveFooterText() {
    const newFooterText = document.getElementById('footerText').value.trim();
    if (newFooterText !== '') {
        receiptFooterText = newFooterText;
    } else {
        alert('Teks footer tidak boleh kosong.');
    }
    closeEditFooterModal();
}

// --- Fungsionalitas Edit Header Struk ---
function openEditHeaderModal() {
    document.getElementById('headerShopName').value = printHeaderSettings.shopName;
    document.getElementById('headerPhone').value = printHeaderSettings.phoneNumber;
    document.getElementById('headerDateFormat').value = printHeaderSettings.dateFormat;
    document.getElementById('headerTimeFormat').value = printHeaderSettings.timeFormat;
    document.getElementById('editHeaderModal').style.display = 'flex';
}

function closeEditHeaderModal() {
    document.getElementById('editHeaderModal').style.display = 'none';
}

function saveHeaderSettings() {
    const newShopName = document.getElementById('headerShopName').value.trim();
    const newPhone = document.getElementById('headerPhone').value.trim();
    const newDateFormat = document.getElementById('headerDateFormat').value.trim();
    const newTimeFormat = document.getElementById('headerTimeFormat').value.trim();

    if (newShopName === '' || newPhone === '') {
        alert('Nama toko dan nomor telepon tidak boleh kosong.');
        return;
    }

    printHeaderSettings.shopName = newShopName;
    printHeaderSettings.phoneNumber = newPhone;
    printHeaderSettings.dateFormat = newDateFormat;
    printHeaderSettings.timeFormat = newTimeFormat;

    alert('Pengaturan header struk berhasil disimpan!');
    closeEditHeaderModal();
}


// Inisialisasi aplikasi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartDisplay();

    const cartSummaryDiv = document.querySelector('.cart-summary');
    if (cartSummaryDiv) {
        const editFooterBtn = document.createElement('button');
        editFooterBtn.textContent = 'Edit Footer Struk';
        editFooterBtn.classList.add('btn-add-new');
        editFooterBtn.style.marginTop = '10px';
        editFooterBtn.onclick = openEditFooterModal;
        cartSummaryDiv.appendChild(editFooterBtn);

        const editHeaderBtn = document.createElement('button');
        editHeaderBtn.textContent = 'Edit Header Struk';
        editHeaderBtn.classList.add('btn-add-new');
        editHeaderBtn.style.marginTop = '10px';
        editHeaderBtn.onclick = openEditHeaderModal;
        cartSummaryDiv.appendChild(editHeaderBtn);
    }
});
