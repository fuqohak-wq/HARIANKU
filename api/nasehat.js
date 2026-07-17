export default async function handler(req, res) {
    // Set Header agar bisa diakses secara bebas (CORS safe)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // URL Google Apps Script Anda yang asli
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzUg2PbvCWboeldk3_cgcDDfMHP7BbtXVvPVzpbKMZkDwUCIdNVqXXX6Oj1KvkxnEIJvw/exec";

    try {
        // Ambil parameter refresh jika dikirim dari frontend
        const { refresh } = req.query;
        const targetUrl = refresh === "true" 
            ? `${GAS_URL}?refresh=true&_ts=${Date.now()}` 
            : `${GAS_URL}?_ts=${Date.now()}`;

        // Server Vercel menembak Google Apps Script (Sangat aman dari CORS)
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`Google Apps Script return status: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error Proxy Nasehat:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Gagal mengambil data dari Google Apps Script." 
        });
    }
}
