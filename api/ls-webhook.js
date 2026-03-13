import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];

  if (!secret || !signature) {
    return res.status(400).json({ error: 'Missing secret or signature' });
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (digest.length !== signatureBuffer.length || !crypto.timingSafeEqual(digest, signatureBuffer)) {
    console.error('Webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {

    // Assuming signature is valid and event is order_created
    const event = JSON.parse(rawBody.toString());
    
    if (event.meta.event_name === 'order_created') {
      const userId = event.meta.custom_data?.user_id;

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
        // Give 30 days of access
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

        await supabase
          .from('profiles')
          .update({ 
            access_expires_at: newExpiry.toISOString(),
            payment_status: 'paid',
            payment_method: 'lemonsqueezy'
          })
          .eq('id', userId);
          
        console.log(`Successfully granted 30-day access to user ${userId}`);
      } else {
        console.error('No custom_data.user_id found in webhook payload');
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
