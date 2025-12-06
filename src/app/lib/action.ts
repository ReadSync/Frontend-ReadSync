"use server";
import React from 'react'
import connection from "./database";
import bcrypt from 'bcryptjs';
import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// =========== REGISTRATION ===========
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
      return { error: "NISN must be a number" };
    }

    const finalClassId = classId && classId !== "" ? parseInt(classId as string) : null;
    const finalMajorId = majorId && majorId !== "" ? parseInt(majorId as string) : null;

    await connection.execute(`INSERT INTO users (nisn, name, password, role, class_id, major_id, email)
         VALUES (?, ?, ?, 'siswa', ?, ?, ?)`, [nisn, name, bcryptPassword, finalClassId, finalMajorId, email]);

    return { success: true, message: "Registered successfully" };
  } catch (error: any) {
    console.error("Register error details:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return { error: "NISN already registered" };
    }

    return { error: "Error during registration" };
  }
};

// =========== GET CLASSES & MAJORS ===========
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

// =========== LOGIN SYSTEM ===========
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
      `SELECT
        u.id,
        u.nisn,
        u.name,
        u.password,
        u.role,
        u.class_id,
        u.major_id,
        u.email,
        c.kelas as class_name,
        m.name as major_name
      FROM users u
      LEFT JOIN class c ON u.class_id = c.id
      LEFT JOIN majors m ON u.major_id = m.id
      WHERE u.email = ?`,
      [email]
    );

    if (getUserByEmailrows.length === 0) return null;

    return getUserByEmailrows[0];
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

// =========== BORROW BOOK SYSTEM ===========
// Helper function untuk mendapatkan user dari cookie token
// Di file actions.ts - UPDATE fungsi getCurrentUserFromToken
async function getCurrentUserFromToken() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log('🔐 Token from cookie:', token ? 'Exists' : 'NOT FOUND');

    if (!token) {
      console.log('❌ No token found in cookies');
      return null;
    }

    // Debug: Lihat token
    console.log('Token value (first 20 chars):', token.substring(0, 20) + '...');

    const decoded: any = jwt.verify(token, JWT_SECRET);

    console.log('✅ Decoded user from token:', {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    });

    return {
      id: decoded.id,
      nisn: decoded.nisn,
      name: decoded.name,
      role: decoded.role,
      email: decoded.email
    };
  } catch (error: any) {
    console.error("❌ Error verifying token:", error.message);

    // Jika token expired/invalid, hapus cookie
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.log('⚠️ Token invalid/expired, clearing cookie...');
      const cookieStore = await cookies();
      cookieStore.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0, // Expire immediately
      });
    }

    return null;
  }
}

