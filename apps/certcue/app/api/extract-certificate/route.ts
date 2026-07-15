import { PDFParse } from "pdf-parse";
import { extractCertificateDetails } from "@/lib/extract-certificate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("certificate");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "Choose a PDF certificate." },
      { status: 400 },
    );
  }
  if (file.size > 10_000_000) {
    return Response.json(
      { error: "The PDF must be smaller than 10 MB." },
      { status: 400 },
    );
  }
  if (
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return Response.json(
      { error: "Only PDF certificates are supported." },
      { status: 400 },
    );
  }

  const parser = new PDFParse({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  try {
    const result = await parser.getText();
    if (!result.text.trim()) {
      return Response.json(
        {
          error:
            "This looks like a scanned PDF without readable text. Enter the date manually.",
        },
        { status: 422 },
      );
    }
    return Response.json(extractCertificateDetails(result.text));
  } finally {
    await parser.destroy();
  }
}
