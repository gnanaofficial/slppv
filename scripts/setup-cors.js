import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to read .env manually since dotenv is not installed
const readEnv = () => {
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const envPath = path.resolve(__dirname, "../.env");
    const envFile = fs.readFileSync(envPath, "utf-8");
    const env = {};
    envFile.split("\n").forEach((line) => {
      const [key, ...values] = line.split("=");
      if (key && values.length > 0) {
        let value = values.join("=").trim();
        // Remove quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        env[key.trim()] = value;
      }
    });
    return env;
  } catch (e) {
    console.error("Could not read .env file:", e);
    return {};
  }
};

const env = readEnv();

const r2 = new S3Client({
  region: "auto",
  endpoint: env.VITE_R2_ENDPOINT,
  credentials: {
    accessKeyId: env.VITE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.VITE_R2_SECRET_ACCESS_KEY,
  },
});

const run = async () => {
  console.log("Configuring CORS for bucket:", env.VITE_R2_BUCKET_NAME);

  const command = new PutBucketCorsCommand({
    Bucket: env.VITE_R2_BUCKET_NAME,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          AllowedOrigins: ["*"], // Allow all origins for simplicity, or strictly "http://localhost:5173"
          ExposeHeaders: ["ETag"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  });

  try {
    await r2.send(command);
    console.log("Successfully set CORS configuration!");
  } catch (err) {
    console.error("Error setting CORS:", err);
  }
};

run();
