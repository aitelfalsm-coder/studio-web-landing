module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, email, type, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: 'c7e9c23a-47f3-41ad-b18d-04110ea5d9f4',
      name,
      email,
      subject: `Nouveau devis — ${name}`,
      message: `Type de projet : ${type || 'Non précisé'}\n\n${message}`,
      from_name: 'StudioWeb Contact',
    }),
  }).catch(err => {
    console.error('Web3Forms error:', err);
    return null;
  });

  if (!response || !response.ok) {
    return res.status(502).json({ error: 'Échec de l\'envoi' });
  }

  const data = await response.json();
  if (!data.success) {
    console.error('Web3Forms rejected:', data);
    return res.status(502).json({ error: 'Échec de l\'envoi' });
  }

  return res.status(200).json({ success: true });
};
