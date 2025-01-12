// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.tsx'
// import { Chain, EthosConnectProvider } from 'ethos-connect'
import { QueryClientProvider } from '@tanstack/react-query'
// import { WalletProvider } from '@mysten/dapp-kit'
// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     {/* <WalletProvider> */}
//       <EthosConnectProvider ethosConfiguration={{chain: Chain.SUI_DEVNET, network: "https://fullnode.testnet.sui.io:443"}}>
//           <App />
//       </EthosConnectProvider>
//     {/* </WalletProvider> */}
//   </StrictMode>,
import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import { QueryClient } from "@tanstack/react-query";
import { WalletProvider } from "@mysten/dapp-kit";
// )
import App from "./App.tsx";
import { networkConfig } from "./networkConfig.ts";
import { SuiClientProvider } from '@mysten/dapp-kit';
import { Theme } from '@radix-ui/themes';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <QueryClientProvider client={queryClient}>
        <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
          <WalletProvider autoConnect>
            <App />
          </WalletProvider>
        </SuiClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>
);
