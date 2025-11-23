import React from 'react';
import { Modal } from './UI';
import { Sparkles, Check, Zap } from 'lucide-react';

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
}

export const ChangelogModal: React.FC<Props> = ({ isOpen, onClose, entries, t }) => {
    const latest = entries[0];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t.UPDATES.WHATS_NEW}>
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-lexi-fuchsia to-purple-600 rounded-full flex items-center justify-center border-2 border-white/20 shadow-[0_0_30px_rgba(217,70,239,0.4)] mb-4">
                        <Sparkles size={40} className="text-white animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase mb-1">LexiMix {latest?.version}</h2>
                    <p className="text-lexi-fuchsia font-bold text-sm tracking-widest uppercase">{t.UPDATES.NOTES}</p>
                </div>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                    {entries.map((entry, index) => (
                        <div key={entry.version} className={`p-4 rounded-2xl border ${index === 0 ? 'bg-white/10 border-lexi-fuchsia/50' : 'bg-black/20 border-white/5'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <span className={`font-bold ${index === 0 ? 'text-white' : 'text-gray-400'}`}>v{entry.version}</span>
                                <span className="text-xs text-gray-500">{entry.date}</span>
                            </div>
                            <ul className="space-y-2">
                                {entry.changes.map((change, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                        <div className="mt-1 w-4 h-4 flex-shrink-0 rounded-full bg-lexi-fuchsia/20 flex items-center justify-center">
                                            <Check size={10} className="text-lexi-fuchsia" />
                                        </div>
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-4 bg-white text-black font-black uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <Zap size={20} className="text-lexi-fuchsia fill-current" />
                    {t.UPDATES.COOL}
                </button>
            </div>
        </Modal>
    );
};
