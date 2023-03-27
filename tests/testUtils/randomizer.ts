import { ethers } from 'ethers';
import { Bip39, Random } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomEthAddress(): ethers.Wallet {
  return ethers.Wallet.createRandom();
}

export interface CosmosWalletData {
  wallet: DirectSecp256k1HdWallet;
  address: string;
  mnemonic: string;
}
export async function getRandomCosmosAddress(): Promise<CosmosWalletData> {
  const mnemonic = Bip39.encode(Random.getBytes(16)).toString();
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
  const [{ address }] = await wallet.getAccounts();

  return { wallet, address, mnemonic };
}

export async function cosmosWalletFromMnemonic(mnemonic: string) {
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic);
  const [{ address }] = await wallet.getAccounts();

  return { wallet, address, mnemonic };
}

export function ethWalletFromMnemonic(mnemonic: string): ethers.Wallet {
  return ethers.Wallet.fromMnemonic(mnemonic);
}
