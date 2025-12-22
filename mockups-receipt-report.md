# POS58 Receipt & Report Mockups

## 1. POS58 Receipt Layout (58mm Thermal Paper)

```
╔══════════════════════════════════════╗
║          TOKO SAYA                   ║
║        Jl. Contoh No. 123            ║
║        Jakarta 12345                 ║
║        Telp: (021) 12345678          ║
║        NPWP: 12.345.678.9-123.000    ║
║──────────────────────────────────────║
║ NO: 001    KASIR: John Doe          ║
║ TGL: 21/12/2025  14:30               ║
║──────────────────────────────────────║
║ ITEM                    QTY   HARGA ║
║──────────────────────────────────────║
║ Coca Cola 350ml         2    8,000 ║
║ Roti Tawar              1   12,000 ║
║ Susu UHT 1L             1   15,000 ║
║──────────────────────────────────────║
║ SUBTOTAL                    35,000 ║
║ PPN(10%)                    3,500 ║
║ TOTAL                      38,500 ║
║──────────────────────────────────────║
║ BAYAR: Tunai              50,000 ║
║ KEMBALI                   11,500 ║
║──────────────────────────────────────║
║          Terima Kasih                  ║
║      Barang yang sudah dibeli          ║
║       tidak dapat dikembalikan         ║
║         www.toko-saya.com              ║
╚══════════════════════════════════════╝
```

## 2. Shift Report Mockup (A4 PDF Format)

```
===============================================================
                        LAPORAN SHIFT KASIR
===============================================================

TOKO: TOKO SAYA
ALAMAT: Jl. Contoh No. 123, Jakarta 12345
KASIR: John Doe
SHIFT: 1
TANGGAL: 21 Desember 2025

===============================================================
                        RINGKASAN SHIFT
===============================================================

WAKTU SHIFT:
• Mulai    : 08:00
• Selesai  : 16:00
• Durasi   : 8 jam

KAS:
• Kas Awal         : Rp 100,000
• Kas Akhir        : Rp 245,000
• Penjualan Tunai  : Rp 145,000
• Variance         : Rp 0 (Sesuai)

PEMBAYARAN:
• Tunai           : Rp 145,000 (5 transaksi)
• Debit           : Rp 85,000  (2 transaksi)
• E-Wallet        : Rp 45,000  (1 transaksi)
• TOTAL PENJUALAN : Rp 275,000 (8 transaksi)

===============================================================
                    DETAIL TRANSAKSI HARIAN
===============================================================

TRANSAKSI TERATAS:
1. Transaksi #001 - Rp 38,500 (Tunai)
2. Transaksi #002 - Rp 25,000 (Debit)
3. Transaksi #003 - Rp 65,000 (Tunai)

PRODUK TERLARIS:
1. Coca Cola 350ml     - 12 unit
2. Roti Tawar         - 8 unit
3. Susu UHT 1L        - 6 unit

JAM PENJUALAN:
08:00-09:00  : Rp 45,000 (2 transaksi)
09:00-10:00  : Rp 80,000 (3 transaksi)
10:00-11:00  : Rp 60,000 (2 transaksi)
11:00-12:00  : Rp 90,000 (3 transaksi)
12:00-13:00  : Rp 85,000 (2 transaksi)
13:00-14:00  : Rp 95,000 (4 transaksi)
14:00-15:00  : Rp 75,000 (2 transaksi)
15:00-16:00  : Rp 65,000 (1 transaksi)

===============================================================
                    GERAKAN KAS MANUAL
===============================================================

08:00 - Kas Awal: +Rp 100,000
10:30 - Tarik Tunai: -Rp 50,000 (Setor Bank)
14:00 - Kas Masuk: +Rp 20,000 (Penyesuaian)
16:00 - Kas Akhir: Rp 245,000

===============================================================
                        CATATAN KASIR
===============================================================

• Penjualan hari ini lebih tinggi dari kemarin
• Stok Coca Cola perlu ditambah
• Printer berfungsi normal
• Tidak ada keluhan pelanggan

===============================================================
                  Tanda Tangan Kasir: __________

Generated: 21/12/2025 16:05 by System POS
===============================================================
```

## 3. Cash Movement Screen Mockup

