# Test Credentials for SLPPV Donor Management System

## Overview

This document contains all test credentials for the donor management system. These credentials are created by the seed data script and are for development/testing purposes only.

## Main Admin

**Email:** `gnana@slppv.org`  
**Password:** `Gnana@8179`  
**Role:** Main Admin  
**Permissions:** Full access to all features

## Sub-Admins

### Sub-Admin 1

**Email:** `subadmin1@slppv.org`  
**Password:** `SubAdmin@123`  
**Role:** Sub Admin  
**Permissions:**

- View Donors
- Edit Donors
- View Donations
- Create Manual Donations

### Sub-Admin 2

**Email:** `subadmin2@slppv.org`  
**Password:** `SubAdmin@456`  
**Role:** Sub Admin  
**Permissions:**

- View Donors
- Manage Gallery
- Manage Videos

## Sample Donors

### Donor 1 - Rajesh Kumar

**Email:** `rajesh.kumar@example.com`  
**Password:** `Donor@123`  
**Donor ID:** Will be auto-generated (format: DNR-YYYYMMDD-0001)  
**Phone:** 9876543210  
**Address:** 123 Temple Street, Hyderabad

### Donor 2 - Priya Sharma

**Email:** `priya.sharma@example.com`  
**Password:** `Donor@456`  
**Donor ID:** Will be auto-generated (format: DNR-YYYYMMDD-0002)  
**Phone:** 9876543211  
**Address:** 456 Devotee Lane, Vijayawada

### Donor 3 - Venkat Reddy

**Email:** `venkat.reddy@example.com`  
**Password:** `Donor@789`  
**Donor ID:** Will be auto-generated (format: DNR-YYYYMMDD-0003)  
**Phone:** 9876543212  
**Address:** 789 Bhakti Road, Tirupati

## How to Seed Data

To populate the database with sample data, run the seed script from the admin setup page or use the browser console:

```javascript
import { seedAllData, downloadCredentials } from "./lib/seedData";

// Seed all data
const credentials = await seedAllData();

// Download credentials as JSON
downloadCredentials(credentials);
```

## Important Notes

1. **Security:** These are test credentials only. Never use these in production.
2. **Donor IDs:** Donor IDs are auto-generated based on the current date.
3. **Transactions:** Each sample donor will have 5-10 random transactions created.
4. **Passwords:** All passwords meet the minimum security requirements (8+ characters, mixed case, numbers, special characters).
5. **Email Verification:** Email verification is disabled for test accounts.

## Features Available

### Main Admin Can:

- View, edit, and delete all donors
- Record manual donations (offline transactions)
- Generate and print invoices
- View donor transaction history
- Export donor data (CSV/Excel)
- View deleted donors history
- Restore deleted donors
- Manage sub-admins
- Manage gallery, videos, and sevas

### Sub-Admins Can:

- Access features based on assigned permissions
- Cannot manage other admins
- Cannot access features without permission

### Donors Can:

- Login to their donor portal
- View their donation history
- Download their invoices
- Update their profile information

## Troubleshooting

### If you can't login:

1. Check if the email/password are correct
2. Verify Firebase Authentication is enabled
3. Check browser console for errors
4. Try resetting the password

### If donors don't appear:

1. Run the seed script
2. Check Firestore database
3. Verify Firebase configuration in `.env`

### If invoices don't generate:

1. Check if jsPDF is installed
2. Verify browser allows pop-ups
3. Check browser console for errors

## Support

For issues or questions, contact the development team.

---

**Last Updated:** January 22, 2026  
**Version:** 1.0.0
