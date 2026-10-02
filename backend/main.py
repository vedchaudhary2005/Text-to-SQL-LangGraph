from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import os

load_dotenv()
MYSQL_HOST = os.getenv("MYSQL_HOST")
MYSQL_PORT = os.getenv("MYSQL_PORT")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")

DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}"
    f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"
)

engine = create_engine(DATABASE_URL)

with engine.connect() as connection:
    print("MySQL Connected!")


def get_database_schema():
    inspector = inspect(engine)

    tables = inspector.get_table_names()

    schema = ""

    for table in tables:
        schema += f"\nTable: {table}\n"
        schema += "Columns:\n"

        columns = inspector.get_columns(table)

        for column in columns:
            schema += f"- {column['name']} ({column['type']})\n"

    return schema


llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY")
)

def generate_sql(question, schema):

    prompt = f"""
You are an AI Data Analyst.

Your job is to convert the user's natural language question
into a valid MySQL SQL query.

DATABASE SCHEMA:

{schema}


USER QUESTION:

{question}


RULES:

1. Generate only a SELECT query.
2. Do not generate INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE.
3. Use only tables and columns that exist in the provided schema.
4. Use proper MySQL syntax.
5. Return ONLY the SQL query.
"""

    
    response = llm.invoke(prompt)

    return response.content.strip()

# SQL VALIDATOR
def validate_sql(sql_query):

    sql = sql_query.strip().lower()

    # Query must start with SELECT
    if not sql.startswith("select"):

        raise ValueError(
            "Only SELECT queries are allowed."
        )


    # Dangerous SQL keywords
    forbidden_keywords = [

        "insert",
        "update",
        "delete",
        "drop",
        "alter",
        "truncate",
        "create"

    ]


    # Check forbidden keywords
    for keyword in forbidden_keywords:

        if keyword in sql:

            raise ValueError(
                f"Unsafe SQL detected: {keyword}"
            )


    return True



def execute_sql(sql_query):

    with engine.connect() as connection:

        result = connection.execute(text(sql_query))

        rows = result.fetchall()

        return rows




if __name__ == "__main__":

    # Get database schema
    schema = get_database_schema()

    print("\n========== DATABASE SCHEMA ==========")
    print(schema)

    # Test question
    question = "2026 mein total sales kitni hui?"

    print("\n========== USER QUESTION ==========")
    print(question)

    # Generate SQL
    sql_query = generate_sql(question, schema)

    # Execute SQL
    result = execute_sql(sql_query)
    print("\n========== DATABASE RESULT ==========")
    print(result)

    print("\n========== GENERATED SQL ==========")
    print(sql_query)