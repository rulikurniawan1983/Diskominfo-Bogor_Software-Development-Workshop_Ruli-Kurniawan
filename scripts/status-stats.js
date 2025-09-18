const { Sequelize } = require("sequelize");

async function main() {
  let sequelize;
  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not set");
      process.exit(1);
    }

    const isRender = process.env.DATABASE_URL.includes("render.com");
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isRender
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      logging: false,
    });

    await sequelize.authenticate();

    const [[{ total }]] = await sequelize.query(
      'SELECT COUNT(*)::int AS total FROM submissions'
    );
    const [[{ selesai }]] = await sequelize.query(
      "SELECT COUNT(*)::int AS selesai FROM submissions WHERE status = 'SELESAI'"
    );

    const percent = total > 0 ? Math.round((selesai / total) * 100) : 0;
    console.log(JSON.stringify({ total, selesai, percent_selesai: percent }));
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

main();


