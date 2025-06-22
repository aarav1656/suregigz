import { connect, Near } from "near-api-js";
import { KeyPairString } from "near-api-js/lib/utils/key_pair";
import tokensData from "../config/tokens.json";
import { utils } from "near-api-js";
import { keyStores } from "near-api-js";
import axios, { all } from "axios";
import { createBatchDepositNearNep141Transaction, createBatchDepositNearNativeTransaction, getDepositedBalances,
    getNearNep141StorageBalance, sendNearTransaction, TokenBalances, FT_DEPOSIT_GAS, FT_TRANSFER_GAS } from "../utils/deposit";
import * as Borsh from "@dao-xyz/borsh";
import * as js_sha256 from "js-sha256";
import crypto from "crypto";
import { CrossChainSwapParams, createTokenDiffIntent, IntentMessage, IntentStatus,
     PublishIntentRequest, PublishIntentResponse, QuoteRequest, QuoteResponse,Quote,
     CrossChainSwapAndWithdrawParams, NativeWithdrawIntent} from "../types/intents";
import { KeyPair } from "near-api-js";
import { Payload, SignMessageParams } from "../types/intents";
import { providers } from "near-api-js";
import { getAllSupportedTokens, getDefuseAssetId, getTokenBySymbol, isTokenSupported, SingleChainToken, UnifiedToken, convertAmountToDecimals,getChainByTokenSymbol,convertDecimalsToAmount } from "../types/tokens";
import { settings } from "../utils/environment";
import { getTokenPriceUSD } from "../providers/coingeckoProvider";
import { setTimeout } from 'timers';
import { isSingleChainTokenBySymbol } from "../types/tokens";
import { getBalancesList } from "../utils/deposit";
import Decimal from "decimal.js";

import { bech32m } from "@scure/base"
import { PublicKey } from "@solana/web3.js"
import {
  isValidClassicAddress as xrp_isValidClassicAddress,
  isValidXAddress as xrp_isValidXAddress,
} from "ripple-address-codec"
import { Atma } from "next/font/google";
import { number } from "bitcoinjs-lib/src/script";
import { init } from "next/dist/compiled/webpack/webpack";


const DEFUSE_RPC_URL = "https://solver-relay-v2.chaindefuser.com/rpc";

const POLLING_INTERVAL_MS = 2000; // 2 seconds
const MAX_POLLING_TIME_MS = 300000; // 5 minutes
const FT_MINIMUM_STORAGE_BALANCE_LARGE = "12500000000000000000000";
const SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD = 0.5;
const SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD = 10;
const SWAP_SAFETY_THRESHOLD_USD = 1;
const ACCOUNT_ID_REGEX = /^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/

export function isLegitAccountId(accountId: string): boolean {
  return ACCOUNT_ID_REGEX.test(accountId)
}


export function validateAddress(
  address: string,
  blockchain: string
): boolean {
  switch (blockchain) {
    case "near":
      return isLegitAccountId(address)
    case "eth":
    case "ethereum":
    case "base":
    case "arbitrum":
    case "turbochain":
    case "aurora":
    case "gnosis":
    case "berachain":
      // todo: Do we need to check checksum?
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case "bitcoin":
      return (
        /^1[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address) ||
        /^3[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address) ||
        /^bc1[02-9ac-hj-np-z]{11,87}$/.test(address) ||
        /^bc1p[02-9ac-hj-np-z]{42,87}$/.test(address)
      )
    case "solana":
      try {
        return PublicKey.isOnCurve(address)
      } catch {
        return false
      }

    case "dogecoin":
      return /^[DA][1-9A-HJ-NP-Za-km-z]{25,33}$/.test(address)

    case "xrpledger":
      return xrp_isValidClassicAddress(address) || xrp_isValidXAddress(address)

    case "zcash":
      return validateZcashAddress(address)

    default:
      return false
  }
}

