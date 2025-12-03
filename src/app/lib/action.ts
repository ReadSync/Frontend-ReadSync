"use server";
import React from 'react'
import connection from "./database";
import bcrypt from 'bcryptjs';
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const userData = async (formData: FormData) => {
    try {
    const email = formData.get("email") as string;
    const nisn = formData.get("nisn") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const classId = formData.get("class_id");
    const majorId = formData.get("major_id");

    const bcryptPassword = await bcrypt.hash(password, 12);

    if (!email || !nisn || !name || !password || !classId || !majorId) {
        return { error: "All fields are required" };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: "Email invalid" };
    }

    if (!/^\d+$/.test(nisn)) {
        return { error: "NISN harus berupa angka" };
    }

    const finalClassId = classId && classId !== "" ? parseInt(classId as string) : null;
    const finalMajorId = majorId && majorId !== "" ? parseInt(majorId as string) : null;

    await connection.execute(`INSERT INTO users (nisn, name, password, role, class_id, major_id, email)
         VALUES (?, ?, ?, 'siswa', ?, ?, ?)`, [nisn, name, bcryptPassword, finalClassId, finalMajorId, email]);

    return { success: true, message: "Registered successfully" };
    } catch (error: any) {
    console.error("Register error details:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return { error: "NISN sudah terdaftar" };
    }

    return { error: "Error during registration"};
  }
};

// Major and Class validation
export async function getClasses() {
  try {
    const [classes]: any = await connection.execute("SELECT * FROM class");
    return classes;
  } catch (error) {
    console.error("Get classes error:");
    return [];
  }
}

export async function getMajors() {
  try {
    const [majors]: any = await connection.execute("SELECT * FROM majors");
    return majors;
  } catch (error) {
    console.error("Get majors error:");
    return [];
  }
}

// Login system
export default async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      return { error: "All fields are required" };
    }
    const [emailRows]: any = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (emailRows.length === 0) {
      return { error: "Email not registered" };
    }

    const user = emailRows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Incorrect password" };
    }

    // Making JWT
    const token = jwt.sign(
      {
        id: user.id,
        nisn: user.nisn,
        name: user.name,
        role: user.role,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return {
      success: true,
      user: {
        id: user.id,
        nisn: user.nisn,
        name: user.name,
        role: user.role,
        email: user.email
      }
    };
  } catch (error: any) {
    console.error("Login error details:");
    return { error: "Error during login" };
  }
}

export async function getUserByEmail(email: string) {
  try {
    const [getUserByEmailrows]: any = await connection.execute(
      "SELECT id, nisn, name, password, role, class_id, major_id, email FROM users WHERE email = ?",
      [email]
    );

    if (getUserByEmailrows.length === 0) return null;

    return getUserByEmailrows[0];
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
