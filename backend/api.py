from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
from graph import graph



app = FastAPI()

class ChatRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "AI Data Analyst API is running"
    }


@app.post("/chat")
def chat(request: ChatRequest):

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