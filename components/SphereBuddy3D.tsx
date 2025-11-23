import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Sparkles, Stars, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { BuddyState } from '../types';
import { Heart, Zap, Utensils, Play, Sparkles as SparklesIcon } from 'lucide-react';
import { audio } from '../utils/audio';

interface Props {
    buddy: BuddyState;
    onUpdate: (newBuddy: BuddyState) => void;
    onPlay: () => void;
    onBack?: () => void;
}

interface Riddle {
    question: string;
    answer: string; // simple string match for now
    options?: string[]; // optional multiple choice
    reward: { xp: number; coins: number };
}

const RIDDLES: Riddle[] = [
    { question: "Was hat Zähne, beißt aber nicht?", answer: "kamm", reward: { xp: 50, coins: 20 } },
    { question: "Was wird nass, wenn es trocknet?", answer: "handtuch", reward: { xp: 50, coins: 20 } },
    { question: "Je mehr man wegnimmt, desto größer wird es.", answer: "loch", reward: { xp: 60, coins: 25 } },
    { question: "Was hat ein Auge, kann aber nicht sehen?", answer: "nadel", reward: { xp: 40, coins: 15 } },
    { question: "Was läuft ohne Beine?", answer: "wasser", reward: { xp: 40, coins: 15 } },
    { question: "Was gehört dir, aber andere benutzen es öfter als du?", answer: "name", reward: { xp: 70, coins: 30 } }
];

