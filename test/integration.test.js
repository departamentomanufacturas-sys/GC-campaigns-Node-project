const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3001';
let server;

// Load scenarios from config
const configPath = path.resolve(__dirname, '../simulator-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

function request(method, urlPath) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const url = new URL(urlPath, BASE_URL);
        const req = http.request(url, { method }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const elapsed = Date.now() - start;
                let parsed = null;
                try { parsed = JSON.parse(body); } catch (_) {}
                resolve({ status: res.statusCode, body: parsed, elapsed });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

before(async () => {
    // Start server on test port
    process.env.PORT = '3001';
    const app = require('../src/index.js');

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
});

after(() => {
    process.exit(0);
});

// --- Customer endpoint tests ---

describe('POST /v1/customers/:customerId/offers/sync', () => {

    it('customer-204 → 204, ~200ms latency', async () => {
        const res = await request('POST', '/v1/customers/customer-204/offers/sync');
        assert.strictEqual(res.status, 204);
        assert.strictEqual(res.body, null);
        assert.ok(res.elapsed >= 150, `Expected >= 150ms, got ${res.elapsed}ms`);
        assert.ok(res.elapsed < 1000, `Expected < 1000ms, got ${res.elapsed}ms`);
    });

    it('customer-204-slow → 204, ~3000ms latency', async () => {
        const res = await request('POST', '/v1/customers/customer-204-slow/offers/sync');
        assert.strictEqual(res.status, 204);
        assert.ok(res.elapsed >= 2500, `Expected >= 2500ms, got ${res.elapsed}ms`);
    });

    it('customer-401 → 401 UNAUTHORIZED', async () => {
        const res = await request('POST', '/v1/customers/customer-401/offers/sync');
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.errorCode, 'UNAUTHORIZED');
        assert.strictEqual(res.body.message, 'Unauthorized');
    });

    it('customer-403 → 403 FORBIDDEN', async () => {
        const res = await request('POST', '/v1/customers/customer-403/offers/sync');
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.errorCode, 'FORBIDDEN');
        assert.strictEqual(res.body.message, 'You do not have permission to perform this action');
    });

    it('customer-404 → 404 CUSTOMER_NOT_FOUND', async () => {
        const res = await request('POST', '/v1/customers/customer-404/offers/sync');
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.errorCode, 'CUSTOMER_NOT_FOUND');
        assert.strictEqual(res.body.message, 'The customer could not be found');
    });

    it('customer-412 → 412 SYNC_PRECONDITION_FAILED', async () => {
        const res = await request('POST', '/v1/customers/customer-412/offers/sync');
        assert.strictEqual(res.status, 412);
        assert.strictEqual(res.body.errorCode, 'SYNC_PRECONDITION_FAILED');
        assert.strictEqual(res.body.message, 'Sync could not be completed due to unmet preconditions');
    });

    it('customer-500 → 500 THIRD_PARTY_SERVICE_UNAVAILABLE, ~5000ms', async () => {
        const res = await request('POST', '/v1/customers/customer-500/offers/sync');
        assert.strictEqual(res.status, 500);
        assert.strictEqual(res.body.errorCode, 'THIRD_PARTY_SERVICE_UNAVAILABLE');
        assert.strictEqual(res.body.message, 'Downstream services are unavailable');
        assert.ok(res.elapsed >= 4500, `Expected >= 4500ms, got ${res.elapsed}ms`);
    });

    it('customer-500-generic → 500 GENERIC_ERROR, ~1000ms', async () => {
        const res = await request('POST', '/v1/customers/customer-500-generic/offers/sync');
        assert.strictEqual(res.status, 500);
        assert.strictEqual(res.body.errorCode, 'GENERIC_ERROR');
        assert.strictEqual(res.body.message, 'An error occurred, please try again later');
        assert.ok(res.elapsed >= 800, `Expected >= 800ms, got ${res.elapsed}ms`);
    });

    it('unknown customerId → 204 (default)', async () => {
        const res = await request('POST', '/v1/customers/any-unknown-id/offers/sync');
        assert.strictEqual(res.status, 204);
    });
});

// --- Contact endpoint tests ---

describe('POST /v1/contacts/:contactId/offers/sync', () => {

    it('UUID 0001 → 204, ~200ms latency', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000001/offers/sync');
        assert.strictEqual(res.status, 204);
        assert.ok(res.elapsed >= 150, `Expected >= 150ms, got ${res.elapsed}ms`);
    });

    it('UUID 0002 → 204, ~3000ms latency (slow)', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000002/offers/sync');
        assert.strictEqual(res.status, 204);
        assert.ok(res.elapsed >= 2500, `Expected >= 2500ms, got ${res.elapsed}ms`);
    });

    it('UUID 0003 → 401 UNAUTHORIZED', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000003/offers/sync');
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.errorCode, 'UNAUTHORIZED');
    });

    it('UUID 0004 → 403 FORBIDDEN', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000004/offers/sync');
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.errorCode, 'FORBIDDEN');
    });

    it('UUID 0005 → 404 CUSTOMER_NOT_FOUND', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000005/offers/sync');
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.errorCode, 'CUSTOMER_NOT_FOUND');
    });

    it('UUID 0006 → 412 SYNC_PRECONDITION_FAILED', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000006/offers/sync');
        assert.strictEqual(res.status, 412);
        assert.strictEqual(res.body.errorCode, 'SYNC_PRECONDITION_FAILED');
    });

    it('UUID 0007 → 500 THIRD_PARTY_SERVICE_UNAVAILABLE', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000007/offers/sync');
        assert.strictEqual(res.status, 500);
        assert.strictEqual(res.body.errorCode, 'THIRD_PARTY_SERVICE_UNAVAILABLE');
    });

    it('UUID 0008 → 500 GENERIC_ERROR', async () => {
        const res = await request('POST', '/v1/contacts/00000000-0000-0000-0000-000000000008/offers/sync');
        assert.strictEqual(res.status, 500);
        assert.strictEqual(res.body.errorCode, 'GENERIC_ERROR');
    });

    it('unknown UUID → 204 (default)', async () => {
        const res = await request('POST', '/v1/contacts/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/offers/sync');
        assert.strictEqual(res.status, 204);
    });
});
