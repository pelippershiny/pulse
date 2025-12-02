#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use enigo::{Enigo, Key, KeyboardControllable};
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use std::thread;
use std::time::Duration;
use tauri::State;

// Estructura para manejar el estado global
struct PulseState {
    is_running: Arc<AtomicBool>,
}

#[tauri::command]
fn toggle_pulse(state: State<PulseState>, running: bool, interval_secs: u64) {
    state.is_running.store(running, Ordering::Relaxed);

    if running {
        let is_running = state.is_running.clone();

        thread::spawn(move || {
            let mut enigo = Enigo::new();

            while is_running.load(Ordering::Relaxed) {
                // CAMBIO: Usamos 'Shift' porque 'ScrollLock' no existe en esta versión de Enigo.
                // Pulsar Shift es invisible y mantiene el PC despierto igual.
                let _ = enigo.key_click(Key::Shift);
                thread::sleep(Duration::from_millis(50));
                let _ = enigo.key_click(Key::Shift);

                println!("Pulse: Heartbeat sent (Shift key).");

                for _ in 0..interval_secs {
                    if !is_running.load(Ordering::Relaxed) {
                        break;
                    }
                    thread::sleep(Duration::from_secs(1));
                }
            }
        });
    }
}

fn main() {
    tauri::Builder::default()
        // Inicializamos el plugin opener para que no fallen los permisos
        .plugin(tauri_plugin_opener::init())
        .manage(PulseState {
            is_running: Arc::new(AtomicBool::new(false)),
        })
        .invoke_handler(tauri::generate_handler![toggle_pulse])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
