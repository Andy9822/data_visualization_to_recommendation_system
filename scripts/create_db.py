import sys
import os
sys.path.append('db/src/core')
from DB import database


create_tables_commands = open(
    "db/create_db.sql", "r").read().split(" /* end of query */")

for command in create_tables_commands:
    print(command)
    database.queryWithoutFetch(command)
