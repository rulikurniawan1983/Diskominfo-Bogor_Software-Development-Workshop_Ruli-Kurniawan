const { Sequelize } = require("sequelize");

async function main() {
  const arg = process.argv[2] || "";
  if (!arg) {
    console.error("Usage: node scripts/show-submission.js <tracking_code|nama>");
    process.exit(1);
  }

  let sequelize;
  try {
    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
      console.error("DATABASE_URL not set");
      process.exit(1);
    }

    const isRender = DATABASE_URL.includes("render.com");
    sequelize = new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      dialectOptions: isRender
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
      logging: false,
    });

    await sequelize.authenticate();

    let submission;
    if (arg.startsWith("WS-")) {
      const [rows] = await sequelize.query(
        `SELECT * FROM submissions WHERE tracking_code = $1 LIMIT 1`,
        { bind: [arg] }
      );
      submission = rows[0] || null;
    } else {
      const [rows] = await sequelize.query(
        `SELECT * FROM submissions WHERE LOWER(nama) LIKE LOWER($1) ORDER BY created_at DESC LIMIT 1`,
        { bind: ["%" + arg + "%"] }
      );
      submission = rows[0] || null;
    }

    if (!submission) {
      console.log(JSON.stringify({ found: false }));
      process.exit(0);
    }

    const [logs] = await sequelize.query(
      `SELECT id, submission_id, channel, send_status, payload, created_at
       FROM notification_logs
       WHERE submission_id = $1
       ORDER BY created_at DESC`,
      { bind: [submission.id] }
    );

    console.log(
      JSON.stringify(
        {
          found: true,
          submission,
          notification_logs: logs,
        },
        null,
        2
      )
    );
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

main();


