import React, { useState, useRef } from 'react';
import { ArrowLeft, FileDown, Layers } from 'lucide-react';

interface SvgConverterProps {
    onBack: () => void;
}

const SvgConverter: React.FC<SvgConverterProps> = ({ onBack }) => {
    const [file, setFile] = useState<File | null>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [scale, setScale] = useState<number>(2); // 1x, 2x, 4x, etc
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            processFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            const selectedFile = e.dataTransfer.files[0];
            if (selectedFile.type === 'image/svg+xml' || selectedFile.name.endsWith('.svg')) {
                processFile(selectedFile);
            } else {
                alert('Please upload a valid SVG file.');
            }
        }
    };

    const processFile = (file: File) => {
        setFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                const encoded = btoa(unescape(encodeURIComponent(e.target.result)));
                setSvgContent(`data:image/svg+xml;base64,${encoded}`);
            }
        };
        reader.readAsText(file);
    };

    const convertToPng = () => {
        if (!svgContent || !file) return;

        const img = new Image();
        img.src = svgContent;
        img.onload = () => {
            const canvas = document.createElement('canvas');

            // Handle SVGs without intrinsic dimensions
            const width = img.width || 500;
            const height = img.height || 500;

            canvas.width = width * scale;
            canvas.height = height * scale;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Background transparent by default, can be modified if needed
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${file.name.replace('.svg', '')}_${scale}x.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }
                }, 'image/png');
            }
        };
        img.onerror = () => {
            alert('Failed to process SVG. Please make sure it is a valid SVG image.');
        };
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">SVG to PNG Converter</h2>
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
                        <Layers size={48} style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }} />
                        <h3>Click or Drag & Drop SVG Here</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Supported format: SVG only</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".svg,image/svg+xml"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Preview ({file.name})</h4>
                            <div
                                className="checkerboard-bg"
                                style={{
                                    minHeight: '200px',
                                    padding: '2rem',
                                    borderRadius: '0.5rem',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                                ref={containerRef}
                            >
                                <img src={svgContent} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px' }} />
                            </div>
                        </div>

                        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <label style={{ color: 'var(--text)', fontWeight: '500' }}>Export Scale</label>
                                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{scale}x</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {[1, 2, 4, 8, 16].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setScale(s)}
                                            style={{
                                                flex: 1,
                                                padding: '0.75rem',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.5rem',
                                                background: scale === s ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                color: scale === s ? 'white' : 'var(--text)',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.2s',
                                                minWidth: '60px'
                                            }}
                                        >
                                            {s}x
                                        </button>
                                    ))}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>
                                    Higher scale results in a larger, higher-quality PNG image.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        setFile(null);
                                        setSvgContent('');
                                    }}
                                    style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', color: 'var(--text)' }}
                                >
                                    Upload New SVG
                                </button>
                                <button
                                    className="generate-btn"
                                    onClick={convertToPng}
                                    style={{ flex: 2, padding: '1rem' }}
                                    disabled={!svgContent}
                                >
                                    <FileDown size={20} />
                                    Download PNG
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>
                {"\
                .checkerboard-bg {\
                    background-image: \
                        linear-gradient(45deg, #2a2a2a 25%, transparent 25%), \
                        linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), \
                        linear-gradient(45deg, transparent 75%, #2a2a2a 75%), \
                        linear-gradient(-45deg, transparent 75%, #2a2a2a 75%);\
                    background-size: 20px 20px;\
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;\
                    background-color: #333;\
                }\
            "}
            </style>
        </div>
    );
};

export default SvgConverter;
