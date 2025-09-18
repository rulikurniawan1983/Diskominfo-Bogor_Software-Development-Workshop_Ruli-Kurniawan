const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

async function seedAdmin() {
  try {
    console.log("🌱 Seeding admin data...");

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

    // Pre-migration: ensure admins timestamp columns exist and are backfilled before NOT NULL
    if (sequelize.getDialect() === 'postgres') {
      try {
        await sequelize.query('ALTER TABLE "public"."admins" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NULL');
        await sequelize.query('ALTER TABLE "public"."admins" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NULL');
        await sequelize.query('UPDATE "public"."admins" SET "created_at" = NOW() WHERE "created_at" IS NULL');
        await sequelize.query('UPDATE "public"."admins" SET "updated_at" = NOW() WHERE "updated_at" IS NULL');
      } catch (e) {
        console.log(`⚠️  Pre-migration admins timestamps skipped: ${e.message}`);
      }
    }

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
        password: {
          type: DataTypes.STRING,
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
      },
      {
        tableName: "admins",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
      }
    );

    // Sync the model
    await sequelize.sync({ alter: true });
    console.log("✅ Admin model synchronized.");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists, updating password...");
      
      // Update password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await existingAdmin.update({
        password: hashedPassword,
        email: "admin@diskominfo.go.id",
      });
      
      console.log("✅ Admin user updated successfully");
    } else {
      console.log("🔧 Creating new admin user...");
      
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await Admin.create({
        username: "admin",
        email: "admin@diskominfo.go.id",
        password: hashedPassword,
      });
      
      console.log("✅ Admin user created successfully");
    }

    // Create additional admin users
    const additionalAdmins = [
      {
        username: "operator1",
        email: "operator1@diskominfo.go.id",
        password: "operator123",
      },
      {
        username: "admin2",
        email: "admin2@diskominfo.go.id",
        password: "admin456",
      },
    ];

    for (const adminData of additionalAdmins) {
      const existing = await Admin.findOne({
        where: { username: adminData.username }
      });

      if (!existing) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        
        await Admin.create({
          username: adminData.username,
          email: adminData.email,
          password: hashedPassword,
        });
        
        console.log(`✅ Created admin user: ${adminData.username}`);
      } else {
        console.log(`⚠️  Admin user ${adminData.username} already exists`);
      }
    }

    // List all admin users
    const allAdmins = await Admin.findAll({
      attributes: ['username', 'email']
    });

    console.log("\n📋 Admin users in database:");
    allAdmins.forEach(admin => {
      console.log(`- ${admin.username} - ${admin.email}`);
    });

    console.log("\n🎉 Admin seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("Email: admin@diskominfo.go.id, Password: admin123");
    console.log("Email: operator1@diskominfo.go.id, Password: operator123");
    console.log("Email: admin2@diskominfo.go.id, Password: admin456");

  } catch (error) {
    console.error("❌ Error seeding admin data:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

// Run the seeding
seedAdmin()
  .then(() => {
    console.log("✅ Admin seeding completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Admin seeding failed:", error);
    process.exit(1);
  });
