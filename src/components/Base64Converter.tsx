import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowDownUp, Copy, Upload, Download, CheckCircle2 } from 'lucide-react';

interface Base64ConverterProps {
    onBack: () => void;
}

const Base64Converter: React.FC<Base64ConverterProps> = ({ onBack }) => {
    const [mode, setMode] = useState<'text' | 'file'>('text');
    const [action, setAction] = useState<'encode' | 'decode'>('encode');

    // Text states
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [textError, setTextError] = useState('');

    // File states
    const [file, setFile] = useState<File | null>(null);
    const [fileBase64, setFileBase64] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);

    // Text Handlers
    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setInputText(val);
        setTextError('');

        if (!val) {
            setOutputText('');
            return;
        }

        try {
            if (action === 'encode') {
                setOutputText(btoa(encodeURIComponent(val)));
            } else {
                setOutputText(decodeURIComponent(atob(val)));
            }
        } catch {
            setOutputText('');
            setTextError(action === 'encode' ? 'Error encoding text.' : 'Invalid Base64 string.');
        }
    };

    const toggleTextAction = () => {
        setAction(prev => prev === 'encode' ? 'decode' : 'encode');
        setInputText(outputText);

        try {
            if (action === 'encode') { // Switching to decode
                setOutputText(decodeURIComponent(atob(outputText)));
            } else { // Switching to encode
                setOutputText(btoa(encodeURIComponent(outputText)));
            }
            setTextError('');
        } catch {
            setOutputText('');
            setTextError(action === 'encode' ? 'Invalid Base64 string.' : 'Error encoding text.');
        }
    };

    const copyOutput = async (text: string) => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
    };

    // File Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    // Extract just the base64 part, discarding data URL prefix if we just want raw,
                    // but keeping prefix allows easy preview/download. We will keep it.
                    setFileBase64(reader.result);
                }
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const downloadDecodedFile = () => {
        if (!inputText || action !== 'decode') return;

        try {
            // Check if it's a data URL
            let base64String = inputText;
            let mimeType = 'application/octet-stream';

            if (inputText.startsWith('data:')) {
                const parts = inputText.split(',');
                mimeType = parts[0].match(/:(.*?);/)?.[1] || mimeType;
                base64String = parts[1];
            }

            const binaryString = window.atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `decoded_file_${Date.now()}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            setTextError('Invalid Base64 string for file conversion.');
        }
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">Base64 Converter</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    <button
                        onClick={() => setMode('text')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: mode === 'text' ? 'var(--primary)' : 'var(--surface)',
                            color: mode === 'text' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Text Converter
                    </button>
                    <button
                        onClick={() => setMode('file')}
                        style={{
                            padding: '0.75rem 2rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: mode === 'file' ? 'var(--primary)' : 'var(--surface)',
                            color: mode === 'file' ? 'white' : 'var(--text)',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        File Converter
                    </button>
                </div>

                <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    {mode === 'text' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: action === 'encode' ? 'bold' : 'normal', color: action === 'encode' ? 'var(--primary)' : 'var(--text)' }}>
                                    Text
                                </span>
                                <button className="action-btn" onClick={toggleTextAction} style={{ background: 'var(--bg)', borderRadius: '50%' }}>
                                    <ArrowDownUp size={20} style={{ transform: action === 'encode' ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                                </button>
                                <span style={{ fontWeight: action === 'decode' ? 'bold' : 'normal', color: action === 'decode' ? 'var(--primary)' : 'var(--text)' }}>
                                    Base64
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <textarea
                                    value={inputText}
                                    onChange={handleTextChange}
                                    placeholder={action === 'encode' ? "Enter text to encode..." : "Enter Base64 to decode..."}
                                    style={{
                                        width: '100%',
                                        minHeight: '150px',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--text)',
                                        fontFamily: 'monospace',
                                        resize: 'vertical'
                                    }}
                                />
                                {textError && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{textError}</div>}

                                <div style={{ position: 'relative' }}>
                                    <textarea
                                        value={outputText}
                                        readOnly
                                        placeholder={action === 'encode' ? "Base64 output..." : "Decoded text output..."}
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            padding: '1rem',
                                            background: 'rgba(0,0,0,0.4)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--text)',
                                            fontFamily: 'monospace',
                                            resize: 'vertical'
                                        }}
                                    />
                                    {outputText && (
                                        <button
                                            onClick={() => copyOutput(outputText)}
                                            style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: 'var(--surface)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                color: copied ? 'var(--primary)' : 'var(--text)'
                                            }}
                                        >
                                            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        </button>
                                    )}
                                </div>
                                {action === 'decode' && outputText === '' && !textError && inputText && (
                                    <button
                                        onClick={downloadDecodedFile}
                                        className="generate-btn"
                                        style={{ alignSelf: 'center', marginTop: '1rem' }}
                                    >
                                        <Download size={18} style={{ marginRight: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }} />
                                        Download as File
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    width: '100%',
                                    padding: '3rem 2rem',
                                    border: '2px dashed var(--primary)',
                                    borderRadius: '1rem',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    background: 'rgba(56, 189, 248, 0.05)',
                                    transition: 'background 0.3s'
                                }}
                            >
                                <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                                <h3>Click to select a file</h3>
                                <p style={{ color: 'var(--text-muted)' }}>Any file type is supported</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {file && (
                                <div style={{ width: '100%', textAlign: 'left' }}>
                                    <h4 style={{ marginBottom: '0.5rem' }}>Selected File: {file.name} ({(file.size / 1024).toFixed(2)} KB)</h4>
                                    <div style={{ position: 'relative' }}>
                                        <textarea
                                            value={fileBase64}
                                            readOnly
                                            style={{
                                                width: '100%',
                                                height: '200px',
                                                padding: '1rem',
                                                background: 'rgba(0,0,0,0.4)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.5rem',
                                                color: 'var(--text)',
                                                fontFamily: 'monospace',
                                                resize: 'vertical',
                                                wordBreak: 'break-all'
                                            }}
                                        />
                                        <button
                                            onClick={() => copyOutput(fileBase64)}
                                            style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                right: '1rem',
                                                background: 'var(--surface)',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                color: copied ? 'var(--primary)' : 'var(--text)'
                                            }}
                                        >
                                            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Base64Converter;
