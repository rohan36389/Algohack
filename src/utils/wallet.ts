import { PeraWalletConnect } from "@perawallet/connect";

export const peraWallet = new PeraWalletConnect({
  chainId: 416002, // Testnet
});

export const connectWallet = async () => {
  try {
    const newAccounts = await peraWallet.connect();
    return newAccounts;
  } catch (error: any) {
    if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
      console.error("Connection failed", error);
    }
    return [];
  }
};

export const disconnectWallet = async () => {
  await peraWallet.disconnect();
};

export const reconnectWallet = async () => {
  try {
    const reconnectAccounts = await peraWallet.reconnectSession();
    return reconnectAccounts;
  } catch (error) {
    return [];
  }
};
