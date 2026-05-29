'use client';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-[#080b10] flex flex-col items-center justify-center z-50">

      {/* Wrapper logo + ombre */}
      <div className="flex flex-col items-center gap-2 mb-12">

        {/* Triangle logo — backflip */}
        <div className="logo-backflip">
          <svg
            viewBox="0 0 100 100"
            className="w-24 h-24"
            fill="none"
          >
            <defs>
              <radialGradient id="triGrad" cx="50%" cy="60%" r="55%">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="30%"  stopColor="#e03030" />
                <stop offset="100%" stopColor="#B01817" />
              </radialGradient>
            </defs>
            <polygon
              points="50,5 95,90 5,90"
              fill="url(#triGrad)"
              stroke="#8a0f0e"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Ombre au sol */}
        <div className="logo-shadow w-16 h-2 rounded-full bg-red-900/40 blur-sm -mt-1" />

        {/* Texte ENSIAS HUB */}
        <p className="text-[#B01817] font-bold text-lg tracking-widest mt-4">
          ENSIAS HUB
        </p>
      </div>

      {/* Texte chargement */}
      <p className="loading-text text-white/40 text-sm tracking-wider">
        Chargement en cours...
      </p>
    </div>
  );
}
