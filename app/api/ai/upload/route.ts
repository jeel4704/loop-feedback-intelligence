import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    // For Phase 7 prototype, we natively extract text from CSVs, JSON, and TXT files.
    // In production, we'd pipe PDFs/DOCX to AWS Textract or pdf-parse.
    if (!["csv", "txt", "json"].includes(fileType || "")) {
      return NextResponse.json({ 
        error: "Unsupported file format. Please upload CSV, TXT, or JSON for text extraction." 
      }, { status: 400 });
    }

    // Extract text content from the file
    const fileContent = await file.text();

    // Limit extracted text size to prevent LLM context window overflow (e.g. max 50,000 characters)
    const truncatedContent = fileContent.length > 50000 
      ? fileContent.slice(0, 50000) + "\n...[CONTENT TRUNCATED DUE TO SIZE]" 
      : fileContent;

    return NextResponse.json({ 
      fileName: file.name,
      extractedText: truncatedContent 
    });

  } catch (error) {
    console.error("[File Upload API Error]", error);
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 });
  }
}
