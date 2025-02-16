export const RPC_URL = "http://localhost:8080";
export const CREATE_ACCOUNT_DEFAULT_PARAMS = {
  type: "schnorr",
  wait: true,
  rpcUrl: RPC_URL,
};
export const ACCOUNTS_STORAGE_KEY = "aztec_accounts_key";
export const NFT_CONTRACT_KEY = "nft_contract_latest";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";
