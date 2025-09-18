# Panduan Login Admin dengan Database

## Overview
Sistem login admin telah diupdate untuk menggunakan database authentication dengan Sequelize. Admin data disimpan dalam tabel `admins` dengan password yang di-hash menggunakan bcryptjs.

## Fitur Baru

### 1. Model Admin
- **Tabel**: `admins`
- **Fields**:
  - `id`: UUID (Primary Key)
  - `username`: String (Unique)
  - `password`: String (Hashed)
  - `email`: String (Optional)
  - `full_name`: String
  - `role`: ENUM (SUPER_ADMIN, ADMIN, OPERATOR)
  - `is_active`: Boolean
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

### 2. API Endpoints
- **POST** `/api/admin/auth/login` - Login admin

### 3. Admin Users yang Tersedia
Setelah menjalankan `node scripts/seed-admin.js`, tersedia 3 admin users:

| Username | Password | Role | Full Name | Email |
|----------|----------|------|-----------|-------|
| admin | admin123 | SUPER_ADMIN | Administrator | admin@diskominfo.go.id |
| operator1 | operator123 | OPERATOR | Operator 1 | operator1@diskominfo.go.id |
| admin2 | admin456 | ADMIN | Admin 2 | admin2@diskominfo.go.id |

## Cara Menggunakan

### 1. Setup Database
```bash
# Jalankan seeding untuk membuat admin users
node scripts/seed-admin.js
```

### 2. Login
1. Buka `/admin/login`
2. Masukkan username dan password
3. Sistem akan memvalidasi dengan database
4. Jika berhasil, akan redirect ke `/admin` dashboard

### 3. Dashboard
- Menampilkan informasi admin yang login
- Menampilkan role admin
- Data admin tersimpan di localStorage

## Keamanan

### Password Hashing
- Password di-hash menggunakan bcryptjs dengan salt rounds 10
- Password tidak disimpan dalam plain text

### Session Management
- Menggunakan localStorage untuk session (development)
- Untuk production, gunakan proper session management (JWT, cookies, dll)

### Role-based Access
- SUPER_ADMIN: Full access
- ADMIN: Standard admin access
- OPERATOR: Limited access

## API Response

### Login Success
```json
{
  "message": "Login berhasil",
  "admin": {
    "id": "uuid",
    "username": "admin",
    "email": "admin@diskominfo.go.id",
    "full_name": "Administrator",
    "role": "SUPER_ADMIN",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login Error
```json
{
  "message": "Username atau password salah"
}
```

## Troubleshooting

### 1. Database Connection Error
- Pastikan database sudah running
- Check DATABASE_URL di .env file
- Jalankan `npm run init-db` untuk sync database

### 2. Login Failed
- Pastikan admin user sudah dibuat dengan `node scripts/seed-admin.js`
- Check username dan password
- Check console untuk error details

### 3. Session Issues
- Clear localStorage dan coba login ulang
- Check browser console untuk error

## Development Notes

### Menambah Admin Baru
```javascript
// Di scripts/seed-admin.js, tambahkan ke array additionalAdmins
{
  username: "newadmin",
  password: "newpassword123",
  full_name: "New Admin",
  email: "newadmin@diskominfo.go.id",
  role: "ADMIN",
}
```

### Update Password
```javascript
// Di scripts/seed-admin.js, update password di existing admin
const hashedPassword = await bcrypt.hash("newpassword", 10);
await existingAdmin.update({ password: hashedPassword });
```

## Production Considerations

1. **Session Management**: Ganti localStorage dengan proper session management
2. **Password Policy**: Implement password complexity requirements
3. **Rate Limiting**: Add rate limiting untuk login attempts
4. **Audit Log**: Log semua login attempts
5. **2FA**: Consider implementing two-factor authentication
6. **Password Reset**: Implement password reset functionality
