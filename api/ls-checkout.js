export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userEmail } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  const variantId = process.env.LEMON_SQUEEZY_VARIANT_ID;

  if (!apiKey || !storeId || !variantId) {
    return res.status(500).json({ error: 'Missing Lemon Squeezy configuration' });
  }

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail || undefined,
              custom: {
                user_id: userId
              }
            },
            product_options: {
              redirect_url: `${req.headers.origin || 'https://ashrae-check-ai-audit.vercel.app'}?payment=success`
            }
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: storeId.toString()
              }
            },
            variant: {
              data: {
                type: "variants",
                id: variantId.toString()
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lemon Squeezy API Error:', errorData);
      throw new Error('Failed to create Lemon Squeezy checkout');
    }

    const json = await response.json();
    const checkoutUrl = json.data.attributes.url;
    
    return res.status(200).json({ url: checkoutUrl });
  } catch (err) {
    console.error('Lemon Squeezy error:', err);
    return res.status(500).json({ error: err.message });
  }
}
