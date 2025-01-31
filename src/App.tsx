// src/App.tsx
import {
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TokenSwap from "./components/TokenSwap";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dex from "./components/Dex";
import Marketplace from "./components/MarketPlace";
import HomePage from "./components/HomePage"; // Add this import
import "@mysten/dapp-kit/dist/index.css";
import "./App.css";

const { networkConfig } = createNetworkConfig({
  mainnet: { url: "https://fullnode.mainnet.sui.io" },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect>
          <Router>
            <div className="app-container">
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<HomePage />} />{" "}
                  {/* Change this line */}
                  <Route path="/swap" element={<TokenSwap />} />
                  <Route path="/dex" element={<Dex />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
