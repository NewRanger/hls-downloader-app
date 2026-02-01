const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 590,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
    
    // Uncomment to open DevTools
    // mainWindow.webContents.openDevTools();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Handle download request from renderer
let ffmpegProcess = null;

ipcMain.handle('start-download', async (event, { url, filename, customReferer }) => {
    return new Promise((resolve) => {
        try {
            const urlObj = new URL(url);
            const referer = customReferer || `${urlObj.protocol}//${urlObj.hostname}/`;
            
            // Sanitize filename
            let safeName = filename.trim().replace(/[\s]+/g, '_').replace(/[^\w\-]/g, '').toLowerCase() || 'output';
            if (!safeName.endsWith('.mp4')) safeName += '.mp4';

            // Get user's Downloads folder
            const outputPath = path.join(app.getPath('downloads'), safeName);

            const args = [
                '-y',
                '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                '-headers', `Referer: ${referer}\r\n`,
                '-i', url,
                '-c', 'copy',
                '-bsf:a', 'aac_adtstoasc',
                outputPath
            ];

            ffmpegProcess = spawn('ffmpeg', args);

            // Send progress updates to renderer
            ffmpegProcess.stderr.on('data', (data) => {
                const output = data.toString();
                const match = output.match(/size=\s*(\S+).*time=(\S+).*speed=(\S+)/);
                if (match) {
                    mainWindow.webContents.send('download-progress', {
                        size: match[1],
                        time: match[2],
                        speed: match[3]
                    });
                }
            });

            ffmpegProcess.on('error', (err) => {
                resolve({ success: false, error: 'FFmpeg not found. Is it installed?' });
            });

            ffmpegProcess.on('close', (code) => {
                ffmpegProcess = null;
                if (code === 0) {
                    resolve({ success: true, path: outputPath });
                } else {
                    resolve({ success: false, error: `FFmpeg exited with code ${code}` });
                }
            });

        } catch (err) {
            resolve({ success: false, error: 'Invalid URL format' });
        }
    });
});

// Handle cancel request
ipcMain.handle('cancel-download', () => {
    if (ffmpegProcess) {
        ffmpegProcess.kill('SIGTERM');
        ffmpegProcess = null;
        return { cancelled: true };
    }
    return { cancelled: false };
});