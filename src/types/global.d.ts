declare module "@mysten/deepbook-v3" {
  import { TransactionBlock } from "@mysten/sui.js/transactions";
  import { SuiClient } from "@mysten/sui.js/client";

  export type Environment = "mainnet" | "testnet" | "devnet";

  export interface SwapParams {
    tx: TransactionBlock;
    poolId: string;
    inputAmount: string;
    baseToQuote: boolean;
    minOutputAmount: string;
  }

  export interface DeepBookClientConfig {
    client: SuiClient;
    address: string;
    env: Environment;
  }

  export class DeepBookClient {
    constructor(config: DeepBookClientConfig);
    swap(params: SwapParams): Promise<void>;
  }
}

// Add timestamp type for consistency
export type Timestamp = `UTC: ${string}`;
export type UserInfo = `User: ${string}`;

// Add transaction result types
export interface TransactionResult {
  digest: string;
  effects: {
    status: {
      status: string;
    };
  };
}

export interface TransactionError {
  message: string;
  code?: string;
}
