from models.BaseModel import BaseModel


class User(BaseModel):
    def __init__(self, user_globoplay_id):
        super().__init__('Users')
        self.user_globoplay_id = str(user_globoplay_id)
        self.user_id = None

    def insert(self):
        user_id = self.getIdByField('user_glbp_id', self.user_globoplay_id)
        if not user_id:
            user_id = self.createWithField(
                'user_glbp_id', self.user_globoplay_id)
        self.user_id = user_id
        return self.user_id
