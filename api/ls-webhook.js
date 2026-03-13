import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Implementation logic for Lemon Squeezy webhook verification will go here
  // const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  try {
    const rawBody = await getRawBody(req);
    // TODO: Verify Lemon Squeezy signature

    // Assuming signature is valid and event is order_created
    const event = JSON.parse(rawBody.toString());
    
    // Example event type for successful payment in LS
    if (event.meta.event_name === 'order_created') {
      // The user ID should be passed as custom data during the checkout session creation
      const userId = event.data.attributes.custom_data?.user_id;

      if (userId) {
        // Get current access_expires_at
        const { data: profile } = await supabase
          .from('profiles')
          .select('access_expires_at')
          .eq('id', userId)
          .single();

        const currentExpiry = profile?.access_expires_at
          ? new Date(profile.access_expires_at)
          : new Date();
        
        const now = new Date();
        // Take the later of now or existing expiry, then add 30 days
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await supabase
          .from('profiles')
          .update({ access_expires_at: newExpiry.toISOString() })
          .eq('id', userId);
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
