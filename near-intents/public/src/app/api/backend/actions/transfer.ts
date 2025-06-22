import { connect, keyStores, utils } from "near-api-js";
import { KeyPairString } from "near-api-js/lib/utils";
import { utils as nearUtils } from "near-api-js";
import { settings } from "../utils/environment";

export async function transferNEAR(
    recipient: string,
    amount: string
) {
    const networkId = settings.networkId;
    const nodeUrl = settings.nodeUrl;
    const accountId = settings.accountId;
    const secretKey = settings.secretKey;

    if (!accountId || !secretKey) {
        throw new Error("NEAR wallet credentials not configured");
    }

    // Create keystore and connect to NEAR
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(secretKey as KeyPairString);
    await keyStore.setKey(networkId, accountId, keyPair);
    
    const nearConnection = await connect({
        networkId,
        keyStore,
        nodeUrl,
    });
    
    const account = await nearConnection.account(accountId);
    
    // Execute transfer
    const result = await account.sendMoney(
        recipient,
        BigInt(nearUtils.format.parseNearAmount(amount)!)
    );
    
    return result;
}