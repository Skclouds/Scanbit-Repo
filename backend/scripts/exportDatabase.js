/**
 * Database Export Script
 * Exports all data from the database to JSON files for seeding into another database
 * 
 * Usage: node scripts/exportDatabase.js
 * 
 * This script will:
 * 1. Connect to the source database
 * 2. Export all collections to JSON files in the exports/ directory
 * 3. Create a metadata file with export information
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Collection names and their corresponding models
const collections = [
  { name: 'users', model: 'User' },
  { name: 'restaurants', model: 'Restaurant' },
  { name: 'categories', model: 'Category' },
  { name: 'menuitems', model: 'MenuItem' },
  { name: 'plans', model: 'Plan' },
  { name: 'payments', model: 'Payment' },
  { name: 'qrscans', model: 'QRScan' },
  { name: 'reviews', model: 'Review' },
  { name: 'businesscategories', model: 'BusinessCategory' },
  { name: 'businessinformations', model: 'BusinessInformation' },
  { name: 'advertisements', model: 'Advertisement' },
  { name: 'adimpressions', model: 'AdImpression' },
  { name: 'faqs', model: 'FAQ' },
  { name: 'knowledgebases', model: 'KnowledgeBase' },
  { name: 'legaldocuments', model: 'LegalDocument' },
  { name: 'sitesettings', model: 'SiteSettings' },
  { name: 'supporttickets', model: 'SupportTicket' }
];

// Create exports directory if it doesn't exist
const exportsDir = path.join(__dirname, '..', 'exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Export a single collection
const exportCollection = async (collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);
    
    // Get all documents
    const documents = await collection.find({}).toArray();
    
    // Convert ObjectIds to strings for JSON serialization
    const serializedDocs = documents.map(doc => {
      const serialized = { ...doc };
      // Convert _id to string
      if (serialized._id) {
        serialized._id = serialized._id.toString();
      }
      // Convert all ObjectId fields to strings
      Object.keys(serialized).forEach(key => {
        if (mongoose.Types.ObjectId.isValid(serialized[key]) && serialized[key].constructor === mongoose.Types.ObjectId) {
          serialized[key] = serialized[key].toString();
        } else if (Array.isArray(serialized[key])) {
          serialized[key] = serialized[key].map(item => {
            if (mongoose.Types.ObjectId.isValid(item) && item.constructor === mongoose.Types.ObjectId) {
              return item.toString();
            }
            return item;
          });
        } else if (typeof serialized[key] === 'object' && serialized[key] !== null) {
          // Handle nested objects
          Object.keys(serialized[key]).forEach(nestedKey => {
            if (mongoose.Types.ObjectId.isValid(serialized[key][nestedKey]) && serialized[key][nestedKey].constructor === mongoose.Types.ObjectId) {
              serialized[key][nestedKey] = serialized[key][nestedKey].toString();
            }
          });
        }
      });
      return serialized;
    });
    
    return {
      collection: collectionName,
      count: documents.length,
      data: serializedDocs
    };
  } catch (error) {
    return {
      collection: collectionName,
      count: 0,
      data: [],
      error: error.message
    };
  }
};

// Main export function
const exportAllData = async () => {
  try {
    
    // Connect to database
    await mongoose.connect(config.database.uri, config.database.options);
    
    const exportResults = [];
    const metadata = {
      exportDate: new Date().toISOString(),
      sourceDatabase: mongoose.connection.name,
      collections: []
    };
    
    // Export each collection
    for (const collection of collections) {
      const result = await exportCollection(collection.name);
      
      // Save to JSON file
      const filePath = path.join(exportsDir, `${collection.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(result.data, null, 2), 'utf8');
      
      exportResults.push(result);
      metadata.collections.push({
        name: collection.name,
        model: collection.model,
        count: result.count,
        file: `${collection.name}.json`,
        exported: !result.error
      });
      
      if (result.error) {
      } else {
      }
    }
    
    // Save metadata
    const metadataPath = path.join(exportsDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    
    // Create summary
    const summary = {
      totalCollections: collections.length,
      totalDocuments: exportResults.reduce((sum, r) => sum + r.count, 0),
      successfulExports: exportResults.filter(r => !r.error).length,
      failedExports: exportResults.filter(r => r.error).length,
      collections: exportResults.map(r => ({
        name: r.collection,
        count: r.count,
        status: r.error ? 'failed' : 'success'
      }))
    };
    
    const summaryPath = path.join(exportsDir, 'export-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
    
    
  } catch (error) {
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run export
exportAllData();
