# SQLite Database Migration Guide

## Overview
Aplikasi SLIDER telah dimigrasi dari Google Sheets ke SQLite database lokal. Ini memberikan keuntungan database gratis, self-contained, dan tidak memerlukan koneksi internet.

## ✅ Migration Completed

### **Database Configuration:**
- **Type**: SQLite (Local file database)
- **File**: `database.sqlite` (di root project)
- **Size**: ~1-10MB (tergantung data)
- **Backup**: Copy file `database.sqlite`

### **Features Migrated:**
- ✅ **Submissions**: Semua data pengajuan
- ✅ **Admin Users**: User admin dan authentication
- ✅ **Notifications**: Log notifikasi
- ✅ **Additional Data**: Data hewan dan dokumen (JSON format)

## 🚀 Setup Instructions

### 1. Database Sudah Dikonfigurasi
```bash
# Database file sudah dibuat
database.sqlite

# Environment sudah dikonfigurasi
DATABASE_URL=sqlite:database.sqlite
```

### 2. Start Application
```bash
npm run dev
```

### 3. Default Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- **URL**: `http://localhost:3000/admin/login`

## 📊 Database Structure

### **Tables Created:**

#### 1. **submissions** - Data Pengajuan
```sql
- id (UUID, Primary Key)
- tracking_code (String, Unique)
- nama (String)
- nik (String, 16 chars)
- email (String)
- no_wa (String)
- jenis_layanan (String)
- status (ENUM: PENGAJUAN_BARU, DIPROSES, SELESAI, DITOLAK)
- additional_data (TEXT, JSON format)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 2. **admins** - Admin Users
```sql
- id (UUID, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password (String, Hashed)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### 3. **notification_logs** - Log Notifikasi
```sql
- id (UUID, Primary Key)
- submission_id (UUID, Foreign Key)
- channel (ENUM: WHATSAPP, EMAIL)
- send_status (ENUM: SUCCESS, FAILED)
- payload (JSON)
- created_at (Timestamp)
```

## 🔧 Database Management

### **View Database:**
```bash
# Install SQLite browser (optional)
# Download: https://sqlitebrowser.org/

# Or use command line
sqlite3 database.sqlite
.tables
.schema submissions
```

### **Backup Database:**
```bash
# Copy database file
cp database.sqlite database_backup.sqlite

# Or create backup with timestamp
cp database.sqlite "database_backup_$(date +%Y%m%d_%H%M%S).sqlite"
```

### **Restore Database:**
```bash
# Replace with backup
cp database_backup.sqlite database.sqlite
```

## 📈 Data Storage

### **Additional Data (JSON Format):**
```json
{
  "nama_hewan": "Buddy",
  "jenis_hewan": "ANJING",
  "jenis_kelamin_hewan": "JANTAN",
  "umur_hewan": "2 tahun",
  "keluhan": "Tidak mau makan",
  "surat_permohonan": "Uploaded",
  "ktp": "Uploaded",
  "pas_foto": "Uploaded",
  "ijazah_dokter_hewan": "Uploaded",
  "sertifikat_kompetensi": "Uploaded",
  "surat_rekomendasi": "Uploaded",
  "surat_permohonan_kontrol": "Uploaded",
  "data_umum_khusus": "Uploaded",
  "sop_pembersihan": "Uploaded",
  "surat_pernyataan": "Uploaded"
}
```

## 🎯 Benefits of SQLite

### **Advantages:**
- ✅ **100% Free** - No hosting costs
- ✅ **Self-contained** - Single file database
- ✅ **No Internet Required** - Works offline
- ✅ **Fast Performance** - Local access
- ✅ **Easy Backup** - Copy single file
- ✅ **No Setup** - Works out of the box
- ✅ **Portable** - Move database anywhere

### **Use Cases:**
- ✅ **Development** - Local development
- ✅ **Small Teams** - Up to 10 users
- ✅ **Offline Work** - No internet dependency
- ✅ **Data Privacy** - Data stays local
- ✅ **Cost Effective** - Zero hosting costs

## 🔄 Migration from Google Sheets

### **Data Migration:**
Jika Anda memiliki data di Google Sheets yang ingin dimigrasi:

1. **Export Google Sheets** ke CSV
2. **Import ke SQLite** menggunakan script
3. **Update tracking codes** jika diperlukan

### **Script untuk Import:**
```javascript
// scripts/import-from-sheets.js
const csv = require('csv-parser');
const fs = require('fs');

// Import CSV data to SQLite
// (Script akan dibuat jika diperlukan)
```

## 🛠️ Maintenance

### **Regular Tasks:**
1. **Backup Database** - Weekly backup
2. **Monitor Size** - Check database size
3. **Clean Logs** - Remove old notification logs
4. **Update Admin** - Change default passwords

### **Performance Tips:**
- Database file akan bertambah seiring data
- Backup reguler untuk keamanan
- Monitor disk space
- Consider archiving old data

## 🚨 Troubleshooting

### **Common Issues:**

#### 1. **Database Locked**
```bash
# Kill any processes using database
# Restart application
npm run dev
```

#### 2. **Permission Denied**
```bash
# Check file permissions
chmod 664 database.sqlite
```

#### 3. **Database Corrupted**
```bash
# Restore from backup
cp database_backup.sqlite database.sqlite
```

#### 4. **Admin Login Failed**
```bash
# Reset admin password
node scripts/reset-admin.js
```

## 📊 Monitoring

### **Database Size:**
```bash
# Check database size
ls -lh database.sqlite
```

### **Record Count:**
```sql
-- Check submission count
SELECT COUNT(*) FROM submissions;

-- Check admin count
SELECT COUNT(*) FROM admins;

-- Check notification count
SELECT COUNT(*) FROM notification_logs;
```

## 🔐 Security

### **Database Security:**
- ✅ **File Permissions** - Restrict access to database file
- ✅ **Backup Encryption** - Encrypt backup files
- ✅ **Admin Passwords** - Use strong passwords
- ✅ **Regular Updates** - Keep application updated

### **Best Practices:**
- Backup database sebelum update
- Test di environment development
- Monitor database size
- Keep backup di lokasi aman

## 🎉 Success!

Aplikasi SLIDER sekarang menggunakan SQLite database yang:
- ✅ **Gratis 100%** - Tidak ada biaya hosting
- ✅ **Self-contained** - Database dalam satu file
- ✅ **Offline Ready** - Bekerja tanpa internet
- ✅ **Easy Backup** - Copy satu file saja
- ✅ **Fast Performance** - Akses lokal yang cepat

Database file: `database.sqlite`
Admin login: `admin` / `admin123`
