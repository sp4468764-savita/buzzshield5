# ⚡ BuzzShield Product Website (Supabase + Razorpay Static Architecture)

BuzzShield is a premium, fully responsive, production-ready product marketing and e-commerce website for the **BuzzShield Electric Mosquito Killer Lamp**. 

This repository is designed to be hosted as a **completely static website on GitHub Pages**, while leveraging **Supabase as a serverless backend** (for cloud database storage, contact entries, and newsletters) and **Supabase Edge Functions + Razorpay** for secure client-side checkouts.

---

## 🏗️ Architecture & Hosting Overview

| Environment / Part | Tech Stack | Role / Purpose |
| :--- | :--- | :--- |
| **Frontend (GitHub Pages)** | HTML5, CSS3, Vanilla JS, Lucide CDN | Renders the visual landing page, specifications, FAQs, contact screens, cart drawer, and triggers the Razorpay payment modal or Cash on Delivery (COD) WhatsApp redirect. |
| **Backend Database (Supabase)** | Postgres, Real-time RLS, REST API | Safely stores order sheets, logs contact form inquiries, and queues subscriber emails in secure relational tables. |
| **Serverless Gateway (Supabase Functions)**| Deno TypeScript, Web Crypto API | A serverless Edge Function (`verify-payment`) that creates Razorpay Order IDs and validates payment signatures securely using server-side HMAC-SHA256 calculations before updating the database. |

---

## 🛠️ Step-by-Step Setup Guide

Follow these simple steps to transition the website from **Demo/Simulation Mode** to your live **Production Database and Payment systems**.

### 1. Database Schema Provisioning
Go to your [Supabase Dashboard](https://supabase.com/), open your project, click on the **SQL Editor** tab in the sidebar, paste the following SQL script, and click **Run**. This will build the three required database tables:

```sql
-- 1. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create Contact Submissions Table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Newsletter Signups Table
CREATE TABLE IF NOT EXISTS newsletter_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- (Optional) Enable RLS and insert standard public access policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on contact_submissions" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public inserts on newsletter_signups" ON newsletter_signups FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public inserts on orders" ON orders FOR INSERT TO anon WITH CHECK (true);
```

---

### 2. Configure Your Client Credentials
Open `supabase-config.js` in your text editor and replace the placeholder keys with your live credentials:

```javascript
const SUPABASE_CONFIG = {
  // Your Supabase Project API Settings (Project Settings > API)
  URL: "https://your-project-id.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",

  // Your Razorpay Key ID (Razorpay Dashboard > Settings > API Keys)
  RAZORPAY_KEY_ID: "rzp_live_yourActualLiveKey"
};
```
*Note: If these values are left as placeholders, the frontend automatically falls back to an interactive **Demo Mode** using browser LocalStorage so that users can preview checkout actions instantly without errors.*

---

### 3. Configure and Deploy the Supabase Edge Function
To process payments securely, Razorpay requires server-side HMAC signature verification. This is handled by our Edge Function located in `/supabase/functions/verify-payment/index.ts`.

#### Step A: Configure Supabase Edge Secrets
Before deploying, set your Razorpay credentials and Supabase credentials in your Supabase environment using CLI or the dashboard. Run these commands in your terminal:

```bash
# Set secrets inside your remote Supabase project
supabase secrets set RAZORPAY_KEY_ID="rzp_live_xxx"
supabase secrets set RAZORPAY_KEY_SECRET="your_razorpay_secret"
supabase secrets set SUPABASE_URL="https://your-project-id.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_secret_key"
```

#### Step B: Deploy via Supabase CLI
Once configured, log into your CLI and deploy the function:

```bash
# Log in to your remote Supabase account
supabase login

# Deploy the verify-payment function
supabase functions deploy verify-payment --project-ref your-supabase-project-reference-id
```

---

## 💳 Checkout & Checkout Pathways

BuzzShield offers **two customer checkout options** out of the box to maximize conversion rate optimization:

1. **Pay Online (UPI, Cards, Wallet via Razorpay)**
   - Pre-fills user details (Name, Phone, Email) in the official Razorpay Checkout panel.
   - On payment validation, Razorpay returns a cryptographic signature.
   - The frontend calls your secure `verify-payment` Edge Function which verifies the HMAC-SHA256 signature server-side.
   - Once verified, the Edge Function inserts a paid row into the `orders` table.

2. **Cash on Delivery (COD) via WhatsApp**
   - Ideal for customers preferring physical delivery confirmation.
   - Inserts a pending order record directly into the database.
   - Launches a WhatsApp Chat window with your business containing a beautiful pre-filled template message listing their Name, Address, Order ID, and Product package for instant shipment dispatching.

---

## 📈 Performance & Accessibility Best Practices
- **Lighthouse Goals**: High accessibility contrast and clean, structured tags targeting Lighthouse 95+ scores.
- **Micro-Animations**: Uses high-performance CSS transitions and standard IntersectionObserver APIs (`scroll-reveal`) to load visual sections fluidly on scroll.
- **Images & Icons**: Integrated with responsive Lucide CDN and picsum.photos dynamic placeholder assets.
