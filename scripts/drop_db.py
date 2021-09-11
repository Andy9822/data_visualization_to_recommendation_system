import sys
import os
sys.path.append('db/src/core')
from DB import database


drop_tables_command = open("db/drop_db.sql", "r").read()
database.queryWithoutFetch(drop_tables_command)
print(drop_tables_command)
