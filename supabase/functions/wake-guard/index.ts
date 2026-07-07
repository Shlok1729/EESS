import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    // 1. Get the data sent by our Database
    const { guard_phone, guard_name, site_name } = await req.json()

    // 2. Load our Twilio Secrets
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID')!
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN')!
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER')!

    // 3. Format the Indian phone number
    const formattedPhone = guard_phone.startsWith('+91') ? guard_phone : `+91${guard_phone}`;

    // 4. The Robotic Voice Script (TwiML) - Using Indian-English female voice 'Polly.Aditi'
    const twiML = `
      <Response>
        <Say voice="Polly.Aditi">
          Alert. Alert. ${guard_name}, you have missed your night patrol at ${site_name}. 
          Please wake up and scan your checkpoints immediately. This incident has been recorded.
        </Say>
      </Response>
    `;

    // 5. Send the command to Twilio to dial the phone
    const details = new URLSearchParams({
      To: formattedPhone,
      From: TWILIO_PHONE_NUMBER,
      Twiml: twiML,
    })

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        },
        body: details.toString(),
      }
    )

    const data = await response.json()
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } })
    
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})