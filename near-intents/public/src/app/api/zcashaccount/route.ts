import { settings } from "../backend/utils/environment";
import { NextResponse} from 'next/server';


export async function GET(){
    try {
        const accountId = settings.zcashaccount;
        return NextResponse.json({address: accountId, message: 'get derive address successfull'}, { status: 201 });
    
    } catch (error) {
        console.error('Error generating NEAR account details:', error);
        return NextResponse.json({address: "", error: 'Failed to generate NEAR account details' }, { status: 500 });
    }
}