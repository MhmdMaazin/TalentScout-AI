import { CandidateFile } from '../types';

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generatePdfThumbnail = async (file: File): Promise<string> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1); // Get first page

  const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) throw new Error("Could not create canvas context");

  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;

  return canvas.toDataURL();
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
};

export const processFile = async (candidate: CandidateFile): Promise<CandidateFile> => {
  try {
    let extractedText = "";
    let previewUrl = "";

    if (candidate.type === 'pdf') {
      extractedText = await extractTextFromPdf(candidate.file);
      // Generate thumbnail for PDF
      try {
        previewUrl = await generatePdfThumbnail(candidate.file);
      } catch (e) {
        console.warn("Failed to generate PDF thumbnail", e);
      }
    } else if (candidate.type === 'image') {
      // For images, we will generate a preview URL
      previewUrl = await readFileAsBase64(candidate.file);
    }

    return {
      ...candidate,
      status: 'done',
      extractedText,
      previewUrl
    };
  } catch (error) {
    console.error(`Error processing file ${candidate.name}:`, error);
    return {
      ...candidate,
      status: 'error'
    };
  }
};