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
    console.log('POST request received for client onboarding');
    
    const body = await request.json();
    console.log('Received data:', { ...body, email: body.email?.substring(0, 5) + '...' });
    
    const { fullName, email, companyName, industry, projectDescription, budget } = body;
    
    // Validate input
    if (!fullName || !email || !industry || !projectDescription || !budget) {
      console.error('Missing required fields:', { 
        fullName: !!fullName, 
        email: !!email, 
        industry: !!industry, 
        projectDescription: !!projectDescription, 
        budget: !!budget 
      });
      return NextResponse.json(
        { error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    // Check if email already exists
    console.log('Checking for existing email...');
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing client:', checkError);
      return NextResponse.json(
        { error: 'Database connection error: ' + checkError.message },
        { status: 500 }
      );
    }

    if (existingClient) {
      console.log('Email already exists:', email);
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Insert new client
    console.log('Inserting new client...');
    const clientData = {
      full_name: fullName,
      email,
      company_name: companyName || null, // Make company name optional
      industry,
      project_description: projectDescription,
      budget: parseFloat(budget)
    };
    console.log('Client data to insert:', { ...clientData, email: clientData.email?.substring(0, 5) + '...' });

    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert([clientData])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create client profile: ' + insertError.message },
        { status: 500 }
      );
    }

    console.log('Successfully created client profile');
    return NextResponse.json(
      { 
        message: 'Client profile created successfully',
        client: newClient
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