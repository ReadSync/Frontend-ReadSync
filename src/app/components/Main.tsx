"use client";

import React from "react";
import { Stack_Sans_Text } from "next/font/google";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";

const stackSansText = Stack_Sans_Text({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-stack-sans-text",
  display: "swap",
});

const container = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.18,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 3, ease: [0.34, 1.56, 0.64, 1]
},
  },
};

const Main = () => {
  return (
    <main className="flex items-center justify-center pt-10 md:pt-28 px-4">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center max-w-5xl mx-auto"
      >
        <motion.h1
          variants={item}
          className={`text-3xl sm:text-5xl md:text-6xl font-bold leading-tight ${stackSansText.className}`}
        >
          The Smarter Way to Borrow Read and Discover
        </motion.h1>

        <motion.p
          variants={item}
          className={`mt-4 sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto ${stackSansText.className}`}
        >
          Level up your learning journey with ReadSync® making book borrowing
          simple and helping you stay consistent with your reading goals
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button className="rounded-2xl bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-5 px-7 sm:py-6 sm:px-8 text-base sm:text-lg shadow-[0_4px_0_0_#16a34a,0_8px_20px_rgba(34,197,94,0.25)] hover:shadow-[0_6px_0_0_#15803d,0_10px_25px_rgba(34,197,94,0.3)] active:shadow-[0_2px_0_0_#16a34a,0_4px_10px_rgba(34,197,94,0.2)] active:translate-y-0.5 transform active:scale-95 transition-all duration-150">
            <div className="inline-flex gap-2">
              Get Started
              <img src="/img/book.png" alt="Book" className="ml-1 w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </Button>

          <Button className="rounded-2xl w-36 sm:w-40 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-5 px-7 sm:py-6 sm:px-8 text-base sm:text-lg shadow-[0_4px_0_0_#d1d5db,0_8px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_0_0_#9ca3af,0_10px_25px_rgba(0,0,0,0.12)] active:shadow-[0_2px_0_0_#d1d5db,0_4px_10px_rgba(0,0,0,0.06)] active:translate-y-0.5 transform active:scale-95 transition-all duration-150">
            <div className="inline-flex gap-2">
              <img src="/img/Command2.png" alt="Command" className="mt-0.5 w-5 h-5 sm:w-6 sm:h-6" />
              Search
            </div>
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default Main;
