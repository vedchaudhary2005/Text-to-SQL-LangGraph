from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv
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
    result = connection.execute(text("SELECT 1"))
    print("MySQL Connected:", result.scalar())



#Database schema inspect 
inspector = inspect(engine)

tables = inspector.get_table_names()
print("Tables:", tables)

for table in tables:
    print(f"\n--- {table} ---")

    columns = inspector.get_columns(table)

    for column in columns:
        print(
            column["name"],
            "|",
            column["type"]
              )