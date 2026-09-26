import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Homepage from '../../../lib/models/Homepage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const data = await Homepage.findOne();
    
    return NextResponse.json(data || {}, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("GET Homepage Error:", error);
    return NextResponse.json({ message: "Error fetching homepage data" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    await Homepage.deleteMany({});
    await Homepage.create(body);
    
    return NextResponse.json({ success: true, message: "Homepage updated successfully" });
  } catch (error) {
    console.error("PUT Homepage Error:", error);
    return NextResponse.json({ message: "Error updating homepage data" }, { status: 500 });
  }
}