// 1. ACTION UNTUK MEMINJAM BUKU (CREATE BORROW)
export async function createBorrow(bookId: number) {
  try {
    console.log('🔄 [ACTION] Creating borrow for book:', bookId);

    // Ambil user dari NextAuth session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return {
        success: false,
        error: 'Please login first'
      };
    }

    const userId = parseInt(session.user.id);

    if (!userId) {
      return {
        success: false,
        error: 'User ID not found'
      };
    }

    console.log('📋 [ACTION] User ID:', userId, 'Book ID:', bookId);

    // 1. Cek apakah buku tersedia
    const [bookRows]: any = await connection.execute(
      "SELECT id, available_quantity, title FROM books WHERE id = ?",
      [bookId]
    );

    if (bookRows.length === 0) {
      return {
        success: false,
        error: 'Book not found'
      };
    }

    const book = bookRows[0];

    if (book.available_quantity <= 0) {
      return {
        success: false,
        error: `Book "${book.title}" is currently unavailable`
      };
    }

    // 2. Cek apakah user sudah meminjam buku yang sama dan belum dikembalikan
    const [existingBorrow]: any = await connection.execute(
      `SELECT id FROM borrows
       WHERE user_id = ? AND book_id = ? AND return_date IS NULL
       AND status IN ('pending', 'approved')`,
      [userId, bookId]
    );

    if (existingBorrow.length > 0) {
      return {
        success: false,
        error: 'You have already borrowed this book and have not returned it'
      };
    }

    // 3. Insert ke table borrows dengan status 'pending'
    const [result]: any = await connection.execute(
      `INSERT INTO borrows (user_id, book_id, status, borrow_date)
       VALUES (?, ?, 'pending', NOW())`,
      [userId, bookId]
    );

    const borrowId = result.insertId;

    // 4. Kurangi stok buku yang tersedia
    await connection.execute(
      "UPDATE books SET available_quantity = available_quantity - 1 WHERE id = ?",
      [bookId]
    );

    // 5. Ambil data borrow yang baru dibuat
    const [newBorrow]: any = await connection.execute(
      `SELECT b.*, bk.title as book_title
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ?`,
      [borrowId]
    );

    console.log('✅ [ACTION] Borrow created successfully. ID:', borrowId);

    return {
      success: true,
      message: 'Borrow request submitted successfully. Waiting for admin approval.',
      data: newBorrow[0]
    };

  } catch (error: any) {
    console.error('❌ [ACTION] Error creating borrow:', error);
    return {
      success: false,
      error: error.message || 'Server error occurred'
    };
  }
}

