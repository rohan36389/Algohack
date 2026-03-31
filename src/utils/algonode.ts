import { ALGOD_SERVER, INDEXER_SERVER } from "./algorand";

export const getAccountInfo = async (address: string) => {
  const res = await fetch(`${ALGOD_SERVER}/v2/accounts/${address}`);
  if (!res.ok) throw new Error("Failed to fetch account info");
  return res.json();
};

export const getApplicationState = async (appId: number) => {
  const res = await fetch(`${ALGOD_SERVER}/v2/applications/${appId}`);
  if (!res.ok) return null; // Contract might not exist or failed
  return res.json();
};

export const getAccountLocalState = async (address: string) => {
  const res = await fetch(`${ALGOD_SERVER}/v2/accounts/${address}/apps-local-state`);
  if (!res.ok) return null;
  return res.json();
};

export const broadcastTransaction = async (signedTxn: Uint8Array) => {
  const res = await fetch(`${ALGOD_SERVER}/v2/transactions`, {
    method: "POST",
    headers: { "Content-Type": "application/x-binary" },
    body: signedTxn as any,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to broadcast transaction");
  }
  return res.json();
};

export const getTransactionsByPrefix = async (address: string, notePrefix: string) => {
  // B64 encode notePrefix: SplitChain
  const enc = new TextEncoder();
  const b64 = btoa(String.fromCharCode(...enc.encode(notePrefix)));
  
  const res = await fetch(`${INDEXER_SERVER}/v2/transactions?address=${address}&note-prefix=${b64}`);
  if (!res.ok) return { transactions: [] };
  return res.json();
};

export const waitForConfirmation = async (txId: string, maxRounds: number = 10) => {
  let roundIdx = 0;
  while (roundIdx < maxRounds) {
    const res = await fetch(`${ALGOD_SERVER}/v2/transactions/pending/${txId}`);
    if (res.ok) {
        const body = await res.json();
        if (body['confirmed-round'] && body['confirmed-round'] > 0) {
            return body;
        }
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
    roundIdx++;
  }
  throw new Error("Transaction confirmation timeout");
};
