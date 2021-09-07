from models.BaseModel import BaseModel


class Device(BaseModel):
    def __init__(self, device_type):
        super().__init__('Devices')
        self.name = device_type
        self.device_id = None

    def insert(self):
        device_id = self.getIdByField('name', self.name)
        if not device_id:
            device_id = self.createWithField('name', self.name)
        self.device_id = device_id
        return self.device_id
