const { resolveScenario, delay } = require('../utils/SimulatorScenarios');

class SpaceCamapignsUseCase {
    async syncCampaigns(campaignsRequest) {
        if (!campaignsRequest) {
            throw new Error('CampaignsRequestDetails cannot be null');
        }

        const id = campaignsRequest.contactID || campaignsRequest.customerId;
        console.log(`[USECASE] syncCampaigns -> id: ${id}`);

        const scenario = resolveScenario(id);
        console.log(`[USECASE] Scenario -> status: ${scenario.status}, latency: ${scenario.latencyMs}ms`);
        await delay(scenario.latencyMs);

        return scenario;
    }
}

module.exports = SpaceCamapignsUseCase;
