
// src/app/auth/register/page.tsx
"use client";

import RegisterForm from "@/components/auth/registerForm";

console.log("Register page loaded");

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Gradient Panel */}
      <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-b from-purple-600 to-black text-white px-10 py-20 rounded-t-3xl mt-5">
        <h1 className="text-3xl font-bold mb-4">NextCommerce</h1>
        <h2 className="text-2xl font-semibold mb-2">Get Started with Us</h2>
        <p className="text-sm text-gray-200 max-w-sm text-center">
          Complete these easy steps to register your account.
        </p>

        <div className="mt-10 space-y-4 w-full max-w-sm">
          <Step number="1" label="Sign up your account" active />
          <Step number="2" label="Set up your workspace" />
          <Step number="3" label="Set up your profile" />
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-black text-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-2">Sign Up Account</h2>
          <p className="text-sm text-gray-400 mb-6">
            Enter your personal data to create your account.
          </p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

function Step({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center space-x-4 px-4 py-3 rounded-md border ${
        active ? "bg-white text-black font-semibold" : "border-gray-600 text-white"
      }`}
    >
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-sm ${
          active ? "bg-black text-white" : "border border-white"
        }`}
      >
        {number}
      </div>
      <span>{label}</span>
    </div>
  );
}
