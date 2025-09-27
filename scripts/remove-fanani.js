const { Sequelize, DataTypes } = require("sequelize");

async function removeFanani() {
  let sequelize;
  try {
    // Try to connect to database
    if (process.env.DATABASE_URL) {
      sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        logging: false,
      });
    } else {
      // Use SQLite for local development
      const path = require("path");
      const dbPath = path.join(__dirname, "..", "database.sqlite");
      sequelize = new Sequelize({
        dialect: "sqlite",
        storage: dbPath,
        logging: false,
      });
    }

    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

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

    // Find and remove the fanani admin
    const adminToRemove = await Admin.findOne({
      where: { username: "fanani" }
    });

    if (adminToRemove) {
      await adminToRemove.destroy();
      console.log("✅ Admin user 'fanani' has been removed successfully");
    } else {
      console.log("⚠️  Admin user 'fanani' not found");
    }

    // List remaining admin users
    const remainingAdmins = await Admin.findAll({
      attributes: ['username', 'email']
    });

    console.log("\n📋 Remaining admin users:");
    if (remainingAdmins.length === 0) {
      console.log("(no admins)");
    } else {
      remainingAdmins.forEach(admin => {
        console.log(`- ${admin.username} - ${admin.email}`);
      });
    }

    console.log("\n🎉 Admin removal completed successfully!");

  } catch (error) {
    console.error("❌ Error removing admin:", error);
    throw error;
  } finally {
    try {
      if (sequelize) {
        await sequelize.close();
      }
    } catch (_) {}
  }
}

removeFanani();
