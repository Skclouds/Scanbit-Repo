/**
 * Database Import Script
 * Imports all data from JSON files into a database
 * 
 * Usage: node scripts/importDatabase.js [target-database-uri]
 * 
 * Example: node scripts/importDatabase.js mongodb://localhost:27017/new-database
 * 
 * This script will:
 * 1. Connect to the target database
 * 2. Import all collections from JSON files in the exports/ directory
 * 3. Preserve ObjectId references between collections
 * 4. Create indexes after import
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import QRScan from '../models/QRScan.js';
import Review from '../models/Review.js';
import BusinessCategory from '../models/BusinessCategory.js';
import BusinessInformation from '../models/BusinessInformation.js';
import Advertisement from '../models/Advertisement.js';
import AdImpression from '../models/AdImpression.js';
import FAQ from '../models/FAQ.js';
import KnowledgeBase from '../models/KnowledgeBase.js';
import LegalDocument from '../models/LegalDocument.js';
import SiteSettings from '../models/SiteSettings.js';
import SupportTicket from '../models/SupportTicket.js';

// Model mapping
const modelMap = {
  'users': User,
  'restaurants': Restaurant,
  'categories': Category,
  'menuitems': MenuItem,
  'plans': Plan,
  'payments': Payment,
  'qrscans': QRScan,
  'reviews': Review,
  'businesscategories': BusinessCategory,
  'businessinformations': BusinessInformation,
  'advertisements': Advertisement,
  'adimpressions': AdImpression,
  'faqs': FAQ,
  'knowledgebases': KnowledgeBase,
  'legaldocuments': LegalDocument,
  'sitesettings': SiteSettings,
  'supporttickets': SupportTicket
};

// Import order (respecting dependencies)
const importOrder = [
  'plans',                    // No dependencies
  'businesscategories',       // No dependencies
  'users',                    // No dependencies (but restaurants reference it)
  'restaurants',              // References: users, plans
  'categories',               // References: restaurants
  'menuitems',                // References: restaurants, categories
  'payments',                 // References: users, plans
  'qrscans',                  // References: restaurants
  'reviews',                  // References: restaurants
  'businessinformations',     // References: restaurants
  'advertisements',           // References: businesscategories
  'adimpressions',            // References: advertisements
  'faqs',                     // No dependencies
  'knowledgebases',           // No dependencies
  'legaldocuments',           // No dependencies
  'sitesettings',             // No dependencies
  'supporttickets'            // References: users
];

// Convert string IDs back to ObjectIds
const convertToObjectId = (value) => {
  if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
    return new mongoose.Types.ObjectId(value);
  }
  if (Array.isArray(value)) {
    return value.map(item => convertToObjectId(item));
  }
  if (typeof value === 'object' && value !== null) {
    const converted = {};
    Object.keys(value).forEach(key => {
      converted[key] = convertToObjectId(value[key]);
    });
    return converted;
  }
  return value;
};

// Import a single collection (use native driver for raw restore)
const importCollection = async (collectionName, data, idMap) => {
  try {
    const Model = modelMap[collectionName];
    if (!Model) {
      throw new Error(`Model not found for collection: ${collectionName}`);
    }
    
    if (!data || data.length === 0) {
      return { imported: 0, errors: [] };
    }
    
    // Convert string IDs to ObjectIds
    const documents = data.map(doc => {
      const converted = { ...doc };
      
      // Convert _id
      if (converted._id) {
        converted._id = convertToObjectId(converted._id);
      }
      
      // Convert all fields that might be ObjectIds
      Object.keys(converted).forEach(key => {
        converted[key] = convertToObjectId(converted[key]);
      });
      
      return converted;
    });
    
    // Clear existing collection (optional - comment out if you want to append)
    await Model.deleteMany({});
    
    // Insert documents using native collection to avoid schema validation issues
    const nativeCollection = mongoose.connection.collection(collectionName);
    const result = await nativeCollection.insertMany(documents, {
      ordered: false,
      bypassDocumentValidation: true
    });
    
    // Update ID mapping for reference resolution
    if (idMap) {
      data.forEach((doc, index) => {
        if (doc._id && result[index]?._id) {
          idMap[collectionName] = idMap[collectionName] || {};
          idMap[collectionName][doc._id] = result[index]._id.toString();
        }
      });
    }
    
    const importedCount = result?.insertedCount ?? Object.keys(result?.insertedIds || {}).length;
    return { imported: importedCount, errors: [] };
  } catch (error) {
    return { imported: 0, errors: [error.message] };
  }
};

// Main import function
const importAllData = async (targetUri) => {
  try {
    const envExportsDir = process.env.EXPORTS_DIR;
    const defaultExportsDir = path.join(__dirname, '..', 'exports');
    const fallbackExportsDir = path.join(__dirname, '..', 'middleware', 'exports');
    let exportsDir = envExportsDir || defaultExportsDir;
    
    // Check if exports directory exists
    if (!fs.existsSync(exportsDir)) {
      if (exportsDir !== fallbackExportsDir && fs.existsSync(fallbackExportsDir)) {
        exportsDir = fallbackExportsDir;
      } else {
        throw new Error(`Exports directory not found: ${exportsDir}\nPlease run exportDatabase.js first or set EXPORTS_DIR.`);
      }
    }
    
    // Check metadata file
    const metadataPath = path.join(exportsDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('metadata.json not found. Please run exportDatabase.js first.');
    }
    
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Connect to target database
    const targetUriToUse = targetUri || process.env.MONGODB_URI;
    if (!targetUriToUse) {
      throw new Error('Target database URI not provided. Set MONGODB_URI or pass as argument.');
    }
    
    
    // Parse URI to handle TLS options
    let connectionUri = targetUriToUse;
    const connectionOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000, // Added connection timeout
    };
    
    // Handle TLS options if present
    try {
      const uri = new URL(targetUriToUse);
      if (uri.searchParams.has('tls') && uri.searchParams.get('tls') === 'true') {
        const tlsCAFile = uri.searchParams.get('tlsCAFile');
        if (tlsCAFile && fs.existsSync(tlsCAFile)) {
          connectionOptions.tls = true;
          connectionOptions.tlsCAFile = tlsCAFile;
        } else if (tlsCAFile) {
          // Remove TLS parameters from URI
          uri.searchParams.delete('tls');
          uri.searchParams.delete('tlsCAFile');
          connectionUri = uri.toString();
        }
      }
    } catch (error) {
      // If URI parsing fails, use original URI
    }
    
    await mongoose.connect(connectionUri, connectionOptions);
    
    const importResults = [];
    const idMap = {}; // For tracking ID mappings if needed
    
    // Import collections in order
    for (const collectionName of importOrder) {
      const collectionInfo = metadata.collections.find(c => c.name === collectionName);
      
      if (!collectionInfo) {
        continue;
      }
      
      if (!collectionInfo.exported) {
        continue;
      }
      
      
      // Load data from JSON file
      const filePath = path.join(exportsDir, `${collectionName}.json`);
      if (!fs.existsSync(filePath)) {
        importResults.push({
          collection: collectionName,
          imported: 0,
          errors: ['File not found']
        });
        continue;
      }
      
      const fileData = fs.readFileSync(filePath, 'utf8');
      let data = JSON.parse(fileData);
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        if (typeof data === 'object' && data !== null) {
          // If it's an object with a data property, use that
          if (Array.isArray(data.data)) {
            data = data.data;
          } else {
            importResults.push({
              collection: collectionName,
              imported: 0,
              errors: ['Data is not an array']
            });
            continue;
          }
        } else {
          importResults.push({
            collection: collectionName,
            imported: 0,
            errors: ['Invalid data format']
          });
          continue;
        }
      }
      
      // Import collection
      const result = await importCollection(collectionName, data, idMap);
      importResults.push({
        collection: collectionName,
        ...result
      });
      
      if (result.errors.length > 0) {
      } else {
      }
    }
    
    // Create indexes
    try {
      const { createIndexes } = await import('../config/database.js');
      await createIndexes();
    } catch (error) {
    }
    
    // Summary
    const summary = {
      totalCollections: importResults.length,
      totalImported: importResults.reduce((sum, r) => sum + r.imported, 0),
      totalErrors: importResults.reduce((sum, r) => sum + r.errors.length, 0),
      collections: importResults
    };
    
    
    if (summary.totalErrors > 0) {
    }
    
    
  } catch (error) {
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Get target URI from command line argument
const targetUri = process.argv[2];

// Run import
importAllData(targetUri);
