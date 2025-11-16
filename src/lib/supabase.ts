import { createClient } from '@supabase/supabase-js';

// Supabase connection
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// const supabaseUrl = 'https://ynintnofgobkalrlvpxb.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaW50bm9mZ29ia2Fscmx2cHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTEyNDIsImV4cCI6MjA3MzYyNzI0Mn0.GUuUCDz2ZzneOEd04cWLSYbJ0O3sSZMEjX7iBpHtnhg';
// const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluaW50bm9mZ29ia2Fscmx2cHhiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODA1MTI0MiwiZXhwIjoyMDczNjI3MjQyfQ.T3QeRm8xiuBjL8egM-bdH-fTAHiQ33Tg1nLzIOVi-Ow';



// const supabaseUrl = 'https://rgcorbmtpltsqmfnmwrp.supabase.co';
// const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnY29yYm10cGx0c3FtZm5td3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMzkyMjgsImV4cCI6MjA3NDYxNTIyOH0.O-lRSL7t7qADXPqsOBQVEL9jYz0sey3ckbwUVtin_Bo';
// const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnY29yYm10cGx0c3FtZm5td3JwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzOTIyOCwiZXhwIjoyMDc0NjE1MjI4fQ.y_MLOYjCuAHyTDMVum2yRAmDo7-FRRFkSab__VsjKU8';



const supabaseUrl = 'https://dymidqlahywrbfxykhha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bWlkcWxhaHl3cmJmeHlraGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODU3MjUsImV4cCI6MjA3NzU2MTcyNX0.Dv-wrgPrQeFpUA5cRZdsi0wAxnuWy9HiEkhoC8MMfY8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5bWlkcWxhaHl3cmJmeHlraGhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk4NTcyNSwiZXhwIjoyMDc3NTYxNzI1fQ.8qBIVFyqGqcof_d1NQ4r2cmwm3JHnoo5Zfgr62YvoLI';

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

console.log('🔧 Supabase configured (env present):', isSupabaseConfigured);

// Connection health state
let isSupabaseConnectionHealthy = true;

// Track connection attempts and failures
let connectionAttempts = 0;
let lastConnectionError: string | null = null;

// Function to set connection health
export const setSupabaseConnectionHealth = (healthy: boolean) => {
  isSupabaseConnectionHealthy = healthy;
  console.log('🏥 Supabase connection health:', healthy ? 'healthy' : 'unhealthy');

  if (!healthy) {
    connectionAttempts++;
    console.log(`🔄 Connection attempt ${connectionAttempts}`);
  } else {
    connectionAttempts = 0;
    lastConnectionError = null;
  }
};

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured && typeof window !== 'undefined'
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Create admin client with service role for admin operations (client-side with service key as requested)
export const supabaseAdmin = isSupabaseConfigured && supabaseServiceKey
  ? createClient(supabaseUrl!, supabaseServiceKey)
  : null;

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return isSupabaseConfigured && supabase !== null;
};

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    console.log('🔍 Testing Supabase connection...');

    // Attempt a lightweight Supabase query with a timeout (no raw fetch to avoid cross-origin noise)
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 4000));
    const queryPromise = supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    const { error } = await Promise.race([queryPromise, timeout]) as any;

    if (error) {
      console.log('❌ Supabase connection test failed (query):', error.message || error);
      setSupabaseConnectionHealth(false);
      lastConnectionError = error.message || String(error);
      return { success: false, error: error.message || 'Query error' };
    }

    console.log('✅ Supabase connection test successful');
    setSupabaseConnectionHealth(true);
    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown connection error';
    console.log('❌ Supabase connection test error:', errorMessage);
    setSupabaseConnectionHealth(false);
    lastConnectionError = errorMessage;
    return { success: false, error: errorMessage };
  }
};

export const signInWithGoogle = async () => {
  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  console.log('🚀 Starting Google sign-in...');
  
  // Use the current domain for redirect
  const currentDomain = window.location.origin;
  const redirectUrl = `${currentDomain}/auth/callback`;
  
  console.log('🔗 OAuth redirect URL:', redirectUrl);
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      skipBrowserRedirect: false,
    },
  });
  
  console.log('🔍 Google OAuth result:', { 
    hasData: !!data, 
    hasUrl: !!data?.url,
    error: error?.message || 'No error'
  });
  
  return { data, error };
};

export const signInWithEmail = async (email: string, password: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUpWithEmail = async (
  email: string, 
  password: string, 
  fullName: string,
  additionalData?: { phone?: string; role?: string }
) => {
  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: additionalData?.phone,
        role: additionalData?.role || 'patient',
      },
    },
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseAvailable() || !supabase) {
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resendConfirmationEmail = async (email: string) => {
  if (!isSupabaseAvailable() || !supabase) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  return { data, error };
};

// Run an initial connection test (non-blocking) so isSupabaseAvailable reflects reality quickly
// Only run this check in the browser to avoid triggering network calls during SSR or other non-browser environments
if (isSupabaseConfigured && typeof window !== 'undefined' && import.meta.env.DEV) {
  (async () => {
    try {
      const res = await testSupabaseConnection();
      if (!res.success) {
        console.warn('Initial Supabase connection check failed:', res.error);
      }
    } catch (e) {
      console.warn('Initial Supabase connection error:', e);
    }
  })();
} else {
  console.log('Supabase initial connection test skipped (either not configured, not in browser, or not in DEV)');
}
