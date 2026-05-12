import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://dmlshwvpsoqpptjmplfq.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_J8uOG_z3u9VcYhpingUgBw_SihCdLve';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const BUCKET_NAME = 'usuarios';
