"use client"
import React from "react";
import { motion } from "framer-motion";

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
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1]
    },
  },
};

const DashboardUi = () => {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="relative w-full flex justify-center items-center py-16 sm:py-20 md:py-28 px-4 overflow-hidden"
    >
      <div className="w-full max-w-md sm:max-w-lg md:max-w-2xl">
        <motion.div
          variants={item}
          className="relative bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-10 border border-gray-200"
        >
          {/* Streak Section */}
          <motion.div variants={item}>
            <p className="text-orange-500 font-semibold flex items-center gap-2 mb-3 text-sm sm:text-base md:text-lg">
              🔥 42 Days Streak!
            </p>
          </motion.div>

          {/* Description */}
          <motion.div variants={item}>
            <p className="text-gray-700 mb-8 sm:mb-10 leading-relaxed text-sm sm:text-base md:text-lg">
              In the past month, you have completed 500+ questions and 50+ practice tests.
            </p>
          </motion.div>

          {/* Current Month Score */}
          <motion.div variants={item} className="mb-6">
            <p className="font-semibold text-lg sm:text-xl md:text-2xl">
              1560 <span className="text-gray-500 text-sm sm:text-base">Scores</span>
            </p>
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-400"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">May 2025</p>
          </motion.div>

          {/* Previous Month Score */}
          <motion.div variants={item}>
            <p className="font-semibold text-lg sm:text-xl md:text-2xl">
              1066 <span className="text-gray-500 text-sm sm:text-base">Scores</span>
            </p>
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gray-300"
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">April 2025</p>
          </motion.div>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default DashboardUi;
