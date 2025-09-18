const { Sequelize, DataTypes } = require("sequelize");

async function fixPostgresSchema() {
  try {
    console.log("🔧 Fixing PostgreSQL database schema migration issue...");

    if (!process.env.DATABASE_URL) {
      console.log("❌ DATABASE_URL not found, using SQLite instead");
      return;
    }

    // Determine if it's local or production
    const isLocal =
      process.env.DATABASE_URL.includes("localhost") ||
      process.env.DATABASE_URL.includes("127.0.0.1") ||
      process.env.DATABASE_URL.includes("postgres://");

    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isLocal
        ? {}
        : {
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

    // Test connection
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connection established successfully.");

    // Ensure snake_case timestamps exist and are populated
    await sequelize.query('ALTER TABLE "public"."submissions" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NULL');
    await sequelize.query('ALTER TABLE "public"."submissions" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NULL');
    await sequelize.query('UPDATE submissions SET "created_at" = NOW() WHERE "created_at" IS NULL');
    await sequelize.query('UPDATE submissions SET "updated_at" = NOW() WHERE "updated_at" IS NULL');

    const [results] = await sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM submissions 
      WHERE "created_at" IS NULL
    `);

    const nullCount = results[0].null_count;
    console.log(`📊 Found ${nullCount} records with null createdAt`);

    if (nullCount > 0) {
      console.log("🔧 Fixing null createdAt values...");
      
      // Update null created_at values with current timestamp
      await sequelize.query(`
        UPDATE submissions 
        SET "created_at" = NOW() 
        WHERE "created_at" IS NULL
      `);
      
      console.log("✅ Updated null createdAt values");
    }

    // Check if updatedAt column exists and has null values
    const [updatedResults] = await sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM submissions 
      WHERE "updated_at" IS NULL
    `);

    const updatedNullCount = updatedResults[0].null_count;
    console.log(`📊 Found ${updatedNullCount} records with null updatedAt`);

    if (updatedNullCount > 0) {
      console.log("🔧 Fixing null updatedAt values...");
      
      // Update null updated_at values with current timestamp
      await sequelize.query(`
        UPDATE submissions 
        SET "updated_at" = NOW() 
        WHERE "updated_at" IS NULL
      `);
      
      console.log("✅ Updated null updatedAt values");
    }

    // Notification logs: ensure and backfill created_at
    await sequelize.query('ALTER TABLE "public"."notification_logs" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NULL');
    await sequelize.query('UPDATE notification_logs SET "created_at" = NOW() WHERE "created_at" IS NULL');

    // Now try to sync the models
    console.log("🔄 Synchronizing database models...");
    
    // Define the Submission model
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
      },
      {
        tableName: "submissions",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Define the NotificationLog model
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

    // Define relationships
    Submission.hasMany(NotificationLog, { foreignKey: "submission_id" });
    NotificationLog.belongsTo(Submission, { foreignKey: "submission_id" });

    // Sync models with force: false to avoid data loss
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized successfully.");

    // Test the models
    const submissionCount = await Submission.count();
    console.log(`📊 Total submissions in database: ${submissionCount}`);

    console.log("🎉 PostgreSQL schema fix completed successfully!");

    // Close connection
    await sequelize.close();

  } catch (error) {
    console.error("❌ Error fixing PostgreSQL schema:", error);
    throw error;
  }
}

// Run the fix
fixPostgresSchema()
  .then(() => {
    console.log("✅ PostgreSQL schema fix completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ PostgreSQL schema fix failed:", error);
    process.exit(1);
  });
