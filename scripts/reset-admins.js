const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

async function resetAdmins() {
  let sequelize;
  try {
    console.log("🗑️  Resetting all admin users...");

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

    // Sync the model
    await sequelize.sync({ force: false });
    console.log("✅ Admin model synchronized");

    // List existing admins
    const existingAdmins = await Admin.findAll();
    console.log(`📋 Found ${existingAdmins.length} existing admin(s):`);
    existingAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
    });

    // Delete all existing admins
    if (existingAdmins.length > 0) {
      console.log("\n🗑️  Deleting all existing admin users...");
      await Admin.destroy({
        where: {},
        truncate: true
      });
      console.log("✅ All admin users deleted");
    }

    // Create single admin user
    console.log("\n➕ Creating single admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    const admin = await Admin.create({
      username: "admin",
      email: "admin@slider.local",
      password: hashedPassword,
    });

    console.log("✅ Single admin user created successfully");
    console.log("📝 Admin details:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Created: ${admin.created_at}`);

    // Verify the admin was created
    const verifyAdmin = await Admin.findOne({
      where: { username: "admin" }
    });

    if (verifyAdmin) {
      console.log("\n✅ Verification successful - admin user exists");
      
      // Test password
      const isPasswordValid = await bcrypt.compare("admin123", verifyAdmin.password);
      if (isPasswordValid) {
        console.log("✅ Password verification successful");
      } else {
        console.log("❌ Password verification failed");
      }
    } else {
      console.log("❌ Verification failed - admin user not found");
    }

    // Show final admin count
    const finalAdmins = await Admin.findAll();
    console.log(`\n📊 Final admin count: ${finalAdmins.length}`);

    console.log("\n🎉 Admin reset completed successfully!");
    console.log("\n📋 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   URL: http://localhost:3000/admin/login");

  } catch (error) {
    console.error("❌ Error resetting admins:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

resetAdmins();
