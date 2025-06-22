import "dotenv/config";
import chalk from "chalk";
import { settings } from "./utils/environment";
import { _depositToIntents, withdrawFromDefuse, getAllBalances, get_token_data, _swapInIntents, getBalances } from "./actions/crossChainSwap";
import { CrossChainSwapParams, CrossChainSwapAndWithdrawParams } from "./types/intents";
import { transferNEAR } from "./actions/transfer";
import { validateAddress } from "./actions/crossChainSwap";
import { account_balance, wallet_balance } from "./actions/zcash";
import {get_btc_balance} from "./bitcoin/btc";
import { getTokenBySymbol } from "./types/tokens";
import { swapInIntents_Internal } from "./actions/crossChainSwap";
import { getAccountForAddress } from "./actions/zcash";

  

export const depositToIntents = async (asset:string,amount:string,network:string): Promise<string> => {
  try{
    
    const cross_chain_params: CrossChainSwapParams = {
      exact_amount_in: amount,
      defuse_asset_identifier_in: asset,
      defuse_asset_identifier_out: asset,
      network: network
    };
    const transaction_hash = await _depositToIntents(cross_chain_params);
    console.log(`Deposit Successfull`);
    return transaction_hash;
  }
  catch(error){
    console.log(`Deposit unsuccessfull due to ${error}`);
    return "";
  }
    
    
  };
  
  export const withdrawFromIntents = async (asset:string,amount:string,network:string,receiver_id:string) => {
  try{
  
    const params: CrossChainSwapAndWithdrawParams = {
      exact_amount_in: amount,
      defuse_asset_identifier_in: "",
      defuse_asset_identifier_out: asset,
      destination_address: receiver_id === "" ? settings.accountId: receiver_id,
      network: network
    };
    if(!validateAddress(receiver_id,network)){
      throw new Error(`You have entered an invalid address ${receiver_id}`);
    }
    const transaction_hash  = await withdrawFromDefuse(params);
    console.log(`Withdraw Successfull`);
    return transaction_hash;
  }
  catch(error){
    console.log(`Withdraw unsuccessfull due to ${error}`);
    return "";
  }
    
  };
  
  export  const checkBalanceIntents = async (): Promise<Array<any>> => {
    try{
      const balance = await getAllBalances(); 
      if(balance.length !== 0 ){
        console.log(balance);
      }
      else{
        console.log("Your intents has 0 balance for all tokens");
      }
      return balance;
    }
    catch(error){
      console.error(`Failed to fetch Intents balance ${error}`);
      return [];
    }
    
  };
  
  // Modified existing functions with styled outputs
  export  const checkBalanceWallet = async (): Promise<Array<any>> => {
    try {
      const balance = await get_token_data();
      const zcashbalancetotal = await wallet_balance();
      const zcashaccountno = await getAccountForAddress(settings.zcashaccount);
      var btcderived = await get_btc_balance(settings.accountId);
      const token = getTokenBySymbol("BTC");
      if(!token){
        console.log("btc in balance token not found");
      }
      else{
        btcderived = (Number(btcderived) / Number(10 ** Number(token.decimals)));
      }
      if(btcderived > 0){
        balance.push({token: 'BTC (Derived)', balance: btcderived.toString()})
      } 
      console.log(zcashbalancetotal);
      console.log(balance);
      console.log("------------------");
      if (zcashbalancetotal[0]){ 
        balance.push({token: 'ZCASH (Transparent)', balance: (zcashbalancetotal[0]).toString()});
      }
      if (zcashbalancetotal[1]){
        balance.push({token: 'ZCASH (Shielded)', balance: (zcashbalancetotal[1]).toString()});
      }
      if(zcashaccountno !== -1){
        const zcashaccountbal = await account_balance(zcashaccountno);
        if(zcashaccountbal){
          balance.push({token: `ZCASH (acc = ${zcashaccountno}) (Transparent)`, balance: (zcashaccountbal[0]).toString()});
          balance.push({token: `ZCASH (acc = ${zcashaccountno}) (Shielded)`, balance: (zcashaccountbal[1]).toString()});
        }
        else{
          balance.push({token: `ZCASH (acc = ${zcashaccountno})`, balance: "0"});
        }
      }
      else{
        console.log("not able to fetch zcash account");
        balance.push({token: "ZCASH (account)", balance: "0"});
      }
      console.log(chalk.white.bold('Current Holdings:'));
      console.log(chalk.white('-'.repeat(40)));
      console.log(balance);
      console.log(chalk.white('-'.repeat(40)));
      return balance;
    } catch (error) {
      console.error(`Failed to fetch wallet balance ${error}`);
      return []
    }
    
  };
  
  export const transferToOtherWallet = async (token:string,amount:string,receiver:string) => {
    try {
      if(!validateAddress(receiver,"near")){
        throw new Error(`You have entered an invalid address ${receiver}`);
      }
      var result;
      if(token == "NEAR"){
        result = await transferNEAR(receiver, amount);
      }
      if(result){
        console.log(`Transfer successful! Transaction ID: ${result.transaction_outcome.id}`);
        return result.transaction_outcome.id;
      }
    } catch (error) {
      console.log(`Transfer failed! ${error}`);
      return "";
    }
    
  };
  
  export const swapInIntents = async (asset1:string,amount:string,asset2:string) => {
  try{
    
    var ret_val = await swapInIntents_Internal(asset1,amount,asset2,"near",true);
    if(ret_val == "deposit_required"){
      throw new Error("Insufficient balance deposit required");
    }
    return ret_val;
  }
    catch(error){
      console.error(`Failed to swap in Intents ${error}`);
      return "";
    }  
      
    }
    
