import { createClient } from '@supabase/supabase-js';
import { env, requireEnv } from './env.js';

const supabaseUrl = requireEnv("SUPABASE_URL");
const supabaseKey = requireEnv("SUPABASE_KEY");

export const BUCKET_NAME = env.supabaseBucketName;
export const SUPABASE_PUBLIC_BASE_URL = env.supabasePublicBaseUrl;

export const supabase = createClient(supabaseUrl, supabaseKey);
