from typing import TypedDict
from langgraph.graph import StateGraph, START, END
from main import generate_sql, validate_sql, execute_sql, llm, get_database_schema

class State(TypedDict):
    question:str
    schema: str
    intent: str
    complexity: str
    sql_query: str
    sql_queries: list[str]
    validation_error: str
    validation_errors: list[str]
    query_result: str
    query_results: list[str]
    analysis: str
    retry_count: int
    

# Schema Node 
def schema_node(state: State):

    print("\nSchema Node chal raha hai...")

    schema = get_database_schema()

    return {
        "schema": schema
    }


# Planner Node
def planner_node(state: State):

    print("\nPlanner Node chal raha hai...")

    question = state["question"]

    prompt = f"""
You are an AI Data Analyst Planner.

Your job is to understand the user's question
and classify it before SQL generation.

USER QUESTION:
{question}

Decide:

1. intent
2. complexity

Possible intents:

- total_sales
- monthly_sales
- yearly_sales
- profit
- sales_decline
- product_analysis
- customer_analysis
- region_analysis
- other

Complexity:

- simple
- complex

Use "simple" when one SQL query should normally
be enough to answer the question.

Use "complex" when the question requires
multiple analyses or multiple SQL queries.

For example:

Question:
"2026 mein total sales kitni hui?"

Output:
intent: total_sales
complexity: simple

Question:
"March ke baad sales kyu gir gayi?"

Output:
intent: sales_decline
complexity: complex

Return ONLY in this exact format:

intent: <intent>
complexity: <complexity>
"""

    response = llm.invoke(prompt)

    content = response.content.strip()

    lines = content.splitlines()

    intent = ""
    complexity = ""

    for line in lines:

        if line.lower().startswith("intent:"):
            intent = line.split(":", 1)[1].strip()

        elif line.lower().startswith("complexity:"):
            complexity = line.split(":", 1)[1].strip()

    return {
        "intent": intent,
        "complexity": complexity
    }

