import React, { useState } from 'react';
import { ArrowLeft, ArrowDownUp } from 'lucide-react';

interface UrlEncoderProps {
    onBack: () => void;
}

const UrlEncoder: React.FC<UrlEncoderProps> = ({ onBack }) => {
    const [action, setAction] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const processText = (text: string, currentAction: 'encode' | 'decode') => {
        setInput(text);

        if (!text) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            if (currentAction === 'encode') {
                setOutput(encodeURIComponent(text));
            } else {
                setOutput(decodeURIComponent(text));
            }
            setError(null);
        } catch {
            setOutput('');
            setError(currentAction === 'encode' ? 'Error encoding URL.' : 'Invalid URL-encoded string.');
        }
    };

    const toggleAction = () => {
        const newAction = action === 'encode' ? 'decode' : 'encode';
        setAction(newAction);
        processText(output, newAction); // Swap input to output and process again
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">URL Encoder/Decoder</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    Quickly encode special characters into percent-encoding (%20) or decode them back to standard text.
                </p>

                <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: action === 'encode' ? 'bold' : 'normal', color: action === 'encode' ? 'var(--primary)' : 'var(--text)' }}>
                                Text
                            </span>
                            <button className="action-btn" onClick={toggleAction} style={{ background: 'var(--bg)', borderRadius: '50%' }}>
                                <ArrowDownUp size={20} style={{ transform: action === 'encode' ? 'rotate(90deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                            </button>
                            <span style={{ fontWeight: action === 'decode' ? 'bold' : 'normal', color: action === 'decode' ? 'var(--primary)' : 'var(--text)' }}>
                                Encoded URL
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <textarea
                                value={input}
                                onChange={(e) => processText(e.target.value, action)}
                                placeholder={action === 'encode' ? "Enter URL or text to encode..." : "Enter encoded URL to decode..."}
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

                            {error && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</div>}

                            <textarea
                                value={output}
                                readOnly
                                placeholder="Output will appear here..."
                                style={{
                                    width: '100%',
                                    minHeight: '150px',
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.4)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--primary)',
                                    fontFamily: 'monospace',
                                    resize: 'vertical'
                                }}
                            />

                            {output && (
                                <button className="action-btn" onClick={() => navigator.clipboard.writeText(output)} style={{ alignSelf: 'flex-end', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem', color: 'var(--text)' }}>
                                    Copy Result
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UrlEncoder;
