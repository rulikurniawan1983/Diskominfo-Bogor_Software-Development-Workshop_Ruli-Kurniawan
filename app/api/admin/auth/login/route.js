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

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await Admin.findOne({
      where: { 
        email: email.trim(),
      },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah" },
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
