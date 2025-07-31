"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { updateProfile } from "@/lib/api";
import { User } from "@/types/user";
import ProfileImage from "./profileImage";

interface ProfileFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [image, setImage] = useState(user.image || "");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Or use your auth context
    setToken(storedToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return toast.error("Token missing");

    setLoading(true);
    try {
      const updated = await updateProfile(token, { name, phone, image });
      onUpdate(updated);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setImage(newImageUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <ProfileImage currentImage={image || null} onUpdate={handleImageUpdate} token={token} />

      <input
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="input input-bordered w-full"
      />

      <input
        type="email"
        name="email"
        value={user.email}
        disabled
        className="input input-bordered w-full"
      />

      <input
        type="tel"
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        className="input input-bordered w-full"
      />

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
