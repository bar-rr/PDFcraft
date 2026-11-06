import React from 'react';
import { Merge, Split, Minimize2, FileImage } from 'lucide-react';
import { Header } from './components/Header';
import { FeatureCard } from './components/FeatureCard';
import { useAuth } from './hooks/useAuth';
import {
  mergePDFs,
  splitPDF,
  compressPDF,
  jpegToPDF,
  downloadBlob,
  downloadMultipleBlobs
} from './utils/pdfUtils';

function App() {
  const { loading } = useAuth();

  const handleMergePDFs = async (files: File[]) => {
    if (files.length < 2) {
      throw new Error('Please select at least 2 PDF files to merge');
    }
    const mergedPdf = await mergePDFs(files);
    downloadBlob(mergedPdf, 'merged_document.pdf');
  };

  const handleSplitPDF = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error('Please select exactly 1 PDF file to split');
    }
    const splitPdfs = await splitPDF(files[0]);
    const baseName = files[0].name.replace(/\.pdf$/i, '');
    await downloadMultipleBlobs(splitPdfs, baseName);
  };

  const handleCompressPDF = async (files: File[]) => {
    if (files.length !== 1) {
      throw new Error('Please select exactly 1 PDF file to compress');
    }
    const compressedPdf = await compressPDF(files[0]);
    const fileName = files[0].name.replace(/\.pdf$/i, '') + '_compressed.pdf';
    downloadBlob(compressedPdf, fileName);
  };

  const handleJpegToPDF = async (files: File[]) => {
    if (files.length === 0) {
      throw new Error('Please select at least 1 JPEG file');
    }
    const pdf = await jpegToPDF(files);
    downloadBlob(pdf, 'images_to_pdf.pdf');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[800px] h-auto overflow-x-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            PDFcraft – Free PDF Tools by Baris Yurttas
          </h1>
          <p className="text-lg text-white/80 max-w-4xl mx-auto">
            Merge, split, compress, and convert PDFs easily. Enjoy 50 free uses daily—more than enough for most tasks. Need more? Get extended access with a one-time payment. Support my work if you'd like—thank you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          <FeatureCard
            title="Merge PDFs"
            description="Combine multiple PDF files into one document"
            icon={Merge}
            accept="application/pdf"
            multiple={true}
            onProcess={handleMergePDFs}
          />
          
          <FeatureCard
            title="Split PDF"
            description="Split a PDF into separate pages"
            icon={Split}
            accept="application/pdf"
            multiple={false}
            onProcess={handleSplitPDF}
          />
          
          <FeatureCard
            title="Compress PDF"
            description="Reduce PDF file size while maintaining quality"
            icon={Minimize2}
            accept="application/pdf"
            multiple={false}
            onProcess={handleCompressPDF}
          />
          
          <FeatureCard
            title="JPEG to PDF"
            description="Convert JPEG images to PDF format"
            icon={FileImage}
            accept="image/jpeg,image/jpg"
            multiple={true}
            onProcess={handleJpegToPDF}
          />
        </div>

        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Why Choose PDFcraft?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
              <div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-sm">All processing happens in your browser. Your files never leave your device.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Fast Processing</h3>
                <p className="text-sm">Lightning-fast PDF operations with no server uploads required.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Professional Quality</h3>
                <p className="text-sm">Maintain document quality and formatting in all operations.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;