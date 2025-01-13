import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv"; // Add dotenv import

dotenv.config(); // Load environment variables
const dbUrl = process.env.DATABASE_URL; // Check this

import { User } from "./entities/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Set to false in production
    logging: true, // Consider disabling this in production to avoid performance impact
    entities: [
        User,
    ],
    migrations: [], // Ensure the migration folder path is correct
    subscribers: [], // Include subscribers if used
});

AppDataSource.initialize()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));
