import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { createDonor, createDonation, createAdmin } from "./firestoreService";
import { addSeva } from "./contentService";
import { generateDonorId } from "./donorService";

/**
 * Sample donor data
 */
const sampleDonors = [
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "9876543210",
    address: "123 Temple Street, Hyderabad",
    password: "Donor@123",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "9876543211",
    address: "456 Devotee Lane, Vijayawada",
    password: "Donor@456",
  },
  {
    name: "Venkat Reddy",
    email: "venkat.reddy@example.com",
    phone: "9876543212",
    address: "789 Bhakti Road, Tirupati",
    password: "Donor@789",
  },
];

/**
 * Sample admin data
 */
const sampleAdmins = [
  {
    email: "gnana@slppv.org",
    password: "Gnana@8179",
    name: "Gnana",
    role: "main_admin",
    permissions: ["all"],
  },
  {
    email: "subadmin1@slppv.org",
    password: "SubAdmin@123",
    name: "Sub Admin 1",
    role: "sub_admin",
    permissions: [
      "donors.view",
      "donors.edit",
      "donations.view",
      "donations.create",
    ],
  },
  {
    email: "subadmin2@slppv.org",
    password: "SubAdmin@456",
    name: "Sub Admin 2",
    role: "sub_admin",
    permissions: ["donors.view", "gallery.manage", "videos.manage"],
  },
];

/**
 * Sample Sevas
 */
const sampleSevas = [
  {
    name: "Suprabhata Seva",
    nameTelugu: "సుప్రభాత సేవ",
    description: "The first seva of the day where the Lord is woken up with hymns.",
    descriptionTelugu: "స్వామివారిని మేల్కొలిపే ప్రథమ సేవ.",
    price: 516,
    category: "daily",
    enabled: true,
  },
  {
    name: "Thomala Seva",
    nameTelugu: "తోమాల సేవ",
    description: "Decorating the Lord with beautiful flower garlands.",
    descriptionTelugu: "స్వామివారిని పూలమాలలతో అలంకరించే సేవ.",
    price: 1016,
    category: "daily",
    enabled: true,
  },
  {
    name: "Archana",
    nameTelugu: "అర్చన",
    description: "Chanting the 1008 names of Lord Venkateswara.",
    descriptionTelugu: "స్వామివారి 1008 నామాలను స్మరించే సేవ.",
    price: 216,
    category: "daily",
    enabled: true,
  },
  {
    name: "Kalyanotsavam",
    nameTelugu: "కళ్యాణోత్సవం",
    description: "The celestial wedding ceremony of the Lord and Goddesses.",
    descriptionTelugu: "స్వామివార్ల కళ్యాణ మహోత్సవం.",
    price: 2516,
    category: "weekly",
    enabled: true,
  },
  {
    name: "Abhishekam",
    nameTelugu: "అభిషేకం",
    description: "Holy bath to the deity with milk, curd, honey, etc.",
    descriptionTelugu: "స్వామివారికి పంచామృతాలతో స్నపన తిరుమంజనం.",
    price: 3016,
    category: "weekly",
    enabled: true,
  },
];

/**
 * Donation purposes
 */
const donationPurposes = [
  "General Donation",
  "Building Fund",
  "Seva Donation",
  "Annadanam",
  "Go Puja",
  "Nitya Kainkaryam",
];

/**
 * Payment methods
 */
const paymentMethods = ["cash", "cheque", "bank_transfer", "upi", "sbi_epay"];

/**
 * Generate random donation amount
 */
const getRandomAmount = () => {
  const amounts = [500, 1000, 2000, 5000, 10000, 25000, 50000, 100000];
  return amounts[Math.floor(Math.random() * amounts.length)];
};

/**
 * Generate random date in the past year
 */
const getRandomPastDate = () => {
  const now = new Date();
  const pastYear = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );
  const randomTime =
    pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime());
  return new Date(randomTime);
};

/**
 * Create sample donors with transactions
 */
