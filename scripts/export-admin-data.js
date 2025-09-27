const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");

async function exportAdminData() {
  let sequelize;
  try {
    console.log("📤 Exporting admin data from main database...");

    // Create SQLite connection to main database
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to main SQLite database");

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

    // Get all admin data
    const admins = await Admin.findAll();
    console.log(`📋 Found ${admins.length} admin(s) in main database:`);
    
    const adminData = admins.map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      password: admin.password,
      created_at: admin.created_at,
      updated_at: admin.updated_at
    }));

    // Export to JSON file
    const exportPath = path.join(__dirname, "..", "admin-data-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(adminData, null, 2));
    
    console.log("✅ Admin data exported to admin-data-export.json");
    console.log("📝 Admin details:");
    adminData.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
    });

    return adminData;

  } catch (error) {
    console.error("❌ Error exporting admin data:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

exportAdminData();
