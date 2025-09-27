const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// Create Sequelize instance based on DATABASE_URL
let sequelize;

try {
  // Check if DATABASE_URL is provided for PostgreSQL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.log("🗄️  Using PostgreSQL database for SLIDER application");
    
    // Determine if it's local or production
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
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        underscored: true, // Use snake_case for column names
      },
    });
    
    console.log("✅ PostgreSQL Sequelize instance created successfully");
  } else {
    console.log("🗄️  Using SQLite database for SLIDER application");
    
    // Use absolute path to ensure consistent database location
    const dbPath = path.resolve(process.cwd(), "database.sqlite");
    console.log(`📁 Database file: ${dbPath}`);
    
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: process.env.NODE_ENV === "development" ? console.log : false,
      define: {
        underscored: true, // Use snake_case for column names
      },
    });
    
    console.log("✅ SQLite Sequelize instance created successfully");
  }
} catch (error) {
  console.error("❌ Failed to create Sequelize instance:", error);
  throw error;
}

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
    timestamps: true, // Enable automatic timestamp columns
    createdAt: "created_at", // Map to database column name
    updatedAt: "updated_at", // Map to database column name
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
    timestamps: true, // Re-enabled for automatic timestamp columns
    createdAt: "created_at", // Map to database column name
    updatedAt: false, // Only track creation time
  }
);

// Define Admin model (username, email, password only)
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

// Define relationships
Submission.hasMany(NotificationLog, { foreignKey: "submission_id" });
NotificationLog.belongsTo(Submission, { foreignKey: "submission_id" });

// Initialize database (SQLite or PostgreSQL)
const initializeDatabase = async () => {
  try {
    const isPostgreSQL = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://');
    const dbType = isPostgreSQL ? "PostgreSQL" : "SQLite";
    
    console.log(`🔌 Connecting to ${dbType} database...`);
    await sequelize.authenticate();
    console.log(`✅ ${dbType} database connection established successfully.`);

    console.log("🔄 Synchronizing database models...");
    await sequelize.sync({ force: false });
    console.log("✅ Database models synchronized successfully.");
    
    console.log(`🎉 ${dbType} database initialization completed!`);
  } catch (error) {
    const dbType = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://') ? "PostgreSQL" : "SQLite";
    console.error(`❌ Unable to connect to ${dbType} database:`, error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Submission,
  NotificationLog,
  Admin,
  initializeDatabase,
};