const BuddyMesh = ({ buddy, animationType }: { buddy: BuddyState; animationType: string }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Idle rotation
            meshRef.current.rotation.y += 0.01;

            // Animation reactions
            if (animationType === 'happy') {
                meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.2;
                meshRef.current.scale.setScalar(1.2 + Math.sin(state.clock.elapsedTime * 20) * 0.1);
            } else if (animationType === 'eating') {
                meshRef.current.scale.setScalar(1 + Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.2);
            } else {
                const scale = hovered ? 1.1 : 1;
                meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
            }
        }
    });

    const getColor = () => {
        if (buddy.skin === 'gold') return '#FDB931';
        if (buddy.skin === 'neon') return '#ff00ff';
        if (buddy.hunger < 30) return '#ef4444'; // Red when hungry
        return '#22d3ee'; // Default Cyan
    };

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <Sphere ref={meshRef} args={[1, 64, 64]} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
                <MeshDistortMaterial
                    color={getColor()}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>

            {/* Eyes (Simple Spheres for now) */}
            <group position={[0, 0.2, 0.85]}>
                <mesh position={[-0.3, 0, 0]}>
                    <sphereGeometry args={[0.1, 32, 32]} />
                    <meshStandardMaterial color="black" />
                </mesh>
                <mesh position={[0.3, 0, 0]}>
                    <sphereGeometry args={[0.1, 32, 32]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            </group>

            {/* Mouth (Dynamic based on mood) */}
            {buddy.mood < 50 ? (
                <mesh position={[0, -0.2, 0.85]} rotation={[0, 0, Math.PI]}>
                    <torusGeometry args={[0.1, 0.02, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            ) : (
                <mesh position={[0, -0.2, 0.85]}>
                    <torusGeometry args={[0.1, 0.02, 16, 32, Math.PI]} />
                    <meshStandardMaterial color="black" />
                </mesh>
            )}
        </Float>
    );
};

export const SphereBuddy3D: React.FC<Props> = ({ buddy, onUpdate, onPlay, onBack }) => {
    const [animationType, setAnimationType] = useState<'idle' | 'happy' | 'eating' | 'sleeping'>('idle');
    const [message, setMessage] = useState<string>("");
    const [showCustomize, setShowCustomize] = useState(false);

    // Quest State
    const [activeQuest, setActiveQuest] = useState<Riddle | null>(null);
    const [questInput, setQuestInput] = useState("");
    const [showQuestModal, setShowQuestModal] = useState(false);

    // Random Quest Trigger
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% chance every 10 seconds if no quest active and idle
            if (!activeQuest && animationType === 'idle' && Math.random() < 0.1) {
                const randomRiddle = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
                setActiveQuest(randomRiddle);
                setMessage("Ich habe ein Rätsel für dich! 💡");
                audio.playClick(); // Sound cue
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [activeQuest, animationType]);

    // Decay logic
    useEffect(() => {
        const now = Date.now();
        const timeDiff = now - buddy.lastInteraction;
        const hoursPassed = timeDiff / (1000 * 60 * 60);
        if (hoursPassed > 1) {
            const decay = Math.floor(hoursPassed * 5);
            const newBuddy = {
                ...buddy,
                hunger: Math.max(0, buddy.hunger - decay),
                energy: Math.max(0, buddy.energy - decay),
                mood: Math.max(0, buddy.mood - decay),
                lastInteraction: now
            };
            onUpdate(newBuddy);
        }
    }, []);

    const handleInteract = (type: 'pet' | 'feed' | 'sleep') => {
        if (animationType !== 'idle') return;

        audio.playClick();
        let newBuddy = { ...buddy, lastInteraction: Date.now() };
        let msg = "";

        if (type === 'pet') {
            setAnimationType('happy');
            newBuddy.mood = Math.min(100, newBuddy.mood + 15);
            newBuddy.xp += 10;
            msg = "So happy! 💕";
        } else if (type === 'feed') {
            setAnimationType('eating');
            newBuddy.hunger = Math.min(100, newBuddy.hunger + 20);
            newBuddy.energy = Math.min(100, newBuddy.energy + 5);
            newBuddy.xp += 5;
            msg = "Yummy! 🍎";
        } else if (type === 'sleep') {
            setAnimationType('sleeping');
            newBuddy.energy = Math.min(100, newBuddy.energy + 30);
            msg = "Zzz...";
        }

        if (newBuddy.xp >= newBuddy.level * 100) {
            newBuddy.level += 1;
            newBuddy.xp = 0;
            msg = `Level Up! ${newBuddy.level} 🎉`;
            audio.playWin();
        }

        setMessage(msg);
        onUpdate(newBuddy);

        setTimeout(() => {
            setAnimationType('idle');
            setMessage("");
        }, 2000);
    };

    const submitQuest = () => {
        if (!activeQuest) return;

        if (questInput.toLowerCase().trim() === activeQuest.answer) {
            // Correct
            audio.playWin();
            setMessage(`Richtig! +${activeQuest.reward.xp} XP`);
            setAnimationType('happy');

            const newBuddy = {
                ...buddy,
                xp: buddy.xp + activeQuest.reward.xp,
                mood: Math.min(100, buddy.mood + 20)
            };
            // Level up check
            if (newBuddy.xp >= newBuddy.level * 100) {
                newBuddy.level += 1;
                newBuddy.xp = 0;
                setMessage(`Richtig! & LEVEL UP! 🎉`);
            }

            onUpdate(newBuddy);
            setActiveQuest(null);
            setShowQuestModal(false);
            setQuestInput("");
        } else {
            // Wrong
            audio.playWrong();
            setMessage("Das war leider falsch...");
            setAnimationType('eating'); // Just a reaction
            setTimeout(() => setMessage(""), 2000);
        }
    };

    const SKINS = [
        { id: 'default', name: 'Cyan Core', color: '#22d3ee' },
        { id: 'gold', name: 'Golden Sun', color: '#FDB931' },
        { id: 'neon', name: 'Neon Pulse', color: '#ff00ff' },
        { id: 'obsidian', name: 'Obsidian', color: '#1f2937' },
        { id: 'ruby', name: 'Ruby Red', color: '#ef4444' }
    ];

    const BACKGROUNDS = [
        { id: 'default', name: 'Deep Space', class: 'bg-gradient-to-b from-indigo-900/20 to-purple-900/20' },
        { id: 'sunset', name: 'Cyber Sunset', class: 'bg-gradient-to-b from-orange-500/20 to-purple-900/20' },
        { id: 'forest', name: 'Digital Forest', class: 'bg-gradient-to-b from-green-900/20 to-emerald-900/20' }
    ];

    const currentBg = BACKGROUNDS.find(b => b.id === (buddy.selectedBackground || 'default'))?.class || BACKGROUNDS[0].class;

    return (
        <div className="w-full max-w-md mx-auto bg-[#0f0518]/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.2)] animate-fade-in relative overflow-hidden flex flex-col h-full">

            {/* Header Stats */}
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                                <Play className="rotate-180 w-4 h-4 text-gray-400" fill="currentColor" />
                            </button>
                        )}
                        <h3 className="text-white font-black text-xl tracking-wider drop-shadow-md">{buddy.name}</h3>
                    </div>
                    <span className="text-xs text-cyan-400 font-bold ml-6">Lvl {buddy.level}</span>
                </div>
                <div className="flex gap-2 items-center">
                    <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] text-gray-300 font-bold"><span>HUNGER</span><span>{buddy.hunger}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10"><div className={`h-full transition-all duration-500 ${buddy.hunger < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${buddy.hunger}%` }}></div></div>

                        <div className="flex justify-between text-[10px] text-gray-300 font-bold"><span>ENERGY</span><span>{buddy.energy}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10"><div className={`h-full transition-all duration-500 ${buddy.energy < 30 ? 'bg-red-500' : 'bg-yellow-400'}`} style={{ width: `${buddy.energy}%` }}></div></div>

                        <div className="flex justify-between text-[10px] text-gray-300 font-bold"><span>MOOD</span><span>{buddy.mood}%</span></div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10"><div className={`h-full transition-all duration-500 ${buddy.mood < 30 ? 'bg-red-500' : 'bg-pink-500'}`} style={{ width: `${buddy.mood}%` }}></div></div>
                    </div>
                    <button onClick={() => setShowCustomize(!showCustomize)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <SparklesIcon size={16} className="text-yellow-400" />
                    </button>
                </div>
            </div>

            {/* Customization Panel */}
            {showCustomize && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md p-6 flex flex-col animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">Customize Sphere</h3>
                        <button onClick={() => setShowCustomize(false)} className="text-gray-400 hover:text-white">Close</button>
                    </div>

                    <div className="space-y-4 overflow-y-auto">
                        <div>
                            <h4 className="text-xs text-gray-400 uppercase font-bold mb-2">Skins</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {SKINS.map(skin => (
                                    <button
                                        key={skin.id}
                                        onClick={() => onUpdate({ ...buddy, skin: skin.id })}
                                        className={`p-2 rounded-lg border ${buddy.skin === skin.id ? 'border-yellow-400 bg-white/10' : 'border-white/10 hover:bg-white/5'} flex flex-col items-center gap-1`}
                                    >
                                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: skin.color }}></div>
                                        <span className="text-[10px] text-gray-300">{skin.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs text-gray-400 uppercase font-bold mb-2">Backgrounds</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {BACKGROUNDS.map(bg => (
                                    <button
                                        key={bg.id}
                                        onClick={() => onUpdate({ ...buddy, selectedBackground: bg.id })}
                                        className={`p-2 rounded-lg border ${buddy.selectedBackground === bg.id ? 'border-yellow-400 bg-white/10' : 'border-white/10 hover:bg-white/5'} text-left`}
                                    >
                                        <span className="text-xs text-gray-300 font-bold">{bg.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quest Modal */}
            {showQuestModal && activeQuest && (
                <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md p-6 flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-[#1e102e] border border-purple-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-center text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">RÄTSELZEIT!</h3>
                        <p className="text-white text-center mb-6 font-medium">{activeQuest.question}</p>

                        <input
                            type="text"
                            value={questInput}
                            onChange={(e) => setQuestInput(e.target.value)}
                            placeholder="Antwort..."
                            className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white mb-4 focus:border-purple-500 outline-none"
                        />

                        <div className="flex gap-2">
                            <button onClick={() => setShowQuestModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5">Später</button>
                            <button onClick={submitQuest} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-xl font-bold text-white hover:brightness-110 shadow-lg">Lösen</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3D Canvas */}
            <div className={`relative flex-1 w-full mb-6 rounded-2xl overflow-hidden ${currentBg} border border-white/5 transition-colors duration-500`}>
                {message && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-bounce bg-white/90 backdrop-blur text-black px-4 py-2 rounded-xl font-black shadow-lg z-20 whitespace-nowrap pointer-events-none">
                        {message}
                    </div>
                )}

                {/* Active Quest Indicator */}
                {activeQuest && !showQuestModal && (
                    <button
                        onClick={() => setShowQuestModal(true)}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-bounce bg-yellow-400 text-black px-4 py-2 rounded-full font-black shadow-[0_0_20px_rgba(250,204,21,0.6)] hover:scale-110 transition-transform border-2 border-white"
                    >
                        ? RÄTSEL LÖSEN ?
                    </button>
                )}

                <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                    {/* Enhanced Lighting */}
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} color="purple" intensity={0.8} />
                    <spotLight position={[0, 10, 0]} intensity={1} angle={0.5} penumbra={1} />

                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <Sparkles count={50} scale={3} size={2} speed={0.4} opacity={0.5} color={buddy.skin === 'neon' ? '#ff00ff' : '#22d3ee'} />

                    <BuddyMesh buddy={buddy} animationType={animationType} />
                </Canvas>

                {/* Interaction Overlay */}
                <div
                    className="absolute inset-0 cursor-pointer z-10"
                    onClick={() => handleInteract('pet')}
                    title="Tap to Pet"
                ></div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-3 relative z-10 mt-auto">
                <button
                    onClick={() => handleInteract('feed')}
                    disabled={animationType !== 'idle'}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50 border border-white/5"
                >
                    <Utensils size={20} className="text-orange-400" />
                    <span className="text-[10px] font-bold text-gray-300">Füttern</span>
                </button>

                <button
                    onClick={() => handleInteract('pet')}
                    disabled={animationType !== 'idle'}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50 border border-white/5"
                >
                    <Heart size={20} className="text-pink-400" />
                    <span className="text-[10px] font-bold text-gray-300">Liebe</span>
                </button>

                <button
                    onClick={() => handleInteract('sleep')}
                    disabled={animationType !== 'idle'}
                    className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors active:scale-95 disabled:opacity-50 border border-white/5"
                >
                    <Zap size={20} className="text-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-300">Schlafen</span>
                </button>

                <button
                    onClick={onPlay}
                    className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl hover:brightness-110 transition-all active:scale-95 shadow-lg border border-white/20"
                >
                    <Play size={20} className="text-white" fill="currentColor" />
                    <span className="text-[10px] font-bold text-white">SPIELEN</span>
                </button>
            </div>

        </div>
    );
};
