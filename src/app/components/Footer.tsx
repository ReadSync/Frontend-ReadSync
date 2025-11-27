import React from 'react';
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-6 sm:py-8 md:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="go home"
          className="mx-auto block size-fit"
        ></Link>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} ReadSync. Library System. Built by Sulthan Muhammad Syathir.
          </p>
          
          <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
            This digital library system is intended for academic and educational purposes only.
            All books, documents, and materials are the intellectual property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
};