# Query Planner Node 
def query_planner_node(state: State):

    print("\nQuery Planner Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    intent = state["intent"]

    prompt = f"""
You are an AI Data Analyst Query Planner.

USER QUESTION:
{question}

INTENT:
{intent}

DATABASE SCHEMA:
{schema}

The user has asked a complex business question.

Your job is to decide what SQL analyses are required
to answer the question properly.

For example, if the user asks:

"2026 mein March ke baad sales kyu gir gayi?"

You may need:
1. Monthly sales
2. Product/category sales
3. Region-wise sales
4. Number of orders

Rules:

1. Use only tables and columns from the provided schema.
2. Do not invent tables or columns.
3. Generate ONLY analysis tasks.
4. Do not generate SQL yet.
5. Return one task per line.
6. Keep tasks short and clear.

Return ONLY the analysis tasks.
"""

    response = llm.invoke(prompt)

    tasks = [
        line.strip()
        for line in response.content.splitlines()
        if line.strip()
    ]

    return {
        "sql_queries": tasks
    }




def clean_sql(sql_query):
    sql_query = sql_query.strip()

    if sql_query.startswith("```sql"):
        sql_query = sql_query[6:]

    if sql_query.endswith("```"):
        sql_query = sql_query[:-3]

    return sql_query.strip()


# Multiple SQL Generator Node
def multiple_sql_node(state: State):

    print("\nMultiple SQL Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    tasks = state["sql_queries"]

    sql_queries = []

    for task in tasks:

        prompt = f"""
You are an AI Data Analyst SQL Generator.

USER QUESTION:
{question}

DATABASE SCHEMA:
{schema}

ANALYSIS TASK:
{task}

Generate one valid MySQL SELECT query
to perform this analysis.

Rules:

1. Generate only SELECT query.
2. Use only tables and columns from the schema.
3. Do not invent tables or columns.
4. Use MySQL syntax.
5. For sales/revenue, use:
   quantity * unit_price
6. Exclude cancelled orders from sales calculations.
7. Return ONLY the SQL query.
"""

        response = llm.invoke(prompt)

        sql = response.content.strip()

        sql = clean_sql(sql)

        sql_queries.append(sql)

    return {
        "sql_queries": sql_queries
    }


# Multiple SQL Validation Node
def multiple_validate_node(state: State):

    print("\nMultiple Validate Node chal raha hai...")

    sql_queries = state["sql_queries"]

    validation_errors = []

    for sql in sql_queries:

        try:
            validate_sql(sql)

            validation_errors.append("")

        except ValueError as e:

            validation_errors.append(str(e))

    return {
        "validation_errors": validation_errors
    }

def multiple_validation_router(state: State):

    print("\nMultiple Validation Router chal raha hai...")

    validation_errors = state["validation_errors"]

    has_error = any(
        error != ""
        for error in validation_errors
    )

    if has_error:
        return "fix"

    return "execute"


def multiple_execute_node(state: State):
    print("\nMultiple Execute Node chal raha hai...")

    sql_queries = state["sql_queries"]

    query_results = []

    for sql in sql_queries:
        try:
            result = execute_sql(sql)
            query_results.append(str(result))

        except Exception as e:
            query_results.append(
                f"SQL execution failed: {str(e)}"
            )

    return {
        "query_results": query_results
    }

def fix_sql_node(state: State):

    print("\nFix SQL Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    sql_queries = state["sql_queries"]
    query_results = state["query_results"]
    validation_errors = state.get("validation_errors", [])

    retry_count = state.get("retry_count", 0)

    fixed_sql_queries = []

    for i, sql in enumerate(sql_queries):

        execution_error = ""

        if i < len(query_results):
            execution_error = query_results[i]

        validation_error = ""

        if i < len(validation_errors):
            validation_error = validation_errors[i]

    # Agar validation aur execution dono successful hain
        if validation_error == "" and (
        execution_error == ""
        or not execution_error.startswith("SQL execution failed:")
        ):
            fixed_sql_queries.append(sql)
            continue

        print(f"\nSQL {i + 1} mein error mila. Fix kar rahe hain...")

        prompt = f"""
You are an expert MySQL SQL debugger.

USER QUESTION:
{question}

DATABASE SCHEMA:
{schema}

FAILED SQL:
{sql}

VALIDATION ERROR:
{validation_error}

MYSQL ERROR:
{execution_error}

Fix this SQL query.

Rules:
1. Return ONLY the corrected SQL query.
2. Generate only SELECT queries.
3. Use only tables and columns from the schema.
4. Do not invent tables or columns.
5. Use valid MySQL 8 syntax.
6. Sales/revenue = quantity * unit_price.
7. Exclude cancelled orders from sales calculations.
8. Do not use reserved MySQL keywords as aliases.
9. Do not explain anything.
"""

        response = llm.invoke(prompt)

        fixed_sql = clean_sql(response.content)

        fixed_sql_queries.append(fixed_sql)

    return {
        "sql_queries": fixed_sql_queries,
        "retry_count": retry_count + 1
    }


def fix_router(state: State):

    retry_count = state.get("retry_count", 0)

    query_results = state["query_results"]

    has_error = any(
        result.startswith("SQL execution failed:")
        for result in query_results
    )

    # Agar koi error nahi hai
    if not has_error:
        return "analyze"

    # Maximum 2 attempts
    if retry_count >= 2:
        print("\nMaximum SQL retry reached.")
        return "analyze"

    return "fix"


# Multiple Analyze Node
def multiple_analyze_node(state: State):
    print("\nMultiple Analyze Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    query_results = state["query_results"]

    combined_results = ""

    for index, result in enumerate(query_results, start=1):
        combined_results += f"\n\nAnalysis {index} Result:\n{result}"

    prompt = f"""
You are an AI Data Analyst.

USER QUESTION:
{question}

DATABASE SCHEMA:
{schema}

DATABASE ANALYSIS RESULTS:
{combined_results}

Your job is to analyze all the database results together
and give a clear business answer to the user's question.

Rules:

1. Use only the provided database results.
2. Never invent data.
3. Compare the different analysis results when useful.
4. If the user asks "why", explain the possible reasons
   only when they are supported by the database results.
5. Do not generate SQL.
6. Clearly mention important numbers and trends.
7. Keep the answer simple and understandable.
8. If the available data is not enough to determine the exact
   reason, clearly say that.
"""

    response = llm.invoke(prompt)

    return {
        "analysis": response.content
    }

# Planner Router
def planner_router(state: State):

    print("\nPlanner Router chal raha hai...")

    if state["complexity"] == "simple":
        return "simple"

    return "complex"

#sql node
def sql_node(state: State):
    print("\nSQL Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]

    sql = generate_sql(question, schema)

    return {
        "sql_query": sql
    }

# Validate Node  
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


# Validation Router
def validation_router(state: State):
    print("\nValidation Router chal raha hai...")

    if state["validation_error"] == "":
        return "execute"

    return "sql"

# Execute Node
def execute_node(state: State):
    print("\nExecute Node chal raha hai...")

    sql_query = state["sql_query"]

    result = execute_sql(sql_query)

    return {
        "query_result": str(result)
    }

# Analyze Node
def analyze_node(state: State):
    print("\nAnalyze Node chal raha hai...")

    question = state["question"]
    schema = state["schema"]
    result = state["query_result"]

    prompt = f"""
You are an AI Data Analyst.

User Question:
{question}

DATABASE SCHEMA:
{schema}

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
graph_builder.add_node("planner", planner_node)
graph_builder.add_node("query_planner", query_planner_node)
graph_builder.add_node("multiple_sql", multiple_sql_node)
graph_builder.add_node("multiple_validate", multiple_validate_node)
graph_builder.add_node("multiple_execute",multiple_execute_node)
graph_builder.add_node("fix_sql", fix_sql_node)
graph_builder.add_node("multiple_analyze",multiple_analyze_node)
graph_builder.add_node("sql", sql_node)
graph_builder.add_node("validate", validate_node)
graph_builder.add_node("execute", execute_node)
graph_builder.add_node("analyze", analyze_node)




graph_builder.add_edge(START, "schema")
graph_builder.add_edge("schema", "planner")
graph_builder.add_conditional_edges(
    "planner",
    planner_router,
    {
        "simple": "sql",
        "complex": "query_planner"
    }
)
graph_builder.add_edge("query_planner", "multiple_sql")
graph_builder.add_edge("sql", "validate")

# Conditional Edge
graph_builder.add_conditional_edges(
    "validate",
    validation_router,
    {
        "execute": "execute",
        "sql": "sql"
    }
)
graph_builder.add_edge("multiple_sql", "multiple_validate")
graph_builder.add_conditional_edges(
    "multiple_validate",
    multiple_validation_router,
    {
        "fix": "fix_sql",
        "execute": "multiple_execute"
    }
)
graph_builder.add_conditional_edges(
    "multiple_execute",
    fix_router,
    {
        "fix": "fix_sql",
        "analyze": "multiple_analyze"
    }
)
graph_builder.add_edge(
    "fix_sql",
    "multiple_validate"
)
graph_builder.add_edge("execute","analyze")
graph_builder.add_edge("analyze", END)
graph_builder.add_edge("multiple_analyze",END)


# Compile
graph = graph_builder.compile()




result = graph.invoke({
    "question": " 2026 Sales March ke baad kyu gir gayi?",
    "schema": "",
    "intent": "",
    "complexity": "",
    "sql_query": "",
    "validation_error": "",
    "query_result": "",
    "analysis": "",
    "retry_count": 0
    
})


print("\nFinal State:")
print(result)