export const swapInWallet = async (asset1:string,amount1:string,network1:string,asset2:string,network2:string) => {
    try{
      const cross_chain_params: CrossChainSwapParams = {
        exact_amount_in: amount1,
        defuse_asset_identifier_in: asset1,
        defuse_asset_identifier_out: asset1,
        network: network1
      };
      const transaction_hash = await _depositToIntents(cross_chain_params);
      if(!transaction_hash && transaction_hash === ""){
        console.error('Failed to deposit in Wallet');
        return { deposittxid: "", swaptxid: "", withdrawtxid: ""};
      }
      console.log(`Deposit Successfull`);
      const te = await getAllBalances();
      var tr = Number(((te).find(b => b.token === asset1)?.balance) || "");
      var amount_in_swap = Number(amount1);
      if(tr < amount_in_swap){
        amount_in_swap = tr;
      }

      var ret_val = await swapInIntents_Internal(asset1,amount_in_swap.toString(),asset2,network1,true);
      if(!ret_val && ret_val === ""){
        console.error('Failed to swap in intents for Wallet swap');
        return { deposittxid: transaction_hash, swaptxid: "", withdrawtxid: ""};
      }

      console.log(`Swap successful`);
      const ten = await getAllBalances();
      tr = Number(((te).find(b => b.token === asset2)?.balance) || "");
      const trn = Number(((ten).find(b => b.token === asset2)?.balance) || "");
      var amount_out_swap = trn - tr;
      if(amount_out_swap < 0){
        amount_out_swap = 0;
        console.error('Failed to withdraw for Wallet swap');
        return { deposittxid: transaction_hash, swaptxid: ret_val, withdrawtxid: ""};
      }

      const params: CrossChainSwapAndWithdrawParams = {
        exact_amount_in: amount_out_swap.toString(),
        defuse_asset_identifier_in: "",
        defuse_asset_identifier_out: asset2,
        destination_address: settings.accountId,
        network: network2
      };

      const transaction_hash_withdraw  = await withdrawFromDefuse(params);
      if(!transaction_hash_withdraw && transaction_hash_withdraw === ""){
        console.error('Failed to swap in intents for Wallet swap');
        return { deposittxid: transaction_hash, swaptxid: ret_val, withdrawtxid: ""};
      }
      console.log(`Withdraw Successfull`);
      return { deposittxid: transaction_hash, swaptxid: ret_val, withdrawtxid: transaction_hash_withdraw};
    }
    catch(error){
        console.error('Failed to swap in Wallet');
        return { deposittxid: "", swaptxid: "", withdrawtxid: ""};
    } 
}
    
    