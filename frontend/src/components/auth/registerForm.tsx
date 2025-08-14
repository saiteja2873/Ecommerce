"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "https://ecommerce-j5j0.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      if (!res.ok) {
        const errorData: { message?: string } = await res.json();
        if (res.status === 409) {
          toast.error("User with this email already exists.");
        } else {
          toast.error(errorData.message || "Registration failed.");
        }
        return;
      }

      toast.success("Registered! Enter the OTP sent to your email.");
      setShowOtpInput(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unexpected error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://ecommerce-j5j0.onrender.com/api/verify?email=${form.email}&otp=${otp}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data: { message?: string; token?: string } = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid or expired OTP.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      toast.success("Email verified! Redirecting...");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Verification failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={showOtpInput ? handleOtpVerify : handleSubmit}
      className="space-y-4"
    >
      {!showOtpInput && (
        <>
          {/* Social Login Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => signIn("google")}
              className="w-full border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn("github")}
              className="w-full border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800 text-white"
              disabled={isSubmitting}
            >
              Github
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex-1 h-px bg-gray-600" />
            <span>Or</span>
            <div className="flex-1 h-px bg-gray-600" />
          </div>

          {/* Registration Fields */}
          <div className="flex gap-2">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
              disabled={isSubmitting}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
              disabled={isSubmitting}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="eg. johnfrans@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
            disabled={isSubmitting}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
            disabled={isSubmitting}
          />
          <p className="text-sm text-gray-500">
            Must be at least 8 characters.
          </p>
        </>
      )}

      {showOtpInput && (
        <input
          type="text"
          name="otp"
          placeholder="Enter verification token / OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full px-3 py-2 bg-black border border-gray-600 rounded-md text-white"
          disabled={isSubmitting}
          required
        />
      )}

      <button
        type="submit"
        className="w-full bg-white text-black py-2 rounded-md hover:bg-gray-200 font-semibold disabled:opacity-50"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? showOtpInput
            ? "Verifying..."
            : "Signing Up..."
          : showOtpInput
          ? "Verify OTP"
          : "Sign Up"}
      </button>

      {!showOtpInput && (
        <p className="text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/auccount/login" className="text-white hover:underline">
            Log in
          </Link>
        </p>
      )}
    </form>
  );
}
