import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize SQLite Database
  const db = new Database(":memory:");

  // Create table and seed data
  db.exec(`
    CREATE TABLE cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      model VARCHAR(50),
      year INTEGER,
      price INTEGER,
      transmission VARCHAR(20),
      mileage INTEGER,
      fuelType VARCHAR(20),
      tax INTEGER,
      mpg REAL,
      engineSize REAL
    );

    INSERT INTO cars (model, year, price, transmission, mileage, fuelType, tax, mpg, engineSize) VALUES
    ('5 Series', 2014, 11200, 'Automatic', 67068, 'Diesel', 125, 57.6, 2.0),
    ('6 Series', 2018, 27000, 'Automatic', 14827, 'Petrol', 145, 42.8, 2.0),
    ('5 Series', 2016, 16000, 'Automatic', 62794, 'Diesel', 160, 51.4, 3.0),
    ('1 Series', 2017, 12750, 'Automatic', 26676, 'Diesel', 145, 72.4, 1.5),
    ('7 Series', 2014, 14500, 'Automatic', 39554, 'Diesel', 160, 50.4, 3.0),
    ('5 Series', 2016, 14900, 'Automatic', 35309, 'Diesel', 125, 60.1, 2.0),
    ('5 Series', 2017, 16000, 'Automatic', 38538, 'Diesel', 125, 60.1, 2.0),
    ('2 Series', 2018, 16250, 'Manual', 10401, 'Petrol', 145, 52.3, 1.5),
    ('4 Series', 2017, 14250, 'Manual', 42668, 'Diesel', 30, 62.8, 2.0),
    ('5 Series', 2016, 14250, 'Automatic', 36099, 'Diesel', 20, 68.9, 2.0),
    ('X3', 2017, 15500, 'Manual', 74907, 'Diesel', 145, 52.3, 2.0),
    ('1 Series', 2017, 11800, 'Manual', 29840, 'Diesel', 20, 68.9, 2.0),
    ('X3', 2016, 15500, 'Automatic', 77823, 'Diesel', 125, 54.3, 2.0),
    ('2 Series', 2015, 10500, 'Manual', 31469, 'Diesel', 20, 68.9, 2.0),
    ('X3', 2017, 22000, 'Automatic', 19057, 'Diesel', 145, 54.3, 2.0),
    ('3 Series', 2017, 16500, 'Manual', 16570, 'Diesel', 125, 58.9, 2.0),
    ('3 Series', 2017, 14250, 'Automatic', 55594, 'Other', 135, 148.7, 2.0),
    ('3 Series', 2017, 16000, 'Automatic', 45456, 'Diesel', 30, 64.2, 2.0),
    ('1 Series', 2017, 15500, 'Automatic', 22812, 'Diesel', 20, 68.9, 1.5),
    ('4 Series', 2014, 14000, 'Automatic', 47348, 'Diesel', 125, 60.1, 2.0),
    ('1 Series', 2015, 9700, 'Automatic', 75124, 'Diesel', 20, 70.6, 2.0),
    ('3 Series', 2015, 12600, 'Automatic', 78957, 'Diesel', 30, 62.8, 2.0),
    ('3 Series', 2016, 15100, 'Automatic', 29213, 'Diesel', 30, 64.2, 2.0),
    ('1 Series', 2016, 9400, 'Manual', 44498, 'Diesel', 0, 83.1, 1.5),
    ('1 Series', 2016, 14300, 'Automatic', 22461, 'Diesel', 20, 67.3, 2.0),
    ('1 Series', 2016, 11200, 'Manual', 23005, 'Petrol', 125, 53.3, 1.5),
    ('3 Series', 2019, 17800, 'Automatic', 22310, 'Diesel', 145, 64.2, 2.0),
    ('3 Series', 2016, 14400, 'Automatic', 51994, 'Diesel', 30, 62.8, 2.0),
    ('X5', 2016, 19750, 'Automatic', 96213, 'Diesel', 165, 52.3, 2.0),
    ('X3', 2015, 17400, 'Automatic', 50316, 'Diesel', 200, 47.9, 3.0),
    ('4 Series', 2017, 16800, 'Automatic', 44011, 'Diesel', 150, 65.7, 2.0),
    ('X4', 2017, 23000, 'Automatic', 34960, 'Diesel', 150, 54.3, 2.0),
    ('i3', 2016, 17100, 'Automatic', 25269, 'Other', 0, 470.8, 0.6),
    ('1 Series', 2017, 20500, 'Automatic', 24029, 'Petrol', 145, 39.8, 3.0),
    ('1 Series', 2017, 11900, 'Manual', 22920, 'Petrol', 145, 53.3, 1.5),
    ('2 Series', 2017, 13000, 'Automatic', 61818, 'Other', 0, 141.2, 1.5),
    ('3 Series', 2015, 11500, 'Manual', 59634, 'Diesel', 125, 61.4, 2.0),
    ('1 Series', 2016, 13500, 'Manual', 29226, 'Diesel', 30, 62.8, 2.0),
    ('X1', 2017, 18900, 'Automatic', 33514, 'Diesel', 145, 60.1, 2.0),
    ('1 Series', 2018, 14600, 'Automatic', 6522, 'Petrol', 145, 37.2, 1.5),
    ('3 Series', 2016, 15800, 'Manual', 11231, 'Petrol', 145, 47.9, 2.0),
    ('1 Series', 2016, 11400, 'Manual', 21591, 'Petrol', 125, 53.3, 1.5),
    ('X3', 2013, 12000, 'Automatic', 79972, 'Diesel', 200, 47.1, 3.0),
    ('1 Series', 2018, 17500, 'Automatic', 14037, 'Petrol', 145, 54.3, 1.5),
    ('5 Series', 2017, 23500, 'Automatic', 25034, 'Diesel', 200, 47.9, 3.0),
    ('X1', 2016, 16700, 'Automatic', 44478, 'Diesel', 125, 60.1, 2.0),
    ('X3', 2017, 18000, 'Automatic', 74852, 'Diesel', 150, 47.1, 3.0),
    ('4 Series', 2016, 15500, 'Automatic', 45856, 'Diesel', 30, 65.7, 2.0),
    ('1 Series', 2016, 9200, 'Manual', 48858, 'Diesel', 0, 83.1, 1.5),
    ('1 Series', 2017, 11200, 'Manual', 40399, 'Diesel', 145, 68.9, 2.0),
    ('1 Series', 2016, 13200, 'Manual', 17393, 'Diesel', 30, 65.7, 2.0),
    ('5 Series', 2014, 11000, 'Automatic', 84816, 'Diesel', 30, 62.8, 2.0),
    ('3 Series', 2017, 18500, 'Automatic', 27139, 'Diesel', 160, 51.4, 3.0),
    ('1 Series', 2017, 12750, 'Automatic', 91563, 'Diesel', 125, 60.1, 2.0),
    ('3 Series', 2014, 14000, 'Manual', 32139, 'Petrol', 205, 43.5, 2.0),
    ('X1', 2017, 14000, 'Automatic', 54120, 'Diesel', 30, 65.7, 2.0),
    ('X1', 2017, 14000, 'Manual', 20925, 'Diesel', 150, 68.9, 2.0),
    ('3 Series', 2016, 12750, 'Manual', 30521, 'Diesel', 20, 68.9, 2.0),
    ('X1', 2018, 18000, 'Manual', 16066, 'Petrol', 150, 51.4, 1.5),
    ('1 Series', 2015, 11100, 'Manual', 11524, 'Diesel', 0, 83.1, 1.5),
    ('1 Series', 2017, 12700, 'Manual', 21809, 'Petrol', 145, 53.3, 1.5),
    ('1 Series', 2017, 14500, 'Automatic', 27245, 'Diesel', 145, 68.9, 2.0),
    ('3 Series', 2013, 12750, 'Automatic', 35736, 'Diesel', 125, 58.9, 2.0),
    ('X1', 2017, 14100, 'Automatic', 55782, 'Diesel', 145, 65.7, 2.0),
    ('1 Series', 2016, 10800, 'Manual', 26404, 'Petrol', 125, 53.3, 1.5),
    ('1 Series', 2016, 13000, 'Manual', 26631, 'Petrol', 125, 52.3, 1.5),
    ('1 Series', 2016, 12500, 'Manual', 24111, 'Petrol', 145, 47.1, 1.6),
    ('3 Series', 2017, 13600, 'Manual', 22763, 'Petrol', 145, 48.7, 2.0),
    ('3 Series', 2016, 12700, 'Manual', 17385, 'Diesel', 20, 72.4, 2.0),
    ('5 Series', 2016, 15600, 'Automatic', 35474, 'Diesel', 125, 60.1, 2.0),
    ('4 Series', 2016, 15250, 'Manual', 16584, 'Diesel', 30, 62.8, 2.0),
    ('1 Series', 2018, 11700, 'Manual', 30273, 'Diesel', 145, 53.3, 1.5),
    ('2 Series', 2017, 10900, 'Manual', 62021, 'Diesel', 145, 65.7, 2.0),
    ('5 Series', 2016, 14400, 'Automatic', 51552, 'Diesel', 30, 62.8, 2.0),
    ('1 Series', 2016, 11100, 'Manual', 29508, 'Petrol', 125, 53.3, 1.5),
    ('1 Series', 2017, 11100, 'Manual', 30865, 'Diesel', 145, 72.4, 1.5),
    ('5 Series', 2014, 12400, 'Automatic', 46356, 'Diesel', 30, 62.8, 2.0),
    ('1 Series', 2016, 12800, 'Manual', 18343, 'Diesel', 20, 70.6, 1.5),
    ('5 Series', 2014, 15000, 'Automatic', 13858, 'Diesel', 125, 57.6, 2.0),
    ('2 Series', 2017, 12750, 'Manual', 33752, 'Petrol', 125, 52.3, 1.5),
    ('X3', 2016, 21750, 'Automatic', 19083, 'Diesel', 150, 54.3, 2.0),
    ('2 Series', 2017, 13900, 'Automatic', 46281, 'Petrol', 125, 51.4, 1.5),
    ('X1', 2017, 14000, 'Automatic', 54183, 'Diesel', 150, 65.7, 2.0),
    ('X1', 2017, 15200, 'Automatic', 36701, 'Diesel', 30, 65.7, 2.0),
    ('3 Series', 2017, 13500, 'Automatic', 48082, 'Petrol', 150, 51.4, 2.0),
    ('X1', 2016, 12150, 'Manual', 77482, 'Diesel', 20, 68.9, 2.0),
    ('2 Series', 2017, 16000, 'Automatic', 32389, 'Other', 0, 141.2, 1.5),
    ('5 Series', 2016, 14000, 'Automatic', 39235, 'Diesel', 30, 62.8, 2.0),
    ('3 Series', 2018, 19490, 'Automatic', 30703, 'Diesel', 145, 57.6, 2.0),
    ('1 Series', 2015, 15499, 'Semi-Auto', 20000, 'Diesel', 125, 60.1, 2.0),
    ('2 Series', 2017, 13000, 'Semi-Auto', 34971, 'Diesel', 150, 72.4, 1.5),
    ('1 Series', 2014, 10600, 'Semi-Auto', 44900, 'Diesel', 30, 64.2, 2.0),
    ('X3', 2017, 23000, 'Semi-Auto', 16945, 'Diesel', 150, 54.3, 2.0),
    ('M4', 2016, 29998, 'Semi-Auto', 34209, 'Petrol', 300, 34.0, 3.0),
    ('1 Series', 2017, 12498, 'Manual', 14138, 'Diesel', 20, 72.4, 1.5),
    ('1 Series', 2015, 7948, 'Manual', 74375, 'Diesel', 30, 65.7, 2.0),
    ('X1', 2017, 17800, 'Automatic', 31238, 'Diesel', 145, 55.4, 2.0),
    ('3 Series', 2015, 13100, 'Manual', 37204, 'Diesel', 30, 64.2, 2.0),
    ('1 Series', 2017, 11400, 'Manual', 26265, 'Diesel', 0, 83.1, 1.5),
    ('3 Series', 2016, 14800, 'Automatic', 38838, 'Diesel', 125, 57.6, 2.0),
    ('X3', 2016, 15900, 'Automatic', 59692, 'Diesel', 145, 54.3, 2.0),
    ('3 Series', 2016, 16300, 'Automatic', 34623, 'Diesel', 125, 57.6, 2.0),
    ('3 Series', 2017, 14800, 'Manual', 29968, 'Diesel', 30, 64.2, 2.0),
    ('3 Series', 2017, 19700, 'Automatic', 27748, 'Diesel', 200, 49.6, 3.0),
    ('3 Series', 2015, 14450, 'Automatic', 47288, 'Diesel', 30, 62.8, 2.0),
    ('5 Series', 2016, 13500, 'Automatic', 64117, 'Diesel', 30, 65.7, 2.0),
    ('5 Series', 2015, 10900, 'Automatic', 79563, 'Diesel', 125, 60.1, 2.0),
    ('3 Series', 2016, 12200, 'Manual', 34842, 'Diesel', 30, 67.3, 2.0),
    ('2 Series', 2016, 10600, 'Manual', 24313, 'Diesel', 0, 74.3, 1.5),
    ('2 Series', 2015, 9100, 'Manual', 40789, 'Diesel', 0, 74.3, 1.5),
    ('3 Series', 2017, 12600, 'Automatic', 66743, 'Diesel', 30, 67.3, 2.0),
    ('5 Series', 2016, 13600, 'Automatic', 65612, 'Diesel', 30, 62.8, 2.0),
    ('1 Series', 2016, 11700, 'Manual', 21390, 'Diesel', 20, 72.4, 1.5),
    ('3 Series', 2017, 12450, 'Automatic', 72065, 'Diesel', 20, 70.6, 2.0),
    ('5 Series', 2016, 13500, 'Automatic', 62444, 'Diesel', 125, 60.1, 2.0),
    ('X3', 2013, 12750, 'Automatic', 71558, 'Diesel', 160, 50.4, 2.0),
    ('X1', 2017, 16700, 'Automatic', 34666, 'Diesel', 145, 65.7, 2.0),
    ('1 Series', 2016, 11400, 'Manual', 22920, 'Diesel', 20, 72.4, 1.5),
    ('X5', 2016, 21000, 'Automatic', 71626, 'Other', 0, 85.6, 2.0),
    ('X1', 2017, 14700, 'Manual', 38405, 'Diesel', 145, 68.9, 2.0),
    ('3 Series', 2018, 19000, 'Automatic', 20681, 'Diesel', 145, 64.2, 2.0),
    ('3 Series', 2017, 15400, 'Automatic', 20529, 'Diesel', 145, 65.7, 2.0),
    ('X3', 2016, 19000, 'Automatic', 42691, 'Diesel', 145, 54.3, 2.0),
    ('1 Series', 2018, 15000, 'Automatic', 10058, 'Petrol', 145, 37.2, 1.5),
    ('3 Series', 2016, 17950, 'Automatic', 40337, 'Diesel', 145, 53.3, 3.0),
    ('5 Series', 2018, 22600, 'Automatic', 23195, 'Diesel', 145, 65.7, 2.0),
    ('1 Series', 2017, 13200, 'Manual', 17117, 'Petrol', 145, 53.3, 1.5),
    ('3 Series', 2017, 12750, 'Manual', 22153, 'Diesel', 150, 68.9, 2.0),
    ('3 Series', 2015, 9750, 'Manual', 56038, 'Diesel', 20, 68.9, 2.0),
    ('3 Series', 2017, 10900, 'Automatic', 78345, 'Diesel', 0, 74.3, 2.0),
    ('X4', 2016, 21400, 'Automatic', 31084, 'Diesel', 145, 54.3, 2.0),
    ('1 Series', 2017, 14600, 'Automatic', 5615, 'Petrol', 145, 58.9, 1.5),
    ('3 Series', 2017, 12600, 'Automatic', 55751, 'Petrol', 150, 51.4, 1.5),
    ('X4', 2017, 22500, 'Automatic', 35016, 'Diesel', 150, 54.3, 2.0),
    ('1 Series', 2016, 8000, 'Manual', 81579, 'Diesel', 0, 83.1, 1.5),
    ('X1', 2017, 14800, 'Manual', 31518, 'Diesel', 145, 60.1, 2.0),
    ('1 Series', 2016, 9900, 'Manual', 44008, 'Diesel', 0, 83.1, 1.5),
    ('2 Series', 2016, 9500, 'Manual', 59509, 'Diesel', 20, 68.9, 2.0),
    ('3 Series', 2017, 17950, 'Automatic', 43703, 'Other', 140, 134.5, 2.0),
    ('1 Series', 2016, 14200, 'Automatic', 36858, 'Diesel', 125, 60.1, 2.0),
    ('1 Series', 2016, 12100, 'Automatic', 25786, 'Diesel', 0, 74.3, 2.0),
    ('1 Series', 2016, 12700, 'Automatic', 24592, 'Diesel', 20, 68.9, 2.0),
    ('1 Series', 2016, 8800, 'Manual', 51002, 'Diesel', 0, 83.1, 1.5),
    ('1 Series', 2017, 15000, 'Automatic', 26052, 'Diesel', 145, 68.9, 2.0),
    ('3 Series', 2017, 17100, 'Automatic', 31528, 'Diesel', 145, 64.2, 2.0),
    ('X3', 2017, 21750, 'Automatic', 25776, 'Diesel', 200, 47.9, 3.0),
    ('1 Series', 2016, 13400, 'Manual', 18055, 'Petrol', 125, 52.3, 1.5),
    ('3 Series', 2014, 9900, 'Automatic', 63223, 'Diesel', 20, 68.9, 2.0),
    ('1 Series', 2016, 13700, 'Manual', 8719, 'Petrol', 125, 52.3, 1.5),
    ('4 Series', 2018, 16900, 'Automatic', 27133, 'Petrol', 145, 44.8, 2.0),
    ('5 Series', 2018, 21950, 'Automatic', 21947, 'Diesel', 150, 68.9, 2.0),
    ('X1', 2013, 8750, 'Manual', 80625, 'Diesel', 160, 51.4, 2.0),
    ('3 Series', 2017, 17000, 'Automatic', 31501, 'Other', 0, 134.5, 2.0),
    ('1 Series', 2016, 13750, 'Automatic', 8707, 'Petrol', 30, 55.5, 1.5),
    ('1 Series', 2017, 12800, 'Manual', 10861, 'Petrol', 125, 53.3, 1.5),
    ('4 Series', 2017, 16000, 'Manual', 16359, 'Petrol', 145, 46.3, 2.0),
    ('4 Series', 2017, 16600, 'Automatic', 46913, 'Diesel', 145, 65.7, 2.0),
    ('3 Series', 2017, 15100, 'Manual', 37747, 'Diesel', 125, 60.1, 2.0),
    ('4 Series', 2017, 16750, 'Manual', 24882, 'Petrol', 145, 46.3, 2.0),
    ('1 Series', 2015, 12450, 'Manual', 24474, 'Petrol', 125, 52.3, 1.5),
    ('3 Series', 2018, 15700, 'Automatic', 29394, 'Petrol', 145, 48.7, 2.0),
    ('5 Series', 2016, 12600, 'Manual', 59528, 'Diesel', 125, 60.1, 2.0),
    ('2 Series', 2016, 14600, 'Manual', 15577, 'Petrol', 160, 44.1, 2.0),
    ('X1', 2016, 13700, 'Manual', 52226, 'Diesel', 20, 68.9, 2.0),
    ('3 Series', 2017, 16900, 'Automatic', 12330, 'Diesel', 30, 64.2, 2.0)
  `);

  // API Endpoint to get database schema
  app.get("/api/schema", (req, res) => {
    try {
      const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='cars'").get();
      const sampleData = db.prepare("SELECT * FROM cars LIMIT 3").all();
      res.json({ schema, sampleData });
    } catch (error: any) {
      console.error("Schema Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Endpoint to call Groq AI
  app.post("/api/groq", async (req, res) => {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const SYSTEM_INSTRUCTION = `
You are an AI assistant that converts natural language business questions into SQL queries and dashboard chart suggestions.
The database is SQLite with CASE-SENSITIVE column names.

Database Schema:
Table: cars
Columns (use EXACTLY these names):
- id (INTEGER PRIMARY KEY)
- model (VARCHAR) - car model name
- year (INTEGER) - manufacturing year
- price (INTEGER) - price in currency units
- transmission (VARCHAR) - transmission type (Automatic, Manual, Semi-Auto)
- mileage (INTEGER) - mileage in miles/km
- fuelType (VARCHAR) - fuel type (Diesel, Petrol, Other)
- tax (INTEGER) - tax amount
- mpg (REAL) - miles per gallon
- engineSize (REAL) - engine size in liters

CRITICAL RULES:
1. Use EXACT column names as shown above (case-sensitive)
2. Always use aliases in SELECT that match x_axis and y_axis
3. For aggregations, always use proper SQL functions (AVG, SUM, COUNT, etc.)
4. Test your SQL mentally before responding

Example Queries:
- "Average price of all cars" → SELECT AVG(price) AS average_price FROM cars
- "Count by fuel type" → SELECT fuelType AS fuel_type, COUNT(*) AS count FROM cars GROUP BY fuelType
- "Price by year" → SELECT year, AVG(price) AS average_price FROM cars GROUP BY year ORDER BY year

Instructions:
1. Read the user's question carefully
2. Generate a correct SQL query using EXACT column names
3. Suggest the best chart type for visualization
4. IMPORTANT: Aliases in SQL MUST match x_axis and y_axis names

Chart Selection Rules:
* Single number (e.g., "What is the average price?") → use "metric"
* Time/year/trend → use "line_chart"
* Comparing categories (model, transmission, fuelType) → use "bar_chart"
* Distribution/breakdown/share → use "pie_chart"

Response Format (JSON only):
{
  "sql_query": "SELECT column AS alias FROM cars ...",
  "chart_type": "bar_chart / line_chart / pie_chart / metric",
  "x_axis": "alias_for_x",
  "y_axis": "alias_for_y"
}

If the question cannot be answered:
{
  "error": "Data not available for this query"
}
`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: SYSTEM_INSTRUCTION
            },
            {
              role: "user",
              content: question
            }
          ],
          model: "llama-3.3-70b-versatile",
          stream: false,
          temperature: 0,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);
        return res.status(response.status).json({ error: `Groq API error: ${response.statusText}` });
      }

      const groqData = await response.json();
      const content = groqData.choices[0]?.message?.content;
      
      if (!content) {
        return res.status(500).json({ error: 'No response from Groq API' });
      }

      // Parse JSON from response
      const parsedData = JSON.parse(content);
      console.log('Generated SQL:', parsedData.sql_query);
      res.json(parsedData);
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API Endpoint to execute SQL
  app.post("/api/execute-sql", (req, res) => {
    const { sql } = req.body;
    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    try {
      // Basic security check: only allow SELECT
      if (!sql.trim().toUpperCase().startsWith("SELECT")) {
        return res.status(403).json({ error: "Only SELECT queries are allowed" });
      }

      const stmt = db.prepare(sql);
      const rows = stmt.all();
      res.json({ data: rows });
    } catch (error: any) {
      console.error("SQL Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
