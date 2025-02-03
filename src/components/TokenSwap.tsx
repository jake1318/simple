// src/components/TokenSwap.tsx
import { useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
// Ensure DeepbookV3Client is available; if you lack types, create a file at src/types/deepbook-v3.d.ts with:
// declare module '@mystenlabs/deepbook-v3';
import { DeepbookV3Client } from "@mystenlabs/deepbook-v3";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState, useEffect } from "react";
import type { CoinStruct } from "@mysten/sui.js/client";
import "./TokenSwap.css";

// Example token definitions (adjust decimals and symbol as necessary)
const TOKENS = {
  SUI: { decimals: 9, symbol: "SUI" },
  USDC: { decimals: 6, symbol: "USDC" },
  USDT: { decimals: 6, symbol: "USDT" },
} as const;

// Example pool configurations – adjust pool IDs and token order per your deployment
const POOLS: { [key: string]: { id: string; tokens: (keyof typeof TOKENS)[] } } = {
  "SUI-USDC": {
    id: "0x06d8af9e6afd27262db436f0d37b304a041f710c3ea1fa4c3a9bab36b3569ad3",
    tokens: ["SUI", "USDC"],
  },
  "SUI-USDT": {
    id: "0x5eb2dfcdd1b15d2021328258f6d5ec091006ee7b03dd76236d3e5093a4773b69",
    tokens: ["SUI", "USDT"],
  },
};

interface TokenAmounts {
  inputAmount: string;
  expectedOutput: string;
}

// Map token symbols to their on-chain coin types
const TOKEN_COIN_TYPES: { [key in keyof typeof TOKENS]: string } = {
  SUI: "0x2::sui::SUI",
  USDC: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
  USDT: "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
};

