const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

async function fixSchema() {
  try {
    console.log("🔧 Fixing database schema migration issue...");

    let sequelize;

    // Check if DATABASE_URL is provided
    if (process.env.DATABASE_URL) {
      console.log("📊 Using PostgreSQL from DATABASE_URL...");

      // Determine if it's local or production
      const isLocal =
        process.env.DATABASE_URL.includes("localhost") ||
        process.env.DATABASE_URL.includes("127.0.0.1") ||
        process.env.DATABASE_URL.includes("postgres://");

      sequelize = new Sequelize(process.env.DATABASE_URL, {
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
    } else {
      console.log("📊 Using SQLite for local development...");
      const dbPath = path.join(__dirname, "..", "database.sqlite");
      sequelize = new Sequelize({
        dialect: "sqlite",
        storage: dbPath,
        logging: console.log,
      });
    }

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Check if createdAt column exists and has null values
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM submissions 
      WHERE "createdAt" IS NULL
    `);

    const nullCount = results[0].null_count;
    console.log(`📊 Found ${nullCount} records with null createdAt`);

    if (nullCount > 0) {
      console.log("🔧 Fixing null createdAt values...");
      
      // Update null createdAt values with current timestamp
      await sequelize.query(`
        UPDATE submissions 
        SET "createdAt" = NOW() 
        WHERE "createdAt" IS NULL
      `);
      
      console.log("✅ Updated null createdAt values");
    }

    // Check if updatedAt column exists and has null values
    const [updatedResults] = await sequelize.query(`
      SELECT COUNT(*) as null_count 
      FROM submissions 
      WHERE "updatedAt" IS NULL
    `);

    const updatedNullCount = updatedResults[0].null_count;
    console.log(`📊 Found ${updatedNullCount} records with null updatedAt`);

    if (updatedNullCount > 0) {
      console.log("🔧 Fixing null updatedAt values...");
      
      // Update null updatedAt values with current timestamp
      await sequelize.query(`
        UPDATE submissions 
        SET "updatedAt" = NOW() 
        WHERE "updatedAt" IS NULL
      `);
      
      console.log("✅ Updated null updatedAt values");
    }

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

    console.log("🎉 Database schema fix completed successfully!");

    // Close connection
    await sequelize.close();

  } catch (error) {
    console.error("❌ Error fixing database schema:", error);
    if (sequelize) {
      await sequelize.close();
    }
    throw error;
  }
}

// Run the fix
fixSchema()
  .then(() => {
    console.log("✅ Schema fix completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Schema fix failed:", error);
    process.exit(1);
  });
