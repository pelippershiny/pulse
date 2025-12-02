# Pulse

A minimalist keep-awake desktop utility built with Tauri and React. Pulse prevents your system from going idle by simulating periodic key presses.

## Features

- 🎯 **Simple & Minimalist**: Clean, distraction-free interface
- ⏰ **Customizable Interval**: Set your own keep-awake frequency (in seconds)
- 🖥️ **Cross-Platform**: Works on Linux, macOS, and Windows
- 🪟 **Custom Window Controls**: Frameless window with minimize, close, and drag functionality
- 🌙 **Dark Mode**: Modern dark interface with semi-transparent styling
- 🔒 **Privacy-Focused**: Runs locally, no data collection

## Prerequisites

- **Node.js** (v18 or higher)
- **Rust** and **Cargo** (latest stable version)
- **Platform-specific dependencies**:
  - **Linux**: `libwebkit2gtk-4.1-dev`, `build-essential`, `curl`, `wget`, `file`, `libxdo-dev`, `libssl-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Microsoft C++ Build Tools

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pulse.git
cd pulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

## Building Binaries

### Build for your current platform

```bash
npm run tauri build
```

The compiled binary will be located in `src-tauri/target/release/`.

### Platform-Specific Build Locations

#### Linux

- **Binary**: `src-tauri/target/release/pulse`
- **AppImage**: `src-tauri/target/release/bundle/appimage/pulse_*.AppImage`
- **Deb**: `src-tauri/target/release/bundle/deb/pulse_*.deb`

#### macOS

- **App Bundle**: `src-tauri/target/release/bundle/macos/Pulse.app`
- **DMG**: `src-tauri/target/release/bundle/dmg/Pulse_*.dmg`

#### Windows

- **Executable**: `src-tauri/target/release/pulse.exe`
- **MSI Installer**: `src-tauri/target/release/bundle/msi/Pulse_*.msi`

### Cross-Platform Building

> **Note**: Cross-compilation for different platforms from a single OS is complex with Tauri. It's recommended to build on the target platform or use CI/CD with platform-specific runners.

#### Using GitHub Actions (Recommended)

Create a workflow file at `.github/workflows/build.yml`:

```yaml
name: Build Pulse

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        platform: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.platform }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Install Linux dependencies
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run tauri build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: pulse-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

## Usage

1. **Launch the app**: Run the executable or app bundle
2. **Set interval**: Adjust the keep-awake interval (default: 30 seconds)
3. **Activate**: Click the power button to start/stop the keep-awake functionality
4. **Monitor status**: The status indicator shows "SYSTEM ACTIVE" when running

### Window Controls

- **Drag**: Click and drag the title bar to move the window
- **Minimize**: Click the "\_" button
- **Close**: Click the "✕" button

## Technical Details

### Stack

- **Frontend**: React 19 + Vite
- **Backend**: Rust + Tauri v2
- **Styling**: CSS-in-JS with `colorScheme: 'dark'`
- **Input Simulation**: `enigo` crate (simulates Shift key presses)

### Key Implementation Notes

- **Linux Rendering**: WebKitGTK compositing is disabled to prevent black screen issues on certain GPU drivers
- **Transparency**: Window transparency is enabled for modern aesthetics
- **Non-intrusive**: Uses Shift key simulation, which doesn't interfere with normal usage

## Development

### Project Structure

```
pulse/
├── src/                  # React frontend
│   ├── App.jsx          # Main app component
│   ├── App.css          # Styles
│   └── main.jsx         # React entry point
├── src-tauri/           # Rust backend
│   ├── src/
│   │   └── main.rs      # Tauri backend logic
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
└── package.json         # Node dependencies
```

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend for production
- `npm run tauri dev` - Run Tauri app in development mode
- `npm run tauri build` - Build production binary

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
