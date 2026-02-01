const urlInput = document.getElementById('url');
const filenameInput = document.getElementById('filename');
const refererInput = document.getElementById('referer');
const downloadBtn = document.getElementById('downloadBtn');
const cancelBtn = document.getElementById('cancelBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const status = document.getElementById('status');

let isDownloading = false;

// Listen for progress updates from main process
window.api.onProgress((data) => {
    progressText.textContent = `Size: ${data.size} | Time: ${data.time} | Speed: ${data.speed}`;
    // Animate progress bar (we don't know total size, so just pulse)
    progressFill.style.width = '100%';
});

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    const filename = filenameInput.value.trim();
    const customReferer = refererInput.value.trim();

    if (!url) {
        showStatus('error', 'Please enter a URL');
        return;
    }

    // Reset UI
    status.className = 'status';
    status.style.display = 'none';
    progressFill.style.width = '0%';
    progressText.textContent = 'Starting download...';

    // Show progress, hide download button
    setDownloadingState(true);

    const result = await window.api.startDownload({ url, filename, customReferer });

    setDownloadingState(false);

    if (result.success) {
        showStatus('success', `Download complete!<div class="status-path">Saved to: ${result.path}</div>`);
    } else {
        showStatus('error', result.error);
    }
});

cancelBtn.addEventListener('click', async () => {
    const result = await window.api.cancelDownload();
    if (result.cancelled) {
        setDownloadingState(false);
        showStatus('error', 'Download cancelled');
    }
});

function setDownloadingState(downloading) {
    isDownloading = downloading;
    downloadBtn.disabled = downloading;
    downloadBtn.textContent = downloading ? 'Downloading...' : 'Download';
    cancelBtn.style.display = downloading ? 'block' : 'none';
    progressSection.classList.toggle('active', downloading);
}

function showStatus(type, message) {
    status.className = `status ${type}`;
    status.innerHTML = message;
    status.style.display = 'block';
}

// Allow Enter key to trigger download
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isDownloading) {
        downloadBtn.click();
    }
});