document.addEventListener('DOMContentLoaded', function() {
    const pengeluaranForm = document.getElementById('pengeluaran-form');
    const daftarPengeluaran = document.getElementById('daftar-pengeluaran');
    const totalPengeluaranElem = document.getElementById('total-pengeluaran');
    const filterBulan = document.getElementById('filter-bulan');
    const filterTahun = document.getElementById('filter-tahun');
    const searchInput = document.getElementById('searchInput');
    const submitButton = document.getElementById('submitButton');
    
    let editingPengeluaranId = null;
    const API_URL = '/api/pengeluaran';
    
    // Format tanggal ke DD/MM/YYYY
    function formatTanggal(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID');
    }
    
    // Format angka ke Rupiah
    function formatRupiah(angka) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(angka);
    }
    
    // Ambil data pengeluaran dari API
    async function fetchPengeluaran() {
        try {
            const bulan = filterBulan.value;
            const tahun = filterTahun.value;
            
            let url = API_URL;
            if (bulan && tahun) {
                url += `?bulan=${bulan}&tahun=${tahun}`;
            }
            
            const response = await fetch(url);
            const result = await response.json();
            
            if (result.success) {
                displayPengeluaran(result.data);
                updateTotalPengeluaran(result.total);
            } else {
                showNotification('Gagal mengambil data: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat mengambil data', 'error');
        }
    }
    
    // Tampilkan data pengeluaran di tabel
    function displayPengeluaran(data) {
        daftarPengeluaran.innerHTML = '';
        
        if (data.length === 0) {
            daftarPengeluaran.innerHTML = '<tr><td colspan="5" class="text-center">Tidak ada data pengeluaran</td></tr>';
            return;
        }
        
        data.forEach(pengeluaran => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pengeluaran.sumber}</td>
                <td>${formatRupiah(pengeluaran.jumlah)}</td>
                <td>${pengeluaran.kategori}</td>
                <td>${formatTanggal(pengeluaran.tanggal)}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editPengeluaran('${pengeluaran._id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePengeluaran('${pengeluaran._id}')">Hapus</button>
                </td>
            `;
            daftarPengeluaran.appendChild(row);
        });
    }
    
    // Update total pengeluaran
    function updateTotalPengeluaran(total) {
        totalPengeluaranElem.textContent = formatRupiah(total || 0);
    }
    
    // Handle form submission
    pengeluaranForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            sumber: document.getElementById('sumber').value,
            jumlah: parseFloat(document.getElementById('jumlah').value),
            kategori: document.getElementById('kategori').value,
            tanggal: document.getElementById('tanggal').value || new Date().toISOString().split('T')[0]
        };
        
        try {
            let response;
            if (editingPengeluaranId) {
                // Update existing
                response = await fetch(`${API_URL}/${editingPengeluaranId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new
                response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            }
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message || 'Operasi berhasil!', 'success');
                pengeluaranForm.reset();
                editingPengeluaranId = null;
                submitButton.textContent = 'Simpan';
                await fetchPengeluaran();
            } else {
                showNotification(result.message || 'Terjadi kesalahan', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat menyimpan data', 'error');
        }
    });
    
    // Fungsi untuk edit pengeluaran (dipanggil dari tombol edit)
    window.editPengeluaran = async function(id) {
        try {
            const response = await fetch(`${API_URL}/${id}`);
            const result = await response.json();
            
            if (result.success) {
                const pengeluaran = result.data;
                document.getElementById('sumber').value = pengeluaran.sumber;
                document.getElementById('jumlah').value = pengeluaran.jumlah;
                document.getElementById('kategori').value = pengeluaran.kategori;
                document.getElementById('tanggal').value = new Date(pengeluaran.tanggal).toISOString().split('T')[0];
                
                editingPengeluaranId = id;
                submitButton.textContent = 'Update';
                
                // Scroll ke form
                pengeluaranForm.scrollIntoView({ behavior: 'smooth' });
            } else {
                showNotification('Gagal mengambil data: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat mengambil data', 'error');
        }
    };
    
    // Fungsi untuk hapus pengeluaran (dipanggil dari tombol hapus)
    window.deletePengeluaran = async function(id) {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(result.message || 'Data berhasil dihapus', 'success');
                await fetchPengeluaran();
            } else {
                showNotification(result.message || 'Gagal menghapus data', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Terjadi kesalahan saat menghapus data', 'error');
        }
    };
    
    // Fungsi untuk mencari pengeluaran
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = daftarPengeluaran.getElementsByTagName('tr');
        
        for (let row of rows) {
            const cells = row.getElementsByTagName('td');
            if (cells.length === 0) continue;
            
            const sumber = cells[0].textContent.toLowerCase();
            const kategori = cells[2].textContent.toLowerCase();
            
            if (sumber.includes(searchTerm) || kategori.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // Filter perubahan
    filterBulan.addEventListener('change', fetchPengeluaran);
    filterTahun.addEventListener('change', fetchPengeluaran);
    
    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Tombol batal
    document.getElementById('btn-batal')?.addEventListener('click', () => {
        pengeluaranForm.reset();
        editingPengeluaranId = null;
        submitButton.textContent = 'Simpan';
    });
    
    // Load data awal
    fetchPengeluaran();
});