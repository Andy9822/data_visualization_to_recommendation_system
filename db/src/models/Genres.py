from models.BaseModel import BaseModel


class Genres(BaseModel):
    def __init__(self, genres):
        super().__init__('Genres')
        self.genresIds = []
        self.genres = genres.split(',')

    def insert(self):
        for genre in self.genres:
            genreId = self.getIdByField('name', genre)
            if not genreId:
                genreId = self.createWithField('name', genre)
            self.genresIds.append(genreId)
        return self.genresIds
