console.log("API server is runnning on port 3000");

import express from "express";
import pool from 'pg';

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Example app listening on http://localhost:${PORT}`);
});