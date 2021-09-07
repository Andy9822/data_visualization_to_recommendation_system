import psycopg2


class DB:
    def __init__(self):
        self.conn = psycopg2.connect(
            host="127.0.0.1",
            database="postgres",
            user="postgres",
            password="oi")

        self.cur = self.conn.cursor()

    def query(self, text):
        self.cur.execute(text)
        self.conn.commit()
        return self.cur.fetchall()

    def queryWithParams(self, text, params):
        self.cur.execute(text, params)
        self.conn.commit()
        return self.cur.fetchall()

    def __del__(self):
        self.cur.close()
        self.conn.close()


database = DB()
