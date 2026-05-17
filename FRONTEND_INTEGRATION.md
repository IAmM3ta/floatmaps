# FloatMaps Frontend Integration Guide

## Connecting to Supabase Backend

### 1. Install Supabase JS (in production build)
```bash
npm install @supabase/supabase-js
```

### 2. Initialize Client (add to your app)
```js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://YOUR-PROJECT.supabase.co',
  'YOUR-ANON-KEY'
);
```

### 3. Key Integrations

#### Fetch & Apply Rider Tunings (Kiosk Flow)
```js
async function fetchAndApplyTunings(riderId) {
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/tunings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ riderId })
  });
  const { tunings } = await res.json();
  console.log('Applying to battery:', tunings);
  // Trigger kiosk hardware sync here
}
```

#### Log a Ride Session
```js
async function logRide(riderId, rideData) {
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/rides', {
    method: 'POST',
    body: JSON.stringify({ riderId, rideData })
  });
  return res.json();
}
```

#### Create Geocache Note
```js
async function createGeocacheNote(riderId, note) {
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/geocache', {
    method: 'POST',
    body: JSON.stringify({ riderId, note })
  });
  return res.json();
}
```

#### Report Hazard
```js
async function reportHazard(hazard) {
  const res = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/hazards', {
    method: 'POST',
    body: JSON.stringify({ hazard })
  });
  return res.json();
}
```

#### Enable Push Notifications
See updated sw.js and profile section in index.html for VAPID subscription flow.

## Row Level Security
All data access is protected by the RLS policies in supabase/migrations/20260517_rls_policies.sql.

## Next Steps
- Wire real auth (Supabase Auth)
- Replace mock IndexedDB with Supabase calls in production build
- Add error handling and loading states