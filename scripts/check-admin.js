const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

async function checkAdmin() {
  let sequelize;
  try {
    console.log("🔍 Checking admin user in database...");

    // Create SQLite connection
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
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

    // Find admin user
    const admin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.created_at}`);
    console.log(`   Password hash: ${admin.password.substring(0, 20)}...`);

    // Test password verification
    console.log("\n🔐 Testing password verification...");
    const testPassword = "admin123";
    const isPasswordValid = await bcrypt.compare(testPassword, admin.password);
    
    if (isPasswordValid) {
      console.log("✅ Password verification successful");
    } else {
      console.log("❌ Password verification failed");
      
      // Try to fix the password
      console.log("🔄 Updating password...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await admin.update({ password: hashedPassword });
      console.log("✅ Password updated successfully");
    }

    // List all admins
    console.log("\n📋 All admin users:");
    const allAdmins = await Admin.findAll();
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
    });

  } catch (error) {
    console.error("❌ Error checking admin:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

checkAdmin();
