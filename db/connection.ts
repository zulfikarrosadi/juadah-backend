import { createPool } from "mysql2/promise";
import "dotenv/config";

const connection = createPool({
	database: process.env.MYSQL_DATABASE,
	user: process.env.DB_USER,
	password: process.env.MYSQL_ROOT_PASSWORD,
	host: process.env.DB_HOST,
	port: 3306,
});

export default connection;
