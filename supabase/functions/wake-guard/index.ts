import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // Notice we added guard_id and site_id here!
    const { guard_phone, guard_name, site_name, guard_id, site_id } = await req.json()

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!
    
    // Automatically gets your Supabase URL (e.g., https://abcdefg.supabase.co)
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!

    const formattedPhone = guard_phone.startsWith('+91') ? guard_phone : `+91${guard_phone}`;

    const twiML = `
      <Response>
        <Say voice="Polly.Aditi">
          Alert. Alert. ${guard_name}, you have missed your night patrol at ${site_name}. 
          Please wake up and scan your checkpoints immediately. This incident has been recorded.
        </Say>
      </Response>
    `;

    const formData = new URLSearchParams();
    formData.append('To', formattedPhone);
    formData.append('From', TWILIO_PHONE_NUMBER);
    formData.append('Twiml', twiML);
    
    // --- NEW: TELL TWILIO TO REPORT BACK TO OUR WEBHOOK ---
    const webhookUrl = `${SUPABASE_URL}/functions/v1/twilio-webhook?guard_id=${guard_id}&site_id=${site_id}`;
    formData.append('StatusCallback', webhookUrl);
    formData.append('StatusCallbackEvent', 'completed');
    formData.append('StatusCallbackEvent', 'busy');
    formData.append('StatusCallbackEvent', 'no-answer');
    formData.append('StatusCallbackEvent', 'failed');

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: formData.toString(),
      }
    )

    const data = await response.json()
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})