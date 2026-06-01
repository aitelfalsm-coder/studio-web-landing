function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { name, email, type, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API manquante' });
  }

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="font-family:sans-serif;color:#0F172A;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 20px;font-size:20px">📩 Nouvelle demande de devis</h2>
  <table style="width:100%;border-collapse:collapse">
    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600;width:140px">Nom</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${esc(name)}</td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600">Email</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-weight:600">Type de projet</td><td style="padding:10px 0;border-bottom:1px solid #E2E8F0">${esc(type || 'Non précisé')}</td></tr>
    <tr><td style="padding:10px 12px 10px 0;font-weight:600;vertical-align:top">Message</td><td style="padding:10px 0;white-space:pre-wrap">${esc(message)}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:13px;color:#94A3B8">Envoyé depuis le formulaire de contact Studio Web.</p>
</body>
</html>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Studio Web <onboarding@resend.dev>',
      to: ['itelfalsm@gmail.com'],
      reply_to: email,
      subject: `Nouveau devis — ${name}`,
      html,
    }),
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    console.error('Resend error:', detail);
    return res.status(502).json({ error: 'Échec de l\'envoi' });
  }

  return res.status(200).json({ success: true });
};
