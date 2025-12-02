import { useState, useEffect } from "react";
// Importaciones core de Tauri v2
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
// Iconos
import { Power, Settings, Minus, X } from "lucide-react";

// Referencia a la ventana para moverla/cerrarla
const appWindow = getCurrentWindow();

function App() {
  const [isActive, setIsActive] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(30);

  const togglePulse = async () => {
    const newState = !isActive;
    setIsActive(newState);
    
    try {
      // Invocamos el comando de Rust
      await invoke("toggle_pulse", { 
        running: newState, 
        intervalSecs: parseInt(intervalSecs) 
      });
    } catch (error) {
      console.error("Error backend:", error);
      setIsActive(false);
    }
  };

  return (
    // CONTENEDOR PRINCIPAL: Glassmorphism
    // bg-black/40 + backdrop-blur da el efecto cristal en Linux/Windows
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl relative">
      
      {/* BARRA DE TÍTULO (Drag Region) */}
      <div 
        data-tauri-drag-region 
        className="h-10 w-full flex justify-end items-center px-3 z-50 cursor-grab active:cursor-grabbing"
      >
        <div className="flex gap-3 text-white/40 hover:text-white transition-colors">
            <button onClick={() => appWindow.minimize()} className="hover:text-cyan-400 transition-colors">
                <Minus size={18} />
            </button>
            <button onClick={() => appWindow.close()} className="hover:text-red-500 transition-colors">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* ZONA CENTRAL */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6 z-10">
        
        {/* TEXTO DE ESTADO */}
        <div className={`text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-700 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-neutral-600'}`}>
            {isActive ? 'System Active' : 'Standby'}
        </div>

        {/* BOTÓN POWER (El corazón de la app) */}
        <div className="relative group">
            {/* Efecto de brillo trasero (solo visible cuando activo) */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${isActive ? 'bg-cyan-500/40 opacity-100 scale-125' : 'bg-transparent opacity-0 scale-100'}`}></div>
            
            <button 
                onClick={togglePulse}
                className={`
                    relative w-28 h-28 rounded-full flex items-center justify-center border-4 
                    transition-all duration-500 ease-out
                    ${isActive 
                        ? 'border-cyan-500/50 bg-black text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-105 animate-pulse-slow' 
                        : 'border-zinc-800 bg-zinc-900/80 text-zinc-600 shadow-inner hover:bg-zinc-800 hover:text-zinc-500'
                    }
                `}
            >
                <Power size={42} strokeWidth={2} />
            </button>
        </div>

        {/* CONFIGURACIÓN DE TIEMPO */}
        <div className="flex flex-col items-center gap-2 mt-2">
            <label className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold">
                Interval (Secs)
            </label>
            <div className="relative">
                <input 
                    type="number" 
                    value={intervalSecs}
                    onChange={(e) => setIntervalSecs(e.target.value)}
                    disabled={isActive}
                    className="w-16 bg-transparent text-center text-lg font-mono text-zinc-400 border-b border-zinc-800 focus:border-cyan-500/50 focus:text-cyan-200 outline-none transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                />
            </div>
        </div>

      </div>

      {/* DECORACIÓN DE FONDO (Noise/Grid sutil) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}

export default App;