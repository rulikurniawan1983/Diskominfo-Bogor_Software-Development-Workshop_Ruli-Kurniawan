const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

async function createAdmin() {
  let sequelize;
  try {
    console.log("🚀 Creating admin user...");

    // Create SQLite connection
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false, // Disable logging for cleaner output
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite database");

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

    // Sync the model
    await sequelize.sync({ force: false });
    console.log("✅ Admin model synchronized");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      console.log("📝 Existing admin details:");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Created: ${existingAdmin.created_at}`);
      
      // Ask if user wants to update password
      console.log("\n🔄 Updating password for existing admin...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await existingAdmin.update({ password: hashedPassword });
      console.log("✅ Admin password updated successfully");
    } else {
      console.log("➕ Creating new admin user...");
      
      // Hash the password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      // Create admin user
      const admin = await Admin.create({
        username: "admin",
        email: "admin@slider.local",
        password: hashedPassword,
      });

      console.log("✅ Admin user created successfully");
      console.log("📝 Admin details:");
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Created: ${admin.created_at}`);
    }

    console.log("\n🎉 Admin setup completed successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   URL: http://localhost:3000/admin/login");

  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

createAdmin();
