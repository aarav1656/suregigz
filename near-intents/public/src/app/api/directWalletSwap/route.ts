import { NextResponse, NextRequest } from 'next/server';
// Assuming you implement a directWalletSwap function in your backend
import { swapInIntents, swapInWallet,depositToIntents } from '../backend/index';
import { deposit,withdraw, zcashFees } from '../backend/actions/zcash';
import { getBalances, withdrawFromDefuse } from '../backend/actions/crossChainSwap';
import { CrossChainSwapAndWithdrawParams,CrossChainSwapParams } from '../backend/types/intents';
import { settings } from '../backend/utils/environment';
import { isAmountAboveMinWithdraw } from '../withdrawFromIntents/route';
import { getderivedaddress } from '../backend/bitcoin/btc';
import { transfer_btc } from '../backend/bitcoin/btc';
import { get_btc_balance_via_address } from '../backend/bitcoin/btc';
import { get_intents_address } from '../backend/bitcoin/btc';
import { getTokenBySymbol } from '../backend/types/tokens';
import { getAllBalances } from '../backend/actions/crossChainSwap';

export async function POST(request: NextRequest) {

  try {
    // Read the request body as text first
        const rawBody = await request.text();

        // Parse JSON manually
        const data = JSON.parse(rawBody);
    
        // Extract values
        const { sellTokenwallet,buyTokenwallet, amountswapwallet,sellChainwallet,buyChainwallet,zwalletsellsender,zwalletbuyreceiver,btcreciveraddr } = data.params;

        var txid:any;
        if(sellTokenwallet === buyTokenwallet){
          return NextResponse.json({ deposittxid: "", swaptxid: "", withdrawtxid: "",message: 'Failed to swap (same token given)' }, { status: 500 });
        }
        else if(sellTokenwallet === "ZEC"){
            if(sellTokenwallet === '' || buyTokenwallet === '' || sellChainwallet === '' || zwalletsellsender === '' || btcreciveraddr === ''){
              return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
            }
            const t1 = await deposit(zwalletsellsender,amountswapwallet) || "";
            console.log(t1);
            const te = await getAllBalances();
            var amount = Number(((te).find(b => b.token === sellTokenwallet)?.balance) || "");
            if(t1 === ""){
              amount = 0;
              return NextResponse.json({ deposittxid: "", swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in deposit)' }, { status: 500 });
            }
            if(amount > amountswapwallet){
              amount = amountswapwallet;
            }
                
            var ret_val = await swapInIntents(sellTokenwallet,amount.toString(),buyTokenwallet);
            console.log(ret_val);
            if(!ret_val || ret_val === ""){
              return NextResponse.json({ deposittxid: t1, swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in internal swap)' }, { status: 500 });
            }

            const ten = await getAllBalances();
            var amount1 = Number(((ten).find(b => b.token === buyTokenwallet)?.balance) || "") - Number(((te).find(b => b.token === buyTokenwallet)?.balance) || "");

            if(amount1 > amount){
              amount1 = amount;
            }
            var params: CrossChainSwapAndWithdrawParams= {
              exact_amount_in: amount1.toString(),
              defuse_asset_identifier_in: "",
              defuse_asset_identifier_out: buyTokenwallet,
              destination_address: settings.accountId,
              network: "near"
            };
            if(buyTokenwallet === "BTC"){
                params = {
                exact_amount_in: amount1.toString(),
                defuse_asset_identifier_in: "",
                defuse_asset_identifier_out: buyTokenwallet,
                destination_address: btcreciveraddr,
                network: "bitcoin" // to check
              };
            }
            console.log(params);
            // if(!validateAddress(settings.accountId,"near")){
            //   throw new Error(`You have entered an invalid address ${settings.accountId}`);
            // }
            if(!isAmountAboveMinWithdraw(buyTokenwallet,(params.network || "near"),amount1)){
              return NextResponse.json({ deposittxid: t1, swaptxid: ret_val, withdrawtxid: "", message: 'Failed to withdraw (minimum amount error)' }, { status: 500 });
            }
            const transaction_hash  = await withdrawFromDefuse(params);
            if(!transaction_hash || transaction_hash === ""){
              return NextResponse.json({ deposittxid: t1, swaptxid: ret_val.hash, withdrawtxid: "",message: 'Failed to swap (in withdraw)' }, { status: 500 });
              }

            txid = { deposittxid: t1, swaptxid: ret_val.hash, withdrawtxid: transaction_hash};
          
        }
        else if(buyTokenwallet === "ZEC"){
            var deposithash = "";
            var swaphash;
            var amount1 = 0;
            var t1 ="";
            var ret_val;
            if(sellTokenwallet === "BTC"){
              if(sellTokenwallet === '' || buyTokenwallet === '' || zwalletbuyreceiver === '' || amountswapwallet === ''){
                return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
              }
              deposithash = await transfer_btc(amountswapwallet,"",false) || "";
              if (!deposithash || deposithash === ""){
                return NextResponse.json({ deposittxid: "", swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in deposit)' }, { status: 500 });
              }
              const te = await getAllBalances();
              var amount = Number(((te).find(b => b.token === sellTokenwallet)?.balance) || "");
              if(amount > amountswapwallet){
                amount = amountswapwallet;
              }

              
              swaphash = await swapInIntents(sellTokenwallet,amount.toString(),buyTokenwallet) || "";
              if (!swaphash || swaphash === ""){
                return NextResponse.json({ deposittxid: deposithash, swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in internal swap)' }, { status: 500 });
              }
              const ten = await getAllBalances();
              amount1 = Number(((ten).find(b => b.token === buyTokenwallet)?.balance) || "") - Number(((te).find(b => b.token === buyTokenwallet)?.balance) || "");

              if(amount1 > amount){
                amount1 = amount;
              }

            }
            else{
              if(sellTokenwallet === '' || buyTokenwallet === '' ||  amountswapwallet === '' || zwalletbuyreceiver === ''){
                return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
              }
              t1 = await depositToIntents(sellTokenwallet,amountswapwallet,"near") || "";
              console.log(t1);
              const te = await getAllBalances();
              var amount = Number(((te).find(b => b.token === sellTokenwallet)?.balance) || "");
              if(t1 === ""){
                amount = 0;
                return NextResponse.json({ deposittxid: "", swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in deposit)' }, { status: 500 });
              }
              if(amount > amountswapwallet){
                amount = amountswapwallet;
              }
                  
              ret_val = await swapInIntents(sellTokenwallet,amount.toString(),buyTokenwallet);
              console.log(ret_val);
              if(!ret_val || ret_val === ""){
                return NextResponse.json({ deposittxid: t1, swaptxid: "", withdrawtxid: "",message: 'Failed to swap (in internal swap)' }, { status: 500 });
              }
              const ten = await getAllBalances();
              amount1 = Number(((ten).find(b => b.token === buyTokenwallet)?.balance) || "") - Number(((te).find(b => b.token === buyTokenwallet)?.balance) || "");

              if(amount1 > amount){
                amount1 = amount;
              }
            }

            if(!isAmountAboveMinWithdraw(buyTokenwallet,"zec",amount1)){
              return NextResponse.json({ deposittxid: t1, swaptxid: ret_val, withdrawtxid: "", message: 'Failed to withdraw (minimum amount error)' }, { status: 500 });
            }

            const withdraw_hash = await withdraw(amount1,zwalletbuyreceiver,buyTokenwallet);

            if(withdraw_hash === ""){
              if(deposithash === ""){
                return NextResponse.json({ deposittxid: t1, swaptxid: ret_val, withdrawtxid: "",message: 'Failed to swap (in withdraw)' }, { status: 500 });
              }
              else{
                return NextResponse.json({ deposittxid: deposithash, swaptxid: swaphash, withdrawtxid: "",message: 'Failed to swap (in withdraw)' }, { status: 500 });
              }
            }
            if(sellTokenwallet === "BTC"){
                txid = { deposittxid: deposithash, swaptxid: swaphash, withdrawtxid: withdraw_hash};
            }
            else{
                txid = { deposittxid: t1, swaptxid: ret_val, withdrawtxid: withdraw_hash};
            }
        }
        else{
          if(sellTokenwallet === '' || buyTokenwallet === '' || sellChainwallet === '' || amountswapwallet === '' || buyChainwallet === ''){
            return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
          }
          txid = await swapInWallet(sellTokenwallet,amountswapwallet,buyChainwallet,buyTokenwallet,sellChainwallet);
        }
    
    return NextResponse.json({ deposittxid: txid.deposittxid, swaptxid:txid.swaptxid, withdrawtxid: txid.withdrawtxid, message: 'Swap successful' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ deposittxid: "", swaptxid: "", withdrawtxid: "",message: 'Failed to swap' }, { status: 500 });
  }
}
