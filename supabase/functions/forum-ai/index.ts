import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { postId, content } = await req.json()

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Post ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the original post content
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('content, category')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple AI logic based on content analysis
    let aiReply = ''

    const postContent = post.content.toLowerCase()
    const category = post.category

    // Generate contextually relevant replies
    if (category === 'process-mapping') {
      if (postContent.includes('gateway') || postContent.includes('decision')) {
        aiReply = "Great question about process mapping! When working with gateways, remember to always label your outgoing flows (Yes/No, Approved/Rejected, etc.) to make the process clear. Also consider adding text annotations for business rules that determine the decision path."
      } else if (postContent.includes('swimlane') || postContent.includes('lane')) {
        aiReply = "Swimlanes are excellent for showing handoffs and ownership! Make sure each lane represents a clear role, team, or system. Keep lane titles short and consistent throughout your diagram. This helps stakeholders quickly understand who's responsible for each step."
      } else if (postContent.includes('annotation') || postContent.includes('text')) {
        aiReply = "Text annotations are perfect for adding context! Use them for business rules, exceptions, SLAs, or any important clarifications. Connect them to the relevant element with an association line. This keeps your diagram clean while providing necessary details."
      } else {
        aiReply = "Process mapping is a powerful tool for visualizing workflows! Remember to start with clear boundaries, use verb+object naming for tasks, and keep your diagrams left-to-right for easy reading. What specific aspect of process mapping are you working on?"
      }
    } else if (category === 'requirements') {
      if (postContent.includes('user story') || postContent.includes('story')) {
        aiReply = "User stories are the foundation of agile requirements! Remember the format: 'As a [user], I want [feature] so that [benefit].' Make sure each story is independent, negotiable, valuable, estimable, small, and testable (INVEST). What's your biggest challenge with user stories?"
      } else if (postContent.includes('acceptance criteria') || postContent.includes('criteria')) {
        aiReply = "Acceptance criteria should be clear, testable, and written from the user's perspective. Use the Given-When-Then format for complex scenarios. Remember: if you can't test it, it's not a good acceptance criterion. What type of feature are you writing criteria for?"
      } else {
        aiReply = "Requirements gathering is both an art and a science! Focus on understanding the 'why' behind requests, not just the 'what.' Good requirements are clear, complete, consistent, and traceable. What's your current requirements challenge?"
      }
    } else if (category === 'interview-prep') {
      if (postContent.includes('interview') || postContent.includes('job')) {
        aiReply = "Interview preparation is key to landing your dream BA role! Practice the STAR method for behavioral questions, prepare examples of your process mapping work, and be ready to discuss your requirements gathering approach. What specific role are you targeting?"
      } else if (postContent.includes('portfolio') || postContent.includes('resume')) {
        aiReply = "Your portfolio should showcase your BA skills! Include process maps, requirements documents, user stories, and case studies. Quantify your impact where possible. Remember to explain your methodology and the business value you delivered. What's your strongest portfolio piece?"
      } else {
        aiReply = "Interview success comes from preparation and confidence! Practice common BA questions, prepare your elevator pitch, and have examples ready for your technical and soft skills. What aspect of interviewing makes you most nervous?"
      }
    } else if (category === 'agile') {
      if (postContent.includes('sprint') || postContent.includes('scrum')) {
        aiReply = "Agile methodologies help teams deliver value incrementally! In Scrum, focus on sprint planning, daily standups, and retrospectives. Remember that the goal is working software over comprehensive documentation. What's your team's biggest agile challenge?"
      } else if (postContent.includes('backlog') || postContent.includes('refinement')) {
        aiReply = "Backlog refinement is crucial for sprint success! Break down large stories, clarify acceptance criteria, and estimate effort. The whole team should participate in refinement sessions. What's your approach to story sizing?"
      } else {
        aiReply = "Agile is about adapting to change! Focus on collaboration, customer feedback, and continuous improvement. Remember the agile manifesto values. What's your experience with agile methodologies?"
      }
    } else if (category === 'stakeholders') {
      if (postContent.includes('meeting') || postContent.includes('workshop')) {
        aiReply = "Stakeholder meetings are opportunities to build relationships and gather insights! Prepare clear agendas, use visual aids like process maps, and follow up with action items. What's your strategy for keeping stakeholders engaged?"
      } else if (postContent.includes('communication') || postContent.includes('presentation')) {
        aiReply = "Effective communication is essential for BA success! Tailor your message to your audience, use visual aids, and practice active listening. Remember that different stakeholders need different levels of detail. What's your communication challenge?"
      } else {
        aiReply = "Stakeholder management is about building trust and understanding! Identify key stakeholders early, understand their needs and concerns, and maintain regular communication. What's your approach to stakeholder engagement?"
      }
    } else {
      // General BA advice
      aiReply = "Great question! As a Business Analyst, remember to always focus on understanding the business need behind any request. Process mapping, requirements gathering, and stakeholder management are core BA skills. What specific area would you like to explore further?"
    }

    // Insert the AI reply
    const { data: reply, error: replyError } = await supabase
      .from('forum_replies')
      .insert({
        post_id: postId,
        user_id: null, // AI-generated reply
        content: aiReply,
        ai_generated: true
      })
      .select()
      .single()

    if (replyError) {
      throw replyError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reply: reply,
        message: 'AI reply generated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in forum-ai function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate AI reply',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
