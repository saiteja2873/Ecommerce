// src/app/account/admin/dashboard/page.tsx
"use client";

import Link from "next/link";
// import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button or similar
import { motion } from "framer-motion"; // For animations
import {
  FaPlus,
  FaEye,
  // FaEdit, // Keep FaEdit and FaTrash if you want to use them elsewhere
  // FaTrash,
  FaChartLine,
  FaBoxOpen,
  FaUsers,
  FaDollarSign,
  FaClipboardList,
  FaTag,
} from "react-icons/fa"; // Added more icons

export default function AdminDashboardPage() {
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger children animations
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 sm:p-8 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-10 text-center md:text-left"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold mb-2 text-blue-600 dark:text-blue-400"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-400">
            Welcome, Administrator! Manage your e-commerce platform efficiently.
          </motion.p>
        </motion.header>

        {/* Dashboard Overview / Key Metrics (Remains the same) */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
              <h3 className="text-2xl font-bold mt-1">$12,500</h3>
            </div>
            <FaDollarSign className="text-blue-500 text-3xl" />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
              <h3 className="text-2xl font-bold mt-1">245</h3>
            </div>
            <FaBoxOpen className="text-green-500 text-3xl" />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Orders</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
            <FaClipboardList className="text-yellow-500 text-3xl" />
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
              <h3 className="text-2xl font-bold mt-1">89</h3>
            </div>
            <FaUsers className="text-purple-500 text-3xl" />
          </motion.div>
        </motion.section>

        {/* Quick Actions / Management Links - MODIFIED FOR RESPONSIVE ICONS */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Quick Actions</h2>
          {/* ✅ MODIFIED GRID FOR QUICK ACTIONS */}
          {/* Default: 2 columns (for very small screens if needed) */}
          {/* sm:grid-cols-3: 3 columns on small screens (e.g., larger phones) */}
          {/* md:grid-cols-4: 4 columns on medium screens (e.g., tablets, small laptops) */}
          {/* lg:grid-cols-5: 5 columns on large screens (desktops) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"> {/* Adjusted gap for tighter fit */}
            {/* Add Product */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/products/add" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaPlus className="text-3xl mb-2" />
                <span className="text-sm font-medium">Add Product</span>
              </Link>
            </motion.div>

            {/* View All Products */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/products" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-green-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaEye className="text-3xl mb-2" />
                <span className="text-sm font-medium">View Products</span>
              </Link>
            </motion.div>

            {/* Manage Orders */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/orders" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-yellow-600 dark:text-yellow-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaClipboardList className="text-3xl mb-2" />
                <span className="text-sm font-medium">Manage Orders</span>
              </Link>
            </motion.div>

            {/* Manage Categories */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/categories" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaTag className="text-3xl mb-2" />
                <span className="text-sm font-medium">Manage Categories</span>
              </Link>
            </motion.div>

            {/* Example: Manage Users (if applicable) */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/users" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaUsers className="text-3xl mb-2" />
                <span className="text-sm font-medium">Manage Users</span>
              </Link>
            </motion.div>

            {/* Add more quick actions as needed */}
            {/* Example: Analytics Overview */}
            <motion.div variants={itemVariants}>
              <Link href="/account/admin/analytics" passHref
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md h-28 text-center text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                <FaChartLine className="text-3xl mb-2" />
                <span className="text-sm font-medium">View Analytics</span>
              </Link>
            </motion.div>

          </div>
        </motion.section>

        {/* Recent Activity / Analytics (Placeholder) (Remains the same) */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Recent Activity & Analytics</h2>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg min-h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <FaChartLine className="text-5xl mr-4" />
            <p>Analytics and recent activities will be displayed here.</p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}