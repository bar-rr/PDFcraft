import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { t } from '../i18n';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// The worker ships with the installed pdfjs-dist version (no CDN, no version mismatch).
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Errors with a message that is already meant for the user (must not be replaced by a generic one).
export class UserError extends Error {}

export const checkPDFEncryption = async (file: File): Promise<boolean> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    await PDFDocument.load(arrayBuffer); // throws EncryptedPDFError for password-protected files
    return false;
  } catch (error: any) {
    return error?.name === 'EncryptedPDFError' || /encrypt/i.test(error?.message || '');
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
        throw new UserError(t('errEncrypted', { name: file.name }));
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
          throw new UserError(t('errEncrypted', { name: file.name }));
        }
        throw error;
      }
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error merging PDFs:', error);
    if (error instanceof UserError) throw error;
    throw new UserError(t('errMerge'));
  }
};

export const splitPDF = async (file: File, selectedPages?: number[]): Promise<Blob[]> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new UserError(t('errEncrypted', { name: file.name }));
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
    if (error instanceof UserError) throw error;
    throw new UserError(t('errSplit'));
  }
};

export const compressPDF = async (file: File): Promise<Blob> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new UserError(t('errEncrypted', { name: file.name }));
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    
    // Compress by removing metadata and optimizing
    const pdfBytes = await pdf.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50,
    });
    
    // Never hand back a bigger file than the one the user gave us.
    if (pdfBytes.length >= arrayBuffer.byteLength) {
      return new Blob([arrayBuffer], { type: 'application/pdf' });
    }
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error compressing PDF:', error);
    if (error instanceof UserError) throw error;
    throw new UserError(t('errCompress'));
  }
};

export const getPDFPageCount = async (file: File): Promise<number> => {
  try {
    const isEncrypted = await checkPDFEncryption(file);
    if (isEncrypted) {
      throw new UserError(t('errEncrypted', { name: file.name }));
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    if (error instanceof UserError) throw error;
    throw new UserError(t('errRead'));
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
    if (error instanceof UserError) throw error;
    throw new UserError(t('errJpeg'));
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
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const downloadMultipleBlobs = async (blobs: Blob[], baseFilename: string) => {
  if (blobs.length === 1) {
    downloadBlob(blobs[0], `${baseFilename}_page_1.pdf`);
    return;
  }
  // Browsers block many separate downloads, so bundle the pages into one ZIP.
  const zip = new JSZip();
  blobs.forEach((blob, index) => zip.file(`${baseFilename}_page_${index + 1}.pdf`, blob));
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${baseFilename}_pages.zip`);
};
