import sys
import os
sys.path.append('db/src/core')
from DB import database


truncate_tables_command = open("db/truncate_db.sql", "r").read()
database.queryWithoutFetch(truncate_tables_command)
print(truncate_tables_command)
