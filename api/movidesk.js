export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { token, domain, top = 50, skip = 0 } = req.query;

  if (!token || !domain) {
    return res.status(400).json({ error: 'Parâmetros token e domain são obrigatórios.' });
  }

  let formattedDomain = domain.trim();
  if (!/^https?:\/\//i.test(formattedDomain)) {
    formattedDomain = 'https://' + formattedDomain;
  }
  formattedDomain = formattedDomain.replace(/\/+$/, '');

  const targetUrl = `${formattedDomain}/api/v1/tickets?token=${encodeURIComponent(token)}&$top=${top}&$skip=${skip}&$expand=clients,owner,ownerTeam,actions($expand=createdBy)`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Movidesk recusou (Status ${response.status}): ${responseText.substring(0, 150)}` 
      });
    }

    const data = JSON.parse(responseText);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: `Erro interno no Proxy Vercel: ${error.message}` });
  }
}
