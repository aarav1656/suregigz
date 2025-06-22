import { string } from "@dao-xyz/borsh";
import { number } from "bitcoinjs-lib/src/script";

export interface RuntimeSettings {
    networkId: string;
    nodeUrl: string;
    walletUrl: string;
    helperUrl: string;
    explorerUrl: string;
    accountId: string;
    secretKey: string;
    publicKey: string;
    SLIPPAGE: number;
    defuseContractId: string;
    coingeckoUrl: string;
    coingeckoKey: string;
    zcashwallet: string;
    zcashexportdir: string;
    zcashusr: string;
    zcashpass: string;
    zcashaccount: string;
}

const nameToIdMap: Record<string, string> = {};

nameToIdMap["ETH"] = "ethereum";
nameToIdMap["BTC"] = "bitcoin";
nameToIdMap["DOGE"] = "dogecoin";
nameToIdMap["PEPE"] = "pepe";
nameToIdMap["NEAR"] = "near";
nameToIdMap["USDC"] = "usd-coin";
nameToIdMap["SHIB"] = "shiba-inu";


function getRuntimeSettings(): RuntimeSettings {
    const accountId = process.env.NEAR_ADDRESS;
    if (!accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    const secretKey = process.env.NEAR_WALLET_SECRET_KEY;
    if (!secretKey) {
        throw new Error("NEAR_WALLET_SECRET_KEY not configured");
    }

    return {
        networkId: process.env.NEAR_NETWORK || "testnet",
        nodeUrl: process.env.NEAR_RPC_URL || `https://rpc.${process.env.NEAR_NETWORK || "testnet"}.near.org`,
        walletUrl: `https://${process.env.NEAR_NETWORK || "testnet"}.mynearwallet.com/`,
        helperUrl: `https://helper.${process.env.NEAR_NETWORK || "testnet"}.near.org`,
        explorerUrl: `https://${process.env.NEAR_NETWORK || "testnet"}.nearblocks.io`,
        accountId: process.env.NEAR_ADDRESS || "",
        secretKey: process.env.NEAR_WALLET_SECRET_KEY || "",
        publicKey: process.env.NEAR_WALLET_PUBLIC_KEY || "",
        SLIPPAGE: process.env.NEAR_SLIPPAGE ? parseInt(process.env.NEAR_SLIPPAGE) : 1,
        defuseContractId: process.env.DEFUSE_CONTRACT_ID || "intents.near",
        coingeckoUrl: process.env.COINGECKO_API_URL || "",
        coingeckoKey: process.env.COINGECKO_API_KEY || "",
        zcashwallet: process.env.ZCASH_WALLET || "",
        zcashexportdir: process.env.EXPORT_DIR_ZCASH || "",
        zcashusr: process.env.ZCASH_USER || "",
        zcashpass: process.env.ZCASH_PASSD || "",
        zcashaccount: process.env.ZCASH_ACCOUNT || "",
    };
}

const settings = getRuntimeSettings();

export{ settings };