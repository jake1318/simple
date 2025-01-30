// src/components/Marketplace.tsx
import { useCurrentAccount } from "@mysten/dapp-kit";
import React from "react";
import "./Marketplace.css";

const Marketplace: React.FC = () => {
  const account = useCurrentAccount();

  return (
    <div className="full-width-page">
      <div className="marketplace-container">
        <div className="marketplace-content">
          <div className="marketplace-header">
            <h1>NFT Marketplace</h1>
            <div className="status-info">
              <span className="status-badge">Coming Soon</span>
            </div>
          </div>

          <div className="feature-preview">
            <h2>Upcoming Features</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>NFT Trading</h3>
                <p>Buy, sell, and trade unique digital assets</p>
              </div>
              <div className="feature-card">
                <h3>Collections</h3>
                <p>Browse and manage NFT collections</p>
              </div>
              <div className="feature-card">
                <h3>Auctions</h3>
                <p>Participate in NFT auctions</p>
              </div>
              <div className="feature-card">
                <h3>Creator Tools</h3>
                <p>Create and mint your own NFTs</p>
              </div>
            </div>
          </div>

          <div className="user-section">
            {account ? (
              <div className="connected-info">
                <p>
                  Connected Wallet:{" "}
                  {`${account.address.slice(0, 6)}...${account.address.slice(
                    -4
                  )}`}
                </p>
                <button className="notify-button">Notify When Live</button>
              </div>
            ) : (
              <div className="connect-prompt">
                <p>Connect your wallet to get notified when we launch</p>
              </div>
            )}
          </div>

          <div className="development-info">
            <h3>Development Timeline</h3>
            <div className="timeline">
              <div className="timeline-item">
                <span className="phase">Phase 1</span>
                <p>Basic NFT marketplace features</p>
              </div>
              <div className="timeline-item">
                <span className="phase">Phase 2</span>
                <p>Advanced trading and auction functionality</p>
              </div>
              <div className="timeline-item">
                <span className="phase">Phase 3</span>
                <p>Creator tools and community features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
