# 🚀 NILELINK PROTOCOL - FINAL PRODUCTION GUIDE

This document provides a comprehensive overview of the NileLink ecosystem, finalized on **January 29, 2026**.

## 🏗️ SYSTEM ARCHITECTURE

NileLink is a "Hybrid-Decentralized" ecosystem (Web2.5), using high-performance cloud for UI/UX and immutable protocols for data and value.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | Ultra-Premium UI/UX |
| **Identity** | Firebase Auth (Standardized) | Multi-profile Zero-Trust permissions |
| **Database** | PostgreSQL + Prisma | Low-latency operational state |
| **Metadata** | IPFS (Pinata) | Decentralized order & image storage |
| **indexing** | The Graph (Subgraphs) | On-chain query optimization |
| **Blockchain** | Polygon / EVM | Governance ($NILE) and financial settlement |
| **Logistics** | ComplianceEngine.ts | Regional tax (SA, AE, JO) and labor laws |
| **Finance** | CurrencyService.ts | Base USD with Manual Merchant Daily Rates |

## 🏗️ 1. CURRENCY & PRICING PROTOCOL

NileLink uses **USD as the global settlement currency** for stability.

- **Manual Daily Rates**: POS owners can set their own operational exchange rates (e.g., 1 USD = 50 EGP).
- **Universal Sync**: Once set, this rate applies to Sales, Driver Pay, and Supplier B2B invoices.
- **Location**: Access via `Settings -> Currency Management` in the POS app.

## 📁 KEY DIRECTORY MAP

- `/web/src`: Unified Ecosystem Entry (Landing, Search, Explorer)
- `/web/admin`: Global Protocol Governance & Treasury
- `/web/pos`: Merchant Operations & AI Intelligence
- `/web/customer`: B2C Shopping & Loyalty Portal
- `/web/driver`: Logistics & Delivery Fulfillment
- `/web/supplier`: B2B Wholesale Marketplace
- `/web/shared`: Shared Services (Auth, DB, Graph, Compliance)

## 🔐 SECURITY & RESILIENCE

1. **Zero-Trust Auth**: All components use `useGuard` and `PermissionGuardScreen` to enforce role-based access.
2. **Resilience Layer**: Real-time monitoring of Indexer lag and RPC health.
3. **Data Integrity**: Orders are pinned to IPFS and confirmed on-chain before being marked as 'Delivered'.
4. **Compliance**: Automated VAT/Tax withholding for 5 Arab markets via localized engine.

## 🚀 DEPLOYMENT STEPS

1. **Environment Config**: Ensure all `.env` files in `web/` contain valid Pinata, Firebase, and Graph-Studio keys.
2. **Database Sync**: Run `npx prisma db push` from the root to sync the PostgreSQL schema.
3. **Build All Nodes**: `npm run build` from the workspace root to generate optimized Next.js bundles.
4. **Cloud Deployment**: Deploy each folder in `/web/` to Vercel/Cloudflare Pages as independent subdomains.

---

**Handover Status:** COMPLETED
**Developer:** Antigravity AI 🚀
**Protocol Version:** 1.0.0-PROD
