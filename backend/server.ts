//@ts-ignore
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zcpesqgzeeiewddphdwg.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcGVzcWd6ZWVpZXdkZHBoZHdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTE3OTksImV4cCI6MjA2OTEyNzc5OX0.xz3X8mi9M6KZGkS0Nkj-YLPCcTHAx4zwdYXVoPA_8IU"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase