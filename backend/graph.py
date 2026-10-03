from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from main import generate_sql, validate_sql

class State(TypedDict):
    question:str
    schema: str
    sql_query: str
    validation_error: str


def schema_node(state: State):

    print("\nSchema Node chal raha hai...")

    schema = "customers, products, orders, order_items"

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

    sql_query = state["sql_query"]

    try:
        validate_sql(sql_query)
        return "execute"

    except ValueError:
        return "sql"


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
graph_builder.add_edge("validate", "execute")
graph_builder.add_edge("execute","analyze")
graph_builder.add_edge("analyze", END)
# Compile
graph = graph_builder.compile()




result = graph.invoke({
    "question": "2026 mein total sales kitni hui?",
    "schema": ""
})


print("\nFinal State:")
print(result)