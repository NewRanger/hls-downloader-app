# HLS Downloader

A simple Electron app to download HLS (M3U8) video streams.

## Features

- Download videos from M3U8 URLs
- Custom referer header support for protected streams
- Real-time download progress
- Saves directly to your Downloads folder

## Requirements

- [FFmpeg](https://ffmpeg.org/download.html) must be installed and available in your system PATH

## Installation
```bash
git clone https://github.com/NewRanger/hls-downloader-app.git
cd hls-downloader-app
npm install
npm start
```

## Usage

1. Paste the M3U8 URL
2. Enter a filename (optional)
3. Add a custom referer if the stream requires it
4. Click Download

## Tech Stack

- Electron
- FFmpeg (for stream processing)

## License

MIT
