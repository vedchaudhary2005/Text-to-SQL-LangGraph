from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from main import generate_sql, validate_sql, execute_sql, llm, get_database_schema

class State(TypedDict):
    question:str
    schema: str
    sql_query: str
    validation_error: str
    query_result: str
    analysis: str
    intent: str
    complexity: str


def schema_node(state: State):

    print("\nSchema Node chal raha hai...")

    schema = get_database_schema()

    return {
        "schema": schema
    }


def sql_node(state: State):
    print("\nSQL Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]

    sql = generate_sql(question, schema)

    return {
        "sql_query": sql
    }


def validate_node(state: State):
    print("\nValidate Node chal raha hai...")

    sql_query = state["sql_query"]

    try:
        validate_sql(sql_query)

        return {
            "validation_error": ""
        }

    except ValueError as e:

        return {
            "validation_error": str(e)
        }



def validation_router(state: State):
    print("\nValidation Router chal raha hai...")

    if state["validation_error"] == "":
        return "execute"

    return "sql"


def execute_node(state: State):
    print("\nExecute Node chal raha hai...")

    sql_query = state["sql_query"]

    result = execute_sql(sql_query)

    return {
        "query_result": str(result)
    }


def analyze_node(state: State):
    print("\nAnalyze Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    result = state["query_result"]

    prompt = f"""
You are an AI Data Analyst.

User Question:
{question}

Database Result:
{result}

Analyze the result and give a simple answer to the user.

Rules:
1. Use only the provided database schema and database result.
2. Never invent tables or columns.
3. Never invent data.
4. If the result is empty, clearly say that no matching data was found.
5. If the user asks "why", explain only what can be supported by the available result.
6. If the available result is not enough to determine the cause, clearly say what additional data would be needed.
7. Do not generate SQL in this node.
8. Give a clear, concise business answer.
"""

    response = llm.invoke(prompt)

    return {
        "analysis": response.content
    }




graph_builder = StateGraph(State)


# Add node
graph_builder.add_node("schema",schema_node)
graph_builder.add_node("sql", sql_node)
graph_builder.add_node("validate", validate_node)
graph_builder.add_node("execute", execute_node)
graph_builder.add_node("analyze", analyze_node)


graph_builder.add_edge(START, "schema")
graph_builder.add_edge("schema", "sql")
graph_builder.add_edge("sql", "validate")
graph_builder.add_conditional_edges(
    "validate",
    validation_router,
    {
        "execute": "execute",
        "sql": "sql"
    }
)
graph_builder.add_edge("execute","analyze")
graph_builder.add_edge("analyze", END)
# Compile
graph = graph_builder.compile()




result = graph.invoke({
    "question": " 2026 Sales March ke baad kyu gir gayi?",
    "schema": "",
    "sql_query": "",
    "validation_error": "",
    "query_result": "",
    "analysis": ""
    
})


print("\nFinal State:")
print(result)