# Exact Merged UI Sections for index.html

Copy and paste these blocks into your `index.html` at the appropriate locations.

## Block 1: Enhanced Profile Modal Content (replace or merge with existing Profile modal body)

```html
<!-- My Energy Credits & Gifts Dashboard -->
<div class="mt-6">
  <div class="section-header mb-3">My Energy Credits & Gifts</div>
  
  <div class="grid grid-cols-2 gap-3 mb-4">
    <div class="glass p-4 rounded-2xl">
      <div class="text-xs text-white/60">Available Credits</div>
      <div class="text-3xl font-semibold text-[#67f6ff]">2,840 <span class="text-sm">Wh</span></div>
    </div>
    <div class="glass p-4 rounded-2xl">
      <div class="text-xs text-white/60">Gifted This Month</div>
      <div class="text-3xl font-semibold">1,650 <span class="text-sm">Wh</span></div>
    </div>
  </div>

  <div>
    <div class="text-xs text-white/60 mb-2">Recent Activity</div>
    <div class="space-y-2 text-sm">
      <div class="glass p-3 rounded-xl flex justify-between items-center">
        <div>Gifted 1,200 Wh to Eric (Specific Pack)</div>
        <div class="text-emerald-400 text-xs">Claimed</div>
      </div>
    </div>
  </div>
</div>

<!-- PEV Device Lookup (refined) -->
<div class="mt-6 border-t border-white/10 pt-6">
  <div class="section-header mb-2">Your Devices & Compatible OPEV Packs</div>
  
  <div class="flex gap-2 mb-3">
    <select id="device-type-filter" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm flex-1">
      <option value="">All Types</option>
      <option value="onewheel">Onewheel / VESC</option>
      <option value="euc">EUC</option>
      <option value="escooter">E-Scooter</option>
      <option value="ebike">E-Bike</option>
      <option value="eskateboard">E-Skateboard</option>
    </select>
    <input id="voltage-filter" type="text" placeholder="Voltage (e.g. 32S)" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm w-32">
    <button onclick="searchDevices()" class="px-4 py-2 bg-white/10 rounded-xl text-sm">Search</button>
  </div>

  <div id="device-results" class="max-h-40 overflow-auto space-y-2 text-sm"></div>
</div>
```

## Block 2: Kiosk Return Flow with Gifting (add to return/kiosk modal or section)

```html
<div class="mt-4 p-4 glass rounded-2xl">
  <div class="font-semibold mb-2">Leftover Charge Options</div>
  
  <div class="flex flex-col gap-2">
    <button onclick="returnNormally()" class="px-4 py-3 rounded-xl border border-white/20 text-left text-sm">
      Return normally — I keep the credit
    </button>
    
    <button onclick="showGiftingOptions()" class="px-4 py-3 rounded-xl bg-[#67f6ff] text-black text-left text-sm">
      Gift remaining charge to a friend
    </button>
  </div>

  <!-- Gifting Options Modal Trigger Content -->
  <div id="gifting-options" class="hidden mt-4">
    <div class="text-xs mb-2">Choose gift type:</div>
    <div class="flex gap-2">
      <button onclick="createGift('specific_pack')" class="flex-1 py-2 rounded-xl border border-white/20 text-xs">Specific Pack</button>
      <button onclick="createGift('general_credit')" class="flex-1 py-2 rounded-xl border border-white/20 text-xs">General Credit</button>
    </div>
  </div>

  <div id="gift-qr-container" class="hidden mt-4 text-center">
    <!-- QR will be injected here -->
  </div>
</div>
```

## JavaScript Functions to Add

Add these functions in your script section (they integrate with existing IndexedDB and fetch calls):

```js
async function searchDevices() {
  const type = document.getElementById('device-type-filter').value;
  const voltage = document.getElementById('voltage-filter').value;
  
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/devices', {
    method: 'POST',
    body: JSON.stringify({ deviceType: type || undefined, voltageConfig: voltage || undefined })
  });
  const { devices } = await res.json();

  const container = document.getElementById('device-results');
  container.innerHTML = devices.map(d => `
    <div class="glass p-3 rounded-xl flex justify-between items-center text-xs">
      <div><strong>${d.brand} ${d.model}</strong> — ${d.voltage_config}</div>
      <button onclick="selectDevice('${d.id}')" class="px-3 py-1 bg-[#67f6ff] text-black rounded text-xs">Select</button>
    </div>
  `).join('');
}

async function createGift(giftType) {
  // Call gifting Edge Function
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/gifting', {
    method: 'POST',
    body: JSON.stringify({
      action: 'create_gift',
      data: { fromRiderId: currentUser.id, giftedWh: calculateRemainingWh(), giftType }
    })
  });
  const { qr_token } = await res.json();
  showGiftQR(qr_token); // from qr-helper.js
}

// Add similar functions for returnNormally(), showGiftingOptions(), etc.
```

These blocks are designed to work with your existing Tailwind classes and the helper functions in `scripts/qr-helper.js`.