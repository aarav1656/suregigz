import { NextResponse, NextRequest } from 'next/server';
import { withdrawFromIntents } from '../backend/index';
import { withdraw } from '../backend/actions/zcash';
import tokendata from '../backend/config/tokens.json';

export function isAmountAboveMinWithdraw(token_symbol: string, chainName: string, amount: number): boolean {
  // Normalize inputs for case-insensitive comparison
  const normalizedSymbol = token_symbol.toUpperCase();
  const normalizedChain = chainName.toLowerCase();

  // First check unified_tokens
  const unifiedToken = tokendata.tokens.mainnet.unified_tokens.find(
    token => token.symbol.toUpperCase() === normalizedSymbol
  );

  if (unifiedToken) {
    if(chainName === "arbitrum")
      return amount >= ((unifiedToken.addresses.arbitrum?.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    else if(chainName === "aurora"){
      return amount >= ((unifiedToken.addresses.aurora?.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
    else if(chainName === "base"){
      return amount >= ((unifiedToken.addresses.base?.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
    else if(chainName === "ethereum"){
      return amount >= ((unifiedToken.addresses.ethereum.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
    else if(chainName === "near"){
      return amount >= ((unifiedToken.addresses.near.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
    else if(chainName === "solana"){
      return amount >= ((unifiedToken.addresses.solana?.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
    else if(chainName === "turbochain"){
      return amount >= ((unifiedToken.addresses.turbochain.min_withdraw_amount || 0) / (10 ** unifiedToken.decimals));
    }
  }

  // Then check single_chain_tokens
  const singleChainToken = tokendata.tokens.mainnet.single_chain_tokens.find(
    token => token.symbol.toUpperCase() === normalizedSymbol && 
            token.chainName.toLowerCase() === normalizedChain
  );

  if (singleChainToken) {
    return amount >= (singleChainToken.min_withdraw_amount / (10 ** singleChainToken.decimals));
  }

  // Token/chain combination not found
  console.log(`Token ${token_symbol} on chain ${chainName} not found`);
  return false;
}

export async function POST(request: NextRequest) {

  try {
    // Read the request body as text first
    const rawBody = await request.text();


    // Parse JSON manually
    const data = JSON.parse(rawBody);


    // Extract values
    const { amountwithdraw, tokenwithdraw, chainwithdraw, withdrawaddress } = data.params;
    console.log(data.params);

    if(!isAmountAboveMinWithdraw(tokenwithdraw,chainwithdraw,amountwithdraw)){
      return NextResponse.json({ txid: "", message: 'Failed to withdraw (minimum amount error)' }, { status: 500 });
    }

    console.log("line 73");

    var txid = "";
    if(tokenwithdraw === "ZEC"){
      if(tokenwithdraw === '' || amountwithdraw === '' || withdrawaddress === ''){
        return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
      }
      txid = await withdraw(amountwithdraw,withdrawaddress,tokenwithdraw) || "";
    }
    else{
      if(tokenwithdraw === '' || amountwithdraw === '' || withdrawaddress === '' || chainwithdraw === ''){
        return NextResponse.json({ txid: "", message: 'Provide all Agruments' }, { status: 500 });
      }
      txid = await withdrawFromIntents(tokenwithdraw, amountwithdraw, chainwithdraw, withdrawaddress);
    }

    if(!txid  || (txid === "")){
      return NextResponse.json({ txid: "", message: 'Failed to withdraw' }, { status: 500 });
    }
    
    return NextResponse.json({txid:txid, message: 'Withdrawal successful' }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({txid:"", message: 'Failed to withdraw' }, { status: 500 });
  }
}
