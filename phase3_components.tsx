// PHASE 3: HOME SCREEN BRUTAL REDESIGN
// This file contains new component designs for the home screen

// NEW HEADER COMPONENT
const BrutalHeader = ({ user, setView, t }: any) => (
    <div className="relative w-full p-4 bg-brutal-cream" style={{ borderBottom: '6px solid #000' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo - Skewed Left */}
            <div className="transform skew-x-[-8deg] bg-brutal-pink border-brutal shadow-brutal px-6 py-3">
                <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                    LEXIMIX
                </h1>
            </div>

            {/* Stats Row - Right Side */}
            <div className="flex items-center gap-4">
                {/* Coins in Yellow Box */}
                <div className="bg-brutal-yellow border-brutal shadow-brutal p-3 flex items-center gap-2 transform skew-x-[5deg] hover:scale-110 transition-all duration-100 cursor-pointer">
                    <div className="w-10 h-10 bg-brutal-orange border-brutal flex items-center justify-center">
                        <IoWalletSharp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-brutal-black">{user.coins}</span>
                </div>

                {/* XP in Orange Box */}
                <div className="bg-brutal-orange border-brutal shadow-brutal p-3 flex items-center gap-2 transform skew-x-[-5deg] hover:scale-110 transition-all duration-100">
                    <div className="w-10 h-10 bg-brutal-purple border-brutal flex items-center justify-center">
                        <IoStarSharp size={24} className="text-white" />
                    </div>
                    <span className="text-2xl font-black text-white">{user.xp}</span>
                </div>

                {/* Profile in Purple Box */}
                <button
                    onClick={() => setView('PROFILE')}
                    className="bg-brutal-purple border-brutal shadow-brutal p-3 transform skew-x-[5deg] hover:shadow-brutal-lg hover:translate-y-[-4px] transition-all duration-100"
                >
                    <div className="w-10 h-10 bg-brutal-pink border-brutal flex items-center justify-center">
                        <IoPersonSharp size={24} className="text-white" />
                    </div>
                </button>

                {/* Shop Button */}
                <button
                    onClick={() => setView('SHOP')}
                    className="bg-brutal-green border-brutal shadow-brutal p-3 transform skew-x-[-5deg] hover:shadow-brutal-lg hover:translate-y-[-4px] transition-all duration-100"
                >
                    <div className="w-10 h-10 bg-brutal-black border-brutal flex items-center justify-center">
                        <IoStorefrontSharp size={24} className="text-brutal-green" />
                    </div>
                </button>
            </div>
        </div>
    </div>
);

// MODE SLIDER COMPONENT
const BrutalModeSlider = ({ modes, currentIndex, onSelect, t }: any) => {
    const colors = ['brutal-pink', 'brutal-orange', 'brutal-purple', 'brutal-yellow'];
    const iconBgColors = ['brutal-yellow', 'brutal-pink', 'brutal-orange', 'brutal-purple'];

    return (
        <div className="relative w-full p-8">
            {/* Mode Cards Container */}
            <div className="overflow-x-auto hide-scrollbar">
                <div className="flex gap-6 pb-4">
                    {modes.map((mode: any, index: number) => {
                        const isActive = index === currentIndex;
                        const colorClass = colors[index % colors.length];
                        const iconBgClass = iconBgColors[index % iconBgColors.length];

                        return (
                            <div
                                key={mode.id}
                                className={`
                  min-w-[320px] bg-white border-brutal-thick shadow-brutal p-6 
                  transform transition-all duration-100 cursor-pointer relative
                  ${isActive ? 'scale-110 shadow-brutal-lg -translate-y-4' : 'scale-100 hover:scale-105'}
                  ${index % 2 === 0 ? 'skew-x-[-3deg]' : 'skew-x-[3deg]'}
                `}
                                onClick={() => onSelect(index)}
                            >
                                {/* Rainbow Stripe */}
                                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brutal-pink via-brutal-orange to-brutal-purple"></div>

                                {/* Icon in Colored Box */}
                                <div className={`w-20 h-20 mx-auto bg-${iconBgClass} border-brutal shadow-brutal flex items-center justify-center mt-4 transform ${index % 2 === 0 ? 'skew-x-[8deg]' : 'skew-x-[-8deg]'}`}>
                                    <IoGameControllerSharp size={48} className="text-brutal-black" />
                                </div>

                                {/* Mode Name */}
                                <h3 className="text-3xl font-black uppercase text-center mt-6 text-brutal-black">
                                    {mode.name}
                                </h3>

                                {/* Description */}
                                <p className="text-sm font-bold text-center mt-2 text-brutal-black opacity-70">
                                    {mode.description}
                                </p>

                                {/* Play Button */}
                                <button className={`w-full mt-6 bg-${colorClass} border-brutal shadow-brutal-sm py-3 px-6 font-black text-lg uppercase text-white hover:shadow-brutal hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-100`}>
                                    ▶ PLAY
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-3 mt-6">
                {modes.map((_: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => onSelect(index)}
                        className={`w-4 h-4 border-brutal transform hover:scale-125 transition-all duration-100 ${index === currentIndex ? 'bg-brutal-pink scale-125' : 'bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export { BrutalHeader, BrutalModeSlider };
