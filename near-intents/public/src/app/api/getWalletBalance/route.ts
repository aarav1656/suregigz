import { NextResponse } from 'next/server';
import { checkBalanceWallet } from '../backend/index';

export async function GET() {
  try {
    const balance = await checkBalanceWallet();
    return NextResponse.json({ balance }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Failed to get balance' }, { status: 500 });
  }
}
