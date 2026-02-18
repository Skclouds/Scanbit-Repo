# Database Export and Import Scripts

This directory contains scripts to export and import all database data for seeding into another database.

## Files

- `exportDatabase.js` - Exports all data from the current database to JSON files
- `importDatabase.js` - Imports data from JSON files into a target database
- `exports/` - Directory containing exported JSON files (created automatically)

## Usage

### Step 1: Export Data from Source Database

```bash
node scripts/exportDatabase.js
```

This will:
- Connect to the database specified in `.env` (MONGODB_URI)
- Export all collections to JSON files in `exports/` directory
- Create `metadata.json` and `export-summary.json` files

**Output:**
- `exports/users.json`
- `exports/restaurants.json`
- `exports/categories.json`
- `exports/menuitems.json`
- `exports/plans.json`
- `exports/payments.json`
- `exports/qrscans.json`
- `exports/reviews.json`
- `exports/businesscategories.json`
- `exports/businessinformations.json`
- `exports/advertisements.json`
- `exports/adimpressions.json`
- `exports/faqs.json`
- `exports/knowledgebases.json`
- `exports/legaldocuments.json`
- `exports/sitesettings.json`
- `exports/supporttickets.json`
- `exports/metadata.json`
- `exports/export-summary.json`

### Step 2: Import Data to Target Database

**Option 1: Using environment variable**
```bash
# Update .env with target database URI
MONGODB_URI=mongodb://localhost:27017/new-database

# Run import
node scripts/importDatabase.js
```

**Option 2: Pass URI as argument**
```bash
node scripts/importDatabase.js mongodb://localhost:27017/new-database
```

This will:
- Connect to the target database
- Import all collections in the correct order (respecting dependencies)
- Create indexes after import
- Show import summary

## Important Notes

1. **Export Order**: Collections are exported in parallel, but import order matters due to references between collections.

2. **Import Order**: The script imports collections in this order to respect dependencies:
   - Plans (no dependencies)
   - BusinessCategories (no dependencies)
   - Users (no dependencies)
   - Restaurants (references: users, plans)
   - Categories (references: restaurants)
   - MenuItems (references: restaurants, categories)
   - Payments (references: users, plans)
   - QRScans (references: restaurants)
   - Reviews (references: restaurants)
   - BusinessInformations (references: restaurants)
   - Advertisements (references: businesscategories)
   - AdImpressions (references: advertisements)
   - FAQs (no dependencies)
   - KnowledgeBases (no dependencies)
   - LegalDocuments (no dependencies)
   - SiteSettings (no dependencies)
   - SupportTickets (references: users)

3. **ObjectId Handling**: The scripts automatically convert ObjectIds to strings for JSON export and back to ObjectIds for import.

4. **Existing Data**: The import script **clears existing collections** before importing. To append data instead, modify `importDatabase.js` and comment out the `deleteMany` line.

5. **Indexes**: Indexes are created automatically after import using the same index definitions from `config/database.js`.

6. **Error Handling**: Both scripts handle errors gracefully and provide detailed summaries.

## Example Workflow

```bash
# 1. Export from production database
# (Make sure .env points to production)
node scripts/exportDatabase.js

# 2. Copy exports directory to another location if needed
cp -r exports/ /backup/exports-$(date +%Y%m%d)

# 3. Import to development database
# (Update .env or pass URI as argument)
node scripts/importDatabase.js mongodb://localhost:27017/scanbit-dev

# 4. Verify import
# Check the import summary output
```

## Troubleshooting

### Export fails
- Check database connection in `.env`
- Ensure you have read permissions
- Check available disk space

### Import fails
- Verify target database URI is correct
- Ensure you have write permissions
- Check that exports directory exists
- Verify JSON files are valid

### Missing references
- Ensure collections are imported in the correct order
- Check that referenced documents exist in the source export
- Verify ObjectId conversion is working correctly

## Security Notes

⚠️ **Important**: 
- Exported JSON files contain sensitive data (passwords, emails, etc.)
- Store exports securely
- Don't commit exports to version control
- Consider encrypting exports for production data

## Collections Exported

1. **users** - All user accounts
2. **restaurants** - All business/restaurant records
3. **categories** - Menu categories
4. **menuitems** - Menu items/products
5. **plans** - Subscription plans
6. **payments** - Payment transactions
7. **qrscans** - QR code scan records
8. **reviews** - Customer reviews
9. **businesscategories** - Business category definitions
10. **businessinformations** - Business information records
11. **advertisements** - Advertisement records
12. **adimpressions** - Ad impression tracking
13. **faqs** - FAQ entries
14. **knowledgebases** - Knowledge base articles
15. **legaldocuments** - Legal documents
16. **sitesettings** - Site configuration
17. **supporttickets** - Support ticket records
