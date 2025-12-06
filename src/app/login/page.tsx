"use client"
import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Inter } from 'next/font/google'
import { Button } from '../components/ui/Button'
import { Footer } from '../components/Footer'
import { usePasswordToggle } from '../hooks/usePasswordToggle'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, useSession } from "next-auth/react";

const inter = Inter({ subsets: ['latin'] })

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const formVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// System login
const Login = () => {
  const passwordToggle = usePasswordToggle();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);

    try {
      const responese = await signIn("credentials", {
        redirect: false,
        email: formData.get("email")?.toString(),
        password: formData.get("password")?.toString(),
      });

      if (responese?.error) {
        alert("Login failed: " + responese.error);
        setIsLoading(false);
        return;
      }

      if (responese?.ok) {
        // Wait a bit for session to be available, then check role
        setTimeout(async () => {
          try {
            const response = await fetch('/api/auth/session');
            const session = await response.json();
            const userRole = session?.user?.role || '';

            // Redirect based on role
            if (userRole === 'petugas' || userRole === 'admin') {
              router.push("/petugas/home");
            } else {
              router.push("/home");
            }
            router.refresh();
          } catch (error) {
            // Fallback to default home if session check fails
            router.push("/home");
            router.refresh();
          }
        }, 100);
      }
    } catch (error) {
      alert("An error occurred during login.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <motion.main
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-center pt-38 md:pt-48 px-4">
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <div className='text-center mb-8'>
            <h1 className={`${inter.className} font-bold leading-tight text-3xl md:text-4xl mb-2`}>Login</h1>
          </div>
          <motion.form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleLogin(formData);
            }}
            variants={formVariants}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <motion.div variants={containerVariants} className='mb-6'>
              <label className='block text-gray-700 mb-2' htmlFor='email'>Email</label>
              <input
                name="email"
                type='email'
                id='email'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all'
                placeholder='Enter your email'
              />
            </motion.div>
            <motion.div variants={containerVariants} className='mb-6 relative'>
              <label className='block text-gray-700 mb-2' htmlFor='password'>Password</label>
              <input
                name="password"
                type={passwordToggle.InputType}
                id='password'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12'
                placeholder='Enter your password'
              />
              <button
                type="button"
                onClick={passwordToggle.toggleVisibility}
                className="absolute right-5 top-12"
              >
                <img
                  src={passwordToggle.IconSrc}
                  alt={passwordToggle.IconAlt}
                  className="w-5 h-5"
                />
              </button>
            </motion.div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50">
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </motion.form>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Register here
              </a>
            </p>
          </div>
        </motion.div>
      </motion.main>
      <div className='mt-20 md:mt-40'>
        <Footer />
      </div>
    </>
  )
}
export default Login;
