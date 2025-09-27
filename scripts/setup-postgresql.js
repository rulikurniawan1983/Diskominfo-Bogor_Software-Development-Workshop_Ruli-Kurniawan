const { Sequelize, DataTypes } = require("sequelize");

async function setupPostgreSQL() {
  let sequelize;
  
  try {
    console.log("🐘 Setting up PostgreSQL database...");
    
    // Check if DATABASE_URL is provided
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
      console.log("❌ DATABASE_URL not found or not PostgreSQL.");
      console.log("Please set DATABASE_URL environment variable:");
      console.log("Example: DATABASE_URL=postgresql://username:password@localhost:5432/layanan_publik");
      return;
    }

    // Connect to PostgreSQL
    const isLocal = 
      process.env.DATABASE_URL.includes("localhost") || 
      process.env.DATABASE_URL.includes("127.0.0.1");
    
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isLocal ? {} : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL database");

    // Define models
    const Submission = sequelize.define("Submission", {
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
    }, {
      tableName: "submissions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    const NotificationLog = sequelize.define("NotificationLog", {
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
    }, {
      tableName: "notification_logs",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    });

    const Admin = sequelize.define("Admin", {
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
    }, {
      tableName: "admins",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    });

    // Define relationships
    Submission.hasMany(NotificationLog, { foreignKey: "submission_id" });
    NotificationLog.belongsTo(Submission, { foreignKey: "submission_id" });

    // Create tables
    console.log("🔄 Creating database tables...");
    await sequelize.sync({ force: false });
    console.log("✅ Database tables created successfully");

    // Test the setup
    const submissionCount = await Submission.count();
    const adminCount = await Admin.count();
    const notificationCount = await NotificationLog.count();

    console.log("\n📊 Database Status:");
    console.log(`   Submissions: ${submissionCount}`);
    console.log(`   Admins: ${adminCount}`);
    console.log(`   Notification Logs: ${notificationCount}`);

    console.log("\n🎉 PostgreSQL setup completed successfully!");
    console.log("💡 Your application is now ready to use PostgreSQL");

  } catch (error) {
    console.error("❌ PostgreSQL setup failed:", error);
    throw error;
  } finally {
    try {
      if (sequelize) await sequelize.close();
    } catch (_) {}
  }
}

// Run setup if called directly
if (require.main === module) {
  setupPostgreSQL()
    .then(() => {
      console.log("✅ PostgreSQL setup completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ PostgreSQL setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupPostgreSQL };
