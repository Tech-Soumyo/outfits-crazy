// src/app/page.tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadForm } from "@/components/custom/UploadForm";

export default function Home() {
  const [images, setImages] = useState<{
    original: string;
    styled: string;
  } | null>(null);
  const [occasion, setOccasion] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Outfit Stylizer</h1>
      <UploadForm
        onImagesGenerated={setImages}
        occasion={occasion}
        setOccasion={setOccasion}
        gender={gender}
        setGender={setGender}
      />
      {images && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>Original</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={images.original}
                alt="Original outfit"
                className="w-full h-auto rounded-md"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{`Styled for ${occasion} (${gender})`}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={images.styled}
                alt={`Styled for ${occasion}`}
                className="w-full h-auto rounded-md"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
