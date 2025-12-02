import { useState, useEffect, useRef } from "react";
// IMPORTS REALES DE TAURI V2
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// --- DIAGNÓSTICO DE ERRORES ---
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    if (message.includes("ResizeObserver")) return;
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); color:red; z-index:9999; padding:20px; font-family:monospace; border:2px solid red; overflow:auto;';
    errorDiv.innerHTML = `<h3 style="margin-top:0">💀 JS ERROR:</h3><p>${message}</p>`;
    document.body.appendChild(errorDiv);
  };
}

function App() {
  const [isActive, setIsActive] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(30);
  const [progress, setProgress] = useState(0); 
  
  const startTimeRef = useRef(0);
  const reqRef = useRef(null);

  // --- LÓGICA DEL ANILLO DE PROGRESO ---
  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const durationMs = (parseInt(intervalSecs) || 30) * 1000;
        const elapsed = now - startTimeRef.current;

        if (elapsed >= durationMs) {
           startTimeRef.current = now;
           setProgress(0);
        } else {
           setProgress((elapsed / durationMs) * 100);
        }
        
        reqRef.current = requestAnimationFrame(animate);
      };

      reqRef.current = requestAnimationFrame(animate);
    } else {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
      setProgress(0);
    }

    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isActive, intervalSecs]);

  const handleWindowAction = async (action) => {
    try {
        if (window.__TAURI_INTERNALS__) {
            const win = getCurrentWindow();
            if (action === 'minimize') await win.minimize();
            if (action === 'close') await win.close();
            if (action === 'drag') await win.startDragging();
        }
    } catch (e) { console.error(e); }
  };

  const togglePulse = async () => {
    const newState = !isActive;
    setIsActive(newState);

    try {
      if (window.__TAURI_INTERNALS__) {
          await invoke("toggle_pulse", { 
            running: newState, 
            intervalSecs: parseInt(intervalSecs) 
          });
      }
    } catch (error) {
      console.error("Error backend:", error);
      setIsActive(false); 
    }
  };

  // --- PARÁMETROS DEL SVG ---
  const radius = 58; 
  const circumference = 2 * Math.PI * radius; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // ESTILOS PUROS
  const styles = {
    container: {
      width: '100vw', height: '100vh', 
      // Glassmorphism oscuro
      background: 'rgba(18, 18, 18, 0.90)', // Un poco más opaco para ocultar fallos de renderizado del sistema
      backdropFilter: 'blur(16px)', 
      WebkitBackdropFilter: 'blur(16px)',
      color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      
      // FIX 2: BORDE PERFECTO
      // Quitamos 'border' y usamos 'box-shadow: inset'. 
      // Esto dibuja el borde DENTRO del div redondeado, evitando que se salga o pixelice.
      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 0 1px transparent', 
      
      borderRadius: '16px', 
      overflow: 'hidden', 
      fontFamily: 'Inter, system-ui, sans-serif',
      boxSizing: 'border-box',
    },
    titleBar: {
      width: '100%', height: '36px', 
      background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)', 
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '12px',
      // Importante: aseguramos que la barra esté por encima del contenido para el drag
      zIndex: 50,
    },
    btnWindow: {
      background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '14px', padding: '6px 10px', 
      transition: 'all 0.2s', borderRadius: '4px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      // FIX 3: Aseguramos que los botones sean clicables y no arrastrables
      WebkitAppRegion: 'no-drag', // Propiedad específica de Webkit/Electron/Tauri para excluir del drag
    },
    status: {
      fontSize: '10px', letterSpacing: '3px', color: isActive ? '#0ff' : '#555', marginBottom: '24px', textTransform: 'uppercase', fontWeight: '700', 
      textShadow: isActive ? '0 0 15px rgba(0,255,255,0.6)' : 'none',
      transition: 'all 0.5s ease',
      fontFamily: 'monospace'
    },
    wrapper: {
      position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    svg: {
      position: 'absolute', top: 0, left: 0, width: '130px', height: '130px', transform: 'rotate(-90deg)', pointerEvents: 'none', zIndex: 0
    },
    powerBtn: {
      width: '100px', height: '100px', borderRadius: '50%', 
      border: 'none', 
      background: isActive ? 'radial-gradient(circle at 30% 30%, #111, #000)' : 'radial-gradient(circle at 30% 30%, #222, #111)',
      color: isActive ? '#0ff' : '#444', 
      fontSize: '40px', cursor: 'pointer',
      boxShadow: isActive 
        ? '0 0 40px rgba(0,255,255,0.15), inset 2px 2px 5px rgba(255,255,255,0.1), inset -2px -2px 5px rgba(0,0,0,0.8)' 
        : 'inset 2px 2px 5px rgba(255,255,255,0.05), inset -2px -2px 5px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      outline: 'none', zIndex: 1
    },
    input: {
      background: 'rgba(0, 0, 0, 0.4)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      color: '#ddd',
      textAlign: 'center', 
      fontSize: '14px', 
      width: '60px', 
      marginTop: '8px', 
      outline: 'none',
      padding: '6px', 
      borderRadius: '6px',
      fontFamily: 'monospace',
      colorScheme: 'dark', 
    },
    label: {
      fontSize: '9px', color: '#666', letterSpacing: '1px', display:'block', fontWeight: '600', textTransform: 'uppercase'
    },
    warning: {
      position: 'absolute', bottom: 12, fontSize: '9px', color: '#333', textAlign: 'center', width: '100%', pointerEvents: 'none', userSelect: 'none'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Barra Título con Drag Region */}
      <div data-tauri-drag-region style={styles.titleBar} onMouseDown={() => handleWindowAction('drag')}>
        
        {/* FIX 3: Botones con stopPropagation */}
        <button 
          style={styles.btnWindow} 
          onMouseEnter={(e)=>e.target.style.color='#fff'} 
          onMouseLeave={(e)=>e.target.style.color='#666'} 
          onMouseDown={(e) => { 
            e.stopPropagation(); // IMPORTANTE: Evita que empiece el drag
          }}
          onClick={(e) => { 
            e.stopPropagation(); // Evita burbujeo
            handleWindowAction('minimize'); 
          }}
        >_</button>
        
        <button 
          style={{...styles.btnWindow, color: '#666', marginLeft: '4px'}} 
          onMouseEnter={(e)=>e.target.style.color='#f55'} 
          onMouseLeave={(e)=>e.target.style.color='#666'} 
          onMouseDown={(e) => { 
            e.stopPropagation(); // IMPORTANTE: Evita que empiece el drag
          }}
          onClick={(e) => { 
            e.stopPropagation(); 
            handleWindowAction('close'); 
          }}
        >✕</button>

      </div>

      {/* Contenido */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        
        <div style={styles.status}>
            {isActive ? 'SYSTEM ACTIVE' : 'SYSTEM IDLE'}
        </div>

        <div style={styles.wrapper}>
            <svg style={styles.svg}>
                <circle cx="65" cy="65" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="3" fill="transparent" />
                <circle 
                    cx="65" cy="65" r={radius} 
                    stroke="#0ff" strokeWidth="3" fill="transparent" 
                    strokeDasharray={circumference} 
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 3px #0ff)' }}
                />
            </svg>

            <button onClick={togglePulse} style={styles.powerBtn}>
                ⏻
            </button>
        </div>

        <div style={{marginTop: '32px', textAlign: 'center'}}>
            <label style={styles.label}>Interval (s)</label>
            <input 
                type="number" 
                value={intervalSecs}
                onChange={(e) => setIntervalSecs(e.target.value)}
                style={styles.input}
            />
        </div>
        
        <div style={styles.warning}>
           Pulse v1.0
        </div>

      </div>
    </div>
  );
}

export default App;