// Helper function to convert a Uint8Array to a hex string
const toHexString = (byteArray: Uint8Array): string =>
  Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const TokenSwap = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [fromToken, setFromToken] = useState<keyof typeof TOKENS>("SUI");
  const [toToken, setToToken] = useState<keyof typeof TOKENS>("USDC");
  const [amounts, setAmounts] = useState<TokenAmounts>({ inputAmount: "", expectedOutput: "0" });
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: string }>({
    SUI: "0",
    USDC: "0",
    USDT: "0",
  });
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [balanceManagerInitialized, setBalanceManagerInitialized] = useState(false);

  // Instantiate the Deepbook client using the connected wallet's Sui client.
  const deepBookClient = currentAccount
    ? new DeepbookV3Client({
        client: suiClient,
        env: "mainnet", // or "testnet" as appropriate
      })
    : null;

  // When the account connects, initialize any on-chain balance management (if needed)
  useEffect(() => {
    if (currentAccount && !balanceManagerInitialized) {
      initializeBalanceManager();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount, balanceManagerInitialized]);

  // Periodically fetch token balances from the wallet.
  useEffect(() => {
    if (currentAccount) {
      fetchTokenBalances();
      const interval = setInterval(fetchTokenBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [currentAccount]);

  // Whenever the input amount or token pair changes, get a price quote.
  useEffect(() => {
    if (amounts.inputAmount) {
      getQuote(amounts.inputAmount);
    } else {
      setAmounts((prev) => ({ ...prev, expectedOutput: "0" }));
    }
  }, [amounts.inputAmount, fromToken, toToken]);

  // Initialize on-chain balance manager (if your protocol requires this step)
  const initializeBalanceManager = async () => {
    if (!deepBookClient || !currentAccount) return;
    try {
      const txb = new TransactionBlock();
      txb.moveCall({
        target: `${deepBookClient.packageId}::custodian::new_pool_balance_register`,
        arguments: [],
      });
      // Build and submit the transaction (convert to hex string if needed)
      const builtTx = await txb.build();
      const hexTx = toHexString(builtTx);
      await signAndExecuteTransaction({ transaction: hexTx });
      setBalanceManagerInitialized(true);
    } catch (error) {
      console.error("Failed to initialize balance manager:", error);
      setError("Failed to initialize balance manager. Please try again.");
    }
  };

  // Fetch token balances from the connected wallet.
  const fetchTokenBalances = async () => {
    if (!currentAccount || !suiClient) return;
    setIsLoadingBalances(true);
    try {
      const { data: coins } = await suiClient.getAllCoins({
        owner: currentAccount.address,
      });
      const balanceMap: { [key: string]: string } = { SUI: "0", USDC: "0", USDT: "0" };
      coins.forEach((coin: CoinStruct) => {
        if (coin.coinType === TOKEN_COIN_TYPES.SUI) {
          balanceMap.SUI = (Number(coin.balance) / Math.pow(10, TOKENS.SUI.decimals)).toFixed(TOKENS.SUI.decimals);
        } else if (coin.coinType === TOKEN_COIN_TYPES.USDC) {
          balanceMap.USDC = (Number(coin.balance) / Math.pow(10, TOKENS.USDC.decimals)).toFixed(TOKENS.USDC.decimals);
        } else if (coin.coinType === TOKEN_COIN_TYPES.USDT) {
          balanceMap.USDT = (Number(coin.balance) / Math.pow(10, TOKENS.USDT.decimals)).toFixed(TOKENS.USDT.decimals);
        }
      });
      setTokenBalances(balanceMap);
    } catch (error) {
      console.error("Error fetching token balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Retrieve a price quote from the Deepbook orderbook.
  const getQuote = async (inputAmount: string) => {
    if (!deepBookClient || !inputAmount || Number(inputAmount) <= 0 || !currentAccount) {
      setAmounts((prev) => ({ ...prev, expectedOutput: "0" }));
      return;
    }
    const pool = getPool(fromToken, toToken);
    if (!pool) {
      console.error("No pool available for this pair");
      return;
    }
    try {
      const inputDecimals = TOKENS[fromToken].decimals;
      const normalizedAmount = (parseFloat(inputAmount) * Math.pow(10, inputDecimals)).toString();
      const isBaseToQuote = pool.tokens[0] === fromToken;
      const orderbook = await deepBookClient.getOrderbook({ poolId: pool.id, page: 1, limit: 1 });
      if (!orderbook || (isBaseToQuote && !orderbook.bids[0]) || (!isBaseToQuote && !orderbook.asks[0])) {
        throw new Error("No liquidity available");
      }
      const price = isBaseToQuote ? orderbook.bids[0].price : orderbook.asks[0].price;
      const outputAmount = (Number(normalizedAmount) * Number(price)) / Math.pow(10, TOKENS[toToken].decimals);
      setAmounts((prev) => ({
        ...prev,
        expectedOutput: outputAmount.toFixed(TOKENS[toToken].decimals),
      }));
      return orderbook;
    } catch (error) {
      console.error("Error getting quote:", error);
      setAmounts((prev) => ({ ...prev, expectedOutput: "0" }));
      return null;
    }
  };

  // Find the pool configuration for the given token pair.
  const getPool = (tokenA: keyof typeof TOKENS, tokenB: keyof typeof TOKENS) => {
    const poolKey = Object.keys(POOLS).find((key) => {
      const pool = POOLS[key];
      return pool.tokens.includes(tokenA) && pool.tokens.includes(tokenB);
    });
    return poolKey ? POOLS[poolKey] : null;
  };

  // Build and execute the swap transaction.
  const executeSwap = async () => {
    if (!currentAccount || !deepBookClient || !suiClient) {
      setError("No wallet connected");
      return;
    }
    if (!balanceManagerInitialized) {
      setError("Balance manager not initialized");
      return;
    }
    const inputBalance = Number(tokenBalances[fromToken]);
    const inputAmount = Number(amounts.inputAmount);
    if (inputAmount > inputBalance) {
      setError("Insufficient balance");
      return;
    }
    const pool = getPool(fromToken, toToken);
    if (!pool) {
      setError("No pool available for this pair");
      return;
    }
    setIsSwapping(true);
    setError("");
    try {
      const txb = new TransactionBlock();
      const isBaseToQuote = pool.tokens[0] === fromToken;
      const inputDecimals = TOKENS[fromToken].decimals;
      const normalizedAmount = BigInt(Math.floor(parseFloat(amounts.inputAmount) * Math.pow(10, inputDecimals)));
      const coinType = TOKEN_COIN_TYPES[fromToken];
      const { data: coins } = await suiClient.getCoins({ owner: currentAccount.address, coinType });
      if (!coins || coins.length === 0) {
        throw new Error("No coins available for swap");
      }
      // Calculate the minimum output, accounting for slippage.
      const minOutput = BigInt(Math.floor(Number(amounts.expectedOutput) * (1 - slippage / 100) * Math.pow(10, TOKENS[toToken].decimals)));
      const [inputCoin] = txb.splitCoins(txb.object(coins[0].coinObjectId), [txb.pure(normalizedAmount)]);
      // Create a market order call (adjust the target/method as required by your on-chain module)
      txb.moveCall({
        target: `${deepBookClient.packageId}::clob::place_market_order`,
        arguments: [
          txb.object(pool.id),
          inputCoin,
          txb.pure(isBaseToQuote),
          txb.pure(minOutput),
          txb.pure(Date.now().toString()),
        ],
      });
      // Build the transaction and convert it to a hex string
      const builtTx = await txb.build();
      const hexTx = toHexString(builtTx);
      await signAndExecuteTransaction({ transaction: hexTx });
      // On success, reset input and refresh balances.
      setAmounts({ inputAmount: "", expectedOutput: "0" });
      fetchTokenBalances();
      setError("");
    } catch (error) {
      console.error("Failed to create swap transaction:", error);
      setError("Failed to create swap transaction: " + (error as Error).message);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="swap-container">
      <div className="swap-content">
        <div className="swap-card">
          <h1>Swap Tokens</h1>
          {!balanceManagerInitialized && currentAccount && (
            <div className="warning-message">Initializing balance manager...</div>
          )}
          <div className="token-section">
            <div className="token-header">
              <span className="balance">Balance: {isLoadingBalances ? "Loading..." : tokenBalances[fromToken]}</span>
            </div>
            <div className="input-group">
              <input
                type="number"
                value={amounts.inputAmount}
                onChange={(e) => setAmounts({ ...amounts, inputAmount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.000001"
              />
              <button
                className="max-btn"
                onClick={() => setAmounts({ ...amounts, inputAmount: tokenBalances[fromToken] })}
                disabled={!currentAccount || isLoadingBalances}
              >
                MAX
              </button>
            </div>
            <select className="token-select" value={fromToken} onChange={(e) => setFromToken(e.target.value as keyof typeof TOKENS)}>
              {Object.entries(TOKENS).map(([symbol]) => (
                <option key={symbol} value={symbol}>{symbol}</option>
              ))}
            </select>
          </div>
          <button
            className="swap-direction-button"
            onClick={() => {
              setFromToken(toToken);
              setToToken(fromToken);
            }}
          >
            <span>↓</span>
          </button>
          <div className="token-section">
            <div className="token-header">
              <span className="balance">Balance: {isLoadingBalances ? "Loading..." : tokenBalances[toToken]}</span>
            </div>
            <div className="input-group">
              <input type="number" value={amounts.expectedOutput} readOnly placeholder="0.00" />
            </div>
            <select className="token-select" value={toToken} onChange={(e) => setToToken(e.target.value as keyof typeof TOKENS)}>
              {Object.entries(TOKENS).map(([symbol]) => (
                <option key={symbol} value={symbol} disabled={symbol === fromToken}>{symbol}</option>
              ))}
            </select>
          </div>
          <div className="price-info">
            {amounts.inputAmount && amounts.expectedOutput !== "0" ? (
              <>
                <div>1 {fromToken} = {(Number(amounts.expectedOutput) / Number(amounts.inputAmount)).toFixed(6)} {toToken}</div>
                <div>1 {toToken} = {(Number(amounts.inputAmount) / Number(amounts.expectedOutput)).toFixed(6)} {fromToken}</div>
              </>
            ) : (
              <div>1 {fromToken} = 0.00 {toToken}</div>
            )}
          </div>
          <div className="settings-section">
            <div className="slippage-settings">
              <span>Slippage Tolerance:</span>
              <input type="number" value={slippage} onChange={(e) => setSlippage(Number(e.target.value))} min="0.1" max="50" step="0.1" />
              <span>%</span>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            className="swap-button"
            onClick={executeSwap}
            disabled={
              !currentAccount ||
              !amounts.inputAmount ||
              fromToken === toToken ||
              !getPool(fromToken, toToken) ||
              isSwapping ||
              !balanceManagerInitialized
            }
          >
            {isSwapping
              ? "Swapping..."
              : !balanceManagerInitialized
              ? "Initializing..."
              : fromToken === toToken
              ? "Invalid Pair"
              : !getPool(fromToken, toToken)
              ? "No Pool Available"
              : "Swap"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenSwap;
