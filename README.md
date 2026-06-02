ADDED_DETAILED_SUPABASE_REALTIME_INTEGRATION_SECTION (Postgres Changes for live_rides/safety_data, Broadcast channels for pings/GroupRide coordination, Presence for participants/location, code examples for ARManager integration, ping + haptic flow, performance throttling, RLS for permissions, tie-in to GroupRide beacon tap and ride recording/sharing)

## @floatmaps/floatila Package

FloatMaps includes a reusable client library for the **FloatILA** (Inter-device Location Architecture) protocol.

### Installation

```bash
npm install @floatmaps/floatila
```

### Usage

```ts
import { generateSchnorrProof, verifySchnorrProof } from '@floatmaps/floatila';

// Generate a cryptographic proof of device ownership
const proof = generateSchnorrProof(privateKey, publicKey, context);

// Verify the proof
const isValid = verifySchnorrProof(publicKey, proof, context);

console.log('Ownership verified:', isValid);
```

### Publishing the Package

The package is configured to publish to GitHub Packages.

To publish a new version:

1. Update the version in `packages/floatila/package.json`
2. Create a new GitHub Release
3. The `publish-floatila.yml` workflow will automatically build and publish the package.

You can also trigger the workflow manually from the Actions tab.

### Development

```bash
cd packages/floatila
npm install
npm run build
```