function validateZcashAddress(address: string) {
    // Transparent address validation
    if (address.startsWith("t1") || address.startsWith("t3")) {
      // t1 for P2PKH addresses, t3 for P2SH addresses
      return /^t[13][a-km-zA-HJ-NP-Z1-9]{33}$/.test(address)
    }
  
    // TEX address validation
    const expectedHrp = "tex"
    if (address.startsWith(`${expectedHrp}1`)) {
      try {
        const decoded = bech32m.decodeToBytes(address)
        if (decoded.prefix !== expectedHrp) {
          return false
        }
        return decoded.bytes.length === 20
      } catch {
        return false
      }
    }
  
    return false
  }
async function makeRPCRequest<T>(method: string, params: any[]): Promise<T> {
    const requestBody = {
        id: 1,
        jsonrpc: "2.0",
        method,
        params,
    };

    const response = await fetch(DEFUSE_RPC_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
    }
    return data.result;
}
export const getQuote = async (params: QuoteRequest): Promise<QuoteResponse> => {
    return makeRPCRequest<QuoteResponse>("quote", [params]);
};

export const publishIntent = async (params: PublishIntentRequest): Promise<PublishIntentResponse> => {
    return makeRPCRequest<PublishIntentResponse>("publish_intent", [params]);
};

export const getIntentStatus = async (intentHash: string): Promise<IntentStatus> => {
    return makeRPCRequest<IntentStatus>("get_status", [{
        intent_hash: intentHash
    }]);
};


export const getCurrentBlock = async (): Promise<{ blockHeight: number }> => {
    try {
        const networkId = settings.networkId;
        const nodeUrl = settings.nodeUrl;

        const nearConnection = await connect({
            networkId,
            nodeUrl,
            headers: {}
        });

        // Get the latest block using finality: 'final' for the most recent finalized block
        const block = await nearConnection.connection.provider.block({
            finality: 'final'
        });

        return {
            blockHeight: block.header.height
        };
    } catch (error) {
        throw error;
    }
};

export async function _depositToIntents(params: CrossChainSwapParams): Promise<string> {
    if (!settings.accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    const network = params.network || "near";

    // Get token details
    const defuseTokenIn = getTokenBySymbol(params.defuse_asset_identifier_in);

    if (!defuseTokenIn) {
        const supportedTokens = getAllSupportedTokens();
        throw new Error(`Token ${params.defuse_asset_identifier_in} not found. Supported tokens: ${supportedTokens.join(', ')}`);
    }

    // Convert amount to proper decimals
    const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, defuseTokenIn);

    // Get defuse asset IDs
    const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn);

    // Setup NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    // Check balances
    const result = await depositIntoDefuse([defuseAssetIdIn], amountInBigInt, nearConnection);
    // if (!result){
    //     throw new Error("Low balance")
    // }
    return result;
    
}



// First check the balance of the user, then deposit the tokens if there are any
export const depositIntoDefuse = async (tokenIds: string[], amount: bigint, nearConnection: Near): Promise<string> => {
    const contractId = tokenIds[0].replace('nep141:', '');

    const nep141balance = await getNearNep141StorageBalance({
        contractId: "wrap.near",
        accountId: settings.accountId
    });
    const storage_balance = BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE) - nep141balance; 


    const tokenResponse = await axios.get(`https://api.fastnear.com/v1/account/${settings.accountId}/ft`);
  
    const tokens = tokenResponse.data.tokens || [];
    const amountInWei =tokens.find((tok:any) => tok.contract_id === "wrap.near").balance;
    var wrap_nearbalance = BigInt(Math.round(amountInWei));
    if( amount < wrap_nearbalance){
        wrap_nearbalance = 0n;
    }
    else{
        wrap_nearbalance = amount - wrap_nearbalance;
    }

    const publicKey = await nearConnection.connection.signer.getPublicKey(settings.accountId, settings.networkId);

    var transaction = null;
    if(contractId === "wrap.near")
    {
        transaction = createBatchDepositNearNativeTransaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(storage_balance), wrap_nearbalance > 0n, wrap_nearbalance);
    }
    else
    {
        transaction = createBatchDepositNearNep141Transaction(contractId, amount, !(nep141balance >= BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)), BigInt(storage_balance));
    }

    for (const tx of transaction) {
        const result = await sendNearTransaction(nearConnection, settings.accountId, publicKey, contractId, tx);
        return result;
    }
    return "";
}

