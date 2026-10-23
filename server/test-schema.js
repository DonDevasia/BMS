require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function testSchema() {
  console.log('Testing if schema tables exist...');
  const { data, error } = await supabase.from('accounts').select('*').limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Error: The "accounts" table does not exist yet. Please run schema.sql in Supabase.');
    } else {
      console.log('❌ Error connecting to database:', error);
    }
  } else {
    console.log('✅ Success! The database is connected and the schema is successfully created.');
  }
}

testSchema();
