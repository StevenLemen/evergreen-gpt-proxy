// api/create-post.js
module.exports = async (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, route: '/api/create-post', method: 'GET' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  let body = req.body;
  // Vercel sometimes gives raw body. Ensure we have an object.
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
  }

  const { title, content, status = 'publish' } = body || {};
  if (!title || !content) {
    return res.status(400).json({ error: 'Missing title or content' });
  }

  try {
    const wpRes = await fetch('https://evergreenanalyticspartners.com/wp-json/wp/v2/posts', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, content, status })
    });

    const text = await wpRes.text();
    let wpJson;
    try { wpJson = JSON.parse(text); } catch { wpJson = { raw: text }; }

    if (!wpRes.ok) {
      return res.status(wpRes.status).json({ error: wpJson });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Post published',
      link: wpJson && wpJson.link ? wpJson.link : null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Proxy failed', details: err.message });
  }
};