```
╔══════════════════════════════════════════════════════╗
║                   GERAKAN KAS                        ║
╠══════════════════════════════════════════════════════╣
║ Shift: 1 (John Doe) | Kas Saat Ini: Rp 245,000      ║
╠══════════════════════════════════════════════════════╣
║ [TAMBAH KAS] [TARIK KAS] [PENYESUAIAN] [LAPORAN]     ║
╠══════════════════════════════════════════════════════╣
║                    HISTORI GERAKAN                   ║
║                                                      ║
║ 08:00 | Kas Awal     | +100,000 | Opening           ║
║ 10:30 | Tarik Tunai  |  -50,000 | Setor Bank        ║
║ 14:00 | Kas Masuk    |  +20,000 | Penyesuaian       ║
║ 14:30 | Penjualan    |  +38,500 | Transaksi #001    ║
║                                                      ║
║ [Lihat Detail] [Cetak Laporan]                      ║
╚══════════════════════════════════════════════════════╝
```

## 4. User Management Screen Mockup

```
╔══════════════════════════════════════════════════════╗
║                   MANAJEMEN KASIR                    ║
╠══════════════════════════════════════════════════════╣
║ [DAFTAR KASIR] [TAMBAH KASIR] [SHIFT AKTIF]         ║
╠══════════════════════════════════════════════════════╣
║                      DAFTAR KASIR                    ║
║                                                      ║
║ NAMA            ROLE      STATUS    SHIFT TERAKHIR   ║
║─────────────────────────────────────────────────────║
║ John Doe        Admin     Aktif     Shift #1 (Buka)  ║
║ Jane Smith      Kasir     Offline   Shift #5 (Tutup) ║
║ Bob Johnson     Kasir     Offline   Shift #4 (Tutup) ║
║                                                      ║
║ [Edit] [Hapus] [Reset Password]                     ║
╚══════════════════════════════════════════════════════╝
```

## 5. Receipt Template Configuration

```
╔══════════════════════════════════════════════════════╗
║              TEMPLATE STRUK                         ║
╠══════════════════════════════════════════════════════╣
║ [PREVIEW] [PENGATURAN] [SIMPAN TEMPLATE]            ║
╠══════════════════════════════════════════════════════╣
║                    HEADER                           ║
║ ✓ Tampilkan Logo          ✓ Tampilkan Alamat       ║
║ ✓ Tampilkan Telepon       ✓ Tampilkan NPWP         ║
║                                                      ║
║                    ITEMS                            ║
║ ✓ Tampilkan Barcode       ✓ Tampilkan Kategori     ║
║                                                      ║
║                    FOOTER                           ║
║ ✓ Pesan Terima Kasih: "Terima Kasih"               ║
║ ✓ Kebijakan Retur: "Barang tidak dapat dikembalikan"║
║ ✓ Tampilkan Website: "www.toko-saya.com"           ║
╚══════════════════════════════════════════════════════╝
```

## 6. Multi-User Authentication Flow

```
1. LOGIN SCREEN
   Username: [_________]
   Password: [_________]
   [LOGIN]

2. SHIFT SELECTION
   [Buka Shift Baru] | [Lanjutkan Shift]

3. SHIFT OPENING
   Kasir: John Doe
   Kas Awal: Rp [_________]
   [Mulai Shift]

4. SHIFT ACTIVITY
   - Process transactions
   - Cash movements
   - Real-time balance

5. SHIFT CLOSING
   Hitung Fisik Kas: Rp [_________]
   [Tutup Shift] | [Generate Report]
```

## 7. POS58 USB Printer Configuration

```
╔══════════════════════════════════════════════════════╗
║                 KONFIGURASI PRINTER                  ║
╠══════════════════════════════════════════════════════╣
║ Printer Type: POS58 Thermal Printer                  ║
║ Connection: USB                                       ║
║ Port: USB001                                          ║
║                                                      ║
║ Paper Width: 58mm (Default)                          ║
║ Character Set: Indonesian (CP437)                    ║
║ Font Size: Normal (12 CPI)                           ║
║                                                      ║
║ [TEST PRINT] [SAVE CONFIG] [FIND PRINTER]           ║
╚══════════════════════════════════════════════════════╝
```
