const { Sequelize } = require("sequelize");

async function main() {
  const q = process.argv.slice(2).join(" ") || "";
  if (!q) {
    console.error("Usage: node scripts/find-person.js <name-or-email>");
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

    const likeQ = `%${q}%`;

    const [subs] = await sequelize.query(
      `SELECT id, tracking_code, nama, email, no_wa, nik, jenis_layanan, status, created_at
       FROM submissions
       WHERE LOWER(nama) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)
       ORDER BY created_at DESC
       LIMIT 50`,
      { bind: [likeQ] }
    );

    const [admins] = await sequelize.query(
      `SELECT id, username, email, created_at
       FROM admins
       WHERE LOWER(username) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)
       ORDER BY created_at DESC
       LIMIT 50`,
      { bind: [likeQ] }
    );

    console.log(JSON.stringify({ query: q, submissions: subs, admins }, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  } finally {
    if (sequelize) await sequelize.close();
  }
}

main();


