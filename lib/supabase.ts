// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual values from Supabase project settings
//const SUPABASE_URL = 'https://lbtesghgsfirlcueaxct.supabase.co';
const SUPABASE_URL = 'https://uzdlkzmwqdrasdulzpvm.supabase.co';
//const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxidGVzZ2hnc2ZpcmxjdWVheGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2MTc3ODEsImV4cCI6MjA1ODE5Mzc4MX0.PW0EW56PyzR9uzsohAeraqtbyc6Aeq5aJI7Tog4mcYQ';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZGxrem13cWRyYXNkdWx6cHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMTA0OTMsImV4cCI6MjA2MTY4NjQ5M30.s8Z97eBYv7yLMv4_t3sUelHOiDR3nbT8eAavM1L9dXU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
