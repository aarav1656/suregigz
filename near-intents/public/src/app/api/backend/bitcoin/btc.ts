import { settings } from "../utils/environment";
import {Bitcoin} from "./bitcoin"
import { NextResponse } from 'next/server';
import { FetchError,ResponseError } from "../types/deposit";
import { getTokenBySymbol } from "../types/tokens";
import { IntentMessage } from "../types/intents";
import { ethers } from "ethers";
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askForInput = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

export async function request(url: string, body: unknown): Promise<Response> {
    let response: Response
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
    } catch (err) {
      throw new FetchError(`The request failed ${err}`)
    }

    if (response.ok) {
      return response
    }

    throw new ResponseError(response, "Response returned an error code")
}

export async function get_btc_balance(accountId: string) { 
    const path = "bitcoin-1";
    const BTC = new Bitcoin("mainnet");
    const { address, publicKey } = await BTC.deriveAddress(
      accountId,
      path
    );

    console.log("Address: ", address);
    console.log("Public Key: ", publicKey);

    const balance = await BTC.getBalance({ address });

    return Number(balance);

}

export async function get_btc_balance_via_address(address:string){
  const BTC = new Bitcoin("mainnet");
    const balance = await BTC.getBalance({ address });

    return Number(balance);
}

export async function get_intents_address(){
  try {
    const accountId = settings.accountId;

    const deposit_address = await request("https://bridge.chaindefuser.com/rpc",
      {
        "jsonrpc": "2.0",
        "id": "dontcare",
        "method": "deposit_address", 
        "params": [ 
          {
            "account_id":  `${accountId}`,
            "chain": "btc:mainnet"
          }
        ]
      });
  
    const  recepient = (await deposit_address.json()).result.address;
    return recepient;

  } catch (error) {
      console.error('Error generating NEAR account details:', error);
      return "";
  }
}

export async function getderivedaddress(): Promise<string>{
  try {
      const accountId = settings.accountId;
      const path = "bitcoin-1";
      const BTC = new Bitcoin("mainnet");
  
      const { address, publicKey } = await BTC.deriveAddress(
        accountId,
        path
      );
      return address;
  
  } catch (error) {
      console.error('Error generating NEAR account details:', error);
      return "";
  }
}


// flag = 1 means transfer btc to given recepient_addr
// flag = 0 means deposit btc to defuse
export async function transfer_btc(amountbtc:string, recepient_addr:string, flag:number){
    try {
        const accountId = settings.accountId;
        const path = "bitcoin-1";
        const BTC = new Bitcoin("mainnet");
    
        const deposit_address = await request("https://bridge.chaindefuser.com/rpc",
        {
          "jsonrpc": "2.0",
          "id": "dontcare",
          "method": "deposit_address", 
          "params": [ 
            {
              "account_id":  `${accountId}`,
              "chain": "btc:mainnet"
            }
          ]
        });
        
        var recepient = (await deposit_address.json()).result.address;
        
        if(flag === 1 ){
          recepient = recepient_addr;
        }
        
        console.log(accountId,path,recepient);
        // await askForInput("hi");

        const { address, publicKey } = await BTC.deriveAddress(
          accountId,
          path
        );

        const token = getTokenBySymbol("BTC");

        const amount = parseInt((Number(amountbtc) * (10 ** Number(token?.decimals))).toString());
    
        const balance = await BTC.getBalance({ address });

        console.log("line 136");
        console.log(amount,balance,token,address);
        
        if (balance < amount) {
          return "";
        }
        
        
        async function chainSignature() {
          
          const { psbt, utxos } = await BTC.createTransaction({
            from: address,
            to: recepient,
            amount
          });
          console.log("line 170");
          console.log(psbt,utxos);
          await askForInput("hi");
            // sessionStorage.setItem(
            //   "btc_transaction",
            //   JSON.stringify({
            //     from: address,
            //     to: recepient,
            //     amount,
            //     utxos,
            //     publicKey: publicKey
            //   })
            // );

            const new_psbt = await BTC.requestSignatureToMPC({path, psbt, utxos, publicKey});

            const btc_hash = await BTC.broadcastTX(new_psbt);
            return btc_hash;
        
        
          //   try {
          //     var obj;
          //     const keyPair = {
          //       publicKey: Buffer.from(publicKey, 'hex'),
          //       sign: async (transactionHash:any) => {
          //         const utxo = utxos[0]; // The UTXO being spent
          //         const value = utxo.value; // The value in satoshis of the UTXO being spent
          
          //         if (isNaN(value)) {
          //           throw new Error(`Invalid value for UTXO at index ${transactionHash}: ${utxo.value}`);
          //         }
          //         console.log("HELLLLOOOOOO", transactionHash);
          
          //         const payload = Object.values(ethers.getBytes(transactionHash));
          
          //         // Sign the payload using MPC
          //         const args = { request: { payload, path, key_version: 0, } };
          
          //         // const { big_r, s } = 
          //         [{
          //           receiverId: contractId,
          //           actions: [
          //             {
          //               type: 'FunctionCall',
          //               params: {
          //                 methodName: method,
          //                 args,
          //                 gas,
          //                 deposit,
          //               },
          //             },
          //           ],
          //         }]
          //         transactions.functionCall(
          //             "sign",
          //             args,
          //             BigInt(250000000000000),
          //             minStorageBalance
          //           )
          //         obj = await wallet.callMethod({
          //           contractId: MPC_CONTRACT,
          //           method: 'sign',
          //           args,
          //           gas: '250000000000000', // 250 Tgas
          //           deposit: attachedDeposit,
          //         });
          
          //         return Buffer.alloc(64);
          //       },
          //     };
          
          //     // Sign each input manually
          //     await Promise.all(
          //       utxos.map(async (_, index) => {
          //         try {
          //           await psbt.signInputAsync(index, keyPair);
          //           console.log(`Input ${index} signed successfully`);
          //         } catch (e) {
          //           console.warn(`Error signing input ${index}:`, e);
          //         }
          //       })
          //     );
          //     const signedTransaction = obj;
          //     return signedTransaction;
          //   } catch (e) {
          //     console.log(e);
          //   }
          }

        // async function relayTransaction() {
        //     try {
        //       const txHash = await BTC.broadcastTX(signtxn);
        //       return txHash;
        //     } catch (e) {
        //       console.log(`error: ${e}`)
        //     }
        // }
        // const signtxn = chainSignature();
        // const hash = relayTransaction();
        console.log("in chain sign line 246");
        const hash:string = await chainSignature()
        console.log(hash);
        console.log("in chain sign line 248");
    
        return hash;
    
    } catch (error) {
        console.error('Error generating NEAR account details:', error);
        return "";
    }
}