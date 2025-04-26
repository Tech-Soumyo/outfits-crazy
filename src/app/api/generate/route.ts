// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { experimental_generateImage as generateImage } from "ai";
import { vertex } from "@ai-sdk/google-vertex";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import { analyzeImageDetails } from "@/lib/vision";

interface OutfitDetails {
  labels: string[];
  colors: string[];
  objects: string[];
}

function createPrompt(
  outfit: OutfitDetails,
  occasion: "Office" | "Party" | "Vacation",
  gender: "Male" | "Female"
): string {
  const base = `${outfit.colors[0]} ${outfit.labels.join(" ")}`;
  const modelGender = gender === "Male" ? "male model" : "female model";
  switch (occasion) {
    case "Office":
      return `A high-end editorial fashion photograph featuring a ${modelGender} model dressed in a complete outfit inspired by a ${base}. The look is styled elegantly for a modern office environment — think smart-casual to business-formal — incorporating complementary clothing pieces, footwear, and accessories. The overall aesthetic is polished yet fashion-forward, aligned with Pinterest and editorial style guides. Neutral background, soft and balanced studio lighting, full-body shot, realistic textures, and detailed fabrics.`;

    case "Party":
      return `A striking editorial fashion photograph of a ${modelGender} model wearing a full outfit inspired by a ${base}, styled for an upscale party or evening event. The ensemble includes chic, coordinated clothing pieces, stylish footwear, and bold accessories that elevate the original item into a glamorous look. The aesthetic is trendy, vibrant, and Pinterest-worthy, with a neutral backdrop, clean dynamic lighting, and a full-body view. Focus on elegance, movement, and confident poses.`;

    case "Vacation":
      return `An editorial-style fashion photo featuring a ${modelGender} model in a full vacation-ready outfit inspired by a ${base}. The outfit is relaxed, stylish, and travel-appropriate — featuring complementary clothing pieces, footwear, and accessories that balance comfort and trendiness. The aesthetic is vibrant yet realistic, aligned with Pinterest/editorial standards. Neutral background mimicking natural daylight, soft shadows, full-body shot capturing a laid-back yet polished vibe.`;

    default:
      throw new Error("Invalid occasion");
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const occasion = formData.get("occasion") as string;
    const gender = formData.get("gender") as string;

    if (!file || !occasion || !gender) {
      return NextResponse.json(
        { error: "Image, occasion, and gender are required" },
        { status: 400 }
      );
    }

    if (!["Office", "Party", "Vacation"].includes(occasion)) {
      return NextResponse.json({ error: "Invalid occasion" }, { status: 400 });
    }

    if (!["Male", "Female"].includes(gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const uploadPath = path.join(
      uploadDir,
      `${uuidv4().slice(0, 3)}-${file.name}`
    );
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(uploadPath, Buffer.from(await file.arrayBuffer()));

    const outfit = await analyzeImageDetails(uploadPath);
    if (!outfit.labels.length) {
      return NextResponse.json(
        { error: "No outfit details detected" },
        { status: 400 }
      );
    }

    const prompt = createPrompt(
      outfit,
      occasion as "Office" | "Party" | "Vacation",
      gender as "Male" | "Female"
    );

    const outputDir = path.join(process.cwd(), "public", "output");
    await fs.mkdir(outputDir, { recursive: true });

    const { image } = await generateImage({
      model: vertex.image(process.env.GCP_VERTEX_MODEL!),
      prompt,
      n: 1,
    });

    if (!image.uint8Array || !image.mimeType) {
      throw new Error("Image data not available from Vertex AI");
    }

    const extension = image.mimeType.split("/")[1];
    const filename = `outfit_${uuidv4().slice(
      0,
      3
    )}_${occasion}_${gender}.${extension}`;
    const filePath = path.join(outputDir, filename);

    await fs.writeFile(filePath, Buffer.from(image.uint8Array));
    console.log(`✅ Image saved at ${filePath}`);
    const imagePath = `/output/${filename}`;

    return NextResponse.json({
      original: `/uploads/${path.basename(uploadPath)}`,
      styled: imagePath,
    });
  } catch (err: any) {
    console.error("❌ Image generation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
