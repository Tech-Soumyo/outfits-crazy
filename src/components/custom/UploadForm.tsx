// src/components/UploadForm.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";

interface UploadFormProps {
  onImagesGenerated: (images: { original: string; styled: string }) => void;
  occasion: string;
  setOccasion: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
}

export function UploadForm({
  onImagesGenerated,
  occasion,
  setOccasion,
  gender,
  setGender,
}: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !occasion || !gender) {
      setError("Please select an image, occasion, and gender");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("occasion", occasion);
      formData.append("gender", gender);
      const { data } = await axios.post("/api/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onImagesGenerated(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <Select value={occasion} onValueChange={setOccasion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Occasion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Office">Office</SelectItem>
            <SelectItem value="Party">Party</SelectItem>
            <SelectItem value="Vacation">Vacation</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gender} onValueChange={setGender}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="submit"
          disabled={loading || !file || !occasion || !gender}
          className="w-full"
        >
          {loading ? "Generating..." : "Generate Styled Image"}
        </Button>
        {error && <p className="text-destructive text-sm">{error}</p>}
      </form>
    </div>
  );
}
