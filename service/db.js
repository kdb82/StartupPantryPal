const { MongoClient } = require("mongodb");
const dbConfig = require("./dbConfig.json");

const url = process.env.MONGODB_URI || `mongodb+srv://${encodeURIComponent(dbConfig.username)}:${encodeURIComponent(dbConfig.password)}@${dbConfig.hostname}/?retryWrites=true&w=majority&appName=PantryPal`;
const dbName = process.env.MONGODB_DB_NAME || dbConfig.dbName || "pantrypal";
const client = new MongoClient(url);
let dbInstance;

async function getDb() {
	if (!dbInstance) {
		try {
			await client.connect();
			dbInstance = client.db(dbName);
		} catch (error) {
			const message = error?.message || "Unknown MongoDB connection error";
			throw new Error(`MongoDB connection failed: ${message}`);
		}
	}
	return dbInstance;
}

module.exports = {
	getDb,
};
