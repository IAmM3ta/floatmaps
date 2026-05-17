# Deployment Scripts + Polished Profile UI + Energy Accounting

## 1. Supabase Deployment
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy --all
```

## 2. Modal Deployment (Gaussian Splatting)
```bash
pip install modal
modal token set
modal deploy scripts/gaussian_splatting_job.py
```

## 3. Polished Profile Modal HTML Block (copy into index.html)

Replace or enhance your current Profile modal content with this refined version:

```html
<!-- Inside Profile Modal -->
<div class="space-y-6">
  <!-- Auth Status -->
  <div id="auth-status" class="glass p-4 rounded-2xl">
    <!-- Populated by JS -->
  </div>

  <!-- Custom Tunings (existing) -->
  ...

  <!-- PEV Device Lookup - Refined UI -->
  <div>
    <div class="section-header mb-2 flex items-center justify-between">
      <span>Your Devices & Compatible OPEV Packs</span>
      <button onclick="searchDevices()" class="text-xs px-3 py-1 bg-white/10 rounded">Refresh</button>
    </div>
    
    <div class="grid grid-cols-2 gap-2 mb-3">
      <select id="device-type-filter" class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
        <option value="">All Types</option>
        <option value="onewheel">Onewheel/VESC</option>
        <option value="euc">EUC</option>
        <option value="escooter">E-Scooter</option>
        <option value="ebike">E-Bike</option>
        <option value="eskateboard">E-Skate</option>
      </select>
      <input id="voltage-filter" type="text" placeholder="Voltage e.g. 32S" 
             class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
    </div>

    <div id="device-results" class="max-h-40 overflow-auto space-y-2 text-sm"></div>
  </div>

  <!-- Energy Note -->
  <div class="text-xs text-white/50">
    Note: You are only billed for energy drawn from OPEV modular batteries. 
    Energy you add via personal charger is not charged.
  </div>
</div>
```

## 4. Refined Device Lookup JS
(Already in AUTH_AND_DEVICE_INTEGRATION.md - use the searchDevices function with both type and voltage filters)

## 5. Energy Accounting Logic
When logging rides:
- Track `wh_from_opev` vs `wh_from_user`
- Only create billing transaction for `wh_from_opev`
- Frontend can show breakdown in ride history

This prevents users from being charged for self-charged energy.