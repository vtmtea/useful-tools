import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, FileDown, ArrowRight } from 'lucide-react';

interface ImageCompressorProps {
    onBack: () => void;
}

const ImageCompressor: React.FC<ImageCompressorProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [compressedUrl, setCompressedUrl] = useState<string>('');
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [quality, setQuality] = useState<number>(0.7); // 70%
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            compressImage(selectedFile, 0.7);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.type.startsWith('image/')) {
                setFile(selectedFile);
                setPreviewUrl(URL.createObjectURL(selectedFile));
                compressImage(selectedFile, parseInt(document.getElementById('quality-slider')?.getAttribute('value') || '70') / 100);
            }
        }
    };

    const compressImage = (imageFile: File, q: number) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (blob) {
                    setCompressedUrl(URL.createObjectURL(blob));
                    setCompressedSize(blob.size);
                }
            }, 'image/jpeg', q);
        };
    };

    useEffect(() => {
        if (file) {
            compressImage(file, quality);
        }
    }, [quality, file]);

    const downloadCompressedImage = () => {
        if (compressedUrl) {
            const a = document.createElement('a');
            a.href = compressedUrl;
            a.download = `compressed_${file?.name.replace(/\.[^/.]+$/, "")}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">Image Compressor</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                        <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                        <h3>Click or Drag & Drop Image Here</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Supported formats: JPG, PNG, WEBP (Outputs JPG)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Original ({formatBytes(file.size)})</h4>
                                    <div style={{
                                        height: '200px',
                                        borderRadius: '0.5rem',
                                        overflow: 'hidden',
                                        background: 'rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <img src={previewUrl} alt="Original" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </div>
                                </div>

                                <ArrowRight size={32} style={{ color: 'var(--primary)', flexShrink: 0, margin: '0 auto' }} className="d-none-mobile" />

                                <div style={{ flex: '1 1 300px', textAlign: 'center' }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                                        Compressed ({compressedSize ? formatBytes(compressedSize) : '...'})
                                        {compressedSize > 0 && file.size > 0 && (
                                            <span style={{ fontSize: '0.9rem', marginLeft: '0.5rem', color: '#10b981' }}>
                                                (-{((1 - compressedSize / file.size) * 100).toFixed(0)}%)
                                            </span>
                                        )}
                                    </h4>
                                    <div style={{
                                        height: '200px',
                                        borderRadius: '0.5rem',
                                        overflow: 'hidden',
                                        background: 'rgba(0,0,0,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {compressedUrl && <img src={compressedUrl} alt="Compressed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <label style={{ color: 'var(--text)' }}>Compression Quality</label>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{Math.round(quality * 100)}%</span>
                                </div>
                                <input
                                    id="quality-slider"
                                    type="range"
                                    min="0.1"
                                    max="1"
                                    step="0.05"
                                    value={quality}
                                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                                    style={{
                                        width: '100%',
                                        accentColor: 'var(--primary)'
                                    }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <span>Smaller File String</span>
                                    <span>Higher Quality Image</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        setFile(null);
                                        setPreviewUrl('');
                                        setCompressedUrl('');
                                        setCompressedSize(0);
                                    }}
                                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                >
                                    Upload New Image
                                </button>
                                <button
                                    className="generate-btn"
                                    onClick={downloadCompressedImage}
                                    style={{ flex: 2, padding: '1rem' }}
                                    disabled={!compressedUrl}
                                >
                                    <FileDown size={20} />
                                    Download Compressed Image
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {"\
                @media (max-width: 768px) {\
                    .d-none-mobile {\
                        display: none;\
                    }\
                }\
            "}
            </style>
        </div>
    );
};

export default ImageCompressor;
