
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-CHECKOUT-SESSION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Request received", { method: req.method });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get session ID from request body
    const body = await req.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      throw new Error("session_id is required in request body");
    }

    logStep("Retrieving checkout session", { sessionId });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    logStep("Checkout session retrieved", { 
      sessionId: session.id, 
      status: session.status,
      paymentStatus: session.payment_status 
    });

    return new Response(JSON.stringify({
      id: session.id,
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      metadata: session.metadata
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error in get-checkout-session", { error: error instanceof Error ? error.message : String(error) });
    console.error(`Error in get-checkout-session: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
