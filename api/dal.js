import { Pool } from "pg";
import bcrypt from "bcryptjs";
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
let dal = {
    getAllReviews: async function() {
        const client = await NON_AUTH_USER_POOL.connect();
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
        const client = await NON_AUTH_USER_POOL.connect();
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
        const client = await NON_AUTH_USER_POOL.connect();
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
    filterReviewsByAlley: async function(alley_name) {
        const client = await NON_AUTH_USER_POOL.connect();
        try {
            const target_alleys = await client.query("SELECT _id FROM alleys WHERE name = $1", [alley_name]);
            if (target_alleys.rows.length === 0){
                return []; //No such alley, fool
            }
            const alley_id = target_alleys.rows[0]._id; //Actually pick out the ID
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
        const client = await NON_AUTH_USER_POOL.connect();
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
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query("INSERT INTO reviews (alley_id, author_id, rating, review_story) VALUES ($1, $2, $3, $4) RETURNING *", [review.alley_id, author._id, review.rating, review.review_story]);
            return result;
        } catch (err) {
            console.error("Failure adding review", err);
            return;
        } finally {
            client.release();
        }
    },
    login: async function (username, password) {
        const client = await NON_AUTH_USER_POOL.connect();
        try {
            const result = await client.query("SELECT * FROM users WHERE username = $1", [username]);
            if (result.rows.length === 0) {
                console.log("DAL: No such user");
                return false;
            }
            const match = await bcrypt.compare(password, result.rows[0].password);
            return match ? result.rows[0] : null;
        } catch (err) {
            console.error("Failure logging in", err);
            return false;
        } finally {
            client.release();
        }
    },
    createUser: async function (username, password) {
        const client = await NON_AUTH_USER_POOL.connect();
        try {
            const hashed = await bcrypt.hash(password, 10);
            const result = await client.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, hashed]);
            return { user: result.rows[0] };
        } catch (err) {
            if (err.code === '23505') return { error: 'username_taken' };
            console.error("Failure creating user", err);
            return { error: 'unknown' };
        } finally {
            client.release();
        }
    },
    getComments: async function (review_id) {
        const client = await NON_AUTH_USER_POOL.connect();
        try {
            const result = await client.query(`
                SELECT comments.*, users.username AS author_name
                FROM comments
                LEFT JOIN users ON comments.author_id = users._id
                WHERE comments.review_id = $1
            `, [review_id]);
            return result.rows;
        } catch (err) {
            console.error("Failure getting comments", err);
            return [];
        } finally {
            client.release();
        }
    },
    editReview: async function (review_id, rating, review_story, author_id) {
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query(
                "UPDATE reviews SET rating = $1, review_story = $2 WHERE _id = $3 AND author_id = $4 RETURNING *",
                [rating, review_story, review_id, author_id]
            );
            return result.rows[0] ?? null;
        } catch (err) {
            console.error("Failure editing review", err);
            return null;
        } finally {
            client.release();
        }
    },
    deleteReview: async function (review_id, author_id) {
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query(
                "DELETE FROM reviews WHERE _id = $1 AND author_id = $2 RETURNING _id",
                [review_id, author_id]
            );
            return result.rowCount > 0;
        } catch (err) {
            console.error("Failure deleting review", err);
            return false;
        } finally {
            client.release();
        }
    },
    editComment: async function (comment_id, content, author_id) {
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query(
                "UPDATE comments SET content = $1 WHERE _id = $2 AND author_id = $3 RETURNING *",
                [content, comment_id, author_id]
            );
            return result.rows[0] ?? null;
        } catch (err) {
            console.error("Failure editing comment", err);
            return null;
        } finally {
            client.release();
        }
    },
    deleteComment: async function (comment_id, author_id) {
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query(
                "DELETE FROM comments WHERE _id = $1 AND author_id = $2 RETURNING _id",
                [comment_id, author_id]
            );
            return result.rowCount > 0;
        } catch (err) {
            console.error("Failure deleting comment", err);
            return false;
        } finally {
            client.release();
        }
    },
    addComment: async function (review, comment, author) {
        //Note that review._id is a FK in the database, as well as author._id!
        const client = await AUTH_USER_POOL.connect();
        try {
            const result = await client.query("INSERT INTO comments (content, review_id, author_id) VALUES ($1, $2, $3) RETURNING *", [comment, review._id, author._id]);
            return result;
        } catch (err) {
            console.error("Failure posting comment", err);
            return;
        } finally {
            client.release();
        }
    }

}
export default dal;