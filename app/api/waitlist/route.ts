import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

interface WaitlistEntry {
  id: string;
  email: string;
  role: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('suregigz');
    const waitlist = db.collection('waitlist');

    // Check if email already exists
    const existingEntry = await waitlist.findOne({ email });
    if (existingEntry) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Create new entry
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      email,
      role,
      timestamp: new Date().toISOString(),
    };

    // Insert into MongoDB
    await waitlist.insertOne(newEntry);

    return NextResponse.json(
      { message: 'Successfully added to waitlist', id: newEntry.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check for admin authentication
    const adminKey = request.headers.get('x-admin-key');
    const expectedAdminKey = process.env.ADMIN_KEY || 'admin123'; // Default for development
    
    if (!adminKey || adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('suregigz');
    const waitlist = db.collection('waitlist');

    // Get all entries
    const entries = await waitlist.find({}).toArray();
    
    return NextResponse.json({ 
      count: entries.length, 
      entries 
    });
  } catch (error) {
    console.error('Error reading waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 