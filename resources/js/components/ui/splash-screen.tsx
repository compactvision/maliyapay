import { useState, useEffect, useMemo } from 'react';

export function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  // Mémoïser les particules pour éviter qu'elles ne changent à chaque tick de progression
  const orbs = useMemo(() => [...Array(12)].map((_, i) => ({
    width: Math.random() * 200 + 50,
    height: Math.random() * 200 + 50,
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: 15 + i * 0.5,
    delay: i * 0.2
  })), []);

  const dots = useMemo(() => [...Array(10)].map((_, i) => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    duration: 2 + i * 0.3,
    delay: i * 0.1
  })), []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Arrière-plan animé avec des orbes lumineuses */}
      <div className="absolute inset-0">
        {orbs.map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full bg-emerald-500/20 blur-xl"
            style={{
              width: `${orb.width}px`,
              height: `${orb.height}px`,
              top: `${orb.top}%`,
              left: `${orb.left}%`,
              animation: `float ${orb.duration}s infinite ease-in-out`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
        {dots.map((dot, i) => (
          <div
            key={`glow-${i}`}
            className="absolute rounded-full bg-emerald-400"
            style={{
              width: '2px',
              height: '2px',
              top: `${dot.top}%`,
              left: `${dot.left}%`,
              animation: `pulse-glow ${dot.duration}s infinite ease-in-out`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Conteneur principal */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center font-['Poppins']">
        <h1
          className="relative mb-6 text-7xl font-black md:text-8xl lg:text-9xl"
          style={{
            background: 'linear-gradient(to right, #fff, #a7f3d0)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
            transformStyle: 'preserve-3d',
            transform: 'perspective(1000px) rotateX(25deg) rotateY(-30deg)',
            animation: 'logo-entrance 2s ease-out forwards',
          }}
        >
          Maliya
        </h1>

        <p
          className="mb-8 text-lg font-medium text-white/80 md:text-xl"
          style={{ animation: 'tagline-entrance 1s ease-out 0.5s forwards', opacity: 0 }}
        >
          Gérez vos finances avec style.
        </p>

        <div className="w-64 max-w-full px-4">
          <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: progress > 0 ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
              }}
            />
          </div>
          <p className="text-xs font-medium text-gray-400">
            Initialisation... {progress}%
          </p>
        </div>
      </div>
    </div>
  );
}