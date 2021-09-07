from models.BaseModel import BaseModel


class Title(BaseModel):
    def __init__(self, title_globoplay_id):
        super().__init__('Titles')
        self.title_globoplay_id = str(title_globoplay_id)
        self.title_id = None

    def insert(self):
        title_id = self.getIdByField('title_glbp_id', self.title_globoplay_id)
        if not title_id:
            title_id = self.createWithField(
                'title_glbp_id', self.title_globoplay_id)
        self.title_id = title_id
        return self.title_id
