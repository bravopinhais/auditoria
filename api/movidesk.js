export default async function handler(req, res) {
  // Configuração universal de cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token, domain, top = 50, skip = 0 } = req.query;

  if (!token || !domain) {
    return res.status(400).json({ error: 'Parâmetros token e domain são obrigatórios.' });
  }

  // Tratamento do domínio
  let cleanDomain = domain.trim();
  if (!/^https?:\/\//i.test(cleanDomain)) {
    cleanDomain = 'https://' + cleanDomain;
  }
  cleanDomain = cleanDomain.replace(/\/+$/, '');

  // URL direta da API v1 do Movidesk sem expansões instáveis
  const targetUrl = `${cleanDomain}/api/v1/tickets?token=${encodeURIComponent(token)}&$top=${top}&$skip=${skip}`;

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
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
    return res.status(500).json({ error: `Falha no Proxy Vercel: ${error.message}` });
  }
}
