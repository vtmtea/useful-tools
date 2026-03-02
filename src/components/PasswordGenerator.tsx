import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PasswordGeneratorProps {
    onBack: () => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onBack }) => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [useUppercase, setUseUppercase] = useState(true);
    const [useLowercase, setUseLowercase] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const symbolChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let validChars = '';
        if (useUppercase) validChars += uppercaseChars;
        if (useLowercase) validChars += lowercaseChars;
        if (useNumbers) validChars += numberChars;
        if (useSymbols) validChars += symbolChars;

        if (validChars === '') {
            setPassword('');
            return;
        }

        let generatedPassword = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * validChars.length);
            generatedPassword += validChars[randomIndex];
        }

        setPassword(generatedPassword);
        setCopied(false);
    };

    useEffect(() => {
        generatePassword();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

    const copyToClipboard = async () => {
        if (!password) return;
        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy password:', err);
        }
    };

    const calculateStrength = () => {
        if (!password) return 0;
        let score = 0;
        if (password.length > 8) score += 1;
        if (password.length > 12) score += 1;
        if (useUppercase && useLowercase) score += 1;
        if (useNumbers) score += 1;
        if (useSymbols) score += 1;
        return score;
    };

    const strength = calculateStrength();
    const strengthLabel = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength === 0 ? 0 : strength - 1] || 'None';
    const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'];
    const strengthColor = strength === 0 ? '#333' : strengthColors[strength - 1];

    return (
        <div className="tool-view">
            <header className="tool-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                    <span>Back to Tools</span>
                </button>
                <h2 className="tool-view-title">Password Generator</h2>
            </header>

            <div className="tool-content" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
                <div style={{
                    background: 'var(--surface)', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--border)'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            fontSize: '1.5rem', fontWeight: '500', letterSpacing: '2px', wordBreak: 'break-all', fontFamily: 'monospace', color: 'var(--text)'
                        }}>
                            {password || 'Select options to generate'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                            <button className="action-btn" onClick={copyToClipboard} title="Copy" style={{ background: 'var(--surface)', color: copied ? 'var(--primary)' : 'var(--text)' }}>
                                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                            </button>
                            <button className="action-btn" onClick={generatePassword} title="Regenerate" style={{ background: 'var(--surface)' }}>
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Password Strength</span>
                            <span style={{ color: strengthColor, fontWeight: '500' }}>{strengthLabel}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', height: '8px' }}>
                            {[1, 2, 3, 4, 5].map(level => (
                                <div key={level} style={{
                                    flex: 1,
                                    borderRadius: '4px',
                                    background: level <= strength ? strengthColor : 'rgba(255,255,255,0.1)',
                                    transition: 'background 0.3s ease'
                                }} />
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <label style={{ color: 'var(--text)' }}>Password Length</label>
                            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{length}</span>
                        </div>
                        <input
                            type="range"
                            min="4"
                            max="64"
                            value={length}
                            onChange={(e) => setLength(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                accentColor: 'var(--primary)'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={useUppercase}
                                onChange={(e) => setUseUppercase(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ color: 'var(--text)', fontSize: '1.1rem' }}>Include Uppercase Letters</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={useLowercase}
                                onChange={(e) => setUseLowercase(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ color: 'var(--text)', fontSize: '1.1rem' }}>Include Lowercase Letters</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={useNumbers}
                                onChange={(e) => setUseNumbers(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ color: 'var(--text)', fontSize: '1.1rem' }}>Include Numbers</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={useSymbols}
                                onChange={(e) => setUseSymbols(e.target.checked)}
                                style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ color: 'var(--text)', fontSize: '1.1rem' }}>Include Symbols</span>
                        </label>
                    </div>

                    <button
                        className="generate-btn"
                        onClick={generatePassword}
                        style={{ width: '100%', marginTop: '2rem' }}
                    >
                        Generate New Password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordGenerator;
