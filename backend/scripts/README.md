# Populate FAQs and Knowledge Base Script

This script populates your database with comprehensive FAQs and Knowledge Base articles for ScanBit.

## Prerequisites

- MongoDB database connection configured in `.env`
- Node.js installed
- Admin user account in the database (optional, but recommended)

## Running the Script

### Option 1: Direct Node Execution

```bash
cd /Users/vivek/N/ScanBit/ScanBit-Backend
node scripts/populateFAQsAndKB.js
```

### Option 2: Using npm script (if configured)

```bash
cd /Users/vivek/N/ScanBit/ScanBit-Backend
npm run populate:faqs-kb
```

## What Gets Created

### FAQs (30+ FAQs)
- General questions about ScanBit
- Account management
- Menu management
- QR code setup
- Billing and subscriptions
- Technical support
- Troubleshooting
- Analytics

### Knowledge Base Articles (5+ Articles)
- Getting Started Guide
- Menu Management Best Practices
- QR Code Setup and Printing Guide
- Understanding Analytics Dashboard
- Account Settings and Profile Management
- Troubleshooting Common Issues

## Features

- **Duplicate Prevention**: Script checks if FAQs/articles already exist before creating
- **Admin User Linking**: Links created content to admin user if available
- **Comprehensive Coverage**: Covers all major aspects of ScanBit
- **Professional Content**: Industry-standard FAQs and articles

## Notes

- The script is idempotent - safe to run multiple times
- Existing FAQs/articles won't be overwritten
- New content will be added if it doesn't exist
- All content is marked as published and ready to use

## Troubleshooting

If you encounter errors:
1. Check MongoDB connection in `.env`
2. Ensure database is accessible
3. Verify admin user exists (optional)
4. Check console for specific error messages
