import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userEmail } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'ashraeCheck AI — Professional Pass',
              description: '30 days of full access to all AI auditing tools. One-time payment. No auto-renewal.',
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail || undefined,
      metadata: {
        userId,
      },
      automatic_tax: { enabled: true },
      success_url: `${req.headers.origin || 'https://ashrae-check-ai-audit.vercel.app'}?payment=success`,
      cancel_url: `${req.headers.origin || 'https://ashrae-check-ai-audit.vercel.app'}?payment=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: err.message });
  }
}
