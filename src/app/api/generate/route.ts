// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { city, sketch } = await req.json();

        if (!city || !sketch) {
            throw new Error("city and sketch are required");
        }

        // Remove the "data:image/png;base64," prefix if present
        const base64Data = sketch.replace(/^data:image\/png;base64,/, "");
        const binary = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        const formData = new FormData();
        formData.append("city", city);
        formData.append("control_image", new Blob([binary], { type: "image/png" }), "sketch.png");

        const response = await fetch("http://127.0.0.1:8000/generate", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`FastAPI error: ${text}`);
        }

        // Convert returned PNG to base64
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Save the image to disk
        const savePath = path.join(process.cwd(), "public", `generated_${Date.now()}.png`);
        fs.writeFileSync(savePath, uint8Array);

        // Convert to base64 for frontend
        const base64Image = "data:image/png;base64," + btoa(
            String.fromCharCode(...uint8Array)
        );

        return NextResponse.json({ output: base64Image, savedPath: savePath });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
