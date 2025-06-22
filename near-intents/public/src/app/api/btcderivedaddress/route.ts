import { settings } from "../backend/utils/environment";
import { Bitcoin } from "../backend/bitcoin/bitcoin";
import { NextResponse} from 'next/server';


export async function GET(){
    try {
        const accountId = settings.accountId;
        const path = "bitcoin-1";
        const BTC = new Bitcoin("mainnet");
    
        const { address, publicKey } = await BTC.deriveAddress(
          accountId,
          path
        );
        return NextResponse.json({address: address, publicKey:publicKey , message: 'get derive address successfull'}, { status: 201 });
    
    } catch (error) {
        console.error('Error generating NEAR account details:', error);
        return NextResponse.json({address: "", publicKey:"" , error: 'Failed to generate NEAR account details' }, { status: 500 });
    }
}