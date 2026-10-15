import bodyParser from "body-parser";
import { Router } from "express";

const router = Router();

router.post('/generate', (req, res) => {

});

router.post('/spoiler_log', (req, res) => {
    
});

router.post('/generate_archipelago', bodyParser.raw({ type: 'application/octet-stream' }), (req, res) => {

});

export default router;