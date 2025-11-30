"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      console.log("👤 USER YANG SEDANG LOGIN:", {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        nisn: session.user.nisn,
        role: session.user.role,
        class: session.user.class,
        major: session.user.major,
        class_id: session.user.class_id,
        major_id: session.user.major_id,
      });
    }
  }, [session, status]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Please login to continue</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {session?.user && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Welcome, <strong>{session.user.name}</strong>!</p>
          <p className="text-xs text-gray-500 mt-1">Email: {session.user.email}</p>
          {session.user.role && <p className="text-xs text-gray-500">Role: {session.user.role}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Total Books</h3>
          <p className="text-3xl font-bold text-green-600">150</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Borrowed</h3>
          <p className="text-3xl font-bold text-orange-600">23</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg">Available</h3>
          <p className="text-3xl font-bold text-blue-600">127</p>
        </div>
      </div>
    </div>
  )
}
