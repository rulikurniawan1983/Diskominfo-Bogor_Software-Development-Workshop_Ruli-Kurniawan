const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");

async function migrateToPostgreSQL() {
  let sqliteSequelize, postgresSequelize;
  
  try {
    console.log("🚀 Starting migration from SQLite to PostgreSQL...");
    
    // Check if DATABASE_URL is provided
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
      console.log("❌ DATABASE_URL not found or not PostgreSQL. Please set DATABASE_URL environment variable.");
      console.log("Example: DATABASE_URL=postgresql://username:password@localhost:5432/layanan_publik");
      return;
    }

    // Step 1: Connect to SQLite database
    console.log("📁 Connecting to SQLite database...");
    const sqlitePath = path.resolve(process.cwd(), "database.sqlite");
    
    if (!fs.existsSync(sqlitePath)) {
      console.log("❌ SQLite database file not found. Nothing to migrate.");
      return;
    }

    sqliteSequelize = new Sequelize({
      dialect: "sqlite",
      storage: sqlitePath,
      logging: false,
    });

    await sqliteSequelize.authenticate();
    console.log("✅ Connected to SQLite database");

    // Step 2: Connect to PostgreSQL database
    console.log("🐘 Connecting to PostgreSQL database...");
    const isLocal = 
      process.env.DATABASE_URL.includes("localhost") || 
      process.env.DATABASE_URL.includes("127.0.0.1");
    
    postgresSequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isLocal ? {} : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

    await postgresSequelize.authenticate();
    console.log("✅ Connected to PostgreSQL database");

    // Step 3: Define models for both databases
    console.log("📋 Setting up models...");
    
    // SQLite models
    const SQLiteSubmission = sqliteSequelize.define("Submission", {
      id: { type: DataTypes.UUID, primaryKey: true },
      tracking_code: { type: DataTypes.STRING, unique: true, allowNull: false },
      nama: { type: DataTypes.STRING, allowNull: false },
      nik: { type: DataTypes.STRING(16), allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      no_wa: { type: DataTypes.STRING, allowNull: false },
      jenis_layanan: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      additional_data: { type: DataTypes.TEXT, allowNull: true },
    }, { tableName: "submissions", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

    const SQLiteNotificationLog = sqliteSequelize.define("NotificationLog", {
      id: { type: DataTypes.UUID, primaryKey: true },
      submission_id: { type: DataTypes.UUID, allowNull: false },
      channel: { type: DataTypes.STRING, allowNull: false },
      send_status: { type: DataTypes.STRING, allowNull: false },
      payload: { type: DataTypes.JSON, allowNull: false },
    }, { tableName: "notification_logs", timestamps: true, createdAt: "created_at", updatedAt: false });

    const SQLiteAdmin = sqliteSequelize.define("Admin", {
      id: { type: DataTypes.UUID, primaryKey: true },
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
    }, { tableName: "admins", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

    // PostgreSQL models
    const PostgresSubmission = postgresSequelize.define("Submission", {
      id: { type: DataTypes.UUID, primaryKey: true },
      tracking_code: { type: DataTypes.STRING, unique: true, allowNull: false },
      nama: { type: DataTypes.STRING, allowNull: false },
      nik: { type: DataTypes.STRING(16), allowNull: false },
      email: { type: DataTypes.STRING, allowNull: true },
      no_wa: { type: DataTypes.STRING, allowNull: false },
      jenis_layanan: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.ENUM("PENGAJUAN_BARU", "DIPROSES", "SELESAI", "DITOLAK"), allowNull: false },
      additional_data: { type: DataTypes.TEXT, allowNull: true },
    }, { tableName: "submissions", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

    const PostgresNotificationLog = postgresSequelize.define("NotificationLog", {
      id: { type: DataTypes.UUID, primaryKey: true },
      submission_id: { type: DataTypes.UUID, allowNull: false },
      channel: { type: DataTypes.ENUM("WHATSAPP", "EMAIL"), allowNull: false },
      send_status: { type: DataTypes.ENUM("SUCCESS", "FAILED"), allowNull: false },
      payload: { type: DataTypes.JSON, allowNull: false },
    }, { tableName: "notification_logs", timestamps: true, createdAt: "created_at", updatedAt: false });

    const PostgresAdmin = postgresSequelize.define("Admin", {
      id: { type: DataTypes.UUID, primaryKey: true },
      username: { type: DataTypes.STRING, unique: true, allowNull: false },
      email: { type: DataTypes.STRING, unique: true, allowNull: false },
      password: { type: DataTypes.STRING, allowNull: false },
    }, { tableName: "admins", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

    // Step 4: Create PostgreSQL tables
    console.log("🔄 Creating PostgreSQL tables...");
    await postgresSequelize.sync({ force: false });
    console.log("✅ PostgreSQL tables created");

    // Step 5: Migrate data
    console.log("📦 Migrating data...");

    // Migrate submissions
    const submissions = await SQLiteSubmission.findAll();
    console.log(`📋 Found ${submissions.length} submissions to migrate`);
    
    for (const submission of submissions) {
      await PostgresSubmission.create({
        id: submission.id,
        tracking_code: submission.tracking_code,
        nama: submission.nama,
        nik: submission.nik,
        email: submission.email,
        no_wa: submission.no_wa,
        jenis_layanan: submission.jenis_layanan,
        status: submission.status,
        additional_data: submission.additional_data,
        created_at: submission.created_at,
        updated_at: submission.updated_at,
      });
    }
    console.log("✅ Submissions migrated");

    // Migrate notification logs
    const notificationLogs = await SQLiteNotificationLog.findAll();
    console.log(`📋 Found ${notificationLogs.length} notification logs to migrate`);
    
    for (const log of notificationLogs) {
      await PostgresNotificationLog.create({
        id: log.id,
        submission_id: log.submission_id,
        channel: log.channel,
        send_status: log.send_status,
        payload: log.payload,
        created_at: log.created_at,
      });
    }
    console.log("✅ Notification logs migrated");

    // Migrate admins
    const admins = await SQLiteAdmin.findAll();
    console.log(`📋 Found ${admins.length} admins to migrate`);
    
    for (const admin of admins) {
      await PostgresAdmin.create({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        password: admin.password,
        created_at: admin.created_at,
        updated_at: admin.updated_at,
      });
    }
    console.log("✅ Admins migrated");

    // Step 6: Verify migration
    const postgresSubmissionCount = await PostgresSubmission.count();
    const postgresNotificationCount = await PostgresNotificationLog.count();
    const postgresAdminCount = await PostgresAdmin.count();

    console.log("\n📊 Migration Summary:");
    console.log(`   Submissions: ${submissions.length} → ${postgresSubmissionCount}`);
    console.log(`   Notification Logs: ${notificationLogs.length} → ${postgresNotificationCount}`);
    console.log(`   Admins: ${admins.length} → ${postgresAdminCount}`);

    console.log("\n🎉 Migration completed successfully!");
    console.log("💡 You can now update your .env file to use PostgreSQL:");
    console.log(`   DATABASE_URL=${process.env.DATABASE_URL}`);

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    try {
      if (sqliteSequelize) await sqliteSequelize.close();
      if (postgresSequelize) await postgresSequelize.close();
    } catch (_) {}
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPostgreSQL()
    .then(() => {
      console.log("✅ Migration script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateToPostgreSQL };
