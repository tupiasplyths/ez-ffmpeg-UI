#!/usr/bin/env bash
set -euo pipefail

BIN_DIR="src-tauri/binaries"
mkdir -p "$BIN_DIR"

LINUX_URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
WINDOWS_URL="https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"

download_ffmpeg_linux() {
    echo "Downloading ffmpeg for Linux (x86_64)..."
    local tmpdir
    tmpdir=$(mktemp -d)
    local tar_file="$tmpdir/ffmpeg-linux.tar.xz"

    curl -L -o "$tar_file" "$LINUX_URL"
    tar -xf "$tar_file" -C "$tmpdir"

    local extracted_dir
    extracted_dir=$(find "$tmpdir" -maxdepth 1 -type d -name "ffmpeg-*" | head -1)
    if [ -z "$extracted_dir" ]; then
        echo "Error: Could not find extracted ffmpeg directory"
        rm -rf "$tmpdir"
        exit 1
    fi

    cp "$extracted_dir/ffmpeg" "$BIN_DIR/ffmpeg-x86_64-unknown-linux-gnu"
    chmod +x "$BIN_DIR/ffmpeg-x86_64-unknown-linux-gnu"
    rm -rf "$tmpdir"
    echo "Linux ffmpeg binary saved to $BIN_DIR/ffmpeg-x86_64-unknown-linux-gnu"
}

download_ffmpeg_windows() {
    echo "Downloading ffmpeg for Windows (x86_64)..."
    local tmpdir
    tmpdir=$(mktemp -d)
    local zip_file="$tmpdir/ffmpeg-windows.zip"

    curl -L -o "$zip_file" "$WINDOWS_URL"
    unzip -q "$zip_file" -d "$tmpdir"

    local extracted_dir
    extracted_dir=$(find "$tmpdir" -maxdepth 1 -type d -name "ffmpeg-*" | head -1)
    if [ -z "$extracted_dir" ]; then
        echo "Error: Could not find extracted ffmpeg directory"
        rm -rf "$tmpdir"
        exit 1
    fi

    cp "$extracted_dir/bin/ffmpeg.exe" "$BIN_DIR/ffmpeg-x86_64-pc-windows-msvc.exe"
    rm -rf "$tmpdir"
    echo "Windows ffmpeg binary saved to $BIN_DIR/ffmpeg-x86_64-pc-windows-msvc.exe"
}

PLATFORM="${1:-all}"

case "$PLATFORM" in
    linux)
        download_ffmpeg_linux
        ;;
    windows)
        download_ffmpeg_windows
        ;;
    all)
        download_ffmpeg_linux
        download_ffmpeg_windows
        ;;
    *)
        echo "Usage: $0 [linux|windows|all]"
        exit 1
        ;;
esac

echo "Done!"
