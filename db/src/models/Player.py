from models.BaseModel import BaseModel


class Player(BaseModel):
    def __init__(self, player_type):
        super().__init__('Players')
        self.name = player_type
        self.player_id = None

    def insert(self):
        player_id = self.getIdByField('name', self.name)
        if not player_id:
            player_id = self.createWithField('name', self.name)
        self.player_id = player_id
        return self.player_id
