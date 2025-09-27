const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

async function initSQLite() {
  let sequelize;
  try {
    console.log("🚀 Initializing SQLite database...");

    // Create SQLite database in project root
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: console.log,
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ SQLite database connection established successfully.");

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
          validate: {
            isEmail: true,
          },
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

    // Define Admin model
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
          validate: {
            isEmail: true,
          },
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

    // Define NotificationLog model
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
          references: {
            model: "submissions",
            key: "id",
          },
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

    // Sync all models
    await sequelize.sync({ force: false });
    console.log("✅ All models synchronized successfully.");

    // Create default admin if not exists
    const bcrypt = require("bcryptjs");
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await Admin.create({
        username: "admin",
        email: "admin@slider.local",
        password: hashedPassword,
      });
      console.log("✅ Default admin user created (username: admin, password: admin123)");
    } else {
      console.log("✅ Admin user already exists");
    }

    console.log("\n🎉 SQLite database initialization completed successfully!");
    console.log(`📁 Database file: ${dbPath}`);
    console.log("\n📝 Default admin credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("\n💡 You can now start the application with: npm run dev");

  } catch (error) {
    console.error("❌ Error initializing SQLite database:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

initSQLite();
