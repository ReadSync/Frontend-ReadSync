"use client"
import React, { useActionState, useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Inter } from 'next/font/google'
import { Button } from '../components/ui/Button'
import { Footer } from '../components/Footer'
import { usePasswordToggle } from '../hooks/usePasswordToggle'
import { userData, getClasses, getMajors } from '../lib/action'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const inter = Inter({ subsets: ['latin'] })

interface Class {
  id: number;
  kelas: string; 
}

interface Majors {
  id: number;
  name: string;
}

interface ActionState {
  error?: string;
  success?: boolean;
  message?: string;
}

const Register = () => {
  const passwordToggle = usePasswordToggle();
  const router = useRouter();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [majors, setMajors] = useState<Majors[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    email: '',
    nisn: '',
    name: '',
    password: '',
    class_id: '',
    major_id: ''
  });

  // Validasi client-side
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    // Required fields
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email is invalid";

    if (!formData.nisn) newErrors.nisn = "NISN is required";
    else if (!/^\d+$/.test(formData.nisn)) newErrors.nisn = "NISN must be numeric";

    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.password) newErrors.password = "Password is required";
    
    if (!formData.class_id) newErrors.class_id = "Class is required";
    if (!formData.major_id) newErrors.major_id = "Major is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const [state, formAction, isPending] = useActionState(
    async (_state: ActionState | null, formData: FormData) => {
      // Validasi client-side dulu sebelum kirim ke server
      if (!validateForm()) {
        return { error: "Please fix the errors above" };
      }
      return await userData(formData);
    },
    null
  );

  // Alert untuk server errors
  useEffect(() => {
    if (state?.error) {
      alert(state.error);
    }
    if (state?.success) {
      alert("Registration successful!");
      router.push('/login');
    }
  }, [state, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [classesData, majorsData] = await Promise.all([
          getClasses(),
          getMajors()
        ]);
        setClasses(classesData);
        setMajors(majorsData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    loadData();
  }, []);

  // Motion animasi
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

  return (
    <>
      <Navbar />
      <motion.main 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center justify-center pt-38 md:pt-48 px-4">
        <motion.div variants={itemVariants} className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className={`${inter.className} font-bold leading-tight text-3xl md:text-4xl mb-2`}>Register</h1>
          </div>

          <motion.form
            variants={formVariants}
            action={formAction} 
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  name="email" 
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your Email Address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NISN
                </label>
                <input
                  name="nisn" 
                  type="text"
                  value={formData.nisn}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.nisn ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your NISN"
                />
                {errors.nisn && <p className="text-red-500 text-xs mt-1">{errors.nisn}</p>}
              </div>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name" 
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your Full Name"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  name="password" 
                  type={passwordToggle.InputType} 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your Password"
                />
                <button
                  type="button"
                  onClick={passwordToggle.toggleVisibility}
                  className="absolute right-5 top-11"
                >
                  <img
                    src={passwordToggle.IconSrc}
                    alt={passwordToggle.IconAlt}
                    className="w-5 h-5"
                  />
                </button>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select 
                  name="class_id" 
                  value={formData.class_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.class_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your class</option>
                  {classes.map(clsItem => (
                    <option key={clsItem.id} value={clsItem.id}>
                      {clsItem.kelas}
                    </option>
                  ))}
                </select>
                {errors.class_id && <p className="text-red-500 text-xs mt-1">{errors.class_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Major
                </label>
                <select 
                  name="major_id" 
                  value={formData.major_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                    errors.major_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your major</option>
                  {majors.map(major => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </select>
                {errors.major_id && <p className="text-red-500 text-xs mt-1">{errors.major_id}</p>}
              </div>
            </motion.div>

            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full h-12 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-all disabled:opacity-50">
              {isPending ? "Registering..." : "Register Account"} 
            </Button>
          </motion.form>

          <div className="text-center mt-6 md:mt-10">
            <p className="text-gray-600">
              Already have an account?{' '}
              <a href="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in here
              </a>
            </p>
          </div>
        </motion.div>
      </motion.main>
      <div className='mt-10 md:mt-20'>
        <Footer />
      </div>
    </>
  )
}

export default Register;