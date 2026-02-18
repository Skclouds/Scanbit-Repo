# Legal Documents Population Script

This script populates your database with professional Privacy Policy, Terms & Conditions, and Cookie Policy documents.

## Prerequisites

- MongoDB database connection configured in `.env`
- Node.js installed
- Admin user account in the database (optional, but recommended)

## Running the Script

```bash
cd /Users/vivek/N/ScanBit/ScanBit-Backend
node scripts/populateLegalDocuments.js
```

## What Gets Created

### Default Documents

1. **Privacy Policy** (Default)
   - Comprehensive privacy policy covering data collection, usage, security, and user rights
   - GDPR and CCPA compliant structure
   - Industry-standard sections

2. **Terms and Conditions** (Default)
   - Complete terms of service
   - Account requirements, payment terms, liability limitations
   - Dispute resolution and termination clauses

3. **Cookie Policy** (Default)
   - Information about cookie usage
   - Types of cookies and their purposes
   - Cookie management instructions

## Features

- **Duplicate Prevention**: Script checks if default documents already exist
- **Admin User Linking**: Links created documents to admin user if available
- **Professional Content**: Industry-standard legal document templates
- **Multiple Languages**: Support for creating documents in different languages
- **Version Control**: Each document has version tracking
- **Effective Dates**: Automatic date management

## Document Types Supported

- Privacy Policy
- Terms & Conditions
- Cookie Policy
- Refund Policy
- Shipping Policy
- User Agreement
- Other (custom)

## Notes

- The script is idempotent - safe to run multiple times
- Existing default documents won't be overwritten
- New documents will be added if they don't exist
- All documents are marked as active and ready to use
- Default documents are set as default for their type

## Accessing Documents

### Admin Panel
- Navigate to: Admin Dashboard > Legal Documents
- Manage all documents, create new ones, edit existing

### Public Access
- Privacy Policy: `/legal/privacy-policy`
- Terms & Conditions: `/legal/terms-and-conditions`
- Cookie Policy: `/legal/cookie-policy`
- Custom documents: `/legal/{slug}`

## Link Generation

Each document gets a unique slug-based URL that can be:
- Copied and shared
- Embedded in emails
- Linked from footer
- Used in user acceptance flows

## Customization

After running the script, you can:
1. Edit documents in the admin panel
2. Customize content for your business
3. Add company-specific information
4. Create additional documents for different purposes
5. Set up multiple language versions
