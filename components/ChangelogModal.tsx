import React from 'react';
import { Modal } from './UI';
import { Sparkles, Check, Zap, Download, Star, Rocket, Gift } from 'lucide-react';

export interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    entries: ChangelogEntry[];
    t: any;
    downloadUrl?: string;
    currentVersion?: string;
    latestVersion?: string;
    onDownload?: () => void;
}

// Rotating colors for entries
const entryColors = [
    '#06FFA5', // Green
    '#FF006E', // Pink
    '#FFBE0B', // Yellow
    '#8338EC', // Purple
    '#0096FF', // Blue
    '#FF7F00', // Orange
];

// Icons for changes
const changeIcons = [Star, Sparkles, Rocket, Gift, Check, Zap];

export const ChangelogModal: React.FC<Props> = ({
    isOpen,
    onClose,
    entries,
    t,
    downloadUrl,
    currentVersion,
    latestVersion,
    onDownload
}) => {
    const latest = entries[0];
    const isCapacitor = (window as any).Capacitor !== undefined;
    const needsUpdate = currentVersion && latestVersion && currentVersion !== latestVersion;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.UPDATES.WHATS_NEW}>
            <div className="space-y-5">
                {/* Header - Colorful */}
                <div className="text-center">
                    <div 
                        className="w-16 h-16 mx-auto flex items-center justify-center mb-3"
                        style={{ 
                            background: '#8338EC', 
                            border: '3px solid #000',
                            boxShadow: '4px 4px 0px #000',
                            transform: 'rotate(-3deg)'
                        }}
                    >
                        <Sparkles size={32} style={{ color: '#FFF' }} />
                    </div>
                    <h2 className="text-xl font-black uppercase mb-1" style={{ color: '#000', transform: 'skewX(-2deg)' }}>
                        LexiMix {latest?.version}
                    </h2>
                    <p className="font-black text-xs tracking-widest uppercase" style={{ color: '#8338EC' }}>{t.UPDATES.NOTES}</p>
                </div>

                {/* Changelog Entries - Colorful Cards */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1">
                    {entries.map((entry, index) => {
                        const color = entryColors[index % entryColors.length];
                        const isFirst = index === 0;
                        
                        return (
                            <div 
                                key={entry.version} 
                                className="p-4 relative overflow-hidden"
                                style={{ 
                                    background: 'var(--color-surface)',
                                    border: '3px solid #000',
                                    boxShadow: isFirst ? '6px 6px 0px #000' : '4px 4px 0px #999',
                                    transform: isFirst ? 'scale(1.02)' : 'scale(1)'
                                }}
                            >
                                {/* Colored Header Bar */}
                                <div 
                                    className="absolute top-0 left-0 right-0 h-1.5 border-b-2 border-black"
                                    style={{ background: color }}
                                ></div>
                                
                                {/* Decorative element */}
                                {isFirst && (
                                    <div className="absolute top-3 right-3 opacity-20">
                                        <Sparkles size={24} style={{ color: '#000' }} />
                                    </div>
                                )}
                                
                                <div className="flex justify-between items-center mb-3 mt-2">
                                    <span 
                                        className="font-black text-sm px-2 py-0.5 border-2 border-black"
                                        style={{ 
                                            background: color, 
                                            color: '#000',
                                            transform: 'skewX(-5deg)'
                                        }}
                                    >
                                        v{entry.version}
                                    </span>
                                    <span className="text-xs font-black uppercase" style={{ color: '#666' }}>{entry.date}</span>
                                </div>
                                
                                <ul className="space-y-2">
                                    {entry.changes.map((change, i) => {
                                        const IconComponent = changeIcons[i % changeIcons.length];
                                        const iconColor = entryColors[(index + i) % entryColors.length];
                                        
                                        return (
                                            <li key={i} className="flex items-start gap-3 text-sm">
                                                <div 
                                                    className="mt-0.5 w-6 h-6 flex-shrink-0 flex items-center justify-center border-2 border-black"
                                                    style={{ 
                                                        background: iconColor,
                                                        color: '#000'
                                                    }}
                                                >
                                                    <IconComponent size={14} strokeWidth={3} />
                                                </div>
                                                <span className="font-bold leading-tight" style={{ color: '#000' }}>{change}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Download Button */}
                {needsUpdate && isCapacitor && downloadUrl && onDownload && (
                    <button
                        onClick={onDownload}
                        className="w-full py-3 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all active:translate-y-1"
                        style={{ 
                            background: '#06FFA5', 
                            color: '#000', 
                            border: '3px solid #000',
                            boxShadow: '4px 4px 0px #000'
                        }}
                    >
                        <Download size={18} />
                        {t.UPDATES.DOWNLOAD}
                    </button>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full py-3 font-black uppercase text-sm flex items-center justify-center gap-2 transition-all active:translate-y-1"
                    style={{ 
                        background: '#8338EC', 
                        color: '#FFF', 
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0px #000'
                    }}
                >
                    <Zap size={18} />
                    {t.UPDATES.COOL}
                </button>
            </div>
        </Modal>
    );
};
