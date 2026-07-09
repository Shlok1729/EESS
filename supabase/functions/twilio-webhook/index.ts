import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    // 1. Get the IDs from the URL we generated
    const url = new URL(req.url);
    const guard_id = url.searchParams.get('guard_id');
    const site_id = url.searchParams.get('site_id');

    // 2. Twilio sends data as a Form, not JSON
    const formData = await req.formData();
    const callStatus = formData.get('CallStatus'); // e.g., 'busy', 'failed', 'completed'
    const callSid = formData.get('CallSid');
    const duration = formData.get('CallDuration');

    // 3. Save the exact result to our new database table!
    if (guard_id && site_id && callStatus) {
        await supabase.from('call_logs').insert([{
            guard_id,
            site_id,
            call_sid: callSid,
            status: callStatus,
            duration_seconds: duration ? parseInt(duration as string) : 0
        }]);
    }

    return new Response("Log saved", { status: 200 });
  } catch (err) {
    return new Response("Error", { status: 500 });
  }
});