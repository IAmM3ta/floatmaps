# Full Auth Flow + PEV Device Lookup Integration

## 1. Supabase Auth Setup
- Enable Email + Password or Magic Link in Supabase Auth.
- On signup, automatically create a row in `riders` table via trigger or Edge Function.

## 2. Signup Flow (Recommended)
1. User signs up via Supabase Auth.
2. After auth success, prompt for device selection.
3. Call `/functions/v1/devices` to search compatible PEVs.
4. User selects device(s) → insert into `user_devices`.
5. Optionally save initial `rider_tunings`.

## 3. Exact Frontend Wiring for index.html (Profile Modal)

Add this section inside the Profile modal (after dashboard or in a new tab):

```html
<!-- Device Lookup Section -->
<div class="mt-6">
  <div class="section-header mb-2">Your PEV Devices</div>
  
  <div class="flex gap-2 mb-3">
    <select id="device-type-filter" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
      <option value="">All Types</option>
      <option value="onewheel">Onewheel / VESC</option>
      <option value="euc">EUC</option>
      <option value="escooter">E-Scooter</option>
      <option value="ebike">E-Bike</option>
      <option value="eskateboard">E-Skateboard</option>
    </select>
    <button onclick="searchDevices()" class="px-4 py-2 bg-white/10 rounded-xl text-sm">Search Compatible Packs</button>
  </div>

  <div id="device-results" class="space-y-2 text-sm"></div>

  <button onclick="addSelectedDevice()" class="mt-2 text-xs px-3 py-1.5 rounded-lg border border-white/20">+ Add to My Profile</button>
</div>
```

**JavaScript to add (inside script tag):**

```js
async function searchDevices() {
  const type = document.getElementById('device-type-filter').value;
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/devices', {
    method: 'POST',
    body: JSON.stringify({ deviceType: type })
  });
  const { devices } = await res.json();

  const container = document.getElementById('device-results');
  container.innerHTML = devices.map(d => `
    <div class="glass p-3 rounded-xl flex justify-between items-center">
      <div>
        <strong>${d.brand} ${d.model}</strong><br>
        <span class="text-xs text-white/60">${d.voltage_config} • ${d.device_type}</span>
      </div>
      <button onclick="selectDevice('${d.id}')" class="text-xs px-3 py-1 bg-[#67f6ff] text-black rounded">Select</button>
    </div>
  `).join('');
}

let selectedDeviceId = null;
function selectDevice(id) { selectedDeviceId = id; }

async function addSelectedDevice() {
  if (!selectedDeviceId || !currentUser) return;
  await supabase.from('user_devices').insert({
    rider_id: currentUser.id,
    device_id: selectedDeviceId
  });
  alert('Device added to profile. Compatible OPEV packs now recommended.');
}
```

## 4. Auth Helpers (add near top of script)
```js
// Example Supabase Auth wiring
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return alert(error.message);
  // After signup, create rider profile if needed
  await supabase.from('riders').insert({ id: data.user.id, email });
}

async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  // Load user profile + devices
}
```

## 5. Kiosk Handoff Enhancement
When picking up a battery, check user's linked devices and recommend matching voltage packs automatically.