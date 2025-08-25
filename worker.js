import {Worker} from "bullmq";
import connection from "./lib/redis.js";
import {QdrantVectorStore} from "@langchain/qdrant";
import {OpenAIEmbeddings} from "@langchain/openai";
import {Document} from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";



const worker = new Worker("file-upload-queue", async (job) => {
    const data = JSON.parse(job.data);
    console.log(data);
    const loader = new PDFLoader(data.path);
    const documents = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 50,
      });
      const chunks = await splitter.splitDocuments(documents);
      console.log(chunks.length);

    
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        model: "text-embedding-004", 
        configuration: {
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        },
      });
    //   const client = new QdrantClient({
    //     url: 'https://1fcff66a-7025-43a5-9bfb-8d2fb1bda8a7.us-east4-0.gcp.cloud.qdrant.io:6333',
    //     apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.BFQwqquEtmKjYy_lNjXSt6Xz2Q5m9oO0DGO0SxIHI7Q',
    // });
    // const vectorStore = new QdrantVectorStore(documents,embeddings, {
    //     client,
    //     collectionName: "pdf-embeddings",
    // });
    const vectorStore = await QdrantVectorStore.fromDocuments(chunks, embeddings, {
        url: "https://1fcff66a-7025-43a5-9bfb-8d2fb1bda8a7.us-east4-0.gcp.cloud.qdrant.io:6333",      
        apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.BFQwqquEtmKjYy_lNjXSt6Xz2Q5m9oO0DGO0SxIHI7Q",
        collectionName: "pdf_docs",
        checkCompatibility: false,
      });
//    console.log(vectorStore);
    console.log("Stored embeddings into Qdrant!");
    await vectorStore.addDocuments(chunks);
    console.log(`All docs are added to vector store`);
}, {
    connection,
    concurrency: 100
});

/**
     * path: data.path
     * read the pdf from path,
     * chunk the pdf
     * call the openai embedding model for every chunk
     * store the embedding in vector db(qdrant)
     */