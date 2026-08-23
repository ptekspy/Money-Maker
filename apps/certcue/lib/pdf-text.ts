import { definePDFJSModule, extractText } from "unpdf";
import * as bundledPdfjs from "unpdf/pdfjs";

let pdfJsSetup: Promise<void> | undefined;

export async function extractPdfText(data: Uint8Array) {
  pdfJsSetup ??= definePDFJSModule(() => Promise.resolve(bundledPdfjs));
  await pdfJsSetup;
  const result = await extractText(data, { mergePages: true });
  return result.text;
}
