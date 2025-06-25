// /api/airtable.js
export default async function handler(req, res) {
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;


  if (!token || !baseId || !tableName) {
    return res.status(500).json({ error: 'Missing Airtable environment variables' });
  }

  try {
    const airtableUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?view=Grid%20view`;

    const response = await fetch(airtableUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Airtable API fetch failed:', err);
    return res.status(500).json({ error: 'Failed to fetch data from Airtable' });
  }
}
