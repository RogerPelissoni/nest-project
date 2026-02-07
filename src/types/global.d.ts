// Extensão global do BigInt para suportar serialização JSON
interface BigInt {
  toJSON(): string;
}
