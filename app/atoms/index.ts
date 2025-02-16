import { atom } from 'jotai'
import { PXE, Wallet } from '@aztec/aztec.js'
import { type TokenContract, PayTransactionFull } from '../types'
import { NFTContract } from '@aztec/noir-contracts.js/NFT'

// Existing PXE atom
export const pxeAtom = atom<PXE | null>(null)
export const walletsAtom = atom<Wallet[]>([])

// Current wallet atom
export const currentWalletAtom = atom<Wallet | null>(null)
export const currentTokenContractAtom = atom<TokenContract | null>(null)
export const tokenContractsAtom = atom<TokenContract[]>([])
export const publicBalanceAtom = atom<bigint>(0n)
export const privateBalanceAtom = atom<bigint>(0n)

export const payTransactionsAtom = atom<PayTransactionFull[]>([])

export const isPrivateAtom = atom<boolean>(false)
export const rpcUrlAtom = atom<string>('')
export const remountKeyAtom = atom<number>(0)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const walletSDKAtom = atom<any>(null)
export const nftContractAtom = atom<NFTContract | null>(null)