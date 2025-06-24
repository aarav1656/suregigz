import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl!, supabaseKey!);

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for worker onboarding');
    
    const body = await request.json();
    console.log('Received data:', { ...body, email: body.email?.substring(0, 5) + '...' });
    
    const { fullName, email, skills, experience, hourlyRate, bio } = body;
    
    // Validate input
    if (!fullName || !email || !skills || !experience || !hourlyRate || !bio) {
      console.error('Missing required fields:', { fullName: !!fullName, email: !!email, skills: !!skills, experience: !!experience, hourlyRate: !!hourlyRate, bio: !!bio });
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    console.log('Checking for existing email...');
    const { data: existingUser, error: checkError } = await supabase
      .from('workers')
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

    // Insert new worker
    console.log('Inserting new worker...');
    const workerData = {
      full_name: fullName,
      email,
      skills: skills.split(',').map((skill: string) => skill.trim()),
      experience,
      hourly_rate: parseFloat(hourlyRate),
      bio
    };
    console.log('Worker data to insert:', { ...workerData, email: workerData.email?.substring(0, 5) + '...' });

    const { data: newWorker, error: insertError } = await supabase
      .from('workers')
      .insert([workerData])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create worker profile: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('Successfully created worker profile');
    return NextResponse.json(
      { 
        message: 'Worker profile created successfully',
        worker: newWorker
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