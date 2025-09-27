const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

async function createTestSubmissions() {
  let sequelize;
  try {
    console.log("🧪 Creating test submissions...");

    // Create SQLite connection
    const dbPath = path.resolve(process.cwd(), "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite database");

    // Define Submission model
    const Submission = sequelize.define(
      "Submission",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        tracking_code: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        nama: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        nik: {
          type: DataTypes.STRING(16),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        no_wa: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        jenis_layanan: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("PENGAJUAN_BARU", "DIPROSES", "SELESAI", "DITOLAK"),
          defaultValue: "PENGAJUAN_BARU",
          allowNull: false,
        },
        additional_data: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        tableName: "submissions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Sync the model
    await sequelize.sync({ force: false });
    console.log("✅ Submission model synchronized");

    // Create test submissions for each type
    const testSubmissions = [
      {
        tracking_code: "WS-20250926-001",
        nama: "Budi Santoso",
        nik: "1234567890123456",
        email: "budi@example.com",
        no_wa: "+6281234567890",
        jenis_layanan: "KLINIK_HEWAN",
        status: "PENGAJUAN_BARU",
        additional_data: JSON.stringify({
          nama_hewan: "Rex",
          jenis_hewan: "ANJING",
          jenis_kelamin_hewan: "JANTAN",
          umur_hewan: "2 tahun",
          keluhan: "Tidak mau makan"
        })
      },
      {
        tracking_code: "WS-20250926-002",
        nama: "Siti Rahayu",
        nik: "2345678901234567",
        email: "siti@example.com",
        no_wa: "+6281234567891",
        jenis_layanan: "REKOMENDASI_DOKTER_HEWAN",
        status: "DIPROSES",
        additional_data: JSON.stringify({
          surat_permohonan: "Uploaded",
          ktp: "Uploaded",
          pas_foto: "Uploaded",
          ijazah_dokter_hewan: "Uploaded",
          sertifikat_kompetensi: "Uploaded",
          surat_rekomendasi: "Uploaded"
        })
      },
      {
        tracking_code: "WS-20250926-003",
        nama: "Ahmad Wijaya",
        nik: "3456789012345678",
        email: "ahmad@example.com",
        no_wa: "+6281234567892",
        jenis_layanan: "NOMOR_KONTROL_VETERINER",
        status: "SELESAI",
        additional_data: JSON.stringify({
          surat_permohonan_kontrol: "Uploaded",
          data_umum_khusus: "Uploaded",
          sop_pembersihan: "Uploaded",
          surat_pernyataan: "Uploaded"
        })
      },
      {
        tracking_code: "WS-20250926-004",
        nama: "Dewi Kartika",
        nik: "4567890123456789",
        email: "dewi@example.com",
        no_wa: "+6281234567893",
        jenis_layanan: "KLINIK_HEWAN",
        status: "DITOLAK",
        additional_data: JSON.stringify({
          nama_hewan: "Mimi",
          jenis_hewan: "KUCING",
          jenis_kelamin_hewan: "BETINA",
          umur_hewan: "1 tahun",
          keluhan: "Sering bersin"
        })
      }
    ];

    // Clear existing submissions
    await Submission.destroy({ where: {} });
    console.log("🗑️  Cleared existing submissions");

    // Create test submissions
    for (const submission of testSubmissions) {
      await Submission.create(submission);
      console.log(`✅ Created submission: ${submission.tracking_code} (${submission.jenis_layanan})`);
    }

    // Verify submissions
    const allSubmissions = await Submission.findAll();
    console.log(`\n📊 Test submissions created: ${allSubmissions.length}`);
    
    const submissionsByType = allSubmissions.reduce((acc, sub) => {
      acc[sub.jenis_layanan] = (acc[sub.jenis_layanan] || 0) + 1;
      return acc;
    }, {});

    console.log("📋 Submissions by type:");
    Object.entries(submissionsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log("\n🎉 Test submissions created successfully!");
    console.log("💡 You can now test the submission type tabs in the admin dashboard");

  } catch (error) {
    console.error("❌ Error creating test submissions:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

createTestSubmissions();
