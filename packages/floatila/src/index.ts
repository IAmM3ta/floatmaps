import { ed25519 } from '@noble/curves/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export interface SchnorrProof {
  R: Uint8Array;
  s: Uint8Array;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  return BigInt('0x' + bytesToHex(bytes));
}

function bigIntToBytes(n: bigint, length: number): Uint8Array {
  const hex = n.toString(16).padStart(length * 2, '0');
  return hexToBytes(hex);
}

function hashToScalar(data: Uint8Array): bigint {
  const hash = sha512(data);
  return ed25519.utils.mod(bytesToBigInt(hash), ed25519.CURVE.n);
}

export function generateSchnorrProof(
  sk: Uint8Array,
  pk: Uint8Array,
  context: Uint8Array = new Uint8Array()
): SchnorrProof {
  const r = ed25519.utils.randomPrivateKey();
  const R = ed25519.getPublicKey(r);
  const c = hashToScalar(concat(R, pk, context));
  const s = ed25519.utils.mod(
    bytesToBigInt(r) + c * bytesToBigInt(sk),
    ed25519.CURVE.n
  );
  return {
    R,
    s: bigIntToBytes(s, 32),
  };
}

export function verifySchnorrProof(
  pk: Uint8Array,
  proof: SchnorrProof,
  context: Uint8Array = new Uint8Array()
): boolean {
  try {
    const c = hashToScalar(concat(proof.R, pk, context));
    const lhs = ed25519.getPublicKey(proof.s);
    const rhs = ed25519.Point.fromHex(proof.R).add(
      ed25519.Point.fromHex(pk).multiply(c)
    );
    return lhs.equals(rhs);
  } catch {
    return false;
  }
}
