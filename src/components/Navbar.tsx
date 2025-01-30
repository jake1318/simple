import { Link } from "react-router-dom";
import React from "react";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const account = useCurrentAccount();

  // Define which pages are active (currently only "swap" and "home")
  // Update the activePages array (line 10) to include the new routes:
  const activePages = ["/", "/swap", "/dex", "/marketplace"]; // Added "/dex" and "/marketplace"

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="navbar-logo">
        <Link to="/" className="logo-container">
          <img src="/Design_2.png" alt="Sui Mind Logo" className="logo-image" />
          <span className="logo-text">Sui Mind</span>
        </Link>
      </div>

      {/* Navigation Links Section */}
      <div className="navbar-center">
        <ul>
          <li>
            {activePages.includes("/search") ? (
              <Link to="/search">Search</Link>
            ) : (
              <span className="disabled-link">Search</span>
            )}
          </li>
          <li>
            {activePages.includes("/swap") ? (
              <Link to="/swap">Swap</Link>
            ) : (
              <span className="disabled-link">Swap</span>
            )}
          </li>
          <li>
            {activePages.includes("/dex") ? (
              <Link to="/dex">DEX</Link>
            ) : (
              <span className="disabled-link">DEX</span>
            )}
          </li>
          <li>
            {activePages.includes("/marketplace") ? (
              <Link to="/marketplace">Marketplace</Link>
            ) : (
              <span className="disabled-link">Marketplace</span>
            )}
          </li>
        </ul>
      </div>

      {/* Wallet Section */}
      <div className="navbar-right">
        <div className="wallet-section">
          {account && (
            <div className="wallet-info">
              <span className="wallet-address" title={account.address}>
                {`${account.address.slice(0, 6)}...${account.address.slice(
                  -4
                )}`}
              </span>
            </div>
          )}
          <ConnectButton
            className="connect-wallet-button"
            connectText="Connect Wallet"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