export async function withdrawFromDefuse(params: CrossChainSwapAndWithdrawParams): Promise<any> {
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const network = params.network || "near";

    // Get token details and defuse asset ID
    const token = getTokenBySymbol(params.defuse_asset_identifier_out);
    if (!token) {
        throw new Error(`Token ${params.defuse_asset_identifier_out} not found`);
    }

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    
    var amountInBigInt:bigint = 0n;
    if (!isSingleChainTokenBySymbol(params.defuse_asset_identifier_out)) {
        // Find the unified token data
        const amount_swap = await swapInIntents_Internal(params.defuse_asset_identifier_out,params.exact_amount_in,"",(params.network || ""),false);
        if(amount_swap === "deposit_required"){
            return "";
        }
        amountInBigInt = amount_swap;
    }
    else{
        const amountInWei = parseFloat(params.exact_amount_in) * (10 ** token.decimals);
        amountInBigInt = BigInt(Math.round(amountInWei));
    }

    // Check balances
    const tokenBalances = await getBalances([token], nearConnection.connection.provider, network);

    const defuseAssetIdentifierOut = getDefuseAssetId(token, network);
    const defuseAssetOutAddrs = defuseAssetIdentifierOut.replace('nep141:', '');

    const tokenBalance = tokenBalances[defuseAssetIdentifierOut];
    if (!tokenBalance) {
        throw new Error(`No balance found for token ${defuseAssetIdentifierOut}`);
    }
    if(tokenBalance < amountInBigInt){
        console.log("Withdraw all the amount on intents");
        amountInBigInt = tokenBalance;
    }


    const nep141balance = await getNearNep141StorageBalance({
        contractId: "wrap.near",
        accountId: settings.accountId
    });

    const storage_deposit: bigint = (nep141balance > BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE)) ? 0n : BigInt(FT_MINIMUM_STORAGE_BALANCE_LARGE);

    console.log(`line 1015`);
    // Create intent message
    var intentMessage: IntentMessage;
    if(defuseAssetOutAddrs === "wrap.near"){
        intentMessage = {
            signer_id: settings.accountId,
            deadline: new Date(Date.now() + 180000).toISOString(),
            intents: [
                {
                    intent: "native_withdraw" ,
                    receiver_id: params.destination_address,
                    amount: amountInBigInt.toString()
                }
            ]
        };
    }
    else if (params.network === "near"){
        intentMessage = {
            signer_id: settings.accountId,
            deadline: new Date(Date.now() + 180000).toISOString(),
            intents: [
                {
                    intent: "ft_withdraw",
                    receiver_id: params.destination_address,
                    token: defuseAssetOutAddrs,
                    amount: amountInBigInt.toString(),
                    deposit: (storage_deposit).toString(),
                    memo:""
                }
            ]
        };
    }
    else{
        intentMessage = {
            signer_id:settings.accountId,
            deadline: new Date(Date.now() + 180000).toISOString(),
            intents: [
                {
                    intent: "ft_withdraw",
                    receiver_id: defuseAssetOutAddrs,
                    amount: amountInBigInt.toString(),
                    token: defuseAssetOutAddrs,
                    deposit: (storage_deposit).toString(),
                    memo: `WITHDRAW_TO:${params.destination_address}`
                }
            ]
        };
    }
    console.log(`line 1062`);

    const messageString = JSON.stringify(intentMessage);
    const recipient = "intents.near";
    // const recipient = settings.accountId;
    console.log(messageString);
    // Generate nonce using crypto
    const nonce = new Uint8Array(crypto.randomBytes(32));

    // Sign the message
    console.log("line 1070");
    console.log(keyPair,{
        message: messageString,
        recipient,
        nonce
    });
    const { signature, publicKey } = await signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
    });
    console.log("line 1076");

    // Ensure public key is registered
    await ensurePublicKeyRegistered(`ed25519:${publicKey}`);
    console.log("line 1080");
    console.log(recipient,publicKey);
    // Publish intent
    const intent = await publishIntent({
        quote_hashes: [], // Empty for withdrawals
        signed_data: {
            payload: {
                message: messageString,
                nonce: Buffer.from(nonce).toString('base64'),
                recipient
            },
            standard: "nep413",
            signature: `ed25519:${signature}`,
            public_key: `ed25519:${publicKey}`
        }
    });

    console.log(`line 1093 ${intent.intent_hash}`);
    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        console.log(`Intent Hash: ${finalStatus.intent_hash}`);
        console.log(finalStatus.data?.hash);
        return finalStatus.data?.hash;
    }
    else{
        throw new Error(`${intent.reason}`);
    }
}

