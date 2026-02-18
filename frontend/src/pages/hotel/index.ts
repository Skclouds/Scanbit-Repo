/**
 * Hotel Dashboard Module
 * 
 * Professional folder structure for the hotel/restaurant dashboard.
 * 
 * Structure:
 * ├── Dashboard.tsx      - Main dashboard layout with sidebar and tab navigation
 * ├── Profile.tsx        - Business profile management
 * ├── Settings.tsx       - Application settings
 * ├── index.ts           - Module exports
 * └── sections/          - Individual dashboard sections
 *     ├── index.ts       - Section exports
 *     ├── Overview.tsx   - Dashboard overview/home
 *     ├── QRCode.tsx     - QR code generation and customization
 *     ├── Analytics.tsx  - Analytics and insights
 *     ├── Subscription.tsx - Subscription management
 *     ├── Promotions.tsx - Promotions and offers
 *     ├── Payments.tsx   - Payment history
 *     ├── Reports.tsx    - Business reports
 *     ├── MediaLibrary.tsx - Media asset management
 *     ├── Integrations.tsx - Third-party integrations
 *     └── Support.tsx    - Help and support
 */

// Main Dashboard
export { default as Dashboard } from './Dashboard';

// Individual Pages
export { default as Profile } from './Profile';
export { default as Settings } from './Settings';

// All Sections
export * from './sections';
