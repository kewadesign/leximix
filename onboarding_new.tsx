// Onboarding Step 0: Language Selection - COMPLETELY NEW LAYOUT
const renderLanguageSelection = () => (
    <div className="space-y-8 text-center animate-slide-brutal bg-white border-brutal-thick shadow-brutal-lg p-8 transform skew-x-[-2deg] relative max-w-md">
        {/* Rainbow Stripe */}
        <div className="absolute top-0 left-0 right-0 h-4" style={{
            background: 'linear-gradient(90deg, #FF006E 0%, #FF7F00 33%, #8338EC 66%, #FFBE0B 100%)'
        }}></div>

        {/* Globe Icon in Yellow Box */}
        <div className="w-24 h-24 mx-auto bg-brutal-yellow border-brutal shadow-brutal flex items-center justify-center transform skew-x-[8deg] mt-4">
            <IoGlobeSharp size={56} className="text-brutal-black" />
        </div>

        <h1 className="text-5xl font-black uppercase tracking-wider text-brutal-black transform skew-x-[3deg] mt-6">
            {t.ONBOARDING.WELCOME}
        </h1>

        {/* Language Cards - Stacked Full Width */}
        <div className="grid grid-cols-1 gap-6 mt-8">
            <button
                onClick={() => { setTempUser({ ...tempUser, language: Language.DE }); setOnboardingStep(1); audio.playClick(); }}
                className="p-8 bg-brutal-pink border-brutal shadow-brutal hover:shadow-brutal-lg hover:bg-brutal-orange transition-all duration-100 transform skew-x-[-5deg] hover:translate-y-[-8px] active:translate-y-[2px] active:shadow-brutal-sm group flex flex-col items-center justify-center"
            >
                <span className="text-8xl mb-4 block group-hover:scale-125 transition-transform duration-100">🇩🇪</span>
                <span className="font-black text-2xl uppercase tracking-widest text-white">DEUTSCH</span>
            </button>

            <button
                onClick={() => { setTempUser({ ...tempUser, language: Language.EN }); setOnboardingStep(1); audio.playClick(); }}
                className="p-8 bg-brutal-orange border-brutal shadow-brutal hover:shadow-brutal-lg hover:bg-brutal-yellow transition-all duration-100 transform skew-x-[5deg] hover:translate-y-[-8px] active:translate-y-[2px] active:shadow-brutal-sm group flex flex-col items-center justify-center"
            >
                <span className="text-8xl mb-4 block group-hover:scale-125 transition-transform duration-100">🇺🇸</span>
                <span className="font-black text-2xl uppercase tracking-widest text-white">ENGLISH</span>
            </button>

            <button
                onClick={() => { setTempUser({ ...tempUser, language: Language.ES }); setOnboardingStep(1); audio.playClick(); }}
                className="p-8 bg-brutal-purple border-brutal shadow-brutal hover:shadow-brutal-lg hover:bg-brutal-pink transition-all duration-100 transform skew-x-[-5deg] hover:translate-y-[-8px] active:translate-y-[2px] active:shadow-brutal-sm group flex flex-col items-center justify-center"
            >
                <span className="text-8xl mb-4 block group-hover:scale-125 transition-transform duration-100">🇪🇸</span>
                <span className="font-black text-2xl uppercase tracking-widest text-white">ESPAÑOL</span>
            </button>
        </div>
    </div>
);

// Onboarding Step 1: Name Input - NEW LAYOUT
const renderNameInput = () => (
    <div className="space-y-8 animate-slide-brutal bg-white border-brutal-thick shadow-brutal-lg p-8 transform skew-x-[2deg] relative max-w-md" style={{ transform: 'translate(20px, -10px) skew(-3deg)' }}>
        {/* Rainbow Stripe - Different colors */}
        <div className="absolute top-0 left-0 right-0 h-4" style={{
            background: 'linear-gradient(90deg, #FF7F00 0%, #FFBE0B 50%, #06FFA5 100%)'
        }}></div>

        {/* User Icon in Pink Box */}
        <div className="w-24 h-24 mx-auto bg-brutal-pink border-brutal shadow-brutal flex items-center justify-center transform skew-x-[-8deg] mt-4">
            <IoPersonSharp size={56} className="text-white" />
        </div>

        <h2 className="text-4xl font-black uppercase tracking-wider text-brutal-black text-center">
            {t.ONBOARDING.NAME_TITLE}
        </h2>

        <input
            type="text"
            maxLength={30}
            value={tempUser.name}
            onChange={(e) => setTempUser({ ...tempUser, name: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
            placeholder={t.ONBOARDING.NAME_PLACEHOLDER}
            className="input-modern text-center text-3xl font-black uppercase"
            autoFocus
            style={{ transform: 'skew(-2deg)' }}
        />
        {tempUser.name.length === 20 && (
            <p className="text-brutal-pink text-sm text-center font-black uppercase animate-shake">
                {t.ONBOARDING.ERR_NAME}
            </p>
        )}

        <button
            disabled={!tempUser.name}
            onClick={() => { setOnboardingStep(2); audio.playClick(); }}
            className="btn-primary w-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {t.ONBOARDING.CONTINUE}
        </button>
    </div>
);

// Onboarding Step 2: Age Input - NEW LAYOUT
const renderAgeInput = () => (
    <div className="space-y-8 animate-slide-brutal bg-white border-brutal-thick shadow-brutal-lg p-8 transform skew-x-[-2deg] relative max-w-md" style={{ transform: 'translate(-15px, 5px) skew(4deg)' }}>
        {/* Rainbow Stripe - Different colors */}
        <div className="absolute top-0 left-0 right-0 h-4" style={{
            background: 'linear-gradient(90deg, #8338EC 0%, #0096FF 50%, #06FFA5 100%)'
        }}></div>

        {/* Settings Icon in Yellow Box */}
        <div className="w-24 h-24 mx-auto bg-brutal-yellow border-brutal shadow-brutal flex items-center justify-center transform skew-x-[8deg] mt-4">
            <IoSettingsSharp size={56} className="text-brutal-black" />
        </div>

        <h2 className="text-4xl font-black uppercase tracking-wider text-brutal-black text-center">
            {t.ONBOARDING.AGE_TITLE}
        </h2>

        <input
            type="number"
            min={1}
            max={120}
            value={tempUser.age || ''}
            onChange={(e) => {
                const val = e.target.value;
                const num = parseInt(val);
                if (val === '' || (num >= 1 && num <= 120)) {
                    setTempUser({ ...tempUser, age: val ? num : 0 });
                }
            }}
            placeholder={t.ONBOARDING.AGE_PLACEHOLDER}
            className="input-modern text-center text-5xl font-black"
            autoFocus
            style={{ transform: 'skew(-2deg)' }}
        />

        <button
            disabled={!tempUser.age || tempUser.age < 1}
            onClick={completeOnboarding}
            className="btn-primary w-full text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {t.ONBOARDING.START}
        </button>
    </div>
);
