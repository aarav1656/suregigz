import { NextResponse, NextRequest } from 'next/server';
import { transferToOtherWallet } from '../backend/index';
import { transfer } from '../backend/actions/zcash';
import { zcashFees } from '../backend/actions/zcash';
import { transfer_btc } from '../backend/bitcoin/btc';
import { isAmountAboveMinWithdraw } from '../withdrawFromIntents/route';

export async function POST(request: NextRequest) {

  try {
    // Read the request body as text first
      const rawBody = await request.text();
  
  
      // Parse JSON manually
      const data = JSON.parse(rawBody);
  
  
      // Extract values
      const { amounttransfer, transferrecipientAddress, transfertoken,transfersender } = data.params;

      var chain="NEAR";
      if(transfertoken === "BTC"){
        chain = "bitcoin";
      }
      else if(transfertoken === "ZEC"){
        chain = "zec";
      }
      if(!isAmountAboveMinWithdraw(transfertoken,chain,amounttransfer)){
        return NextResponse.json({ txid: "", message: 'Failed to withdraw (minimum amount error)' }, { status: 500 });
      }

      var txid = "";
      if(transfertoken === "ZEC"){
        if(transfertoken === '' || transfersender === '' || amounttransfer === '' || transferrecipientAddress === ''){
          return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
        }
        const args = [
          1,
          zcashFees,
          "NoPrivacy"
        ];
        txid = await transfer(transfersender,amounttransfer,transferrecipientAddress,args) || "";
      }
      else if(transfertoken === "BTC"){
        if(transfertoken === '' || amounttransfer === '' || transferrecipientAddress === ''){
          return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
        }
        txid = await transfer_btc(amounttransfer,transferrecipientAddress,true) || "";
      }
      else{
        if(transfertoken === '' || amounttransfer === '' || transferrecipientAddress === ''){
          return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
        }
        txid = await transferToOtherWallet(transfertoken, amounttransfer, transferrecipientAddress) || "";
      }

      if(!txid  || (txid === "")){
        return NextResponse.json({ txid: "", message: 'Failed to transfer' }, { status: 500 });
      }
  
    return NextResponse.json({txid:txid, message: 'Transfer successful' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({txid:"", message: 'Failed to transfer' }, { status: 500 });
  }
}
