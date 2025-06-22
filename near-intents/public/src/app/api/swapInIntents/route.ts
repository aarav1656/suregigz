import { NextResponse, NextRequest } from 'next/server';
import { swapInIntents } from '../backend/index';

export async function POST(request: NextRequest) {

  try {
    const rawBody = await request.text();
    
    
    // Parse JSON manually
    const data = JSON.parse(rawBody);
    
    console.log("line13");
    // Extract values
    const { sellTokenintents,buyTokenintents,amountswapintent} = data.params;
    if(sellTokenintents === '' || buyTokenintents === '' || amountswapintent === ''){
      return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
    }
    console.log("line19");
    const txid = await swapInIntents(sellTokenintents, amountswapintent, buyTokenintents);
    console.log("line21");
    if(!txid  || (txid === "")){
      return NextResponse.json({ txid: "", message: 'Failed to swap' }, { status: 500 });
    }
    console.log("line25");
    return NextResponse.json({txid:txid, message: 'Swap successful' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({txid:"", message: 'Failed to swap' }, { status: 500 });
  }
}
