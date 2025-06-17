import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received');
    
    const { email, role } = await request.json();
    console.log('Request data:', { email: email?.substring(0, 5) + '...', role });

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    console.log('Checking for existing email...');
    const { data: existingUser, error: checkError } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Database connection error: ' + checkError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('Email already exists:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Insert new entry
    console.log('Inserting new entry...');
    const { data: newEntry, error: insertError } = await supabase
      .from('waitlist')
      .insert([{ email, role }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to add to waitlist: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('Successfully inserted new entry:', newEntry);
    return NextResponse.json(
      { 
        message: 'Successfully added to waitlist', 
        id: newEntry.id,
        email: newEntry.email,
        role: newEntry.role,
        timestamp: newEntry.created_at
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    const expectedAdminKey = process.env.ADMIN_KEY || 'admin123';
    
    if (!adminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch waitlist: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      count: data.length, 
      entries: data 
    });
  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}