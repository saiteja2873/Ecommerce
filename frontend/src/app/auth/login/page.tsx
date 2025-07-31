"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });

  // ✅ Trigger toast on redirect-based login (Google/GitHub)
  useEffect(() => {
    if (status === "authenticated") {
      toast.success("Welcome back!");
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    console.log("SignIn Result:", res);

    if (res?.error) {
      toast.error("Invalid credentials");
    } else {
      toast.success("Welcome back!");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Login to your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-black text-white"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-3 py-2 border border-gray-600 rounded-md bg-black text-white"
        />
        <button
          type="submit"
          className="w-full py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200"
        >
          Login
        </button>
      </form>

      <div className="my-4 text-center text-gray-400 text-sm">OR</div>

      <div className="flex gap-2">
        <button
          onClick={() => signIn("google")}
          className="w-full border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Continue with Google
        </button>
        <button
          onClick={() => signIn("github")}
          className="w-full border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Continue with GitHub
        </button>
      </div>

      <p className="text-sm mt-4 text-center text-gray-400">
        Don’t have an account?{" "}
        <Link href="/auth/register" className="text-white hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
