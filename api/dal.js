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
            const result = await client.query("SELECT * FROM reviews")
            return result.rows;
        } catch (err) {
            console.error("Failure getting reviews", err);
            return;
        }finally{
            client.release() //Use release instead of close since this connection came from a pool
        }
    },
    filterReviewsByAuthor: async function(author) {
        const client = await currentPool.connect();
        try {
            const result = await client.query("SELECT * FROM reviews WHERE author = $1", [author]);
            return result.rows;
        } catch (err) {
            console.error("Failure filtering reviews by author", err);
            return;
        } finally {
            client.release();
        }
    },
    filterReviewsByAlley: async function(alley) {
        const client = await currentPool.connect();
        try {
            const result = await client.query("SELECT * FROM reviews WHERE alley = $1", [alley]);
            return result.rows;
        } catch (err) {
            console.error("Failure filtering reviews by alley", err);
            return;
        } finally {
            client.release();
        }
    }

}
export default dal;