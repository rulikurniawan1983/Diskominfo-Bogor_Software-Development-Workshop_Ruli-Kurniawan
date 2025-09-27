# PostgreSQL Setup Guide

Panduan lengkap untuk menghubungkan aplikasi SLIDER ke database PostgreSQL.

## 🚀 Quick Start

### 1. Install PostgreSQL

#### Windows:
```bash
# Download dari https://www.postgresql.org/download/windows/
# Atau gunakan Chocolatey:
choco install postgresql
```

#### macOS:
```bash
# Menggunakan Homebrew:
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Setup Database

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE layanan_publik;
CREATE USER slider_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE layanan_publik TO slider_user;
\q
```

### 3. Update Environment Variables

Buat file `.env` dari `env.example`:

```bash
cp env.example .env
```

Edit `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://slider_user:your_password@localhost:5432/layanan_publik

# Application Configuration
APP_BASE_URL=http://localhost:3000

# SiCuba Configuration (WhatsApp)
SICUBA_API_TOKEN=your_sicuba_api_token_here
SICUBA_CAMPAIGN_ID=your_campaign_id_here

# Resend Configuration (Email)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# Node Environment
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install pg
```

### 5. Setup Database Tables

```bash
# Setup PostgreSQL database
node scripts/setup-postgresql.js
```

### 6. Migrate Data (Optional)

Jika Anda sudah memiliki data di SQLite dan ingin memindahkannya ke PostgreSQL:

```bash
# Migrate data dari SQLite ke PostgreSQL
node scripts/migrate-to-postgresql.js
```

### 7. Test Connection

```bash
# Test aplikasi
npm run dev
```

## 🌐 Production Setup

### Railway (Recommended)

1. **Buat akun di [Railway](https://railway.app)**
2. **Buat PostgreSQL service:**
   - Klik "New Project"
   - Pilih "Database" → "PostgreSQL"
   - Copy connection string

3. **Update environment variables:**
```env
DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
```

### Supabase

1. **Buat akun di [Supabase](https://supabase.com)**
2. **Buat project baru**
3. **Copy connection string dari Settings → Database**

### Neon

1. **Buat akun di [Neon](https://neon.tech)**
2. **Buat database baru**
3. **Copy connection string**

## 🔧 Troubleshooting

### Connection Issues

```bash
# Test connection manual
psql postgresql://username:password@host:port/database
```

### SSL Issues (Production)

Jika menggunakan database cloud, pastikan SSL diaktifkan:

```javascript
// Otomatis terdeteksi di lib/sequelize.js
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
}
```

### Permission Issues

```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE layanan_publik TO slider_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO slider_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO slider_user;
```

## 📊 Database Schema

### Tables Created:

1. **submissions** - Data pengajuan layanan
2. **notification_logs** - Log notifikasi
3. **admins** - Data admin

### Key Features:

- **UUID Primary Keys** - Untuk keamanan
- **Timestamps** - created_at, updated_at
- **JSON Support** - additional_data, payload
- **ENUM Types** - status, channel, send_status

## 🚀 Deployment

### Vercel + Railway

1. **Setup Railway database**
2. **Update Vercel environment variables:**
   - `DATABASE_URL` = Railway connection string
   - `SICUBA_API_TOKEN` = Your SiCuba token
   - `RESEND_API_KEY` = Your Resend API key

3. **Deploy:**
```bash
vercel --prod
```

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Scripts Available

- `node scripts/setup-postgresql.js` - Setup database tables
- `node scripts/migrate-to-postgresql.js` - Migrate from SQLite
- `node scripts/export-admin-data.js` - Export admin data
- `node scripts/import-admin-data.js` - Import admin data

## 🔍 Monitoring

### Check Database Status

```bash
# Check connection
node -e "
const { initializeDatabase } = require('./lib/sequelize');
initializeDatabase().then(() => console.log('✅ Connected')).catch(console.error);
"
```

### View Data

```sql
-- Connect to database
psql postgresql://username:password@host:port/database

-- Check tables
\dt

-- View submissions
SELECT * FROM submissions LIMIT 5;

-- View admins
SELECT username, email FROM admins;
```

## 🆘 Support

Jika mengalami masalah:

1. **Check logs:** `npm run dev`
2. **Test connection:** `node scripts/setup-postgresql.js`
3. **Check environment:** Pastikan `.env` file benar
4. **Database permissions:** Pastikan user memiliki akses penuh

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize PostgreSQL Guide](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
