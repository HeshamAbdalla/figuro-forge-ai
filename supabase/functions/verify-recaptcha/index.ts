
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Define the reCAPTCHA verification URL
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

// Define the secret key from environment variables
const RECAPTCHA_SECRET_KEY = Deno.env.get("RECAPTCHA_SECRET_KEY");

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  error_codes?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    // Check if method is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', details: 'Only POST requests are allowed' }),
        { 
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify that the secret key is available
    if (!RECAPTCHA_SECRET_KEY) {
      console.error("Missing RECAPTCHA_SECRET_KEY environment variable");
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          details: 'reCAPTCHA secret key is not configured'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const requestData = await req.json();
    const { token, action, minScore = 0.5 } = requestData;

    // Validate required parameters
    if (!token) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing parameters',
          details: 'Token is required'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Prepare form data for reCAPTCHA verification
    const formData = new URLSearchParams();
    formData.append('secret', RECAPTCHA_SECRET_KEY);
    formData.append('response', token);

    // Get the client IP if available from request headers
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip');
    if (clientIp) {
      formData.append('remoteip', clientIp);
    }

    console.log(`Verifying reCAPTCHA token for action: ${action || 'unknown'}`);

    // Make the request to Google's reCAPTCHA API
    const verifyResponse = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      body: formData,
    });

    // Parse the response
    const verifyData: RecaptchaResponse = await verifyResponse.json();

    console.log('reCAPTCHA verification result:', verifyData);

    // Enhanced validation
    let validationResult = {
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      expectedAction: action,
      timestamp: verifyData.challenge_ts,
      hostname: verifyData.hostname,
      errors: verifyData.error_codes || [],
    };

    // Add score validation
    if (verifyData.success && verifyData.score !== undefined) {
      if (verifyData.score < minScore) {
        validationResult.success = false;
        validationResult.errors = [...(validationResult.errors || []), 'score_too_low'];
        console.log(`reCAPTCHA score (${verifyData.score}) below minimum threshold (${minScore})`);
      }
    }

    // Add action validation if both expected and actual actions are present
    if (action && verifyData.action && verifyData.action !== action) {
      validationResult.success = false;
      validationResult.errors = [...(validationResult.errors || []), 'action_mismatch'];
      console.log(`reCAPTCHA action mismatch. Expected: ${action}, Got: ${verifyData.action}`);
    }

    // Return the validation result
    return new Response(
      JSON.stringify(validationResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    // Log the error
    console.error("Error verifying reCAPTCHA token:", error);

    // Return a generic error response
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
