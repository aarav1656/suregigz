
import { KeyPair, keyStores, connect, Account, utils } from "near-api-js";
import BigNumber from "bignumber.js";
import { KeyPairString } from "near-api-js/lib/utils";
import NodeCache from "node-cache";
import { settings } from "../utils/environment";

const PROVIDER_CONFIG = {
    networkId: settings.networkId,
    nodeUrl:settings.nodeUrl,
    walletUrl: settings.walletUrl,
    helperUrl: settings.helperUrl,
    explorerUrl: settings.explorerUrl,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    SLIPPAGE: settings.SLIPPAGE,
};

export interface NearToken {
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    uiAmount: string;
    priceUsd: string;
    valueUsd: string;
    valueNear?: string;
}

interface WalletPortfolio {
    totalUsd: string;
    totalNear?: string;
    tokens: Array<NearToken>;
}

export class WalletProvider {
    private cache: NodeCache;
    private account: Account | null = null;
    private keyStore: keyStores.InMemoryKeyStore;
    constructor(private accountId: string) {
        this.cache = new NodeCache({ stdTTL: 300 }); // Cache TTL set to 5 minutes
        this.keyStore = new keyStores.InMemoryKeyStore();
    }

    async get(): Promise<string | null> {
        try {
            return await this.getFormattedPortfolio();
        } catch (error) {
            // console.error("Error in wallet provider:", error);
            return null;
        }
    }

    public async connect() {
        if (this.account) return this.account;

        const secretKey = settings.secretKey;
        const publicKey = settings.publicKey;

        // console.log(secretKey)

        if (!secretKey || !publicKey) {
            throw new Error("NEAR wallet credentials not configured");
        }

        // Create KeyPair from secret key
        const keyPair = KeyPair.fromString(secretKey as KeyPairString);

        // Set the key in the keystore
        await this.keyStore.setKey(
            PROVIDER_CONFIG.networkId,
            this.accountId,
            keyPair
        );

        const nearConnection = await connect({
            networkId: PROVIDER_CONFIG.networkId,
            keyStore: this.keyStore,
            nodeUrl: PROVIDER_CONFIG.nodeUrl,
            walletUrl: PROVIDER_CONFIG.walletUrl,
            helperUrl: PROVIDER_CONFIG.helperUrl,
        });

        this.account = await nearConnection.account(this.accountId);
        return this.account;
    }

    private async fetchWithRetry(
        url: string,
        options: RequestInit = {}
    ): Promise<any> {
        let lastError: Error;

        for (let i = 0; i < PROVIDER_CONFIG.MAX_RETRIES; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                // console.error(`Attempt ${i + 1} failed:`, error);
                lastError = error as Error;
                if (i < PROVIDER_CONFIG.MAX_RETRIES - 1) {
                    await new Promise((resolve) =>
                        setTimeout(
                            resolve,
                            PROVIDER_CONFIG.RETRY_DELAY * Math.pow(2, i)
                        )
                    );
                }
            }
        }
        throw lastError!;
    }

    async fetchPortfolioValue(): Promise<WalletPortfolio> {
        try {
            const cacheKey = `portfolio-${this.accountId}`;
            const cachedValue = this.cache.get<WalletPortfolio>(cacheKey);

            if (cachedValue) {
                // console.log("Cache hit for fetchPortfolioValue");
                return cachedValue;
            }

            const account = await this.connect();
            const balance = await account.getAccountBalance();

            // Convert yoctoNEAR to NEAR
            const nearBalance = utils.format.formatNearAmount(
                balance.available
            );

            // Fetch NEAR price in USD
            const nearPrice = await this.fetchNearPrice();
            const valueUsd = new BigNumber(nearBalance).times(nearPrice);

            const portfolio: WalletPortfolio = {
                totalUsd: valueUsd.toString(),
                totalNear: nearBalance,
                tokens: [
                    {
                        name: "NEAR Protocol",
                        symbol: "NEAR",
                        decimals: 24,
                        balance: balance.available,
                        uiAmount: nearBalance,
                        priceUsd: nearPrice.toString(),
                        valueUsd: valueUsd.toString(),
                    },
                ],
            };

            this.cache.set(cacheKey, portfolio);
            return portfolio;
        } catch (error) {
            // console.error("Error fetching portfolio:", error);
            throw error;
        }
    }

    private async fetchNearPrice(): Promise<number> {
        const cacheKey = "near-price";
        const cachedPrice = this.cache.get<number>(cacheKey);

        if (cachedPrice) {
            return cachedPrice;
        }

        try {
            const response = await this.fetchWithRetry(
                "https://api.coingecko.com/api/v3/simple/price?ids=near&vs_currencies=usd"
            );
            const price = response.near.usd;
            this.cache.set(cacheKey, price);
            return price;
        } catch (error) {
            // console.error("Error fetching NEAR price:", error);
            return 0;
        }
    }

    formatPortfolio(portfolio: WalletPortfolio): string {
        let output = `NEAR Wallet Portfolio Summary\n`;
        output += `Account ID: ${this.accountId}\n\n`;

        const totalUsdFormatted = new BigNumber(portfolio.totalUsd).toFixed(2);
        const totalNearFormatted = portfolio.totalNear;

        output += `Total Value: $${totalUsdFormatted} (${totalNearFormatted} NEAR)\n\n`;
        output += "Token Balances:\n";

        for (const token of portfolio.tokens) {
            output += `${token.name} (${token.symbol}): ${token.uiAmount} ($${new BigNumber(token.valueUsd).toFixed(2)})\n`;
        }

        output += "\nMarket Prices:\n";
        output += `NEAR: $${new BigNumber(portfolio.tokens[0].priceUsd).toFixed(2)}\n`;

        return output;
    }

    async getFormattedPortfolio(): Promise<string> {
        try {
            const portfolio = await this.fetchPortfolioValue();
            return this.formatPortfolio(portfolio);
        } catch (error) {
            // console.error("Error generating portfolio report:", error);
            return "Unable to fetch wallet information. Please try again later.";
        }
    }
}

const walletProvider = {
    get: async (): Promise<string | null> => {
        try {
            const accountId = settings.accountId;
            if (!accountId) {
                throw new Error("NEAR_ADDRESS not configured");
            }
            const provider = new WalletProvider(accountId);
            return await provider.getFormattedPortfolio();
        } catch (error) {
            // console.error("Error in wallet provider:", error);
            return null;
        }
    },
};


export { walletProvider };