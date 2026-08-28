const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '../server/.env' }); // Read backend variables

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// The folder where you place your images to upload
const imageFolder = path.join(__dirname, 'images_to_upload');

if (!fs.existsSync(imageFolder)) {
  console.log(`Please create a folder named 'images_to_upload' next to this script and put your images there.`);
  fs.mkdirSync(imageFolder);
  process.exit(1);
}

const files = fs.readdirSync(imageFolder).filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));

if (files.length === 0) {
  console.log('No images found in the images_to_upload folder.');
  process.exit(1);
}

console.log(`Found ${files.length} images. Starting upload to Cloudinary...`);

async function uploadImages() {
  for (const file of files) {
    const filePath = path.join(imageFolder, file);
    try {
      console.log(`Uploading ${file}...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'products'
      });
      console.log(`✅ Success! ${file} -> Public ID: ${result.public_id}`);
      
      // Optionally, move the uploaded file to a 'done' folder
      const doneFolder = path.join(__dirname, 'images_uploaded');
      if (!fs.existsSync(doneFolder)) fs.mkdirSync(doneFolder);
      fs.renameSync(filePath, path.join(doneFolder, file));

    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error);
    }
  }
  console.log('Finished uploading all images!');
}

uploadImages();
