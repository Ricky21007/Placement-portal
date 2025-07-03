// src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://coqvyrfpmywsaxvbsltz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvcXZ5cmZwbXl3c2F4dmJzbHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwMTM2MjUsImV4cCI6MjA2NjU4OTYyNX0.R2-2HWuSakBgDk98q_XoV7kYxwpp0Bw1ZBSMI5WBSdY";
export const supabase = createClient(supabaseUrl, supabaseKey);
