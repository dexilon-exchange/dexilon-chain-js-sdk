import { keccak256 as solidityKeccak256 } from '@ethersproject/solidity';
import { ethers, Wallet } from 'ethers';

export async function getSignature(wallet: Wallet, data: any, dataStructure: Array<any>): Promise<string> {
  const solidityKeccak256Hash = await solidityKeccak256(dataStructure, data);
  console.log({ solidityKeccak256Hash });

  const messageHash = solidityKeccak256Hash;
  // console.log({ messageHash });
  let messageHashBytes = ethers.utils.arrayify(messageHash);

  const sign = await wallet.signMessage(messageHashBytes);
  // console.log({ sign, messageHash, data });
  return sign;
}
