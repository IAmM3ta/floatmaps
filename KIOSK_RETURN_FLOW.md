# Kiosk Return Flow UI + Net Consumption Billing

## Recommended Flow

1. **Pickup**: Record starting_soc + link device (voltage/pack capacity known from user_devices + pev_devices).
2. **Ride**: Optional real-time tracking.
3. **Return**: Kiosk reads ending_soc → calculates net consumption → only bills for net OPEV energy used.

## Polished Return Flow UI Snippet (for demo or kiosk web app)

```html
<div class="glass p-6 rounded-3xl max-w-md mx-auto">
  <div class="section-header mb-4">Return Battery</div>
  
  <div class="mb-4">
    <div class="text-sm text-white/60 mb-1">Battery ID</div>
    <div class="font-mono">KVL-042 • 32S Funwheel X7</div>
  </div>

  <div class="mb-4">
    <div class="text-sm text-white/60 mb-1">Starting SoC (at pickup)</div>
    <div class="text-2xl font-semibold">98%</div>
  </div>

  <div class="mb-6">
    <label class="text-sm text-white/60 block mb-1">Ending SoC (current reading)</label>
    <input id="ending-soc" type="range" min="0" max="100" value="60" 
           class="w-full accent-[#67f6ff]" oninput="updateNetCalculation()">
    <div class="flex justify-between text-xs mt-1">
      <span>0%</span>
      <span id="ending-soc-value" class="font-mono">60%</span>
    </div>
  </div>

  <div class="glass p-4 rounded-2xl mb-6">
    <div class="flex justify-between text-sm">
      <span>Net Energy Consumed</span>
      <span id="net-wh" class="font-semibold text-[#67f6ff]">~1,248 Wh</span>
    </div>
    <div class="text-xs text-white/50 mt-1">Only this amount will be billed (energy you returned is credited)</div>
  </div>

  <button onclick="processReturn()" 
          class="w-full py-3 rounded-2xl bg-[#67f6ff] text-[#050505] font-semibold">
    CONFIRM RETURN & FINALIZE
  </button>
</div>

<script>
function updateNetCalculation() {
  const ending = parseFloat(document.getElementById('ending-soc').value);
  document.getElementById('ending-soc-value').textContent = ending + '%';
  
  // In real app, get from current ride/device
  const starting = 98;
  const packWh = 3000; // Example for X7
  const net = (starting - ending) * packWh;
  
  document.getElementById('net-wh').textContent = '~' + Math.round(net) + ' Wh';
}

async function processReturn() {
  const endingSoc = parseFloat(document.getElementById('ending-soc').value);
  // Call enhanced /rides or dedicated return endpoint with starting_soc, ending_soc, pack_capacity
  alert('Return processed. Only net consumption billed. Thank you!');
}
</script>
```