from typing import List
from core.DB import database


class BaseModel(object):
    def __init__(self, tableName) -> None:
        self.tableName = tableName

    def getIdByFields(self, fields_names, fields_values):
        id = None

        # We want "field_name1=%s AND field_name2=s... AND last_field_name=%s"
        where_clauses = ' AND '.join(map('{0}=%s'.format, fields_names))

        response = database.queryWithParams(
            f"select * from {self.tableName} "
            f"where {where_clauses}", fields_values)

        if len(response):
            id = response[0][0]

        return id

    def createWithFields(self, fields_names: List[str], fields_values: List[str]):
        inserting_values = ', '.join(fields_names)

        # We want "%s, %s, %s..., %s"
        interpolating_values = ', '.join(['%s'] * len(fields_names))

        response = database.queryWithParams(
            f"INSERT INTO {self.tableName}({inserting_values})\n"
            f"VALUES({interpolating_values})\n"
            "RETURNING id", fields_values)

        return response[0][0]

    def getIdByField(self, field_name, field_value):
        id = None
        response = database.queryWithParams(
            f"select * from {self.tableName} "
            f"where {field_name}=%s", [field_value])

        if len(response):
            id = response[0][0]

        return id

    def createWithField(self, field_name, field_value):
        response = database.queryWithParams(
            f"INSERT INTO {self.tableName}({field_name})\n"
            "VALUES(%s)\n"
            "RETURNING id", [field_value])

        return response[0][0]
