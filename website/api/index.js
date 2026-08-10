require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => console.error("MongoDB connection error:", err));
} else {
  console.log("No MONGODB_URI found. Please set it in .env");
}

// Models
const Category = require('./models/Category');
const Product = require('./models/Product');
const Homepage = require('./models/Homepage');
const Message = require('./models/Message');
const AdminUser = require('./models/AdminUser');

// Middleware
app.use(cors()); // Allow cross-origin requests from React
app.use(express.json()); // Parse JSON body

// Cloudinary Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Multer Setup (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Transporter configuration for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// In-memory store for email rate limiting (5 per day)
const emailRateLimits = {};

// Clear rate limits every 24 hours
setInterval(() => {
  for (const key in emailRateLimits) {
    delete emailRateLimits[key];
  }
}, 24 * 60 * 60 * 1000);

// Endpoint to handle inquiry submissions
app.post('/api/inquiry', async (req, res) => {
  try {
    const { source, name, email, mobile, quantity, message, items } = req.body;

    // Check Email Rate Limit
    if (email) {
      const emailLower = email.toLowerCase();
      if (!emailRateLimits[emailLower]) {
        emailRateLimits[emailLower] = 1;
      } else {
        emailRateLimits[emailLower]++;
      }

      if (emailRateLimits[emailLower] > 5) {
        return res.status(429).json({ success: false, message: 'Daily limit reached: You can only send 5 inquiries per day from this email address.' });
      }
    }

    // Construct the email body based on the source (Contact Page or ItemList Popup)
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
      from: `"${name || 'Website Inquiry'}" <${process.env.GMAIL_USER}>`, // Shows the customer's name
      to: process.env.GMAIL_USER, // Send it to yourself
      subject: `New Wholesale Inquiry from ${name || email}`,
      html: emailHtml,
      replyTo: email // Allows you to reply directly to the customer
    };

    await transporter.sendMail(mailOptions);
    
    // Also save to MongoDB
    await Message.create({
      source,
      name,
      email,
      mobile,
      quantity,
      message,
      items
    });

    res.status(200).json({ success: true, message: 'Inquiry sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send inquiry.' });
  }
});

// Endpoint to upload an image to Cloudinary (Admin Panel)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }

  // Upload image to Cloudinary via stream
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'products' },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ success: false, message: 'Upload failed', error });
      }
      res.status(200).json({ 
        success: true, 
        message: 'Upload successful', 
        imageUrl: result.secure_url,
        publicId: result.public_id
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

// Database Routes (MongoDB)
app.get('/api/homepage', async (req, res) => {
  try {
    const data = await Homepage.findOne();
    res.json(data || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching homepage data" });
  }
});

app.put('/api/homepage', async (req, res) => {
  try {
    await Homepage.deleteMany({});
    await Homepage.create(req.body);
    res.json({ success: true, message: "Homepage updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating homepage data" });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Product.find();
    res.json({ categories, products });
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.put('/api/products', async (req, res) => {
  try {
    const { categories, products } = req.body;
    
    if (categories) {
      await Category.deleteMany({});
      if (categories.length > 0) await Category.insertMany(categories);
    }
    
    if (products) {
      await Product.deleteMany({});
      if (products.length > 0) await Product.insertMany(products);
    }
    
    res.json({ success: true, message: "Products updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating database" });
  }
});

// Messages Routes
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }); // Newest first
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

app.delete('/api/messages/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting message" });
  }
});

// Admin Auth Route
app.post('/api/admin/login', async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
    
    console.log(`Login attempt for email: "${email}". Expected Admin: "${adminEmail}"`);
    
    if (email.toLowerCase() === adminEmail.toLowerCase() || email.toLowerCase() === 'feltgoodbcn@gmail.com') {
      console.log('Match! Returning isMainAdmin: true');
      return res.json({ success: true, message: 'Authenticated successfully', isMainAdmin: true });
    }
    
    const adminUser = await AdminUser.findOne({ email });
    if (adminUser) {
      return res.json({ success: true, message: 'Authenticated successfully', isMainAdmin: false });
    }
    
    res.status(401).json({ success: false, message: 'Unauthorized email' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Admin Users Management Routes
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await AdminUser.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin users" });
  }
});

app.post('/api/admin/users', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const existing = await AdminUser.findOne({ email });
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
    if (existing) return res.status(400).json({ message: "Email already has admin access" });
    if (email.toLowerCase() === adminEmail.toLowerCase() || email.toLowerCase() === 'feltgoodbcn@gmail.com') return res.status(400).json({ message: "This is the main admin email" });
    
    const newUser = await AdminUser.create({ email });
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error adding admin user" });
  }
});

app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    await AdminUser.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Admin access removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing admin access" });
  }
});

module.exports = app;
