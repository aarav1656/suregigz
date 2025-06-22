import { NextResponse,NextRequest } from 'next/server';
import { depositToIntents } from '../backend/index';
import { deposit } from '../backend/actions/zcash';
import { transfer_btc } from '../backend/bitcoin/btc';

export async function POST(request: NextRequest) {

  try {

    // Read the request body as text first
    const rawBody = await request.text();


    // Parse JSON manually
    const data = JSON.parse(rawBody);


    // Extract values
    const { amountdeposit, tokendeposit, chaindeposit, senderdeposit } = data.params;
    if(!amountdeposit || !tokendeposit || !chaindeposit || amountdeposit === '' || tokendeposit === '' || chaindeposit === '' ){
      return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
    }
    if(tokendeposit === "ZEC" && (!senderdeposit || senderdeposit === '')){
      return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
    }
    console.log(data.params);
    console.log(`sender: ${senderdeposit}`);

    console.log(amountdeposit,tokendeposit,chaindeposit,senderdeposit);

    var txid = "";

    if(tokendeposit === "ZEC"){
      console.log("in zec");
      txid = (await deposit(senderdeposit,parseFloat(amountdeposit))) || "";
    }
    else if(tokendeposit === "BTC"){
      console.log("in btc");
      txid = (await transfer_btc(amountdeposit,"",false)) || "";
    }
    else{
      console.log("in near");
      txid = await depositToIntents(tokendeposit, amountdeposit, chaindeposit);
    }
    console.log("line39");
    if(!txid  || (txid === "")){
      return NextResponse.json({ txid: "", message: 'Failed to deposit' }, { status: 500 });
    }

    return NextResponse.json({ txid, message: 'Deposit successful' }, { status: 201 });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json({ txid: "", message: 'Failed to deposit' }, { status: 500 });
  }
}

