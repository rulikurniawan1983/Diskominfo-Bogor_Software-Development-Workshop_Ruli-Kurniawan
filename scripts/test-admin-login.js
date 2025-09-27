const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const path = require("path");

async function testAdminLogin() {
  let sequelize;
  try {
    console.log("🧪 Testing admin login logic...");

    // Create SQLite connection (same as in API)
    const dbPath = path.join(__dirname, "..", "database.sqlite");
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: dbPath,
      logging: console.log, // Enable logging to see queries
    });

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Connected to SQLite database");

    // Define Admin model (same as in API)
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

    // Test the exact same logic as the API
    const username = "admin";
    const password = "admin123";

    console.log(`🔐 Testing login: username=${username}`);

    // Find admin by username (same as API)
    const admin = await Admin.findOne({
      where: { 
        username: username.trim(),
      },
    });

    console.log(`🔍 Admin lookup result: ${admin ? 'Found' : 'Not found'}`);
    if (admin) {
      console.log(`📝 Admin details: username=${admin.username}, email=${admin.email}`);
    }

    if (!admin) {
      console.log("❌ Admin not found - this would cause 401");
      return;
    }

    // Verify password (same as API)
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log(`🔐 Password verification: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password - this would cause 401");
      return;
    }

    console.log("✅ Login test successful - should work in API");

  } catch (error) {
    console.error("❌ Error testing admin login:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

testAdminLogin();
