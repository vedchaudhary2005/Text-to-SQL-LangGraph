from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uuid
from graph import graph
from main import connect_database, save_conversation, conversations_collection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://text-to-sql-langgraph.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    conversation_id: str | None = None


class DatabaseRequest(BaseModel):
    host: str
    port: int = 3306
    username: str
    password: str
    database: str


@app.get("/")
def home():
    return {
        "message": "AI Data Analyst API is running"
    }


@app.post("/connect-database")
def connect_db(request: DatabaseRequest):

    try:
        connect_database(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database=request.database
        )

        return {
            "success": True,
            "message": "Database connected successfully"
        }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Database connection failed: {str(e)}"
        )


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        result = graph.invoke({
            "question": request.question,
            "schema": "",
            "intent": "",
            "complexity": "",
            "sql_query": "",
            "sql_queries": [],
            "validation_error": "",
            "validation_errors": [],
            "query_result": "",
            "query_results": [],
            "analysis": "",
            "retry_count": 0
        })

        save_conversation(
            conversation_id,
            result["question"],
            result["analysis"]
        )

        return {
            "conversation_id": conversation_id,
            "question": result["question"],
            "intent": result["intent"],
            "complexity": result["complexity"],
            "answer": result["analysis"],
            "sql_query": result["sql_query"],
            "sql_queries": result["sql_queries"],
            "query_result": result["query_result"],
            "query_results": result["query_results"]
        }

   

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Something went wrong: {str(e)}"
        )



@app.get("/conversations/{conversation_id}")
def get_conversation(conversation_id: str):
    conversation = conversations_collection.find_one(
        {"conversation_id": conversation_id},
        {"_id": 0}
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    return conversation

@app.get("/conversations")
def get_conversations():
    conversations = conversations_collection.find(
        {},
        {
            "_id": 0,
            "conversation_id": 1,
            "title":1,
            "messages": 1
        }
    ).sort("_id", -1)

    return list(conversations)