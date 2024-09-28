"use client";

import React, { useState } from "react";
import { SigningStargateClient, coins } from "@cosmjs/stargate";

declare let window: WalletWindow;

const App: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Replace with your local node's chain ID and RPC endpoint
  const chainId = "localchain-1"; // Replace with your local chain ID
  const rpcEndpoint = "http://localhost:26657"; // Local node's RPC endpoint

  const connectWallet = async () => {
    try {
      // Enable Keplr for the local chain
      await window.keplr.experimentalSuggestChain({
        chainId,
        chainName: "Event Chain",
        rpc: rpcEndpoint,
        rest: "http://localhost:1317", // Replace with your REST endpoint if available
        bip44: {
          coinType: 118,
        },
        bech32Config: {
          bech32PrefixAccAddr: "event",
          bech32PrefixAccPub: "eventpub",
          bech32PrefixValAddr: "eventvaloper",
          bech32PrefixValPub: "eventvaloperpub",
          bech32PrefixConsAddr: "eventvalcons",
          bech32PrefixConsPub: "eventvalconspub",
        },
        currencies: [
          {
            coinDenom: "EVENT",
            coinMinimalDenom: "uevent",
            coinDecimals: 6,
          },
        ],
        feeCurrencies: [
          {
            coinDenom: "EVENT",
            coinMinimalDenom: "uevent",
            coinDecimals: 6,
          },
        ],
        stakeCurrency: {
          coinDenom: "EVENT",
          coinMinimalDenom: "uevent",
          coinDecimals: 6,
        },
      });

      await window.keplr.enable(chainId);
      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();
      setAddress(accounts[0].address);
    } catch (err) {
      setError("Failed to connect to Keplr wallet");
      console.error(err);
    }
  };

  const sendTransaction = async () => {
    if (!address) {
      setError("No wallet connected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = await SigningStargateClient.connectWithSigner(rpcEndpoint, window.keplr.getOfflineSigner(chainId));
      
      const msgSend = {
        fromAddress: address,
        toAddress: "event1efd63aw40lxf3n4mhf7dzhjkr453axurnfe2w6", // Replace with recipient address
        amount: coins(1000, "uevent"), // Sending 1 EVENT (1000000 uevent)
      };

      const fee = {
        amount: coins(500, "uevent"),
        gas: "200000",
      };

      const result = await client.sendTokens(address, msgSend.toAddress, msgSend.amount, fee, "");
      // assertIsBroadcastTxSuccess(result);

      setTransactionHash(result.transactionHash);
      setLoading(false);
    } catch (err) {
      setError("Failed to send transaction");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Cosmos SDK Transaction App</h1>
      
      {address ? (
        <>
          <p>Connected Wallet Address: {address}</p>
          <button onClick={sendTransaction} disabled={loading}>
            {loading ? "Sending..." : "Send Transaction"}
          </button>
        </>
      ) : (
        <button onClick={connectWallet}>Connect Keplr Wallet</button>
      )}

      {transactionHash && (
        <p>Transaction Successful! Hash: {transactionHash}</p>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;
