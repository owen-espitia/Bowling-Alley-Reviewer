console.log("API server is runnning on port 3000");

import express from "express";
import pool from 'pg';
import path from 'path';
import dns from 'dns';
import dal from "./dal.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);


const app = express();
const PORT = 3058;

app.use(express.json());
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.get ("/", (req, res) =>{
    res.send("You're not supposed to be here...");
});

app.get("/alleys", async (req, res) => {
    const result = await dal.getAllAlleys();
    console.log(result);
    res.json(result);
});

app.get("/reviews", async (req, res) =>{
    const result = await dal.getAllReviews();
    console.log(result);
    res.json(result);
});

app.get("/reviews/:author", async (req, res) => {
    const result = await dal.filterReviewsByAuthor(req.params.author);
    console.log(result);
    res.json(result); 
});

app.get("/reviews-by-alley/:alley_id", async (req, res) => {
    const result = await dal.filterReviewsByAlley(req.params.alley_id);
    console.log(result);
    res.json(result); 
});

app.get("/switch-pool", async (req, res) => {
    const result = await dal.swapPool();
    console.log(result);
    res.json(result); 
});

app.post("/add-review", async (req, res) => {
    /*
    req.body should look like:
    {
        "alley": "alley",
        "author": "author of the review",
        "rating": "score outta 10",
        "review_story": "description of the review",
        "comments": "list of comments, note that this will be a Foreign key to the comments table. -> Implement later"
    }
    */
    const result = await dal.addReview(req.body);
    console.log(result);
    res.json(result); 
});

app.get("/single-review/:id", async (req, res) => {
    const result = await dal.getSpecificReview(req.params.id);
    console.log(result);
    res.json(result); 
});

app.listen(PORT, () => {
    console.log(`Example app listening on http://localhost:${PORT}`);
});