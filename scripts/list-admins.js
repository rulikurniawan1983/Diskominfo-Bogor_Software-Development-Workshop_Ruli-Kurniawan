const { Sequelize, DataTypes } = require("sequelize");

async function listAdmins() {
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

    const Admin = sequelize.define(
      "Admin",
      {
        id: { type: DataTypes.UUID, primaryKey: true },
        username: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
      },
      {
        tableName: "admins",
        timestamps: false,
      }
    );

    const admins = await Admin.findAll({
      attributes: ["username", "email"],
      order: [["username", "ASC"]],
    });

    if (!admins.length) {
      console.log("(no admins)");
    } else {
      admins.forEach((a) => {
        console.log(`- ${a.username} - ${a.email}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to list admins:", err.message);
    process.exit(1);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

listAdmins();


