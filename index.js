import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import connection from "./lib/redis.js";
import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });


import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";





const queue = new Queue("file-upload-queue", {
    connection,

});




const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

//multer storage engine

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });



app.get("/", (req, res) => {
    res.send("Working!!");
});


app.post("/upload", upload.single("pdf"), (req, res) => {
    queue.add("file-upload", JSON.stringify({
        filename: req.file.filename,
        path: req.file.path,
        destination: req.file.destination,
        originalname: req.file.originalname,
        size: req.file.size,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
    }));
    const file = req.file;
    if (!file) {
        return res.status(400).send("Please upload a file");
    }
    return res.status(200).send({
        message: "File uploaded successfully",
        data: file
    });
});

app.get("/chat", async (req, res) => {
    const question = req.query.question || "RAG"
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-004",
        configuration: {
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        },
    });
    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName: "pdf_docs",
        checkCompatibility: false,
    });
    const r = await vectorStore.asRetriever({ k: 20 });
    const result = await r.invoke(question);
    // console.log(result);

    const SYSTEM_PROMPT = `
  You are helpfull AI Assistant who answers the question basen the available context from PDF File.
  Context:
  ${JSON.stringify(result)}
  `;
    const chatResult = await openai.chat.completions.create({
        model: "gemini-2.0-flash",
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: question },
        ],
    });

    return res.json({
        message: chatResult.choices[0].message.content,
        docs: result,
    });

});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
