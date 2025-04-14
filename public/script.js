const bookForm = document.getElementById('bookForm');
const booksTable = document.getElementById('booksTable').getElementsByTagName('tbody')[0];
const submitButton = document.getElementById('submitButton');
const searchInput = document.getElementById('searchInput');

let editingBookNo = null;

// Fungsi untuk mengambil semua buku
async function fetchBooks() {
    const response = await fetch('/api/books');
    const books = await response.json();
    displayBooks(books);
}

// Fungsi untuk menampilkan buku di tabel
function displayBooks(books) {
    booksTable.innerHTML = ''; // Kosongkan tabel sebelum menampilkan data baru
    books.forEach(book => {
        const row = booksTable.insertRow();
        row.innerHTML = `
            <td>${book.nomorbuku}</td>
            <td>${book.name}</td>
            <td>${book.halaman}</td>
            <td>${book.penulis}</td>
            <td>${book.lokasi}</td>
            <td>
                ${
                book.filepath
                    ? `<a href="${book.filepath.replace(/\\/g, '/')}" target="_blank" rel="noopener noreferrer">Baca PDF</a>`
                    : 'Tidak ada'
                }
            </td>
            <td>
                <button class="change" data-bs-toggle="modal" data-bs-target="#formulir" onclick="editBook('${book._id}')">Edit</button>
                <button class="change" onclick="deleteBook('${book._id}')">Hapus</button>
            </td>
        `;

    });
}

// Fungsi untuk menambah buku
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const ebookInput = document.getElementById('ebook');
    const nomorbukuInput = document.getElementById('nomorbuku').value;
    const formData = new FormData();

    // Validasi sederhana di frontend
    if (!nomorbukuInput) {
        alert('Nomor buku harus diisi');
        return;
    }

    // Tambahkan data buku ke FormData
    formData.append('nomorbuku', nomorbukuInput);
    formData.append('name', document.getElementById('name').value);
    formData.append('halaman', document.getElementById('halaman').value);
    formData.append('penulis', document.getElementById('penulis').value);
    formData.append('lokasi', document.getElementById('lokasi').value);

    if (ebookInput.files.length > 0) {
        formData.append('ebook', ebookInput.files[0]);
    }
    console.log(editingBookNo);
    try {
        if (editingBookNo) {
            // Update buku yang ada
            const response = await fetch(`/api/books/${editingBookNo}`, {
                method: 'PUT',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal memperbarui buku');
            }
    
            showNotification('Buku berhasil diperbarui!', 'success');
        } else {
            // Tambah buku baru
            const response = await fetch('/api/books', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menambahkan buku');
            }
            
            showNotification('Buku berhasil ditambahkan!', 'success');
        }

        // Reset form dan status
        editingBookNo = null;
        submitButton.textContent = 'Tambah Buku';
        bookForm.reset();
        
        // Refresh daftar buku
        await fetchBooks();
        
    } catch (error) {
        console.error("Error:", error);
        showNotification(error.message, 'error');
    }
});

// Fungsi untuk menampilkan notifikasi (opsional)
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Fungsi untuk mengedit buku
async function editBook(id) {
    try {
        // Mengambil data buku dari API
        const response = await fetch(`/api/books/search/${id}`);
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data buku: ${response.status}`);
        }

        const book = await response.json();
        
        // Mengisi form dengan data buku
        document.getElementById('nomorbuku').value = book.nomorbuku;
        document.getElementById('name').value = book.name;
        document.getElementById('halaman').value = book.halaman;
        document.getElementById('penulis').value = book.penulis;
        document.getElementById('lokasi').value = book.lokasi;
        
        // Untuk field file (ebook), biasanya tidak di-set value-nya karena security restriction
        // Tapi bisa menampilkan nama file yang ada jika diperlukan
        if (book.filepath) {
            // Hapus elemen informasi file sebelumnya jika ada
            const existingEbookInfo = document.getElementById('ebook-info');
            if (existingEbookInfo) {
                existingEbookInfo.remove();
            }


            const ebookInfo = document.createElement('div');
            ebookInfo.id = 'ebook-info';
            ebookInfo.textContent = `File terpasang: ${book.filepath.split('/').pop()}`;
            ebookInfo.style.marginTop = '5px';
            document.getElementById('ebook').parentNode.appendChild(ebookInfo);
        }

        // Set status edit
        console.log(`Nomor Buku: ${id}`);
        editingBookNo = id;
        submitButton.textContent = 'Update Buku';
        
        // Scroll ke form untuk UX yang lebih baik
        document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        alert('Gagal memuat data buku untuk diedit. Silakan coba lagi.');
    }
}

// Fungsi untuk menghapus buku
async function deleteBook(id) {
    const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        console.error("Gagal menghapus buku");
        return;
    }

    fetchBooks(); // Ambil data buku terbaru
}

// Fungsi untuk mencari buku
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = booksTable.getElementsByTagName('tr');
    
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        const nomorbuku = cells[0].innerText.toLowerCase();
        const name = cells[1].innerText.toLowerCase();
        const penulis = cells[3].innerText.toLowerCase();
        
        if (
            nomorbuku.includes(searchTerm) || 
            name.includes(searchTerm) || 
            penulis.includes(searchTerm)
        ) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
});

// Ambil buku saat halaman dimuat
fetchBooks();

// Reset form setiap kali modal ditutup
const modalElement = document.getElementById('formulir');
modalElement.addEventListener('hidden.bs.modal', () => {
    bookForm.reset(); // Reset semua input di form
    editingBookNo = null; // Reset status editing
    submitButton.textContent = 'Tambah Buku'; // Ubah tombol kembali ke "Tambah Buku"

    // Hapus elemen informasi file jika ada
    const existingEbookInfo = document.getElementById('ebook-info');
    if (existingEbookInfo) {
        existingEbookInfo.remove();
    }
});