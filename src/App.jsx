import { useState, useEffect } from "react";
// IMPORTS REALES DE TAURI V2
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

// --- DIAGNÓSTICO DE ERRORES EN PANTALLA ---
if (typeof window !== 'undefined') {
  window.onerror = function(message, source, lineno, colno, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(50,0,0,0.9); color:white; z-index:9999; padding:20px; font-family:monospace; border:2px solid red;';
    errorDiv.innerHTML = `<h3 style="margin-top:0">💀 ERROR CRÍTICO JS:</h3><p>${message}</p><p>Archivo: ...${String(source).slice(-20)} : ${lineno}</p>`;
    document.body.appendChild(errorDiv);
  };
}

function App() {
  const [isActive, setIsActive] = useState(false);
  const [intervalSecs, setIntervalSecs] = useState(30);

  useEffect(() => {
    // 1. Limpieza de estilos globales
    // CAMBIO: Fondo transparente para permitir el efecto glass en la ventana
    document.body.style.backgroundColor = "transparent"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
  }, []);

  const handleWindowAction = async (action) => {
    try {
        // Protección: Solo ejecutar si existe la API de ventana
        if (window.__TAURI_INTERNALS__) {
            const win = getCurrentWindow();
            if (action === 'minimize') await win.minimize();
            if (action === 'close') await win.close();
            if (action === 'drag') await win.startDragging();
        } else {
            console.log(`[Simulación] Ventana: ${action}`);
        }
    } catch (e) { console.error(e); }
  };

  const togglePulse = async () => {
    const newState = !isActive;
    setIsActive(newState);

    try {
      // PROTECCIÓN CRÍTICA: Verificamos si estamos en Tauri antes de llamar al backend
      // Esto arregla el error "window.__TAURI_INTERNALS__ is undefined" en el navegador
      if (window.__TAURI_INTERNALS__) {
          await invoke("toggle_pulse", { 
            running: newState, 
            intervalSecs: parseInt(intervalSecs) 
          });
      } else {
          console.warn("Modo Navegador: Backend no disponible. Simulación activa.");
      }
    } catch (error) {
      console.error("Error backend:", error);
      setIsActive(false); 
    }
  };

  // ESTILOS EN LÍNEA PUROS
  const styles = {
    container: {
      width: '100vw', height: '100vh', 
      background: 'rgba(10, 10, 10, 0.75)', // Fondo semi-transparente
      backdropFilter: 'blur(20px)', // Intento de blur (no funciona con compositing deshabilitado)
      WebkitBackdropFilter: 'blur(20px)',
      color: 'white',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(255, 255, 255, 0.15)', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    titleBar: {
      width: '100%', height: '32px', background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '10px'
    },
    btnWindow: {
      background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '16px', padding: '0 8px'
    },
    status: {
      fontSize: '10px', letterSpacing: '3px', color: isActive ? '#0ff' : '#666', marginBottom: '20px', textTransform: 'uppercase', fontWeight: 'bold'
    },
    powerBtn: {
      width: '100px', height: '100px', borderRadius: '50%', 
      border: isActive ? '4px solid #0ff' : '4px solid #333',
      background: isActive ? '#000' : '#111', 
      color: isActive ? '#0ff' : '#444', 
      fontSize: '40px', cursor: 'pointer',
      boxShadow: isActive ? '0 0 40px rgba(0,255,255,0.4)' : 'none', 
      transition: 'all 0.3s ease',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      outline: 'none'
    },
    input: {
      background: 'rgba(0, 0, 0, 0.6)', 
      border: 'none', 
      borderBottom: '2px solid rgba(255, 255, 255, 0.2)', 
      color: '#eee',
      textAlign: 'center', 
      fontSize: '18px', 
      width: '70px', 
      marginTop: '5px', 
      outline: 'none',
      padding: '8px', 
      borderRadius: '6px',
      colorScheme: 'dark', // Force dark mode for number spinners
      WebkitAppearance: 'textfield', // Remove default spinner styling
      MozAppearance: 'textfield',
    },
    warning: {
      position: 'absolute', bottom: 10, fontSize: '10px', color: '#555', textAlign: 'center', width: '100%'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Barra Título */}
      <div data-tauri-drag-region style={styles.titleBar}>
        <button style={styles.btnWindow} onClick={(e) => { e.stopPropagation(); handleWindowAction('minimize'); }}>_</button>
        <button style={{...styles.btnWindow, color:'#f55'}} onClick={(e) => { e.stopPropagation(); handleWindowAction('close'); }}>✕</button>
      </div>

      {/* Contenido */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
        
        <div style={styles.status}>
            {isActive ? 'SYSTEM ACTIVE' : 'SYSTEM IDLE'}
        </div>

        <button onClick={togglePulse} style={styles.powerBtn}>
            ⏻
        </button>

        <div style={{marginTop: '30px', textAlign: 'center'}}>
            <label style={{fontSize: '9px', color: '#555', letterSpacing: '1px', display:'block'}}>INTERVAL (S)</label>
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