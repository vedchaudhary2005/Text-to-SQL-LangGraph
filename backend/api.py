from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from graph import graph
from main import connect_database


app = FastAPI()


class ChatRequest(BaseModel):
    question: str


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

        return {
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