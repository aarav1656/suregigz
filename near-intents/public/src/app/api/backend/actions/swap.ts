//  
import { connect, keyStores, utils } from "near-api-js";
import {
    init_env,
    ftGetTokenMetadata,
    estimateSwap,
    instantSwap,
    fetchAllPools,
    FT_MINIMUM_STORAGE_BALANCE_LARGE,
    ONE_YOCTO_NEAR,
} from "@ref-finance/ref-sdk";

// import { walletProvider } from "../providers/wallet";
import { settings } from "../utils/environment";
import { KeyPairString } from "near-api-js/lib/utils";

async function checkStorageBalance(
    account: any,
    contractId: string
): Promise<boolean> {
    try {
        const balance = await account.viewFunction({
            contractId,
            methodName: "storage_balance_of",
            args: { account_id: account.accountId },
        });
        return balance !== null && balance.total !== "0";
    } catch (error) {
        // console.log(`Error checking storage balance: ${error}`);
        return false;
    }
}

export async function swapToken(
    inputTokenId: string,
    outputTokenId: string,
    amount: string,
    slippageTolerance: number = Number(settings.SLIPPAGE) || 0.01
): Promise<any> {
    try {
        // Get token metadata
        const tokenIn = await ftGetTokenMetadata(inputTokenId);
        const tokenOut = await ftGetTokenMetadata(outputTokenId);
        const networkId = settings.networkId;
        const nodeUrl = settings.nodeUrl;

        // Get all pools for estimation
        // ratedPools, unRatedPools,
        const { simplePools } = await fetchAllPools();
        const swapTodos = await estimateSwap({
            tokenIn,
            tokenOut,
            amountIn: amount,
            simplePools,
            options: {
                enableSmartRouting: true,
            },
        });

        if (!swapTodos || swapTodos.length === 0) {
            throw new Error("No valid swap route found");
        }

        // Get account ID from runtime settings
        const accountId = settings.accountId;
        if (!accountId) {
            throw new Error("NEAR_ADDRESS not configured");
        }

        const secretKey = settings.secretKey;
        const keyStore = new keyStores.InMemoryKeyStore();
        const keyPair = utils.KeyPair.fromString(secretKey as KeyPairString);
        await keyStore.setKey(networkId, accountId, keyPair);

        const nearConnection = await connect({
            networkId,
            keyStore,
            nodeUrl,
        });

        const account = await nearConnection.account(accountId);

        // Check storage balance for both tokens
        const hasStorageIn = await checkStorageBalance(account, inputTokenId);
        const hasStorageOut = await checkStorageBalance(account, outputTokenId);

        const transactions = await instantSwap({
            tokenIn,
            tokenOut,
            amountIn: amount,
            swapTodos,
            slippageTolerance,
            AccountId: accountId,
        });

        // If storage deposit is needed, add it to transactions
        if (!hasStorageIn) {
            transactions.unshift({
                receiverId: inputTokenId,
                functionCalls: [
                    {
                        methodName: "storage_deposit",
                        args: {
                            account_id: accountId,
                            registration_only: true,
                        },
                        gas: "30000000000000",
                        amount: FT_MINIMUM_STORAGE_BALANCE_LARGE,
                    },
                ],
            });
        }

        if (!hasStorageOut) {
            transactions.unshift({
                receiverId: outputTokenId,
                functionCalls: [
                    {
                        methodName: "storage_deposit",
                        args: {
                            account_id: accountId,
                            registration_only: true,
                        },
                        gas: "30000000000000",
                        amount: FT_MINIMUM_STORAGE_BALANCE_LARGE,
                    },
                ],
            });
        }

        return transactions;
    } catch (error) {
        // console.error("Error in swapToken:", error);
        throw error;
    }
}

