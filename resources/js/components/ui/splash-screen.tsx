import { useState, useEffect } from 'react';

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
    }, 30); // Durée totale de l'animation ~3 secondes

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* Styles pour l'animation 3D et les particules */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700;900&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(-360deg); opacity: 0; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8); }
        }
        @keyframes logo-entrance {
          0% { transform: perspective(1000px) rotateX(25deg) rotateY(-30deg) scale(0.5); opacity: 0; filter: blur(10px); }
          50% { transform: perspective(1000px) rotateX(25deg) rotateY(-30deg) scale(1.1); opacity: 1; filter: blur(0px); }
          100% { transform: perspective(1000px) rotateX(25deg) rotateY(-30deg) scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes tagline-entrance {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes progress-glow {
          0% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
          100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.8); }
      `}</style>

      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
        {/* Arrière-plan animé avec des orbes lumineuses */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-500/20 blur-xl"
              style={{
                width: `${Math.random() * 300 + 50}px`,
                height: `${Math.random() * 300 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${15 + i * 0.5}s infinite ease-in-out`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
          {[...Array(15)].map((_, i) => (
            <div
              key={`glow-${i}`}
              className="absolute rounded-full bg-emerald-400"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `pulse-glow ${2 + i * 0.3}s infinite ease-in-out`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Conteneur principal */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center font-['Poppins']">
          {/* Logo 3D "Maliya" */}
          <h1
            className="relative mb-6 text-7xl font-black md:text-8xl lg:text-9xl"
            style={{
              background: 'linear-gradient(to right, #fff, #a7f3d0)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: `
                0 1px 1px rgba(0,0,0,0.3),
                0 0 20px rgba(16, 185, 129, 0.5),
                0 0 40px rgba(16, 185, 129, 0.3),
                inset 0 1px 2px rgba(255,255,255,0.5)
              `,
              transformStyle: 'preserve-3d',
              transform: 'perspective(1000px) rotateX(25deg) rotateY(-30deg)',
              animation: 'logo-entrance 2s ease-out forwards',
            }}
          >
            Maliya
          </h1>

          {/* Tagline */}
          <p
            className="mb-8 text-lg font-medium text-white/80 md:text-xl"
            style={{ animation: 'tagline-entrance 1s ease-out 0.5s forwards', opacity: 0 }}
          >
            Gérez vos finances avec style.
          </p>

          {/* Barre de progression stylée */}
          <div className="w-64 max-w-full">
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300 ease-out"
                style={{
                  width: `${progress}%`,
                  boxShadow: progress > 0 ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none',
                  animation: progress > 0 ? 'progress-glow 1s infinite alternate' : 'none',
                }}
              />
            </div>
            <p className="text-xs font-medium text-gray-400">
              Initialisation... {progress}%
            </p>
          </div>
        </div>
      </div>
    </>
  );
}