# @floatmaps/floatila

Client library for the FloatILA (Inter-device Location Architecture) protocol.

## Installation

```bash
npm install @floatmaps/floatila
```

## Usage

```ts
import { generateSchnorrProof, verifySchnorrProof } from '@floatmaps/floatila';

// Generate ownership proof
const proof = generateSchnorrProof(privateKey, publicKey);

// Verify ownership
const isValid = verifySchnorrProof(publicKey, proof);
```

## Publishing

This package is configured to publish to GitHub Packages.

```bash
npm publish
```