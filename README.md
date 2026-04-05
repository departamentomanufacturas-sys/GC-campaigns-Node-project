# GC Campaigns Sync — Simulator

Node.js microservice that simulates campaign synchronization (offers/sync) with configurable HTTP responses and latency.

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/v1/contacts/:contactId/offers/sync` | Sync by contactId (customer view — CSW / SPACE) |
| POST | `/v1/customers/:customerId/offers/sync` | Sync by customerId (external consumer) |

## Architecture

```
src/
├── index.js                        # Entry point (Express server, port 3000)
├── controller/
│   └── spaceCampaignsController.js  # Routes + HTTP response mapping
├── usecase/
│   └── SpaceCamapignsUseCase.js     # Scenario resolution + latency simulation
└── utils/
    └── SimulatorScenarios.js        # Scenario loading from config
```

## Scenario Simulator

API behavior is controlled via `simulator-config.json` at the project root. Each scenario defines:

- **ids** — List of IDs (customerId and/or contactId UUID) that trigger the scenario
- **status** — HTTP response status code
- **errorCode / message** — Error response body (only for status != 204)
- **latencyMs** — Simulated delay in milliseconds

Unconfigured IDs fall back to the `default` scenario (204, 200ms).

### Included Scenarios

| # | customerId | contactId (UUID) | Status | Latency |
|---|------------|-------------------|--------|---------|
| 1 | `customer-204` | `00000000-0000-0000-0000-000000000001` | 204 | 200ms |
| 2 | `customer-204-slow` | `00000000-0000-0000-0000-000000000002` | 204 | 3s |
| 3 | `customer-401` | `00000000-0000-0000-0000-000000000003` | 401 | 100ms |
| 4 | `customer-403` | `00000000-0000-0000-0000-000000000004` | 403 | 100ms |
| 5 | `customer-404` | `00000000-0000-0000-0000-000000000005` | 404 | 200ms |
| 6 | `customer-412` | `00000000-0000-0000-0000-000000000006` | 412 | 500ms |
| 7 | `customer-500` | `00000000-0000-0000-0000-000000000007` | 500 | 30s |
| 8 | `customer-500-generic` | `00000000-0000-0000-0000-000000000008` | 500 | 1s |

To add or modify scenarios, edit `simulator-config.json` and restart the service.

## Commands

```bash
make debug    # Install dependencies + start at http://localhost:3000
make stop     # Kill process on port 3000
make test     # Run integration tests (port 3001)
make push     # Push to origin (current branch)
make clean    # Remove node_modules
```

## Usage Examples

```bash
# Quick success (204, ~200ms)
curl -v -X POST http://localhost:3000/v1/customers/customer-204/offers/sync

# Slow success (204, ~3s)
curl -v -X POST http://localhost:3000/v1/customers/customer-204-slow/offers/sync

# 404 error
curl -s -X POST http://localhost:3000/v1/customers/customer-404/offers/sync

# Same scenario via contactId UUID
curl -s -X POST http://localhost:3000/v1/contacts/00000000-0000-0000-0000-000000000005/offers/sync

# Unknown ID → default (204, 200ms)
curl -v -X POST http://localhost:3000/v1/customers/any-id/offers/sync
```

## Tests

17 integration tests using the Node.js native test runner (no extra dependencies):

```bash
npm test
```

Validates HTTP status codes, error codes, messages, and latencies for all scenarios on both endpoints.

## Deploy (Render)

- **Build command:** `npm install`
- **Start command:** `node ./src/index.js`

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 4
- **Tests:** Node.js native test runner (`node:test`)
