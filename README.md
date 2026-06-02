ADDED_DETAILED_SUPABASE_REALTIME_INTEGRATION_SECTION (Postgres Changes for live_rides/safety_data, Broadcast channels for pings/GroupRide coordination, Presence for participants/location, code examples for ARManager integration, ping + haptic flow, performance throttling, RLS for permissions, tie-in to GroupRide beacon tap and ride recording/sharing)

## @floatmaps/floatila Package

FloatMaps includes a reusable client library for the **FloatILA** (Inter-device Location Architecture) protocol.

### Installation

#### From GitHub Packages (Recommended)

Because `@floatmaps/floatila` is published to GitHub Packages, you need to configure your package manager to use the GitHub registry.

Create or update a `.npmrc` file in your project root:

```ini
@floatmaps:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install the package:

```bash
npm install @floatmaps/floatila
```

#### Using pnpm or Yarn

**pnpm:**
```bash
pnpm add @floatmaps/floatila
```

**yarn:**
```bash
yarn add @floatmaps/floatila
```

#### Development (from source)

```bash
git clone https://github.com/IAmM3ta/floatmaps.git
cd floatmaps/packages/floatila
npm install
npm run build
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
2. Create a new GitHub Release (or trigger the workflow manually)
3. The `.github/workflows/publish-floatila.yml` workflow will automatically build and publish the package.

### Development

```bash
cd packages/floatila
npm install
npm run build
```