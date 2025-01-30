import {
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TokenSwap from "./components/TokenSwap"; // Changed to default import
import "@mysten/dapp-kit/dist/index.css";
import "./App.css";

// Create the network configuration for mainnet
const { networkConfig } = createNetworkConfig({
  mainnet: { url: "https://fullnode.mainnet.sui.io" },
});

// Create a new query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <div className="app-container">
            <header className="app-header">
              <div className="header-info">
                <span className="timestamp">UTC: 2025-01-30 05:12:28</span>
                <span className="user-info">User: jake1318</span>
              </div>
              <h1>DeepBook Mainnet Swap</h1>
            </header>
            <main className="app-main">
              <TokenSwap />
            </main>
            <footer className="app-footer">
              <p>Built with DeepBook V3 SDK on Sui Mainnet</p>
            </footer>
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
