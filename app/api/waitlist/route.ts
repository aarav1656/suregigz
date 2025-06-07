import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface WaitlistEntry {
  id: string;
  email: string;
  role: string;
  timestamp: string;
}

const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read existing waitlist data
async function readWaitlist(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write waitlist data
async function writeWaitlist(data: WaitlistEntry[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(data, null, 2));
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

    // Read existing data
    const waitlist = await readWaitlist();

    // Check if email already exists
    const existingEntry = waitlist.find(entry => entry.email === email);
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

    // Add to waitlist
    waitlist.push(newEntry);

    // Save updated waitlist
    await writeWaitlist(waitlist);

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

export async function GET() {
  try {
    const waitlist = await readWaitlist();
    return NextResponse.json({ 
      count: waitlist.length, 
      entries: waitlist 
    });
  } catch (error) {
    console.error('Error reading waitlist:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 