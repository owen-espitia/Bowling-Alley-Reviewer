console.log("API server is running on port 3058");

import express from "express";
import dns from 'dns';
import dal from "./dal.js";
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = 3058;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

const _authenticateToken = (req, res, next) =>{
    const token = req.cookies.token;
    if ( !token ) {
        return res.status(401).json({error: "Must be logged in to perform this action, FOOL!"});
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(403).json({error: "Invalid token, must relogin"});
    }
};

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

app.get("/reviews-by-alley/:name", async (req, res) => {
    const result = await dal.filterReviewsByAlley(req.params.name);
    console.log(result);
    res.json(result); 
});

// app.get("/switch-pool", async (req, res) => {
//     const result = await dal.swapPool();
//     console.log(result);
//     res.json(result); 
// });

app.post("/add-review", _authenticateToken, async (req, res) => {
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
    const result = await dal.addReview(req.body, req.user);
    console.log(result);
    res.json(result); 
});

app.get("/single-review/:id", async (req, res) => {
    const result = await dal.getSpecificReview(req.params.id);
    console.log(result);
    res.json(result); 
});

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }
    const result = await dal.createUser(username, password);
    if (result.error === 'username_taken') {
        return res.status(409).json({ error: "That username is already taken." });
    }
    if (result.error) {
        return res.status(500).json({ error: "Could not create account." });
    }
    const token = jwt.sign({ _id: result.user._id, username: result.user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("token", token, {
        maxAge: 3600000,
        path: "/",
        httpOnly: true,
        sameSite: "strict"
    });
    return res.status(201).json({ success: true, user: username });
});

app.post("/logout", (req, res) => {
    res.clearCookie("token", { path: "/", httpOnly: true, sameSite: "strict" });
    return res.json({ success: true });
});

app.post("/login", async (req, res) => {
    const result = await dal.login(req.body.username, req.body.password);
    if ( result ) {
        const token = jwt.sign({ _id: result._id, username: result.username }, JWT_SECRET, {expiresIn: "1h"});
        res.cookie("token", token, {
            maxAge: 3600000,
            path: "/",
            httpOnly: true,
            sameSite: "strict"
        });
        return res.json({success: true, user: result.username});
    }
    return res.status(401).json({error: "Invalid credentials.. FOOL!"});
});


app.listen(PORT, () => {
    console.log(`Example app listening on http://localhost:${PORT}`);
});