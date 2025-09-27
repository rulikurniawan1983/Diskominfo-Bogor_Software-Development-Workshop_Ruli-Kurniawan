const { Sequelize, DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

async function removeAdmin() {
  let sequelize;
  try {
    if (!process.env.DATABASE_URL) {
      console.log("❌ DATABASE_URL not set");
      process.exit(1);
    }

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

removeAdmin();
