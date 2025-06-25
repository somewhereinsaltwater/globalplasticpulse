export default async function handler(req, res) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = "appOaLP4SNGxDT1Tc";
  const tableName = "Global Plastics Map";

  try {
    const airtableRes = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await airtableRes.json();
    const records = data.records.map((record) => ({
      country: record.fields.Country,
      lat: record.fields.Latitude,
      lng: record.fields.Longitude,
      type: record.fields['Type of Law'],
      description: record.fields.Description,
      source: record.fields.URL,
    }));
    res.status(200).json(records);
  } catch (error) {
    console.error("Failed to fetch Airtable data:", error);
    res.status(500).json({ error: "Failed to fetch Airtable data" });
  }
}
