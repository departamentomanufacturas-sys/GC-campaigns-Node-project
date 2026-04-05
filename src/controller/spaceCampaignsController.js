// src/spaceCampaignsController.js
// Node.js Express version of SpaceCampaignsController
const express = require('express');
const router = express.Router();

const SpaceCampaignsUseCase = require('../usecase/SpaceCamapignsUseCase');
const useCase = new SpaceCampaignsUseCase();

function sendScenarioResponse(res, scenario) {
    if (scenario.status !== 204) {
        return res.status(scenario.status).send({
            errorCode: scenario.errorCode,
            message: scenario.message
        });
    }
    res.status(204).send();
}

// POST /v1/contacts/:contactId/offers/sync – Customer view (CSW / SPACE)
router.post('/v1/contacts/:contactId/offers/sync', async (req, res) => {
    const id = req.params.contactId;
    console.log(`[CONTROLLER] POST /v1/contacts/${id}/offers/sync`);
    try {
        const scenario = await useCase.syncCampaigns({ contactID: id });
        sendScenarioResponse(res, scenario);
    } catch (error) {
        console.error('[CONTROLLER] Error:', error.message);
        res.status(500).send({ errorCode: 'GENERIC_ERROR', message: error.message });
    }
});

// POST /v1/customers/:customerId/offers/sync – External consumer
router.post('/v1/customers/:customerId/offers/sync', async (req, res) => {
    const id = req.params.customerId;
    console.log(`[CONTROLLER] POST /v1/customers/${id}/offers/sync`);
    try {
        const scenario = await useCase.syncCampaigns({ customerId: id });
        sendScenarioResponse(res, scenario);
    } catch (error) {
        console.error('[CONTROLLER] Error:', error.message);
        res.status(500).send({ errorCode: 'GENERIC_ERROR', message: error.message });
    }
});

module.exports = router;
