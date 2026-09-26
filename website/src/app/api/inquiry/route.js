import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '../../../lib/db';
import Message from '../../../backend/models/Message';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

let emailRateLimits = global.emailRateLimits;

if (!emailRateLimits) {
  emailRateLimits = global.emailRateLimits = {};
  // Clear rate limits every 24 hours
  setInterval(() => {
    for (const key in global.emailRateLimits) {
      delete global.emailRateLimits[key];
    }
  }, 24 * 60 * 60 * 1000);
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { source, name, email, mobile, quantity, message, items } = body;

    if (email) {
      const emailLower = email.toLowerCase();
      if (!global.emailRateLimits[emailLower]) {
        global.emailRateLimits[emailLower] = 1;
      } else {
        global.emailRateLimits[emailLower]++;
      }

      if (global.emailRateLimits[emailLower] > 5) {
        return NextResponse.json(
          { success: false, message: 'Daily limit reached: You can only send 5 inquiries per day from this email address.' },
          { status: 429 }
        );
      }
    }

    let emailHtml = `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name || 'N/A'}</p>
      <p><strong>Email:</strong> ${email || 'N/A'}</p>
      <p><strong>Mobile:</strong> ${mobile || 'N/A'}</p>
    `;

    if (quantity) {
      emailHtml += `<p><strong>Expected Quantity:</strong> ${quantity}</p>`;
    }

    if (message) {
      emailHtml += `<p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`;
    }

    if (items && items.length > 0) {
      emailHtml += `<h3>Requested Items:</h3><ul>`;
      items.forEach(item => {
        emailHtml += `<li>${item.name} - Qty: ${item.quantity}</li>`;
      });
      emailHtml += `</ul>`;
    }

    const mailOptions = {
      from: `"${name || 'Website Inquiry'}" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `New Wholesale Inquiry from ${name || email}`,
      html: emailHtml,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    
    await Message.create({
      source,
      name,
      email,
      mobile,
      quantity,
      message,
      items
    });

    return NextResponse.json({ success: true, message: 'Inquiry sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, message: 'Failed to send inquiry.' }, { status: 500 });
  }
}
