from models.BaseModel import BaseModel


class View(BaseModel):
    def __init__(self, title_id, user_id, device_id, player_id):
        super().__init__('Views')
        self.title_id = title_id
        self.user_id = user_id
        self.device_id = device_id
        self.player_id = player_id
        self.view_id = None

    def insert(self):
        view_id = self.createWithFields(
            ['title_id', 'user_id', 'device_id', 'player_id'],
            [self.title_id, self.user_id, self.device_id, self.player_id]
        )
        self.view_id = view_id
        return self.view_id
