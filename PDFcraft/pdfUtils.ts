import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export const checkPDFEncryption = async (file: File): Promise<boolean> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    return false; // If we can load it, it's not encrypted (or password is empty)
  } catch (error: any) {
    if (error.name === 'PasswordException' || error.message?.includes('password') || error.message?.includes('encrypted')) {
      return true;
    }
    return false;
  }
};

export const renderPDFPage = async (file: File, pageNumber: number): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber + 1); // PDF.js uses 1-based indexing
    
    const scale = 0.5; // Smaller scale for thumbnails
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    return canvas.toDataURL();
  } catch (error) {
    console.error('Error rendering PDF page:', error);
    return '';
  }
};

export const mergePDFs = async (files: File[]): Promise<Blob> => {
  try {
    // Check for encrypted PDFs first
    for (const file of files) {
      const isEncrypted = await checkPDFEncryption(file);
      if (isEncrypted) {
        throw new Error(`Cannot process encrypted PDF: ${file.name}. Please remove password protection first.`);
      }
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (error: any) {
        if (error.message?.includes('password') || error.message?.includes('encrypted')) {
          throw new Error(`Cannot process encrypted PDF: ${file.name}. Please remove password protection first.`);
        }
        throw error;
      }
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
  }
};

export const splitPDF = async (file: File, selectedPages?: number[]): Promise<Blob[]> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new Error('Cannot process encrypted PDF. Please remove password protection first.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();
    const pagesToSplit = selectedPages || Array.from({ length: pageCount }, (_, i) => i);
    const splitPDFs: Blob[] = [];

    for (const pageIndex of pagesToSplit) {
      if (pageIndex >= pageCount) continue;
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      splitPDFs.push(new Blob([pdfBytes], { type: 'application/pdf' }));
    }

    return splitPDFs;
  } catch (error) {
    console.error('Error splitting PDF:', error);
    throw new Error('Failed to split PDF. Please ensure the file is a valid PDF document.');
  }
};

export const compressPDF = async (file: File): Promise<Blob> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new Error('Cannot process encrypted PDF. Please remove password protection first.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // Compress by removing metadata and optimizing
    const pdfBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('Failed to compress PDF. Please ensure the file is a valid PDF document.');
  }
};

export const getPDFPageCount = async (file: File): Promise<number> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new Error('Cannot process encrypted PDF. Please remove password protection first.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    throw new Error('Failed to read PDF. Please ensure the file is a valid PDF document.');
  }
};

export const jpegToPDF = async (files: File[]): Promise<Blob> => {
  try {
    const pdf = new jsPDF();
    let isFirstPage = true;

    for (const file of files) {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      await new Promise((resolve) => {
        img.onload = () => {
          const pageWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgRatio = img.width / img.height;
          const pageRatio = pageWidth / pageHeight;

          let width, height;
          if (imgRatio > pageRatio) {
            width = pageWidth;
            height = pageWidth / imgRatio;
          } else {
            height = pageHeight;
            width = pageHeight * imgRatio;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          const imgData = canvas.toDataURL('image/jpeg', 0.7);

          if (!isFirstPage) {
            pdf.addPage();
          }
          
          pdf.addImage(imgData, 'JPEG', 
            (pageWidth - width) / 2, 
            (pageHeight - height) / 2, 
            width, 
            height
          );
          
          isFirstPage = false;
          resolve(void 0);
        };
        img.src = URL.createObjectURL(file);
      });
    }

    const pdfBlob = pdf.output('blob');
    return pdfBlob;
  } catch (error) {
    console.error('Error converting JPEG to PDF:', error);
    throw new Error('Failed to convert images to PDF. Please ensure all files are valid JPEG images.');
  }
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadMultipleBlobs = (blobs: Blob[], baseFilename: string) => {
  blobs.forEach((blob, index) => {
    const filename = `${baseFilename}_page_${index + 1}.pdf`;
    downloadBlob(blob, filename);
  });
};