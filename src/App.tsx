import {
  WalletProvider,
  SuiClientProvider,
  createNetworkConfig,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TokenSwap from "./components/TokenSwap"; // Default import
import Navbar from "./components/Navbar"; // Import Navbar component
import Footer from "./components/Footer"; // Import Footer component
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
          <Router>
            <div className="app-container">
              <Navbar /> {/* Navbar remains at the top */}
              <main className="app-main">
                <Routes>
                  <Route path="/swap" element={<TokenSwap />} />
                  {/* Add more routes as you create pages */}
                </Routes>
              </main>
              <Footer /> {/* Footer remains at the bottom */}
            </div>
          </Router>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
