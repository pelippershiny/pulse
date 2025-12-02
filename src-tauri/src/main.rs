#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use enigo::{Coordinate, Enigo, Mouse, Settings}; // Quitamos imports no usados
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc,
};
use std::thread;
use std::time::Duration;
use tauri::State;

struct PulseState {
    is_running: Arc<AtomicBool>,
}

#[tauri::command]
fn toggle_pulse(state: State<PulseState>, running: bool, interval_secs: u64) {
    state.is_running.store(running, Ordering::Relaxed);

    if running {
        let is_running = state.is_running.clone();

        thread::spawn(move || {
            // Inicialización de Enigo
            let mut enigo = match Enigo::new(&Settings::default()) {
                Ok(e) => e,
                Err(_) => return, // Si falla inicializar, salimos del hilo
            };

            while is_running.load(Ordering::Relaxed) {
                // CORRECCIÓN: En Enigo 0.2 se usa Coordinate::Rel (Relative)
                // Movemos 1 pixel y volvemos. El .ok() evita pánicos si falla.
                enigo.move_mouse(1, 0, Coordinate::Rel).ok();
                enigo.move_mouse(-1, 0, Coordinate::Rel).ok();

                println!("Pulse: Micro-movement sent (Mouse).");

                // Esperamos el intervalo
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
    // FIX LINUX: Desactivar composición hardware para evitar pantalla negra en WebKitGTK
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(PulseState {
            is_running: Arc::new(AtomicBool::new(false)),
        })
        .invoke_handler(tauri::generate_handler![toggle_pulse])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
