import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced motivational quotes for Business Analysts and professionals
const quotes = [
  // Business Analysis Focus
  "The best way to predict the future is to create it. Start your BA journey today! 🌟",
  "Requirements are like a bridge between business needs and technical solutions. Build them strong! 🏗️",
  "Process mapping isn't just about documenting workflows—it's about understanding them. 📊",
  "Every great software solution starts with a great business analyst. 💡",
  "The difference between a good BA and a great BA is asking the right questions. 🤔",
  "Stakeholder management is 90% communication and 10% documentation. 💬",
  "Agile isn't just a methodology—it's a mindset of continuous improvement. 🔄",
  "Your process maps tell a story. Make sure it's a story worth telling. 📖",
  "Requirements gathering is an art. Master it, and you'll master your career. 🎨",
  "The best BAs don't just gather requirements—they discover them. 🔍",
  
  // Professional Growth
  "Success in business analysis comes from understanding the 'why' behind every 'what'. 🎯",
  "Your portfolio is your story. Make it compelling. 📚",
  "Every interview is an opportunity to showcase your BA superpowers. ⚡",
  "The most valuable skill a BA can have is active listening. 👂",
  "Process improvement starts with process understanding. 🔧",
  "Requirements are the foundation of every successful project. 🏛️",
  "Your stakeholders are your partners in success. 🤝",
  "The best solutions come from the best questions. ❓",
  "Documentation is a love letter to your future self. 💌",
  "Agile success comes from embracing change, not fearing it. 🌊",
  
  // Motivation & Mindset
  "Today's challenges are tomorrow's success stories. Keep pushing forward! 🚀",
  "Your unique perspective is your superpower. Use it wisely. ⚡",
  "Every problem is an opportunity in disguise. Look for the silver lining! ✨",
  "The only way to do great work is to love what you do. Passion drives excellence! ❤️",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. 💪",
  "Your attitude determines your altitude. Stay positive and keep climbing! 🗻",
  "The future belongs to those who believe in the beauty of their dreams. 🌙",
  "Don't watch the clock; do what it does. Keep going! ⏰",
  "The only limit to your impact is your imagination and commitment. 🌟",
  "Make today amazing so tomorrow can be even better! 🌅",
  
  // Team & Collaboration
  "Alone we can do so little; together we can do so much. Teamwork makes the dream work! 👥",
  "The strength of the team is each individual member. The strength of each member is the team. 🤝",
  "Great things in business are never done by one person. They're done by a team of people. 🏢",
  "Collaboration is the key to innovation. Share your ideas and watch them grow! 🌱",
  "When we work together, we achieve more than we ever could alone. 💫",
  "Your success is my success. Let's lift each other up! 🚀",
  "The best teams are built on trust, communication, and mutual respect. 🤗",
  "Together we are stronger, smarter, and more successful. 💪",
  "Celebrate each other's wins. Your success inspires others to succeed! 🎉",
  "Build bridges, not walls. Connect with others and create something amazing! 🌉"
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Pick a random quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

    // Get all active spaces (cohorts)
    const { data: spaces, error: spacesError } = await supabase
      .from('spaces')
      .select('id, name')

    if (spacesError) {
      throw spacesError
    }

    // Get all general channels in each space
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('id, space_id, name')
      .in('space_id', spaces.map(s => s.id))
      .eq('is_private', false)
      .eq('is_staff_only', false)

    if (channelsError) {
      throw channelsError
    }

    const results = []

    // Post quote to each general channel
    for (const channel of channels) {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channel.id,
          user_id: '00000000-0000-0000-0000-000000000000', // System user ID
          body: `💬 **Daily Motivation**\n\n${randomQuote}\n\n*Posted by BA WorkXP™*`,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error(`Error posting to channel ${channel.name}:`, error)
        results.push({ channel: channel.name, success: false, error: error.message })
      } else {
        results.push({ channel: channel.name, success: true, message_id: message.id })
      }
    }

    // Also post to forum_posts for general community
    const { data: forumPost, error: forumError } = await supabase
      .from('forum_posts')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // System user ID
        content: `💬 **Daily Motivation**\n\n${randomQuote}\n\n*Posted by BA WorkXP™*`,
        category: 'general',
        system_generated: true
      })
      .select()
      .single()

    if (forumError) {
      console.error('Error posting to forum:', forumError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        quote: randomQuote,
        channels_posted: results.length,
        results: results,
        forum_post: forumPost,
        message: 'Daily motivational quote posted successfully to all cohort channels'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in daily-quote function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to post daily quote',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
