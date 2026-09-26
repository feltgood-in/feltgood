import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import Category from '../../../lib/models/Category';
import Product from '../../../lib/models/Product';

export const dynamic = 'force-dynamic'; // Ensures this route isn't statically cached since we disabled cache in the original

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find();
    const products = await Product.find();
    
    return NextResponse.json(
      { categories, products },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { categories, products } = await req.json();
    
    if (categories) {
      await Category.deleteMany({});
      if (categories.length > 0) await Category.insertMany(categories);
    }
    
    if (products) {
      await Product.deleteMany({});
      if (products.length > 0) await Product.insertMany(products);
    }
    
    return NextResponse.json({ success: true, message: "Products updated successfully" });
  } catch (error) {
    console.error("PUT Products Error:", error);
    return NextResponse.json({ message: "Error updating database" }, { status: 500 });
  }
}
