"use client";
import { useState } from "react";
import { Button } from "../components/ui/Button";
import { motion, useScroll, useTransform } from "framer-motion";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Hover state for search button
  const [isHovered, setIsHovered] = useState(false);
  // Mobile state for search button
  const [isSearchHovered, setIsSearchHovered] = useState(false);

  const { scrollY } = useScroll();

  // Efek scroll untuk transformasi navbar
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const width = useTransform(scrollY, [0, 100], ["100%", "90%"]);
  const borderRadius = useTransform(scrollY, [0, 100], ["0px", "20px"]);
  const margin = useTransform(scrollY, [0, 100], ["0px", "20px"]);

  const background = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]
  );

  const blur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(10px)"]);

  const border = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(0,0,0,0.08)"]
  );

  const shadow = useTransform(
    scrollY,
    [0, 100],
    ["0px 0px 0px rgba(0,0,0,0)", "0px 4px 20px rgba(0,0,0,0.1)"]
  );

  return (
 <motion.nav
  style={{
    background,
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    boxShadow: shadow,
    border: `1px solid ${border}`,
    scale,
    width,
    borderRadius,
  }}
 className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">

      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        
        <a className="text-xl font-bold tracking-wide text-gray-900">ReadSync</a>

        <ul className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
          <li><a className="hover:text-green-700 transition cursor-pointer">Dashboard</a></li>
          <li><a className="hover:text-green-700 transition cursor-pointer">Discussion</a></li>
          <li><a className="hover:text-green-700 transition cursor-pointer">Blog</a></li>
        </ul>

        <div className="hidden md:flex gap-3">
          <Button
            className="w-25 h-9 rounded-lg bg-green-700 text-white hover:bg-green-800 transition-colors duration-200"
          >
            Register
          </Button>

          <button
            className={`w-10 h-9 rounded-lg border ${
              isHovered ? "bg-green-700 border-green-700" : "border-gray-300"
            } text-white flex items-center justify-center transition-colors duration-200`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <img
              src={isHovered ? "/img/WhiteSearch.png" : "/img/Search.png"}
              alt="Search"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col space-y-1 p-2"
          onClick={toggleMobileMenu}
        >
          <span
            className={`block w-6 h-0.5 bg-black transition-transform ${
              isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-black transition-opacity ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-black transition-transform ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden top-15 w-90 h-80 left-1/2 transform -translate-x-1/2 absolute border border-gray-200 rounded-2xl bg-white shadow-lg py-4 px-6 z-50">
          <ul className="flex flex-col space-y-3">
            <li>
              <a 
                className="block py-2 text-gray-700 hover:text-green-700 transition cursor-pointer" 
                onClick={closeMobileMenu}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                className="block py-2 text-gray-700 hover:text-green-700 transition cursor-pointer" 
                onClick={closeMobileMenu}
              >
                Discussion
              </a>
            </li>
            <li>
              <a 
                className="block py-2 text-gray-700 hover:text-green-700 transition cursor-pointer" 
                onClick={closeMobileMenu}
              >
                Blog
              </a>
            </li>
          </ul>
          
          <div className="flex flex-col space-y-3 mt-4">
            <button 
              className="w-full h-10 rounded-lg bg-green-700 text-white text-sm hover:bg-green-800 transition-colors"
              onClick={closeMobileMenu}
            >
              Register
            </button>

            <button 
              className="w-full h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-green-700 hover:text-white hover:border-green-700 flex items-center justify-center gap-2 transition-colors" 
              onClick={closeMobileMenu}
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => setIsSearchHovered(false)}
            > 
              <img 
                src={isSearchHovered ? "/img/WhiteSearch.png" : "/img/Search.png"} 
                alt="Search" 
                className="w-5 h-5" 
              />
              <span>Search</span>
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;