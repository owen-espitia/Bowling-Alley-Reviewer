import { Pool } from "pg";
const AUTH_USER_POOL = new Pool({
    host: "localhost",
    port: 5432, //Standard port, if err check if the port has been modified
    database: "alleys", //PLACEHOLDER, SWAP ALL VARIABLES!
    user: "auth_user",
    password: "authpass"
});
const NON_AUTH_USER_POOL = new Pool({
    host: "localhost",
    port: 5432, 
    database: "alleys", 
    user: "non_auth_user", //
    password: "non_authpass" //
});
let currentPool = NON_AUTH_USER_POOL;
const placeholderuser = {
    _id: "c0a2ab55-5f85-49aa-afc9-737f91b7eb03",
    username: "devJerry",
    password: "pass123"
}
let dal = {
    swapPool: async function() {
        if ( currentPool === NON_AUTH_USER_POOL){
            currentPool = AUTH_USER_POOL;
        } else {
            currentPool = NON_AUTH_USER_POOL;
        }
        return currentPool;
    },
    getAllReviews: async function() {
        const client = await currentPool.connect();
        try {
            const result = await client.query(`
                SELECT reviews.*, alleys.name AS alley_name, users.username AS author_name
                FROM reviews
                LEFT JOIN alleys ON reviews.alley_id = alleys._id
                LEFT JOIN users ON reviews.author_id = users._id
            `);
            return result.rows;
        } catch (err) {
            console.error("Failure getting reviews", err);
            return;
        } finally {
            client.release();
        }
    },
    getSpecificReview: async function(_id) {
        const client = await currentPool.connect();
        try {
            const result = await client.query(`
                SELECT reviews.*, alleys.name AS alley_name, users.username AS author_name
                FROM reviews
                LEFT JOIN alleys ON reviews.alley_id = alleys._id
                LEFT JOIN users ON reviews.author_id = users._id
                WHERE reviews._id = $1
            `, [_id]);
            return result.rows;
        } catch (err) {
            console.error("Failure filtering reviews by ID", err);
            return;
        } finally {
            client.release();
        }
    },
    filterReviewsByAuthor: async function(author) {
        const client = await currentPool.connect();
        try {
            const result = await client.query(`
                SELECT reviews.*, alleys.name AS alley_name, users.username AS author_name
                FROM reviews
                LEFT JOIN alleys ON reviews.alley_id = alleys._id
                LEFT JOIN users ON reviews.author_id = users._id
                WHERE users.username = $1
            `, [author]);
            return result.rows;
        } catch (err) {
            console.error("Failure filtering reviews by author", err);
            return;
        } finally {
            client.release();
        }
    },
    filterReviewsByAlley: async function(alley_id) {
        const client = await currentPool.connect();
        try {
            const result = await client.query(`
                SELECT reviews.*, alleys.name AS alley_name, users.username AS author_name
                FROM reviews
                LEFT JOIN alleys ON reviews.alley_id = alleys._id
                LEFT JOIN users ON reviews.author_id = users._id
                WHERE reviews.alley_id = $1
            `, [alley_id]);
            return result.rows;
        } catch (err) {
            console.error("Failure filtering reviews by alley", err);
            return;
        } finally {
            client.release();
        }
    },
    getAllAlleys: async function() {
        const client = await currentPool.connect();
        try {
            const result = await client.query("SELECT _id, name FROM alleys ORDER BY name");
            return result.rows;
        } catch (err) {
            console.error("Failure getting alleys", err);
            return;
        } finally {
            client.release();
        }
    },
    addReview: async function(review, author) {
        author = placeholderuser; //Replace soon....
        const client = await currentPool.connect();
        try {
            const result = await client.query("INSERT INTO reviews (alley_id, author_id, rating, review_story) VALUES ($1, $2, $3, $4) RETURNING *", [review.alley_id, author._id, review.rating, review.review_story]);
            return result;
        } catch (err) {
            console.error("Failure adding review", err);
            return;
        } finally {
            client.release();
        }
    }

}
export default dal;