module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, email, type, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const sheetUrl = process.env.GOOGLE_SHEET_URL;
  if (!sheetUrl) {
    return res.status(500).json({ error: 'Configuration manquante' });
  }

  const now = new Date();
  const date = now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const response = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, name, email, type: type || 'Non précisé', message }),
  }).catch(err => {
    console.error('Google Sheet error:', err);
    return null;
  });

  if (!response || !response.ok) {
    return res.status(502).json({ error: 'Échec de l\'enregistrement' });
  }

  return res.status(200).json({ success: true });
};
