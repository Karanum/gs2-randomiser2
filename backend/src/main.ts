import { init } from "./randomiser/main";
import express from "express";
import adminRouter from "./routers/admin";
import permalinkRouter from "./routers/permalink";
import randomiserRouter from "./routers/randomiser";

const app = express();
const port = 8000;

// Set up the randomiser
init();

// Set up the Express server
app.use('/admin', adminRouter);
app.use('/permalink', permalinkRouter);
app.use('/', randomiserRouter);

app.listen(port, () => {
    console.log(`GS2 Randomiser API started listening on port ${port}`);
});