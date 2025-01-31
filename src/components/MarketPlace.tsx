/**
 * @file MarketPlace.tsx
 * @description AI Agent marketplace component
 * @author jake1318
 * @updated 2025-01-31 00:13:22
 */

import { useCurrentAccount } from "@mysten/dapp-kit";
import React from "react";
import "./MarketPlace.css";

const Marketplace: React.FC = () => {
  const account = useCurrentAccount();

  return (
    <div className="page-container">
      <div className="marketplace-container">
        <div className="marketplace-content">
          <div className="marketplace-header">
            <h1>AI Agent Marketplace</h1>
            <div className="status-info">
              <span className="status-badge">Coming Soon</span>
            </div>
          </div>

          <div className="feature-preview">
            <h2>Marketplace Features</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <h3>Agent Trading</h3>
                <p>Buy, sell, and trade AI agents with unique capabilities</p>
              </div>
              <div className="feature-card">
                <h3>Agent Directory</h3>
                <p>Browse specialized AI agents by category and rating</p>
              </div>
              <div className="feature-card">
                <h3>Agent Testing</h3>
                <p>Test and evaluate agents before purchase</p>
              </div>
              <div className="feature-card">
                <h3>Developer Tools</h3>
                <p>Create and deploy your own AI agents</p>
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
                <button className="notify-button">Get Early Access</button>
              </div>
            ) : (
              <div className="connect-prompt">
                <p>Connect your wallet to join the AI agent revolution</p>
              </div>
            )}
          </div>

          <div className="development-info">
            <h3>Roadmap</h3>
            <div className="timeline">
              <div className="timeline-item">
                <span className="phase">Phase 1</span>
                <p>Basic agent marketplace with buying and selling</p>
              </div>
              <div className="timeline-item">
                <span className="phase">Phase 2</span>
                <p>Agent testing environment and reputation system</p>
              </div>
              <div className="timeline-item">
                <span className="phase">Phase 3</span>
                <p>Advanced agent creation tools and collaborative features</p>
              </div>
            </div>
          </div>

          <div className="agent-categories">
            <h3>Agent Categories</h3>
            <div className="category-grid">
              <div className="category-item">
                <h4>Trading Agents</h4>
                <p>Automated trading and market analysis</p>
              </div>
              <div className="category-item">
                <h4>Research Agents</h4>
                <p>Data analysis and research automation</p>
              </div>
              <div className="category-item">
                <h4>Task Agents</h4>
                <p>Workflow automation and task management</p>
              </div>
              <div className="category-item">
                <h4>Creative Agents</h4>
                <p>Content generation and creative assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
