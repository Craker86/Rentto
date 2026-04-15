import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://azuoakmljtzspknotzac.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dW9ha21sanR6c3Brbm90emFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMTg4OTUsImV4cCI6MjA5MTU5NDg5NX0.N_bXoOjErDMYo0PhwuwM6jDETYEN7-86QULzOHbvOJ0";

export const supabase = createClient(supabaseUrl, supabaseKey);