// 2. ACTION UNTUK MENDAPATKAN DAFTAR PINJAMAN USER
export async function getUserBorrows() {
  try {
    console.log('📚 [ACTION] Getting user borrows...');

    // Ambil user dari token cookie
    const user = await getCurrentUserFromToken();

    if (!user) {
      return {
        success: false,
        error: 'Please login first'
      };
    }

    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: 'User ID not found'
      };
    }

    console.log('👤 [ACTION] Fetching borrows for user ID:', userId);

    // Ambil data borrow dari database
    const [borrows]: any = await connection.execute(
      `SELECT
        b.id,
        b.book_id,
        b.borrow_date,
        b.due_date,
        b.return_date,
        b.status,
        b.created_at,
        bk.title as book_title,
        bk.author as book_author,
        bk.category_name as book_category,
        bk.book_code,
        bk.cover_image,
        u.name as user_name
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       JOIN users u ON b.user_id = u.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    console.log(`📊 [ACTION] Found ${borrows.length} borrow records`);

    return {
      success: true,
      data: borrows
    };

  } catch (error: any) {
    console.error('❌ [ACTION] Error getting user borrows:', error);
    return {
      success: false,
      error: error.message || 'Terjadi kesalahan server'
    };
  }
}

// 3. ACTION UNTUK MENDAPATKAN DETAIL BUKU
// Di actions.ts - UPDATE fungsi getBookDetail
export async function getBookDetail(bookId: number) {
  try {
    console.log('📖 [ACTION] Getting book detail for ID:', bookId);

    const [books]: any = await connection.execute(
      `SELECT
        id, title, author, publisher, cover_image,
        category_name, available_quantity, total_quantity,
        book_code, isbn, isbnr, description, publication_year,
        category_id, created_at, updated_at
       FROM books WHERE id = ?`,
      [bookId]
    );

    if (books.length === 0) {
      return {
        success: false,
        error: 'Book not found'
      };
    }

    return {
      success: true,
      data: books[0],
      // Tambahkan user info jika ada
      user: await getCurrentUserFromToken() // Ini optional, tidak required
    };

  } catch (error: any) {
    console.error('❌ [ACTION] Error getting book detail:', error);
    return {
      success: false,
      error: error.message || 'Server error occurred'
    };
  }
}

// 4. ACTION UNTUK CANCEL BORROW (SISWA BATALIN PINJAMAN)
export async function cancelBorrow(borrowId: number) {
  try {
    const user = await getCurrentUserFromToken();

    if (!user) {
      return {
        success: false,
        error: 'Please login first'
      };
    }

    const userId = user.id;

    // 1. Check if borrow belongs to this user
    const [borrowRows]: any = await connection.execute(
      `SELECT b.*, bk.id as book_id
       FROM borrows b
       JOIN books bk ON b.book_id = bk.id
       WHERE b.id = ? AND b.user_id = ?`,
      [borrowId, userId]
    );

    if (borrowRows.length === 0) {
      return {
        success: false,
        error: 'Borrow not found or does not belong to you'
      };
    }

    const borrow = borrowRows[0];

    // 2. Can only cancel if status is still 'pending'
    if (borrow.status !== 'pending') {
      return {
        success: false,
        error: `Cannot cancel borrow with status "${borrow.status}"`
      };
    }

    // 3. Mulai transaction
    await connection.execute('START TRANSACTION');

    try {
      // 4. Update status to 'cancelled'
      await connection.execute(
        `UPDATE borrows SET status = 'cancelled', notes = 'Cancelled by user' WHERE id = ?`,
        [borrowId]
      );

      // 5. Add back book stock
      await connection.execute(
        "UPDATE books SET available_quantity = available_quantity + 1 WHERE id = ?",
        [borrow.book_id]
      );

      // 6. Commit transaction
      await connection.execute('COMMIT');

      return {
        success: true,
        message: 'Borrow cancelled successfully'
      };

    } catch (error) {
      // Rollback jika ada error
      await connection.execute('ROLLBACK');
      throw error;
    }

  } catch (error: any) {
    console.error('❌ [ACTION] Error cancelling borrow:', error);
    return {
      success: false,
      error: error.message || 'Server error occurred'
    };
  }
}

// 5. ACTION UNTUK PERPANJANG BORROW
export async function extendBorrow(borrowId: number, days: number = 7) {
  try {
    const user = await getCurrentUserFromToken();

    if (!user) {
      return {
        success: false,
        error: 'Please login first'
      };
    }

    const userId = user.id;

    // 1. Check if borrow belongs to this user
    const [borrowRows]: any = await connection.execute(
      "SELECT * FROM borrows WHERE id = ? AND user_id = ?",
      [borrowId, userId]
    );

    if (borrowRows.length === 0) {
      return {
        success: false,
        error: 'Borrow not found or does not belong to you'
      };
    }

    const borrow = borrowRows[0];

    // 2. Can only extend if status is 'approved'
    if (borrow.status !== 'approved') {
      return {
        success: false,
        error: `Can only extend borrow with status "approved"`
      };
    }

    // 3. Calculate new due_date
    const currentDueDate = new Date(borrow.due_date);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + days);

    // 4. Update due_date
    await connection.execute(
      "UPDATE borrows SET due_date = ? WHERE id = ?",
      [newDueDate, borrowId]
    );

    return {
      success: true,
      message: `Borrow extended successfully by ${days} day${days > 1 ? 's' : ''}`,
      data: {
        new_due_date: newDueDate
      }
    };

  } catch (error: any) {
    console.error('❌ [ACTION] Error extending borrow:', error);
    return {
      success: false,
      error: error.message || 'Server error occurred'
    };
  }
}

// 6. ACTION UNTUK MENDAPATKAN SEMUA BUKU (untuk halaman home/books_list)
export async function getAllBooks() {
  try {
    console.log('📚 [ACTION] Getting all books...');

    const [books]: any = await connection.execute(
      `SELECT
        id, title, author, publisher, cover_image,
        category_name, available_quantity, total_quantity,
        book_code, isbn, isbnr, description, publication_year,
        created_at
       FROM books
       ORDER BY created_at DESC`
    );

    console.log(`📊 [ACTION] Found ${books.length} books`);

    return {
      success: true,
      data: books
    };

  } catch (error: any) {
    console.error('❌ [ACTION] Error getting books:', error);
    return {
      success: false,
      error: error.message || 'Server error occurred'
    };
  }
}
