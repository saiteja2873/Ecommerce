"use client";

import { useState } from "react";
import { uploadProfileImage } from "@/lib/api";
import { toast } from "react-hot-toast";

interface ProfileImageProps {
  currentImage: string | null;
  onUpdate: (newUrl: string) => void;
  token: string | null;
}

export default function ProfileImage({ currentImage, onUpdate, token }: ProfileImageProps) {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    try {
      const imageUrl = await uploadProfileImage(token, file);
      onUpdate(imageUrl);
      toast.success("Profile image updated");
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <img
        src={currentImage || "/default-avatar.png"}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover mb-2"
      />
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {uploading && <p className="text-sm">Uploading...</p>}
    </div>
  );
}
