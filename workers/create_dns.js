const https = require('https');
const fs = require('fs');

const API_TOKEN = "oQDxpDvH24UJeQWKuZw1acEL6BbKzksL5y4MrodJ";
const ZONE_ID = "66f8e193a4c1a3a9a4533aeb820584fc";

function log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync('dns_log_direct.txt', msg + '\n');
    } catch (e) {
        // ignore log error
    }
}

const records = [
    { type: 'CNAME', name: 'pos', content: 'nilelink-pos.pages.dev', proxied: true },
    { type: 'CNAME', name: 'admin', content: 'nilelink-admin.pages.dev', proxied: true },
    { type: 'CNAME', name: 'vendor', content: 'nilelink-vendor.pages.dev', proxied: true },
    { type: 'CNAME', name: 'delivery', content: 'nilelink-delivery.pages.dev', proxied: true },
    { type: 'CNAME', name: 'assets', content: 'gateway.pinata.cloud', proxied: true },
    // Only attempt edge if not exists, but create API call is idempotent if we don't care about duplicates (CF returns error if exists usually)
    { type: 'CNAME', name: 'edge', content: 'nilelink-ipfs-token.nilelink.workers.dev', proxied: true }
];

async function createRecord(record) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(record);

        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            method: 'POST',
            path: `/client/v4/zones/${ZONE_ID}/dns_records`,
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    if (response.success) {
                        log(`✅ Success: ${record.name} -> ${record.content}`);
                        resolve(response);
                    } else {
                        log(`❌ Failed: ${record.name} - ${JSON.stringify(response.errors)}`);
                        resolve(response);
                    }
                } catch (e) {
                    log(`❌ Error parsing response for ${record.name}: ${e}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            log(`❌ Request Error for ${record.name}: ${e}`);
            resolve(null);
        });

        req.write(data);
        req.end();
    });
}

// Clear log file
if (fs.existsSync('dns_log_direct.txt')) {
    fs.unlinkSync('dns_log_direct.txt');
}

async function main() {
    log("🚀 Starting DNS Record Creation via Node.js (File Log)...");
    for (const record of records) {
        log(`Creating ${record.name}...`);
        await createRecord(record);
        await new Promise(r => setTimeout(r, 500));
    }
    log("✨ Done.");
}

main();