export const seedDonors = async () => {
  const createdDonors = [];
  const credentials = [];

  console.log("🌱 Starting donor seeding...");

  for (const donorData of sampleDonors) {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        donorData.email,
        donorData.password,
      );

      // Generate donor ID
      const donorId = await generateDonorId();

      // Create donor record
      const donor = await createDonor({
        name: donorData.name,
        email: donorData.email,
        phone: donorData.phone,
        address: donorData.address,
        donorId: donorId,
        uid: userCredential.user.uid,
        hasAuthAccount: true,
      });

      createdDonors.push(donor);
      credentials.push({
        type: "donor",
        name: donorData.name,
        email: donorData.email,
        password: donorData.password,
        donorId: donorId,
      });

      console.log(`✅ Created donor: ${donorData.name} (${donorId})`);

      // Create 5-10 random donations for each donor
      const numDonations = 5 + Math.floor(Math.random() * 6);

      for (let i = 0; i < numDonations; i++) {
        const donation = await createDonation({
          donorId: donor.id,
          donorName: donorData.name,
          donorEmail: donorData.email,
          donorPhone: donorData.phone,
          amount: getRandomAmount(),
          purpose:
            donationPurposes[
            Math.floor(Math.random() * donationPurposes.length)
            ],
          paymentMethod:
            paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          status: "success",
          transactionDate: getRandomPastDate().toISOString(),
        });

        console.log(`  💰 Created donation: ₹${donation.amount}`);
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️  Donor ${donorData.email} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating donor ${donorData.name}:`, error);
      }
    }
  }

  return { donors: createdDonors, credentials };
};

/**
 * Create sample admins
 */
export const seedAdmins = async () => {
  const createdAdmins = [];
  const credentials = [];

  console.log("🌱 Starting admin seeding...");

  for (const adminData of sampleAdmins) {
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminData.email,
        adminData.password,
      );

      // Create admin record
      const admin = await createAdmin({
        name: adminData.name,
        email: adminData.email,
        role: adminData.role,
        permissions: adminData.permissions,
        uid: userCredential.user.uid,
      });

      createdAdmins.push(admin);
      credentials.push({
        type: "admin",
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: adminData.role,
      });

      console.log(`✅ Created admin: ${adminData.name} (${adminData.role})`);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        console.log(`⚠️  Admin ${adminData.email} already exists, skipping...`);
      } else {
        console.error(`❌ Error creating admin ${adminData.name}:`, error);
      }
    }
  }

  return { admins: createdAdmins, credentials };
};

/**
 * Seed Sevas
 */
export const seedSevas = async () => {
  console.log("🌱 Starting seva seeding...");
  const createdSevas = [];

  for (const seva of sampleSevas) {
    try {
      const id = await addSeva(seva);
      createdSevas.push({ ...seva, id });
      console.log(`✅ Created seva: ${seva.name}`);
    } catch (error) {
      console.error(`❌ Error creating seva ${seva.name}:`, error);
    }
  }
  return createdSevas;
};

/**
 * Seed all data
 */
export const seedAllData = async () => {
  console.log("🚀 Starting database seeding...\n");

  const donorResult = await seedDonors();
  console.log("\n");
  const adminResult = await seedAdmins();
  console.log("\n");
  await seedSevas();

  const allCredentials = [
    ...donorResult.credentials,
    ...adminResult.credentials,
  ];

  console.log("\n✨ Seeding complete!\n");
  console.log("=".repeat(60));
  console.log("CREDENTIALS");
  console.log("=".repeat(60));

  console.log("\n📧 ADMINS:");
  allCredentials
    .filter((c) => c.type === "admin")
    .forEach((c) => {
      console.log(`\n${c.name} (${c.role})`);
      console.log(`  Email: ${c.email}`);
      console.log(`  Password: ${c.password}`);
    });

  console.log("\n\n💝 DONORS:");
  allCredentials
    .filter((c) => c.type === "donor")
    .forEach((c) => {
      console.log(`\n${c.name} (${c.donorId})`);
      console.log(`  Email: ${c.email}`);
      console.log(`  Password: ${c.password}`);
    });

  console.log("\n" + "=".repeat(60));

  // Save credentials to a JSON file (for reference)
  const credentialsData = {
    seededAt: new Date().toISOString(),
    credentials: allCredentials,
  };

  // In a real app, you might want to save this to a file
  // For now, we'll just return it
  return credentialsData;
};

/**
 * Export credentials as downloadable JSON
 */
export const downloadCredentials = (credentialsData) => {
  const dataStr = JSON.stringify(credentialsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `credentials-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);
};
