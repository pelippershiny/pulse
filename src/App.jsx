import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Power, Minus, X } from "lucide-react";

const appWindow = getCurrentWindow();

function App() {
  const [isActive, setIsActive] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(30);

  const togglePulse = async () => {
    const newState = !isActive;
    setIsActive(newState);
    try {
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
    // Fondo oscuro sólido (#0a0a0a) para garantizar visibilidad en Linux
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none bg-[#0a0a0a] border border-white/10 rounded-xl relative">
      
      {/* Barra de Título */}
      <div 
        data-tauri-drag-region 
        className="h-10 w-full flex justify-end items-center px-3 z-50 cursor-grab active:cursor-grabbing bg-white/5"
      >
        <div className="flex gap-3 text-white/50 hover:text-white transition-colors">
            <button onClick={() => appWindow.minimize()} className="hover:text-cyan-400 transition-colors">
                <Minus size={18} />
            </button>
            <button onClick={() => appWindow.close()} className="hover:text-red-500 transition-colors">
                <X size={18} />
            </button>
        </div>
      </div>

      {/* Zona Central */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 pb-6 z-10">
        
        {/* Texto de Estado */}
        <div className={`text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-700 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-neutral-600'}`}>
            {isActive ? 'SYSTEM ACTIVE' : 'SYSTEM IDLE'}
        </div>

        {/* Botón Power */}
        <div className="relative group">
            <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-1000 ${isActive ? 'bg-cyan-500/40 opacity-100 scale-125' : 'bg-transparent opacity-0 scale-100'}`}></div>
            
            <button 
                onClick={togglePulse}
                className={`
                    relative w-28 h-28 rounded-full flex items-center justify-center border-4 
                    transition-all duration-500 ease-out cursor-pointer
                    ${isActive 
                        ? 'border-cyan-500/50 bg-black text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-105 animate-pulse-slow' 
                        : 'border-zinc-800 bg-zinc-900 text-zinc-600 hover:bg-zinc-800 hover:text-zinc-500 hover:border-zinc-700'
                    }
                `}
            >
                <Power size={42} strokeWidth={2.5} />
            </button>
        </div>

        {/* Input Tiempo */}
        <div className="flex flex-col items-center gap-2 mt-2">
            <label className="text-zinc-600 text-[9px] uppercase tracking-widest font-semibold">
                Interval (Secs)
            </label>
            <input 
                type="number" 
                value={intervalSecs}
                onChange={(e) => setIntervalSecs(e.target.value)}
                disabled={isActive}
                className="w-16 bg-transparent text-center text-lg font-mono text-zinc-400 border-b border-zinc-800 focus:border-cyan-500/50 focus:text-cyan-200 outline-none transition-all disabled:opacity-30"
            />
        </div>

      </div>
    </div>
  );
}

export default App;