const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

async function clearAdminDashboard() {
  let sequelize;
  try {
    console.log("🗑️  Clearing admin dashboard...");

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

    // Define models
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

    const NotificationLog = sequelize.define(
      "NotificationLog",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        submission_id: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        channel: {
          type: DataTypes.ENUM("WHATSAPP", "EMAIL"),
          allowNull: false,
        },
        send_status: {
          type: DataTypes.ENUM("SUCCESS", "FAILED"),
          allowNull: false,
        },
        payload: {
          type: DataTypes.JSON,
          allowNull: false,
        },
      },
      {
        tableName: "notification_logs",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: false,
      }
    );

    const Admin = sequelize.define(
      "Admin",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        tableName: "admins",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Drop and recreate all tables
    console.log("🗑️  Dropping all tables...");
    await sequelize.drop();
    console.log("✅ All tables dropped");

    // Recreate tables with correct schema
    console.log("🔄 Recreating tables with correct schema...");
    await sequelize.sync({ force: true });
    console.log("✅ Tables recreated successfully");

    // Create single admin user
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await Admin.create({
      username: "admin",
      email: "admin@slider.local",
      password: hashedPassword,
    });
    console.log("✅ Admin user created");

    // Verify empty state
    const submissionCount = await Submission.count();
    const notificationCount = await NotificationLog.count();
    const adminCount = await Admin.count();

    console.log("\n📊 Dashboard cleared successfully:");
    console.log(`   Submissions: ${submissionCount}`);
    console.log(`   Notifications: ${notificationCount}`);
    console.log(`   Admins: ${adminCount}`);

    console.log("\n🎉 Admin dashboard cleared successfully!");
    console.log("📋 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   URL: http://localhost:3000/admin/login");

  } catch (error) {
    console.error("❌ Error clearing admin dashboard:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

clearAdminDashboard();
