import { NextResponse } from "next/server";
import { Admin, initializeDatabase } from "@/lib/sequelize";
import bcrypt from "bcryptjs";

// Initialize database on first request
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

export async function POST(request) {
  try {
    await initDB();

    const { username, password } = await request.json();
    console.log(`🔐 Login attempt: username=${username}`);

    // Validation
    if (!username || !password) {
      console.log("❌ Missing username or password");
      return NextResponse.json(
        { message: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by username
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
      console.log("❌ Admin not found");
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log(`🔐 Password verification: ${isPasswordValid ? 'Valid' : 'Invalid'}`);
    
    if (!isPasswordValid) {
      console.log("❌ Invalid password");
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Return admin data (without password)
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      created_at: admin.created_at,
    };

    return NextResponse.json({
      message: "Login berhasil",
      admin: adminData,
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
