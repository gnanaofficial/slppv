const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

// Manually parse .env because we can't depend on dotenv being installed/configured for this script
const envPath = path.resolve(__dirname, "../.env");
const envContent = fs.readFileSync(envPath, "utf-8");
console.log("Env path:", envPath);
const envConfig = {};
envContent.split(/\r?\n/).forEach((line) => {
  line = line.trim();
  if (!line || line.startsWith("#")) return;

  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    envConfig[key] = value;
  }
});

console.log("Config loaded:");
console.log("Endpoint:", envConfig.VITE_R2_ENDPOINT);
console.log("Bucket:", envConfig.VITE_R2_BUCKET_NAME);
console.log("AccessKey:", envConfig.VITE_R2_ACCESS_KEY_ID ? "***" : "MISSING");

const r2 = new S3Client({
  region: "auto",
  endpoint: envConfig.VITE_R2_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: envConfig.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: envConfig.VITE_R2_SECRET_ACCESS_KEY,
  },
});

const uploadImage = async (filename) => {
  const filePath = path.resolve(__dirname, `../src/assets/Cover/${filename}`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const timestamp = Date.now();
  const uploadPath = `home_hero/${year}/${month}/${timestamp}_${filename}`;

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: envConfig.VITE_R2_BUCKET_NAME,
        Key: uploadPath,
        Body: fileBuffer,
        ContentType: "image/png",
      }),
    );
    const publicUrl = `${envConfig.VITE_R2_PUBLIC_URL}/${uploadPath}`;
    console.log(`Uploaded ${filename} -> ${publicUrl}`);
    return {
      url: publicUrl,
      path: uploadPath,
      id: timestamp + Math.random().toString(36).substr(2, 9),
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    if (error.name) console.error("Error Name:", error.name);
    if (error.message) console.error("Error Message:", error.message);
    if (error.$metadata) console.error("Metadata:", error.$metadata);
    return null;
  }
};

const run = async () => {
  const images = ["img1.png", "img2.png", "img3.png", "img4.png"];
  const results = [];

  for (const img of images) {
    const res = await uploadImage(img);
    if (res) results.push(res);
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../hero_images.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("Written to hero_images.json");
};

run();
