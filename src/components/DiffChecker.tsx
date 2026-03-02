import React, { useState } from 'react';
import { ArrowLeft, ArrowRightLeft } from 'lucide-react';
import { diff_match_patch } from 'diff-match-patch';

interface DiffCheckerProps {
    onBack: () => void;
}

const DiffChecker: React.FC<DiffCheckerProps> = ({ onBack }) => {
    const [original, setOriginal] = useState('');
    const [modified, setModified] = useState('');
    const [diffs, setDiffs] = useState<[number, string][]>([]);

    const compareTexts = () => {
        const dmp = new diff_match_patch();
        const diff = dmp.diff_main(original, modified);
        dmp.diff_cleanupSemantic(diff);
        setDiffs(diff);
    };

    const swapTexts = () => {
        setOriginal(modified);
        setModified(original);
        setDiffs([]);
    };

    const clearTexts = () => {
        setOriginal('');
        setModified('');
        setDiffs([]);
    };

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">Text Diff Checker</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
                <div style={{ display: 'flex', gap: '1rem', height: '50%' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Original Text</h3>
                        <textarea
                            value={original}
                            onChange={(e) => {
                                setOriginal(e.target.value);
                                setDiffs([]);
                            }}
                            placeholder="Paste original text here..."
                            style={{
                                flex: 1,
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

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                        <button className="action-btn" onClick={swapTexts} title="Swap texts" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                            <ArrowRightLeft size={20} />
                        </button>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Modified Text</h3>
                        <textarea
                            value={modified}
                            onChange={(e) => {
                                setModified(e.target.value);
                                setDiffs([]);
                            }}
                            placeholder="Paste modified text here..."
                            style={{
                                flex: 1,
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
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0' }}>
                    <button className="action-btn" onClick={clearTexts} style={{ padding: '0.5rem 2rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                        Clear
                    </button>
                    <button className="generate-btn" onClick={compareTexts} disabled={!original && !modified} style={{ padding: '0.5rem 3rem' }}>
                        Compare Differences
                    </button>
                </div>

                {diffs.length > 0 && (
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        color: 'var(--text)',
                        fontFamily: 'monospace',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        lineHeight: 1.5
                    }}>
                        <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Comparison Result</h3>
                        {diffs.map((part, index) => {
                            const [operation, text] = part;
                            let color = 'inherit';
                            let background = 'transparent';
                            let textDecoration = 'none';

                            if (operation === 1) { // Added
                                color = '#10b981';
                                background = 'rgba(16, 185, 129, 0.2)';
                            } else if (operation === -1) { // Removed
                                color = '#ef4444';
                                background = 'rgba(239, 68, 68, 0.2)';
                                textDecoration = 'line-through';
                            }

                            return (
                                <span key={index} style={{ color, background, textDecoration, padding: '0 2px', borderRadius: '2px' }}>
                                    {text}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiffChecker;
