const path = require('path');
const fs = require('fs');

const configPath = path.resolve(__dirname, '../../simulator-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Build a lookup map: id -> scenario
const scenarioMap = {};
config.scenarios.forEach(scenario => {
    scenario.ids.forEach(id => {
        scenarioMap[id] = {
            status: scenario.status,
            errorCode: scenario.errorCode || null,
            message: scenario.message || null,
            latencyMs: scenario.latencyMs
        };
    });
});

console.log(`[SIMULATOR] Loaded ${config.scenarios.length} scenarios (${Object.keys(scenarioMap).length} IDs mapped)`);

function resolveScenario(id) {
    return scenarioMap[id] || config.default;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { resolveScenario, delay };
