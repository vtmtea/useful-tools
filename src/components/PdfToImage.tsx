import React, { useState, useRef } from 'react';
import { ArrowLeft, FileDown, FileImage, Download } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import JSZip from 'jszip';

// Configure the worker for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfToImageProps {
    onBack: () => void;
}

interface PdfPage {
    pageNumber: number;
    dataUrl: string;
}

const PdfToImage: React.FC<PdfToImageProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PdfPage[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            processPdf(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.type === 'application/pdf') {
                processPdf(selectedFile);
            } else {
                alert('Please upload a valid PDF file.');
            }
        }
    };

    const processPdf = async (file: File) => {
        setFile(file);
        setPages([]);
        setIsConverting(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
            const pdf = await loadingTask.promise;

            setProgress({ current: 0, total: pdf.numPages });

            const extractedPages: PdfPage[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);

                // Set scale for high quality
                const scale = 2.0;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                        canvas: canvas,
                    };

                    await page.render(renderContext).promise;
                    const dataUrl = canvas.toDataURL('image/png');
                    extractedPages.push({ pageNumber: i, dataUrl });

                    setProgress({ current: i, total: pdf.numPages });
                    setPages([...extractedPages]); // Update progressively
                }
            }
        } catch (error) {
            console.error('Error processing PDF:', error);
            alert('Failed to process the PDF. Please try a different file.');
            setFile(null);
        } finally {
            setIsConverting(false);
        }
    };

    const downloadZip = async () => {
        if (pages.length === 0) return;

        const zip = new JSZip();
        const folderName = file?.name.replace('.pdf', '') || 'pdf-images';
        const imgFolder = zip.folder(folderName);

        pages.forEach((page) => {
            const base64Data = page.dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
            imgFolder?.file(`page_${page.pageNumber}.png`, base64Data, { base64: true });
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadSingleImage = (page: PdfPage) => {
        const a = document.createElement('a');
        a.href = page.dataUrl;
        a.download = `${file?.name.replace('.pdf', '')}_page_${page.pageNumber}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">PDF to Image Converter</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {!file ? (
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            padding: '4rem 2rem',
                            border: '2px dashed var(--primary)',
                            borderRadius: '1rem',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: 'rgba(56, 189, 248, 0.05)',
                            transition: 'background 0.3s'
                        }}
                    >
                        <FileImage size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }} />
                        <h3>Click or Drag & Drop PDF Here</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Supported format: PDF only</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,application/pdf"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>{file.name}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {isConverting
                                        ? `Converting... ${progress.current} / ${progress.total} pages`
                                        : `Successfully converted ${pages.length} pages`
                                    }
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        setFile(null);
                                        setPages([]);
                                    }}
                                    style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                >
                                    Upload New PDF
                                </button>
                                {pages.length > 0 && !isConverting && (
                                    <button
                                        className="generate-btn"
                                        onClick={downloadZip}
                                        style={{ padding: '0.75rem 1.5rem' }}
                                    >
                                        <FileDown size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Download All (ZIP)
                                    </button>
                                )}
                            </div>
                        </div>

                        {pages.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {pages.map((page) => (
                                    <div key={page.pageNumber} style={{
                                        background: 'var(--surface)',
                                        borderRadius: '0.5rem',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(0,0,0,0.2)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexGrow: 1
                                        }}>
                                            <img
                                                src={page.dataUrl}
                                                alt={`Page ${page.pageNumber}`}
                                                style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div style={{
                                            padding: '1rem',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderTop: '1px solid var(--border)'
                                        }}>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Page {page.pageNumber}</span>
                                            <button
                                                onClick={() => downloadSingleImage(page)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--primary)',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem'
                                                }}
                                                title="Download Image"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfToImage;
