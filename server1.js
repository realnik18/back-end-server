const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin,Accept,X-Requested-With,Content-Type,Access-Control-Request-Method,Access-Control-Request-Headers"
    );
    next();
});

// MongoDB connection
const mongoURL = "mongodb+srv://admin:MDX2025@twitterclonecluster.b826976.mongodb.net/"; // Update with your credentials
const client = new MongoClient(mongoURL);
let db;

// Connect to MongoDB
client.connect()
    .then(() => {
        db = client.db("testweek8");
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the TestWeek8 API!");
});

// GET all documents from testdata collection
app.get('/collection/testdata', async (req, res, next) => {
    try {
        const results = await db.collection('testdata').find({}).toArray();
        res.json(results);
    } catch (e) {
        next(e);
    }
});

// POST: Add a new document to testdata collection
app.post('/collection/testdata', async (req, res, next) => {
    try {
        const result = await db.collection('testdata').insertOne(req.body);
        res.status(201).json({ message: "Document added successfully", result });
    } catch (e) {
        next(e);
    }
});

// GET: Fetch a single document by ID
app.get('/collection/testdata/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await db.collection('testdata').findOne({ _id: new ObjectId(id) });

        if (!result) {
            return res.status(404).json({ error: "Document not found" });
        }

        res.json(result);
    } catch (err) {
        next(err);
    }
});

// PUT: Update a document by ID
app.put('/collection/testdata/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await db.collection('testdata').updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );

        if (result.modifiedCount === 1) {
            res.json({ message: "Document updated successfully" });
        } else {
            res.status(404).json({ error: "Document not found or no changes made" });
        }
    } catch (e) {
        next(e);
    }
});

// DELETE: Remove a document by ID
app.delete('/collection/testdata/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        const result = await db.collection('testdata').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            res.json({ message: "Document deleted successfully" });
        } else {
            res.status(404).json({ error: "Document not found" });
        }
    } catch (e) {
        next(e);
    }
});

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error
    res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
