import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import {
    ArrowLeft,
    Upload,
    Trash2,
    ArrowUp,
    ArrowDown,
    FileDown,
    CheckCircle2,
    Circle
} from 'lucide-react';
import './ImageToPdf.css';

interface ImageFile {
    id: string;
    file: File;
    previewUrl: string;
    isSelected: boolean;
}

interface ImageToPdfProps {
    onBack: () => void;
}

const ImageToPdf: React.FC<ImageToPdfProps> = ({ onBack }) => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                isSelected: true
            }));
            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files)
                .filter(file => file.type.startsWith('image/'))
                .map(file => ({
                    id: crypto.randomUUID(),
                    file,
                    previewUrl: URL.createObjectURL(file),
                    isSelected: true
                }));
            setImages(prev => [...prev, ...newFiles]);
        }
    };

    const removeImage = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setImages(prev => {
            const img = prev.find(i => i.id === id);
            if (img) URL.revokeObjectURL(img.previewUrl);
            return prev.filter(i => i.id !== id);
        });
    };

    const toggleSelection = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setImages(prev => prev.map(img =>
            img.id === id ? { ...img, isSelected: !img.isSelected } : img
        ));
    };

    const moveImage = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newImages = [...images];
        if (direction === 'up' && index > 0) {
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        } else if (direction === 'down' && index < newImages.length - 1) {
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
        }
        setImages(newImages);
    };

    const generatePDF = async () => {
        const selectedImages = images.filter(img => img.isSelected);
        if (selectedImages.length === 0) return;
        setIsGenerating(true);

        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const a4Width = 210;
            const a4Height = 297;

            for (let i = 0; i < selectedImages.length; i++) {
                if (i > 0) doc.addPage();

                const img = selectedImages[i];

                await new Promise<void>((resolve, reject) => {
                    const imageElement = new Image();
                    imageElement.src = img.previewUrl;
                    imageElement.onload = () => {
                        const imgWidth = imageElement.naturalWidth;
                        const imgHeight = imageElement.naturalHeight;

                        const ratio = Math.min(a4Width / imgWidth, a4Height / imgHeight);
                        const drawWidth = imgWidth * ratio;
                        const drawHeight = imgHeight * ratio;

                        const x = (a4Width - drawWidth) / 2;
                        const y = (a4Height - drawHeight) / 2;

                        doc.addImage(img.previewUrl, 'JPEG', x, y, drawWidth, drawHeight);
                        resolve();
                    };
                    imageElement.onerror = reject;
                });
            }

            doc.save('converted-document.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again with different images.');
        } finally {
            setIsGenerating(false);
        }
    };

    const selectedCount = images.filter(img => img.isSelected).length;

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">Image to PDF Converter</h2>
            </header>

            <div className="tool-content">
                <div
                    className={`dropzone ${images.length > 0 ? 'has-content' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        className="hidden-input"
                    />
                    <div className="dropzone-content">
                        <div className="dropzone-icon">
                            <Upload size={32} />
                        </div>
                        <h3>Click or Drag & Drop Images Here</h3>
                        <p>Supported formats: JPG, PNG, WEBP</p>
                    </div>
                </div>

                {images.length > 0 && (
                    <div className="image-preview-section">
                        <h3 className="section-title">
                            Selected: {selectedCount} / {images.length}
                        </h3>
                        <div className="image-grid">
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className={`image-item ${!img.isSelected ? 'unselected' : ''}`}
                                    onClick={(e) => toggleSelection(img.id, e)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className={`image-thumbnail ${!img.isSelected ? 'dimmed' : ''}`}>
                                        <img src={img.previewUrl} alt={`preview ${index}`} />

                                        <div className="selection-badge">
                                            {img.isSelected ? (
                                                <CheckCircle2 className="checked-icon" size={24} />
                                            ) : (
                                                <Circle className="unchecked-icon" size={24} />
                                            )}
                                        </div>

                                        <div className="image-actions">
                                            <button
                                                className="action-btn"
                                                onClick={(e) => moveImage(index, 'up', e)}
                                                disabled={index === 0}
                                            >
                                                <ArrowUp size={16} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => moveImage(index, 'down', e)}
                                                disabled={index === images.length - 1}
                                            >
                                                <ArrowDown size={16} />
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                onClick={(e) => removeImage(img.id, e)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="image-label">Page {index + 1}</div>
                                </div>
                            ))}
                        </div>

                        <div className="action-panel">
                            <button
                                className="generate-btn"
                                onClick={generatePDF}
                                disabled={isGenerating || images.length === 0}
                            >
                                {isGenerating ? (
                                    <span className="loading-spinner"></span>
                                ) : (
                                    <FileDown size={20} />
                                )}
                                {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageToPdf;
