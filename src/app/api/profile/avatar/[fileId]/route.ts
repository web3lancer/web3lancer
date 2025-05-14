import { NextResponse } from "next/server";
import { Storage } from "appwrite";
import { client } from "@/app/appwrite";
import { PROFILE_AVATARS_BUCKET_ID } from "@/lib/env";

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  const fileId = params.fileId;

  if (!fileId) {
    return new NextResponse("File ID is required", { status: 400 });
  }

  try {
    const storage = new Storage(client);
    const file = await storage.getFileDownload(PROFILE_AVATARS_BUCKET_ID, fileId);
    
    const buffer = await file.arrayBuffer();
    const response = new NextResponse(buffer);
    
    // Set appropriate content type
    const fileDetails = await storage.getFile(PROFILE_AVATARS_BUCKET_ID, fileId);
    response.headers.set("Content-Type", fileDetails.mimeType);
    response.headers.set("Cache-Control", "public, max-age=604800"); // Cache for 1 week
    
    return response;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return new NextResponse("Error fetching avatar", { status: 500 });
  }
}