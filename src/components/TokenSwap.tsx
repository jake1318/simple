import {
  useCurrentAccount,
  useSuiClient,
  ConnectButton,
  useSignAndExecuteTransactionBlock,
} from "@mysten/dapp-kit";
import { DeepBookClient } from "@mysten/deepbook-v3";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";
import type { SuiTransactionBlockResponse } from "@mysten/sui.js/client";
import "./TokenSwap.css";

// Available tokens and their decimals
const TOKENS = {
  SUI: { decimals: 9, symbol: "SUI" },
  USDC: { decimals: 6, symbol: "USDC" },
  USDT: { decimals: 6, symbol: "USDT" },
} as const;

// Pool configurations
const POOLS = {
  "SUI-USDC": {
    id: "0x06d8af9e6afd27262db436f0d37b304a041f710c3ea1fa4c3a9bab36b3569ad3",
    tokens: ["SUI", "USDC"] as const,
  },
  "SUI-USDT": {
    id: "0x5eb2dfcdd1b15d2021328258f6d5ec091006ee7b03dd76236d3e5093a4773b69",
    tokens: ["SUI", "USDT"] as const,
  },
} as const;

interface TokenAmounts {
  inputAmount: string;
  expectedOutput: string;
}

const TokenSwap = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [digest, setDigest] = useState<string>("");
  const [fromToken, setFromToken] = useState<keyof typeof TOKENS>("SUI");
  const [toToken, setToToken] = useState<keyof typeof TOKENS>("USDC");
  const [amounts, setAmounts] = useState<TokenAmounts>({
    inputAmount: "",
    expectedOutput: "0",
  });

  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const deepBookClient = currentAccount
    ? new DeepBookClient({
        client: suiClient,
        address: currentAccount.address,
        env: "mainnet",
      })
    : null;

  // Find the appropriate pool for the token pair
  const getPool = (tokenA: string, tokenB: string) => {
    const poolKey = Object.keys(POOLS).find((key) => {
      const pool = POOLS[key as keyof typeof POOLS];
      return (
        pool.tokens.includes(tokenA as any) &&
        pool.tokens.includes(tokenB as any)
      );
    }) as keyof typeof POOLS | undefined;

    return poolKey ? POOLS[poolKey] : null;
  };

  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  async function handleSwap() {
    if (!currentAccount || !deepBookClient) {
      console.error("No wallet connected");
      return;
    }

    const pool = getPool(fromToken, toToken);
    if (!pool) {
      console.error("No pool available for this pair");
      return;
    }

    try {
      const tx = new TransactionBlock();
      const isBaseToQuote = pool.tokens[0] === fromToken;

      const inputDecimals = TOKENS[fromToken].decimals;
      const normalizedAmount = (
        parseFloat(amounts.inputAmount) * Math.pow(10, inputDecimals)
      ).toString();

      await deepBookClient.swap({
        tx,
        poolId: pool.id,
        inputAmount: normalizedAmount,
        baseToQuote: isBaseToQuote,
        minOutputAmount: "0",
      });

      signAndExecuteTransactionBlock(
        {
          transactionBlock: tx as any,
          chain: "sui:mainnet",
          options: {
            showEffects: true,
            showEvents: true,
          },
        },
        {
          onSuccess: (result: SuiTransactionBlockResponse) => {
            console.log("Transaction executed:", result);
            setDigest(result.digest);
            setAmounts({
              inputAmount: "",
              expectedOutput: "0",
            });
          },
          onError: (error: Error) => {
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
      <div className="swap-content">
        <div className="swap-card">
          <h1>Swap Tokens</h1>

          {/* Input Token Section */}
          <div className="token-section">
            <div className="token-header">
              <label></label>
              <span className="balance">Balance: 0.00</span>
            </div>
            <div className="input-group">
              <input
                type="number"
                value={amounts.inputAmount}
                onChange={(e) =>
                  setAmounts({
                    ...amounts,
                    inputAmount: e.target.value,
                  })
                }
                placeholder="0.00"
                min="0"
                step="0.000001"
              />
              <button className="max-btn">MAX</button>
            </div>
            <select
              className="token-select"
              value={fromToken}
              onChange={(e) =>
                setFromToken(e.target.value as keyof typeof TOKENS)
              }
            >
              {Object.entries(TOKENS).map(([symbol]) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Direction Button */}
          <button className="swap-direction-button" onClick={handleSwapTokens}>
            <span>↓</span>
          </button>

          {/* Output Token Section */}
          <div className="token-section">
            <div className="token-header">
              <label></label>
              <span className="balance">Balance: 0.00</span>
            </div>
            <div className="input-group">
              <input
                type="number"
                value={amounts.expectedOutput}
                readOnly
                placeholder="0.00"
              />
            </div>
            <select
              className="token-select"
              value={toToken}
              onChange={(e) =>
                setToToken(e.target.value as keyof typeof TOKENS)
              }
            >
              {Object.entries(TOKENS).map(([symbol]) => (
                <option
                  key={symbol}
                  value={symbol}
                  disabled={symbol === fromToken}
                >
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Price Info */}
          <div className="price-info">
            1 {fromToken} = 0.00 {toToken}
          </div>

          {/* Settings Section */}
          <div className="settings-section">
            <div className="slippage-settings">
              <span>Slippage Tolerance:</span>
              <input type="number" defaultValue="0.5" min="0" step="0.1" />
              <span>%</span>
            </div>
          </div>

          {/* Meta Info */}
          <div
            className="meta-info"
            style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#6F6E84" }}
          ></div>

          {!currentAccount ? (
            <ConnectButton className="swap-button" />
          ) : (
            <button
              className="swap-button"
              onClick={handleSwap}
              disabled={
                !amounts.inputAmount ||
                fromToken === toToken ||
                !getPool(fromToken, toToken)
              }
            >
              {fromToken === toToken
                ? "Invalid Pair"
                : !getPool(fromToken, toToken)
                ? "No Pool Available"
                : "Swap"}
            </button>
          )}

          {digest && (
            <div className="loading-message">Transaction Hash: {digest}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenSwap;
