declare module "@mysten/deepbook-v3" {
  import { TransactionBlock } from "@mysten/sui.js/transactions";

  export type Environment = "mainnet" | "testnet" | "devnet";

  export interface SwapParams {
    tx: TransactionBlock;
    poolId: string;
    inputAmount: string;
    baseToQuote: boolean;
    minOutputAmount: string;
  }

  export interface DeepBookClientConfig {
    client: any; // Using any to avoid version conflicts
    address: string;
    env: Environment;
  }

  export class DeepBookClient {
    constructor(config: DeepBookClientConfig);
    swap(params: SwapParams): Promise<void>;
  }
}
