# ez-ffmpeg

A lightweight desktop app for converting media files between video and audio formats. Built with [Tauri 2](https://v2.tauri.app/), SvelteKit 5, and TypeScript.

**Drop a file. Pick a format. Convert.**

## Features

- Drag-and-drop or browse to select media files
- Auto-detects input media type (video/audio) and shows relevant output formats
- Supported video formats: MP4, MKV, WebM, AVI, MOV
- Supported audio formats: MP3, WAV, AAC, FLAC, OGG, M4A
- Real-time conversion progress bar
- Cross-platform: Linux and Windows

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/) for your platform

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev patchelf
```

### Windows

Install [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/). Make sure the **Desktop development with C++** workload is selected.

## Build

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Download the ffmpeg binary

The app bundles ffmpeg as a sidecar binary. Run the download script before building:

```bash
# Linux
bash scripts/download-ffmpeg.sh linux

# Windows (from Git Bash or WSL)
bash scripts/download-ffmpeg.sh windows

# Both platforms
bash scripts/download-ffmpeg.sh all
```

This places platform-specific ffmpeg binaries into `src-tauri/binaries/`.

### 3. Run in development mode

```bash
npm run tauri dev
```

### 4. Build for production

```bash
npm run tauri build
```

The output bundle will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
src/                        # SvelteKit frontend
  lib/
    components/             # UI components (DropZone, FormatPicker, etc.)
    stores/conversion.ts    # Svelte stores for app state
    types.ts                # TypeScript interfaces
    utils/formats.ts        # Format definitions and helpers
  routes/+page.svelte       # Main application page

src-tauri/                  # Tauri (Rust) backend
  src/commands.rs           # Tauri commands (ffmpeg invocation + progress parsing)
  src/lib.rs                # App entry point and plugin registration
  binaries/                 # Bundled ffmpeg sidecar binaries (gitignored)
  capabilities/             # Tauri permission capabilities

scripts/
  download-ffmpeg.sh        # Downloads platform-specific ffmpeg binaries
```

## License

MIT