export async function getAllBalances(): Promise<Array<{ token: string; balance: string }>> {
    // Setup NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);
  
    const nearConnection = await connect({
      networkId: settings.networkId,
      keyStore,
      nodeUrl: settings.nodeUrl,
    });
  
    const tokens = getAllSupportedTokens();
    const balances: Array<{ token: string; balance: string }> = [];
  
    for (const token of tokens) {
      const networks = getChainByTokenSymbol(token);
      const token_val = getTokenBySymbol(token);
      if (!token_val) {
        throw new Error("Token not defined");
      }
      var totalBalance = 0n;
      const network_seen:string[] = []
      for (const network of networks) {
            const defuse = getDefuseAssetId(token_val,network);
            if(network_seen.includes(defuse)){
                continue;
            }
            else{
                network_seen.push(defuse);
            }
            const tokenBalance = await getBalances([token_val], nearConnection.connection.provider, network);
            const totalBalance1 = Object.values(tokenBalance).reduce((acc, balance) => {
                if (acc === undefined) return balance || 0n;
                return acc + (balance || 0n);
            }, 0n);
            // console.log({token,network,tokenBalance});
            totalBalance = totalBalance + (totalBalance1 || 0n);
        }
        if (totalBalance) {
          const balanceStr = convertDecimalsToAmount(totalBalance, token_val);
          balances.push({ token, balance: balanceStr });
        }
    }
    return balances;
  }

  export async function get_token_data() {
    const accountId = settings.accountId; 

    try {
      // Fetch tokens (excluding NEAR)
      const tokenResponse = await axios.get(`https://api.fastnear.com/v1/account/${accountId}/ft`);
      // Fetch NEAR balance
      const nearResponse = await axios.get(`https://api.nearblocks.io/v1/account/${accountId}`);
  
      const tokens = tokenResponse.data.tokens || [];
      const nearBalance = nearResponse.data.account[0]?.amount || "0";
  
      // Process token balances
      const tokenBalances = tokens.map((token: any) => {
        const tokenInfo =
          tokensData.tokens.mainnet.unified_tokens.find(
            (t: any) =>
              Object.values(t.addresses).some(
                (addr: any) => addr.address === token.contract_id
              )
          ) ||
          tokensData.tokens.mainnet.single_chain_tokens.find(
            (t: any) => t.defuseAssetId === `nep141:${token.contract_id}`
          );
  
        return {
          contractId: token.contract_id,
          symbol: tokenInfo?.symbol || "UNKNOWN",
          balance: token.contract_id == "wrap.near" ? (parseFloat(token.balance) + parseFloat(nearBalance)).toString(): token.balance,
          name: tokenInfo?.name || "Unknown Token",
          icon: tokenInfo?.icon || "",
          decimals: tokenInfo?.decimals || 18,
          cgId: tokenInfo?.cgId || "",
        };
      });
  
  
      // Fetch USD prices
      const tokenPrices = await getTokenPrices(
        tokenBalances.map((t:any) => t.cgId).filter(Boolean)
      );
  
      // Convert balances to USD and filter out tokens with 0 USDC balance
      const tokensWithUSD = tokenBalances
        .map((t: any) => ({
          ...t,
          TokenBal:(parseFloat(t.balance) / 10 ** t.decimals).toFixed(5),
          amountUSD:
            (parseFloat(t.balance) / 10 ** t.decimals) * (tokenPrices[t.cgId]?.usd || 0),
        }))
        .filter((t: any) => t.amountUSD > 0); // Remove tokens with 0 USD balance
  
        const extractedData = tokensWithUSD.map((item:any)  => ({ token:item.symbol, balance:item.TokenBal }));
      return extractedData;
    } catch (error) {
      throw new Error(`${Response.json({ error: "Internal server error" }, { status: 500 })}`);
    }
  }

  async function getTokenPrices(tokenIds: string[]) {
    
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price`,
        {
          params: {
            ids: tokenIds.join(","),
            vs_currencies: "usd",
          },
        }
      );
      return response.data;
    } catch (error) {
      return {};
    }
  }

export async function getBalances(
    tokens: (UnifiedToken | SingleChainToken )[],
    nearClient: providers.Provider,
    network?: string
): Promise<TokenBalances> {

    const tokenBalances = await getDepositedBalances(
        settings.accountId || "",
        tokens,
        nearClient,
        network
    );
    return tokenBalances;
}

//flag = true means final swap need to be done
//flag = false means no final swap
export async function swapInIntents_Internal(asset1:string,amount:string,asset2:string,swapto_chain:string,flag:boolean){
    // Setup NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);
  
    const nearConnection = await connect({
      networkId: settings.networkId,
      keyStore,
      nodeUrl: settings.nodeUrl,
    });
  
    const token = asset1;
    const networks = getChainByTokenSymbol(token);
    const token_val = getTokenBySymbol(token);
    if (!token_val) {
        throw new Error("Token not defined");
    }
    var amount_in = (Number(amount) * (10 ** Number(token_val.decimals)));
    var totalBalance = 0n;
    const network_seen:string[] = []
    const amount_network_defuse_id = [];
    for (const network of networks) {
        const defuse = getDefuseAssetId(token_val,network);
        if(network_seen.includes(defuse)){
            continue;
        }
        else{
            network_seen.push(defuse);
        }
        const tokenBalance = await getBalances([token_val], nearConnection.connection.provider, network);
        const totalBalance1 = (Object.values(tokenBalance).reduce((acc, balance) => {
            if (acc === undefined) return balance || 0n;
            return acc + (balance || 0n);
        }, 0n));
        if((totalBalance1 || 0n) > 0n){
            amount_network_defuse_id.push({amount:(totalBalance1 || 0n), network:network, defuse_asset_id: defuse});
        }
        totalBalance = totalBalance + (totalBalance1 || 0n);
    }
    console.log("--------------- switching to near network --------------------------");
    // var ret_val = await _swapInIntents_internal2(token_val,getDefuseAssetId(token_val,"near"),getDefuseAssetId(token_val,"ethereum"),amount_in);
    // console.log(ret_val);
    // return ret_val.hash;
    const intial_amount = amount_in;
    if (totalBalance &&  totalBalance > amount_in) {
        amount_network_defuse_id.sort((a, b) => Number((b.amount).toString()) - Number((a.amount).toString()));
        
        var ret_val;
        if(!swapto_chain || swapto_chain === ""){
            swapto_chain = "near";
        }
        const defuseassetidout = getDefuseAssetId(token_val,swapto_chain);
        var amount_out = 0; 
        for(const item of amount_network_defuse_id){
            if(item.defuse_asset_id === defuseassetidout){
                amount_out = amount_out + Number(item.amount);
                continue;
            }
            if(amount_in > item.amount){
                ret_val = await _swapInIntents_internal2(token_val,item.defuse_asset_id,defuseassetidout,item.amount);
                if(ret_val && ret_val.hash !== ""){
                    amount_in = amount_in - Number((item.amount).toString());
                }
                amount_out = amount_out + ret_val.amount_out;
                console.log(ret_val);
            }
            else{
                ret_val = await _swapInIntents_internal2(token_val,item.defuse_asset_id,defuseassetidout,BigInt((item.amount).toString()));
                if(ret_val && ret_val.hash !== ""){
                    amount_in = 0;
                }
                amount_out = amount_out + ret_val.amount_out;
                console.log(ret_val);
            }
            if(amount_in === 0){
                break;
            }
        }
        if(intial_amount < Number(amount_out.toString())){
            amount_out = intial_amount;
        }
        if(flag){
            console.log("--------------- final swap --------------------------");
            const cross_chain_params: CrossChainSwapParams = {
                exact_amount_in: (Number(amount_out) / (10 ** token_val.decimals)).toString(),
                defuse_asset_identifier_in: asset1,
                defuse_asset_identifier_out: asset2,
                network: "near"
            };
            console.log(cross_chain_params);
            ret_val = await _swapInIntents(cross_chain_params);
            console.log(ret_val);
        }
        else{
            return amount_out;
        }
        return ret_val;
    }
    else{
        return "deposit_required";
    }
}

export async function _swapInIntents_internal2(token:(UnifiedToken | SingleChainToken), defuseAssetIdIn:string,defuseAssetIdOut:string,amountInBigInt:BigInt): Promise<any> {
    if (!settings.accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }
    // Setup NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    // Get quote
    const quote = await getQuote({
        defuse_asset_identifier_in: defuseAssetIdIn,
        defuse_asset_identifier_out: defuseAssetIdOut,
        exact_amount_in: amountInBigInt.toString(),
    });

    if (!quote || !Array.isArray(quote) || quote.length === 0) {
        throw new Error("Failed to get quote from Defuse. Response: " + JSON.stringify(quote));
    }


    var best_quote_index = 0;
    var max:bigint = 0n;
    for (let index = 0; index < quote.length; index++) {
        const element = quote[index];
        if (BigInt(element.amount_out) > max)
        {
            max = BigInt(element.amount_out);
            best_quote_index = index;
        }
    }

    const in_token_decimal:number = token.decimals;
    const out_token_decimal:number = token.decimals;

    const in_usd_price:number = await getTokenPriceUSD(token.cgId) * Number(quote[best_quote_index].amount_in) / Number(`1${"0".repeat(in_token_decimal)}`);
    const out_usd_price:number = await getTokenPriceUSD(token.cgId) * Number(quote[best_quote_index].amount_out) / Number(`1${"0".repeat(out_token_decimal)}`);

    
    const loss:number = in_usd_price - out_usd_price;
    const loss_percent:number = ((Number(loss)) / Number(in_usd_price)) * 100;


    if ((loss > SWAP_SAFETY_THRESHOLD_USD && loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD) || (loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD))
    {
        throw new Error("Failed to get good quotes from Defuse. We rejected the quotes obtained . Response: " + JSON.stringify(quote));
    }
    
    const intentMessage: IntentMessage = {
        signer_id: settings.accountId,
        deadline: new Date(Date.now() + 300000).toISOString(),
        intents: [createTokenDiffIntent(
            quote[best_quote_index].defuse_asset_identifier_in,
            quote[best_quote_index].defuse_asset_identifier_out,
            quote[best_quote_index].amount_in,
            quote[best_quote_index].amount_out
        )]
    };

    const messageString = JSON.stringify(intentMessage);
    const nonce = new Uint8Array(crypto.randomBytes(32));
    const recipient = "intents.near";
    const { signature, publicKey } = await signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
    });

    await ensurePublicKeyRegistered(`ed25519:${publicKey}`);

    const intent = await publishIntent({
        quote_hashes: [quote[best_quote_index].quote_hash],
        signed_data: {
            payload: {
                message: messageString,
                nonce: Buffer.from(nonce).toString('base64'),
                recipient
            },
            standard: "nep413",
            signature: `ed25519:${signature}`,
            public_key: `ed25519:${publicKey}`
        }
    });

    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        console.log(`Intent Hash: ${finalStatus.intent_hash}`);
        return {hash:finalStatus.data?.hash,amount_out:quote[best_quote_index].amount_out};
    }
    else{
        return {hash:"",amount_out:0};
        throw new Error(`Error Details: ${intent}`);
    }

    return intent;
}


export async function _swapInIntents(params: CrossChainSwapParams): Promise<any> {
    if (!settings.accountId) {
        throw new Error("NEAR_ADDRESS not configured");
    }

    const network = params.network || "near";

    // Get token details
    const defuseTokenIn = getTokenBySymbol(params.defuse_asset_identifier_in);
    const defuseTokenOut = getTokenBySymbol(params.defuse_asset_identifier_out);


    if (!defuseTokenIn || !defuseTokenOut) {
        const supportedTokens = getAllSupportedTokens();
        throw new Error(`Token ${params.defuse_asset_identifier_in} or ${params.defuse_asset_identifier_out} not found. Supported tokens: ${supportedTokens.join(', ')}`);
    }

    // Convert amount to proper decimals
    const amountInBigInt = convertAmountToDecimals(params.exact_amount_in, defuseTokenIn);
    console.log(amountInBigInt);


    // Get defuse asset IDs
    const defuseAssetIdIn = getDefuseAssetId(defuseTokenIn,network);
    const defuseAssetIdOut = getDefuseAssetId(defuseTokenOut, network);
    console.log(defuseAssetIdIn,defuseAssetIdOut);


    // Setup NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    // Check balances
    const tokenBalanceIn = await getBalances([defuseTokenIn], nearConnection.connection.provider, network);
    const tokenBalanceOut = await getBalances([defuseTokenOut], nearConnection.connection.provider, network);

    if (tokenBalanceIn[defuseAssetIdIn] != undefined &&
        tokenBalanceIn[defuseAssetIdIn] < amountInBigInt) {
        return "deposit_required";
        // await depositIntoDefuse([defuseAssetIdIn], amountInBigInt - tokenBalanceIn[defuseAssetIdIn], nearConnection);
    }
    console.log(defuseAssetIdIn,defuseAssetIdOut);
    // Get quote
    const quote = await getQuote({
        defuse_asset_identifier_in: defuseAssetIdIn,
        defuse_asset_identifier_out: defuseAssetIdOut,
        exact_amount_in: amountInBigInt.toString(),
    });

    if (!quote || !Array.isArray(quote) || quote.length === 0) {
        throw new Error("Failed to get quote from Defuse. Response: " + JSON.stringify(quote));
    }


    var best_quote_index = 0;
    var max:bigint = 0n;
    for (let index = 0; index < quote.length; index++) {
        const element = quote[index];
        if (BigInt(element.amount_out) > max)
        {
            max = BigInt(element.amount_out);
            best_quote_index = index;
        }
    }

    const in_token_decimal:number = defuseTokenIn.decimals;
    const out_token_decimal:number = defuseTokenOut.decimals;

    const in_usd_price:number = await getTokenPriceUSD(defuseTokenIn.cgId) * Number(quote[best_quote_index].amount_in) / Number(`1${"0".repeat(in_token_decimal)}`);
    const out_usd_price:number = await getTokenPriceUSD(defuseTokenOut.cgId) * Number(quote[best_quote_index].amount_out) / Number(`1${"0".repeat(out_token_decimal)}`);

    
    const loss:number = in_usd_price - out_usd_price;
    const loss_percent:number = ((Number(loss)) / Number(in_usd_price)) * 100;


    if ((loss > SWAP_SAFETY_THRESHOLD_USD && loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_ABOVE_1USD) || (loss_percent > SWAP_SAFETY_THRESHOLD_PERCENT_BELOW_1USD))
    {
        throw new Error("Failed to get good quotes from Defuse. We rejected the quotes obtained . Response: " + JSON.stringify(quote));
    }
    
    const intentMessage: IntentMessage = {
        signer_id: settings.accountId,
        deadline: new Date(Date.now() + 300000).toISOString(),
        intents: [createTokenDiffIntent(
            quote[best_quote_index].defuse_asset_identifier_in,
            quote[best_quote_index].defuse_asset_identifier_out,
            quote[best_quote_index].amount_in,
            quote[best_quote_index].amount_out
        )]
    };

    const messageString = JSON.stringify(intentMessage);
    const nonce = new Uint8Array(crypto.randomBytes(32));
    const recipient = "intents.near";
    const { signature, publicKey } = await signMessage(keyPair, {
        message: messageString,
        recipient,
        nonce
    });

    await ensurePublicKeyRegistered(`ed25519:${publicKey}`);

    const intent = await publishIntent({
        quote_hashes: [quote[best_quote_index].quote_hash],
        signed_data: {
            payload: {
                message: messageString,
                nonce: Buffer.from(nonce).toString('base64'),
                recipient
            },
            standard: "nep413",
            signature: `ed25519:${signature}`,
            public_key: `ed25519:${publicKey}`
        }
    });

    if (intent.status === "OK") {
        const finalStatus = await pollIntentStatus(intent.intent_hash);
        console.log(`Intent Hash: ${finalStatus.intent_hash}`);
        return finalStatus.data?.hash;
    }
    else{
        throw new Error(`Error Details: ${intent}`);
    }

    return intent;
}
  



async function pollIntentStatus(intentHash: string): Promise<IntentStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLLING_TIME_MS) {
        const status = await getIntentStatus(intentHash);

        if (status.status === "SETTLED" || status.status === "NOT_FOUND_OR_NOT_VALID") {
            return status;
        }

        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }

    throw new Error("Timeout waiting for intent to settle");
}


async function signMessage(keyPair: KeyPair, params: SignMessageParams) {
    // Check the nonce is a 32bytes array
    if (params.nonce.byteLength !== 32) {
        throw Error("Expected nonce to be a 32 bytes buffer");
    }
    console.log("insign282");

    // Create the payload and sign it
    const payload = new Payload({ tag: 2147484061, message: params.message, nonce: Array.from(params.nonce), recipient: params.recipient});
    console.log(`insign286${payload}`);
    const borshPayload = Borsh.serialize(payload);
    console.log("insign288");
    const hashedPayload = js_sha256.sha256.array(borshPayload)
    console.log("insign290");
    const { signature } = keyPair.sign(Uint8Array.from(hashedPayload))
    console.log("insign292");
    return {
        signature: utils.serialize.base_encode(signature),
        publicKey: utils.serialize.base_encode(keyPair.getPublicKey().data)
    };
}

async function addPublicKeyToIntents(publicKey: string): Promise<void> {

    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(settings.secretKey as KeyPairString);
    await keyStore.setKey(settings.networkId, settings.accountId, keyPair);

    const nearConnection = await connect({
        networkId: settings.networkId,
        keyStore,
        nodeUrl: settings.nodeUrl,
    });

    const account = await nearConnection.account(settings.accountId);

    await account.functionCall({
        contractId: "intents.near",
        methodName: "add_public_key",
        args: {
            public_key: publicKey
        },
        gas: BigInt(FT_DEPOSIT_GAS),
        attachedDeposit: BigInt(1)
    });
}

async function getPublicKeysOf(accountId: string): Promise<Set<string>> {
    const nearConnection = await connect({
        networkId: settings.networkId,
        nodeUrl: settings.nodeUrl,
    });

    const account = await nearConnection.account(accountId);
    const result = await account.viewFunction({
        contractId: settings.defuseContractId || "intents.near",
        methodName: "public_keys_of",
        args: { account_id: accountId }
    });

    return new Set(result);
}

async function ensurePublicKeyRegistered(publicKey: string): Promise<void> {
    const existingKeys = await getPublicKeysOf(settings.accountId);
    if (!existingKeys.has(publicKey)) {
        console.log(`Public key ${publicKey} not found, registering...`);
        await addPublicKeyToIntents(publicKey);
    } 
}