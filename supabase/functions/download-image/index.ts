
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { imageUrl, fileName } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('🔄 [DOWNLOAD] Authenticated user downloading:', fileName, 'User ID:', user.id)

    // Extract the file path from the URL
    const urlParts = imageUrl.split('/storage/v1/object/public/figurine-images/')
    if (urlParts.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Invalid image URL' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const filePath = urlParts[1]
    console.log('🔄 [DOWNLOAD] Extracting file path:', filePath)

    // Generate a signed URL for secure download
    const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
      .from('figurine-images')
      .createSignedUrl(filePath, 60) // 60 seconds expiry

    if (signedUrlError) {
      console.error('❌ [DOWNLOAD] Error creating signed URL:', signedUrlError)
      return new Response(
        JSON.stringify({ error: 'Failed to create download link' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ [DOWNLOAD] Signed URL created successfully')

    // Fetch the file using the signed URL
    const fileResponse = await fetch(signedUrlData.signedUrl)
    
    if (!fileResponse.ok) {
      console.error('❌ [DOWNLOAD] Error fetching file:', fileResponse.status)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch file' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the file content
    const fileBlob = await fileResponse.blob()
    const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream'

    console.log('✅ [DOWNLOAD] File downloaded successfully, size:', fileBlob.size)

    // Return the file
    return new Response(fileBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName || 'download'}"`,
      },
    })

  } catch (error) {
    console.error('❌ [DOWNLOAD] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
