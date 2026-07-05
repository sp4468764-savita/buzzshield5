/**
 * Supabase & Razorpay Configuration for BuzzShield
 * 
 * Replace the placeholders below with your actual Supabase Project credentials.
 * You can find these in your Supabase Dashboard under Project Settings > API.
 */

const SUPABASE_CONFIG = {
  // Replace with your real Supabase project URL (e.g., 'https://xyz.supabase.co')
  URL: "YOUR_SUPABASE_PROJECT_URL",
  
  // Replace with your real Supabase anonymous public key
  ANON_KEY: "YOUR_SUPABASE_ANON_KEY",

  // Razorpay Key ID (For frontend Checkout checkout integration)
  RAZORPAY_KEY_ID: "YOUR_RAZORPAY_KEY_ID"
};

// Helper to check if credentials have been updated from placeholders
function isSupabaseConfigured() {
  return SUPABASE_CONFIG.URL && 
         SUPABASE_CONFIG.URL !== "YOUR_SUPABASE_PROJECT_URL" && 
         SUPABASE_CONFIG.ANON_KEY && 
         SUPABASE_CONFIG.ANON_KEY !== "YOUR_SUPABASE_ANON_KEY";
}

// Global configurations
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.isSupabaseConfigured = isSupabaseConfigured;
