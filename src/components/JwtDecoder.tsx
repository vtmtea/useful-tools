import React, { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface JwtDecoderProps {
    onBack: () => void;
}

const JwtDecoder: React.FC<JwtDecoderProps> = ({ onBack }) => {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [error, setError] = useState<string | null>(null);

    const decodeToken = (jwtStr: string) => {
        setToken(jwtStr);

        if (!jwtStr.trim()) {
            setHeader('');
            setPayload('');
            setError(null);
            return;
        }

        const parts = jwtStr.split('.');
        if (parts.length !== 3) {
            setError('Invalid JWT structure. A JWT must consist of 3 parts separated by dots.');
            setHeader('');
            setPayload('');
            return;
        }

        try {
            const decodedHeader = decodeURIComponent(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedPayload = decodeURIComponent(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            setHeader(JSON.stringify(JSON.parse(decodedHeader), null, 4));
            setPayload(JSON.stringify(JSON.parse(decodedPayload), null, 4));
            setError(null);
        } catch {
            setError('Failed to decode JWT base64 segments. Ensure it is a valid token.');
        }
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">JWT Decoder</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                    Decode JSON Web Tokens locally in your browser. Tokens are never sent to any server.
                </p>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Encoded JWT String</h3>
                    <textarea
                        value={token}
                        onChange={(e) => decodeToken(e.target.value)}
                        placeholder="Paste your eyJ... here..."
                        style={{
                            width: '100%',
                            height: '150px',
                            minHeight: '150px',
                            padding: '1rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--primary)',
                            fontFamily: 'monospace',
                            resize: 'vertical',
                            wordBreak: 'break-all'
                        }}
                    />
                </div>

                {error ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '0.5rem' }}>
                        <AlertCircle size={20} /> {error}
                    </div>
                ) : (
                    token && (
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Header <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Algorithm & Token Type)</span>
                                </h3>
                                <pre style={{
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text)',
                                    overflowX: 'auto',
                                    fontFamily: 'monospace',
                                    minHeight: '150px'
                                }}>
                                    {header}
                                </pre>
                            </div>

                            <div style={{ flex: 2, minWidth: '400px' }}>
                                <h3 style={{ marginBottom: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Payload <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(Data)</span>
                                </h3>
                                <pre style={{
                                    padding: '1rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: '0.5rem',
                                    color: 'var(--text)',
                                    overflowX: 'auto',
                                    fontFamily: 'monospace',
                                    minHeight: '300px'
                                }}>
                                    {payload}
                                </pre>
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default JwtDecoder;
