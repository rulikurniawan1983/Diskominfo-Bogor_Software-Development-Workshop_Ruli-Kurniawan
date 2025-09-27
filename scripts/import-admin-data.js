const { Sequelize, DataTypes } = require("sequelize");
const fs = require("fs");
const path = require("path");

async function importAdminData() {
  let sequelize;
  try {
    console.log("📥 Importing admin data to correct database...");

    // Read exported admin data
    const exportPath = path.join(__dirname, "..", "admin-data-export.json");
    if (!fs.existsSync(exportPath)) {
      console.log("❌ No exported admin data found");
      return;
    }

    const adminData = JSON.parse(fs.readFileSync(exportPath, "utf8"));
    console.log(`📋 Found ${adminData.length} admin(s) to import`);

    // Create SQLite connection to correct database location
    const dbPath = path.resolve(process.cwd(), "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: false,
    });

    // Test connection
    await sequelize.authenticate();
    console.log(`✅ Connected to database: ${dbPath}`);

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

    // Clear existing admins
    await Admin.destroy({
      where: {},
      truncate: true
    });
    console.log("🗑️  Cleared existing admin data");

    // Import admin data
    for (const admin of adminData) {
      await Admin.create({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        password: admin.password,
        created_at: admin.created_at,
        updated_at: admin.updated_at
      });
      console.log(`✅ Imported admin: ${admin.username}`);
    }

    // Verify import
    const importedAdmins = await Admin.findAll();
    console.log(`\n📊 Import completed: ${importedAdmins.length} admin(s) in database`);
    
    importedAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
    });

    console.log("\n🎉 Admin data import completed successfully!");

  } catch (error) {
    console.error("❌ Error importing admin data:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

importAdminData();
