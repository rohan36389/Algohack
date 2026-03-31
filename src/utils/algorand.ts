import algosdk from 'algosdk';

export const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
export const INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
export const PORT = '';
export const TOKEN = '';

export const getAlgodClient = () => {
  return new algosdk.Algodv2(TOKEN, ALGOD_SERVER, PORT);
};

export const getIndexerClient = () => {
  return new algosdk.Indexer(TOKEN, INDEXER_SERVER, PORT);
};

export const isValidAddress = (address: string) => {
  return algosdk.isValidAddress(address);
};

export const microAlgosToAlgos = (microAlgos: number) => {
  return algosdk.microalgosToAlgos(microAlgos);
};

export const algosToMicroAlgos = (algos: number) => {
  return algosdk.algosToMicroalgos(algos);
};
