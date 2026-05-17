// Simple QR Code helper for FloatMaps gifting
// Include via CDN in production: <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

function generateQRCode(token, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  
  container.innerHTML = '';
  
  // Using QRCode.js if available, otherwise fallback text
  if (typeof QRCode !== 'undefined') {
    new QRCode(container, {
      text: token,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff"
    });
  } else {
    // Fallback
    container.innerHTML = `
      <div class="p-4 bg-white text-black text-center">
        <div class="font-mono text-xs break-all">${token}</div>
        <div class="text-[10px] mt-2">QR Code (include qrcodejs CDN for visual)</div>
      </div>
    `;
  }
}

function showGiftQR(token) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-6';
  modal.innerHTML = `
    <div class="glass max-w-sm w-full p-6 rounded-3xl">
      <div class="text-center mb-4">
        <div class="font-semibold">Gift QR Code</div>
        <div class="text-xs text-white/60">Share with your friend</div>
      </div>
      <div id="qr-container" class="flex justify-center"></div>
      <div class="mt-4 text-center">
        <button onclick="this.closest('.fixed').remove()" 
                class="px-6 py-2 rounded-2xl border border-white/20 text-sm">
          Close
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  setTimeout(() => {
    generateQRCode(token, 'qr-container');
  }, 100);
}