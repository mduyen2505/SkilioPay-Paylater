import { Router } from "express";
import PayLaterController from "../controllers/paylaterCtr";
import store from "../../data/mock_store";

const router = Router();

// User endpoints
router.get("/users", PayLaterController.getUsers);
router.get("/users/:user_id/carts", PayLaterController.getCarts);
router.get("/eligibility", PayLaterController.checkEligibility);
router.post("/agreement", PayLaterController.createAgreement);
router.get("/agreement/:agreementId", PayLaterController.getAgreement);

// Instalment update (simulate/retry/failure from dev UI)
router.patch("/agreement/:agreementId/instalment/:idx", PayLaterController.updateInstalment);
router.post("/agreement/:agreementId/retry", PayLaterController.retryInstalment);
router.post("/agreement/:agreementId/fail", PayLaterController.failInstalment);

// Activity log
router.get("/activity-log", PayLaterController.getActivityLog);

// Dev/test routes: scenario select, seed/reset
router.get("/dev/scenarios", PayLaterController.getAllScenarios);
router.post("/dev/scenario/select", PayLaterController.selectScenario);
router.post("/dev/reset", PayLaterController.resetSeed);

export default router;
