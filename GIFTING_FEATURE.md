# Gifting Leftover Charge Feature

## Concept
When returning a battery with remaining charge, the user can choose to **gift the remaining energy** to a connected friend on the network.

This generates a QR code. The friend can claim the charged pack. When the friend eventually returns that pack, the original user receives credit for the gifted energy (or it is simply not billed to them).

## Flow
1. User returns battery at kiosk.
2. System calculates remaining charge (e.g. 60%).
3. User selects "Gift remaining charge to a friend".
4. System generates unique QR token and creates `energy_gifts` record.
5. QR code is shown (or sent to friend).
6. Friend uses QR (at kiosk or in app) to associate with their swap/return.
7. When friend returns the gifted pack, original user's account is credited (net consumption adjusted).

## UI Addition to Return Flow

In the return screen, after calculating net consumption:

```html
<div class="mt-4 p-4 glass rounded-2xl">
  <div class="font-semibold mb-2">Leftover Charge Options</div>
  
  <div class="flex flex-col gap-2">
    <button onclick="returnNormally()" class="px-4 py-3 rounded-xl border border-white/20 text-left">
      Return normally (I keep any credit)
    </button>
    
    <button onclick="giftToFriend()" class="px-4 py-3 rounded-xl bg-[#67f6ff] text-black text-left">
      Gift remaining charge to a friend
    </button>
  </div>
  
  <div id="gift-qr" class="hidden mt-4 text-center">
    <!-- QR code will be generated here -->
    <div class="text-xs mt-2">Share this QR with your friend. They can claim the charged pack.</div>
  </div>
</div>
```

## JavaScript Logic (simplified)
```js
async function giftToFriend() {
  const remainingWh = calculateRemainingWh(); // from ending SoC
  
  const res = await fetch('/functions/v1/gifting', {
    method: 'POST',
    body: JSON.stringify({
      action: 'create_gift',
      data: {
        fromRiderId: currentUser.id,
        rideLogId: currentRide.id,
        giftedWh: remainingWh
      }
    })
  });
  
  const { qr_token } = await res.json();
  
  // Generate QR code (use qrcode.js or similar)
  showQRCode(qr_token);
  
  // Mark in ride that part was gifted (adjust billing)
}

// When friend redeems (via QR scan or kiosk)
async function redeemGift(qrToken) {
  await fetch('/functions/v1/gifting', {
    method: 'POST',
    body: JSON.stringify({
      action: 'redeem_gift',
      data: { qrToken, claimingRiderId: currentUser.id }
    })
  });
}
```

## Billing Impact
- When gift is created, the gifted Wh is excluded from the original user's bill.
- When recipient returns the pack, the system can further adjust or simply treat the gifted portion as already credited.

This feature beautifully embodies the community ethos while maintaining fair energy accounting.