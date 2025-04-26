import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import { analyzeImageDetails } from "@/lib/vision";

export async function POST(req: NextRequest) {
  try {
    const { imagePath } = await req.json();
    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json(
        { error: "Valid imagePath required" },
        { status: 400 }
      );
    }
    await fs.access(imagePath).catch(() => {
      throw new Error("Image file not found");
    });
    const details = await analyzeImageDetails(imagePath);
    return NextResponse.json({ details });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
