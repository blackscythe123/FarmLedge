import http from 'http';

const data = JSON.stringify({
    type: "checkout.session.completed",
    data: {
        object: {
            id: "cs_test_simulated_split_7",
            metadata: {
                batchId: "3",
                isSplit: "true",
                splitQuantity: "100",
                toAddress: "0x2222222222222222222222222222222222222222",
                completeBatch: "false",
                resalePricePerKg: "60",
                role: "distributor"
            }
        }
    }
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/webhook',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_bypass',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
