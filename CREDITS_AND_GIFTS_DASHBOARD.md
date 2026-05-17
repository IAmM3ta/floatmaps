# My Credits & Gifts Dashboard

Add this section to the Profile modal for users to see their gifting activity and available credits.

```html
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
    <div class="text-xs text-white/60 mb-2">Recent Gifts</div>
    <div class="space-y-2 text-sm">
      <!-- Populated dynamically -->
      <div class="glass p-3 rounded-xl flex justify-between">
        <div>Gifted 1,200 Wh to Eric</div>
        <div class="text-emerald-400 text-xs">Claimed</div>
      </div>
    </div>
  </div>
</div>
```

**JavaScript to populate it** (example):
```js
async function loadCreditsAndGifts() {
  // Fetch from energy_gifts + energy_transactions
  // Show available credits from general_credit gifts
  // List recent sent/received gifts
}
```