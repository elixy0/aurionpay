import { buildPoseidon } from "circomlibjs";
import * as snarkjs from "snarkjs";

export function generateCurveSafeRandom() {
  const bytes = new Uint8Array(31);
  window.crypto.getRandomValues(bytes);
  return BigInt(
    "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")
  );
}

export function bigIntToHex32(n) {
  return n.toString(16).padStart(64, "0");
}

export async function generateCommitment(secret, nullifier) {
  const poseidon   = await buildPoseidon();
  const hash       = poseidon([secret, nullifier]);
  const commitHex  = poseidon.F.toString(hash, 16).padStart(64, "0");
  return commitHex;
}

export async function generateNullifierHash(nullifier) {
  const poseidon = await buildPoseidon();
  const hash     = poseidon([nullifier]);
  return poseidon.F.toString(hash);
}

export function generateBackupNote(secret, nullifier) {
  return `aurion-${secret.toString(16)}-${nullifier.toString(16)}`;
}

export function parseBackupNote(note) {
  if (!note.startsWith("aurion-")) throw new Error("Invalid note format");
  const parts = note.split("-");
  if (parts.length !== 3) throw new Error("Invalid note format");
  return {
    secret:   BigInt("0x" + parts[1]),
    nullifier: BigInt("0x" + parts[2]),
  };
}

export async function generateWithdrawProof({ secret, nullifier, invoiceId }) {
  const poseidon = await buildPoseidon();

  const nullifierHashBig = poseidon([nullifier]);
  const nullifierHash    = poseidon.F.toString(nullifierHashBig);

  const input = {
    secret:       secret.toString(),
    nullifier:    nullifier.toString(),
    root:         "0",
    invoiceId:    BigInt("0x" + invoiceId).toString(),
    nullifierHash,
  };

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    "/withdraw.wasm",
    "/withdraw_final.zkey"
  );

  const nullifierHex = BigInt(publicSignals[1]).toString(16).padStart(64, "0");

  return { proof, publicSignals, nullifierHex };
}

export function parseProofForSolidity(proof) {
  const a  = [BigInt(proof.pi_a[0]),  BigInt(proof.pi_a[1])];
  const b  = [
    [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
    [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
  ];
  const c  = [BigInt(proof.pi_c[0]),  BigInt(proof.pi_c[1])];
  return { a, b, c };
}