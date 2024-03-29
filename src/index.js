import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

import {getDefaultWallets, RainbowKitProvider} from "@rainbow-me/rainbowkit";
import {configureChains, createConfig, WagmiConfig} from "wagmi";
import {mainnet} from "wagmi/chains";
import {publicProvider} from "wagmi/providers/public";

import App from "./App";

const {chains, publicClient} = configureChains([mainnet], [publicProvider()]);
const {connectors} = getDefaultWallets({
  appName: "Bored Anons",
  projectId: "c79671f77e15d3c16d8df828931df7a7",
  chains,
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

ReactDOM.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
  document.getElementById("root")
);
