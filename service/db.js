const { MongoClient } = require("mongodb");
const dbConfig = require("./dbConfig.json");

const url = `mongodb+srv://${encodeURIComponent(dbConfig.username)}:${encodeURIComponent(dbConfig.password)}@${dbConfig.hostname}/?retryWrites=true&w=majority&appName=PantryPal`;
const client = new MongoClient(url);
let dbInstance;

async function getDb() {
	if (!dbInstance) {
		await client.connect();
		dbInstance = client.db("pantrypal");
	}
	return dbInstance;
}

module.exports = {
	getDb,
};
