import {
  useCurrentAccount,
  useSuiClient,
  ConnectButton,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { DeepBookClient } from "@mysten/deepbook-v3";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";

function TokenSwap() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [digest, setDigest] = useState<string>("");

  // Simple hook usage without custom execution
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  // Create DeepBookClient instance when account is available
  const deepBookClient = currentAccount
    ? new DeepBookClient({
        // @ts-ignore - Known type mismatch between dapp-kit and sui.js
        client: suiClient,
        address: currentAccount.address,
        env: "mainnet",
      })
    : null;

  async function handleSwap(isBaseToQuote: boolean, amount: string) {
    if (!currentAccount || !deepBookClient) {
      console.error("No wallet connected");
      return;
    }

    try {
      // Create and build the transaction
      const tx = new TransactionBlock();

      await deepBookClient.swap({
        tx,
        poolId: "YOUR_POOL_ID", // Replace with actual pool ID
        inputAmount: amount,
        baseToQuote: isBaseToQuote,
        minOutputAmount: "0", // Add proper slippage calculation
      });

      // Sign and execute the transaction with simplified options
      signAndExecuteTransactionBlock(
        {
          // @ts-ignore - Known type mismatch between TransactionBlock versions
          transactionBlock: tx,
          chain: "sui:mainnet",
          options: {
            showEffects: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log("Transaction executed:", result);
            setDigest(result.digest);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create swap transaction:", error);
    }
  }

  return (
    <div className="swap-container">
      <ConnectButton />
      {currentAccount ? (
        <div className="swap-form">
          <div className="meta-info">
            <div className="timestamp">UTC: 2025-01-30 05:49:22</div>
            <div className="user-info">User: jake1318</div>
          </div>

          <div className="swap-buttons">
            <button
              onClick={() => handleSwap(true, "1000000")}
              className="swap-button"
            >
              Swap Base to Quote
            </button>
            <button
              onClick={() => handleSwap(false, "1000000")}
              className="swap-button"
            >
              Swap Quote to Base
            </button>
          </div>

          {digest && (
            <div className="transaction-info">
              <h3>Last Transaction</h3>
              <code>{digest}</code>
            </div>
          )}
        </div>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to start swapping</p>
        </div>
      )}
    </div>
  );
}

export default TokenSwap;
