from models.BaseModel import BaseModel


class GenreTitle(BaseModel):
    def __init__(self, genre_id, title_id):
        super().__init__('GenreTitles')
        self.genre_id = str(genre_id)
        self.title_id = str(title_id)

    def insert(self):
        genre_title_id = self.getIdByFields(
            ['genre_id',  'title_id'], [self.genre_id, self.title_id])
        if not genre_title_id:
            genre_title_id = self.createWithFields(
                ['genre_id',  'title_id'], [self.genre_id, self.title_id])
        self.genre_title_id = genre_title_id
        return self.genre_title_id
