# PDFcraft – Free PDF Tools by Baris Yurttas

Browser-based PDF tools: merge, split, compress, JPEG → PDF. All processing happens in the browser; files never leave the device.

Live: https://pdfcraft.barisy.org

## Stack
Vite + React + TypeScript, Tailwind CSS, pdf-lib, pdf.js (bundled worker), jsPDF, JSZip, Firebase Auth (Google sign-in).

## Develop
```bash
npm install
npm run dev
```

## Build and deploy
```bash
npm run build
firebase deploy --only hosting   # project: pdfcraft-2302a
```

## Custom domain (pdfcraft.barisy.org)
1. Firebase Console → Hosting → Add custom domain → `pdfcraft.barisy.org`, add the DNS records it shows.
2. Firebase Console → Authentication → Settings → Authorized domains → add `pdfcraft.barisy.org`.

## Notes
- Free daily limit: 50 operations (stored in the browser's localStorage).
- Split downloads all selected pages as one ZIP.
