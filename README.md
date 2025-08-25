# ai_chat_with_pdf_using_rag_vector_db

uploading pdf embedding with the help of rag and store it in vector db(qdrant) and response / retrive with the help of llm(gemini apy key with openai ). used bullmq for queue processing and ioredis for redis connection. used langchain for rag and vector db(qdrant). used multer for file upload.

RAG is a technique that uses machine learning to extract relevant information from a large dataset and provide a personalized response to a user's query.

vector db is a database that stores data in a vector space, where each data point is represented as a vector of numbers. 

system prompt is a prompt that is used to guide the behavior of a language model. It is a way to provide context and instructions to the model so that it can generate responses that are relevant and appropriate to the task at hand.

embedding is a process of converting text into a numerical representation that can be used to measure the similarity between different pieces of text.

llm is a language model that is used to generate responses to user queries. It is a type of artificial intelligence that is designed to understand and generate human-like text based on the input it receives.

## Tech Stack

- Nodejs
- Express
- Multer
- Bullmq
- Ioredis
- Langchain
- Openai
- Qdrant
- Pdf-parse

## Setup

- install dependencies
- setup redis
- setup qdrant
- setup openai
- setup multer
- setup bullmq
- setup ioredis



## Flow

Upload pdf
queue added to redis
worker process the queue
file processing
split the pdf
chunk the pdf
openai embedding for every chunk
store the embedding in vector db(qdrant)
in chat pass the query to openai and get the response

## API

- POST /upload
- GET /chat

## Example

- POST /upload
- GET /chat?question=socketIO

## License

ISC

