#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
const envPath = path.join(__dirname, '..', 'env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = {}

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) {
    envVars[key.trim()] = value.trim()
  }
})

const SUPABASE_URL = envVars.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables')
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function setupAudioBucket() {
  try {
    console.log('🪣 Setting up audio storage bucket...')
    
    // First, let's check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError)
      return
    }
    
    const audioBucket = buckets.find(bucket => bucket.id === 'motivation-audio')
    
    if (audioBucket) {
      console.log('✅ Audio bucket already exists:', audioBucket.name)
      return
    }
    
    // Create the bucket with minimal settings
    const { data, error } = await supabase.storage.createBucket('motivation-audio', {
      public: true
    })
    
    if (error) {
      console.error('❌ Error creating bucket:', error)
      return
    }
    
    console.log('✅ Audio bucket created successfully!')
    console.log('📋 Bucket details:', data)
    
  } catch (error) {
    console.error('💥 Failed to setup audio bucket:', error)
  }
}

setupAudioBucket()

