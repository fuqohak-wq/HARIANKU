export default async function handler(req, res) {
    // Set Header agar bisa diakses secara bebas (CORS safe)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    // URL Google Apps Script yang berfungsi
    const GAS_URL = "https://script.google.com/macros/s/AKfycbzUg2PbvCWboeldk3_cgcDDfMHP7BbtXVvPVzpbKMZkDwUCIdNVqXXX6Oj1KvkxnEIJvw/exec";

    try {
        const { refresh } = req.query;
        const targetUrl = refresh === "true" 
            ? `${GAS_URL}?refresh=true&_ts=${Date.now()}` 
            : `${GAS_URL}?_ts=${Date.now()}`;

        // Fetch menggunakan redirect follow agar aman dari lompatan domain Google Apps Script
        const response = await fetch(targetUrl, {
            method: "GET",
            redirect: "follow",
            headers: {
                "Accept": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });

        if (!response.ok) {
            throw new Error(`Google Apps Script mengembalikan status: ${response.status}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error Proxy Nasehat:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Gagal mengambil data dari Google Apps Script via proxy serverless." 
        });
    }
}
