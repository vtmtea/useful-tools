import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface JsonFormatterProps {
    onBack: () => void;
}

const JsonFormatter: React.FC<JsonFormatterProps> = ({ onBack }) => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const formatJson = () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 4));
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    const minifyJson = () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (e) {
            setError((e as Error).message);
        }
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">JSON Formatter</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem', height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Input JSON</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="action-btn" onClick={formatJson} style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                Format
                            </button>
                            <button className="action-btn" onClick={minifyJson} style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                Minify
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError(null);
                        }}
                        placeholder="Paste your JSON here..."
                        style={{
                            flex: 1,
                            width: '100%',
                            padding: '1rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                            color: 'var(--text)',
                            fontFamily: 'monospace',
                            resize: 'none'
                        }}
                    />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Output / Validation
                            {output && !error && <CheckCircle2 size={18} color="#10b981" />}
                            {error && <AlertCircle size={18} color="#ef4444" />}
                        </h3>
                        {output && !error && (
                            <button className="action-btn" onClick={() => navigator.clipboard.writeText(output)} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                                Copy
                            </button>
                        )}
                    </div>

                    {error ? (
                        <div style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            borderRadius: '0.5rem',
                            color: '#ef4444',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto'
                        }}>
                            <strong>Invalid JSON:</strong>
                            <br /><br />
                            {error}
                        </div>
                    ) : (
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Formatted output will appear here..."
                            style={{
                                flex: 1,
                                width: '100%',
                                padding: '1rem',
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.5rem',
                                color: 'var(--primary)',
                                fontFamily: 'monospace',
                                resize: 'none'
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default JsonFormatter;
