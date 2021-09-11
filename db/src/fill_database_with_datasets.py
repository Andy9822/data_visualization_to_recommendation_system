from core.DB import database
from models.View import View
from models.User import User
from models.Device import Device
from models.Player import Player
from models.GenreTitle import GenreTitle
from models.Title import Title
from core.utils import load_dataset, load_populated_datasets, set_populated_dataset
from models.Genres import Genres
import os


def main():
    datasets = os.listdir('db/datasets')
    populated_datasets_filepath = 'db/src/populated_datasets.txt'
    populated_datasets = load_populated_datasets(populated_datasets_filepath)

    for dataset in datasets:
        if not populated_datasets[dataset]:
            try:
                print(f"[Populating db] {dataset}...", end='')
                df = load_dataset(f'db/datasets/{dataset}')
                # print(df)
                for index, row in df.iterrows():
                    # print(row)
                    genres_ids = Genres(row['genres']).insert()
                    # print('genres_ids:', genres_ids)
                    title_id = Title(row['title_ID']).insert()
                    # print('title_id:', title_id)
                    for genre_id in genres_ids:
                        genre_title_id = GenreTitle(
                            genre_id, title_id).insert()
                        # print('genre_title_id:', genre_title_id)
                    player_id = Player(row['playertype']).insert()
                    # print('player_id:', player_id)
                    device_id = Device(row['deviceGroup']).insert()
                    # print('device_id:', device_id)
                    user_id = User(row['user_ID']).insert()
                    # print('user_id:', user_id)
                    view_id = View(title_id, user_id, device_id,
                                   player_id).insert()
                    # print('view_id:', view_id)
                    # print()
                database.commit()
                set_populated_dataset(populated_datasets_filepath, dataset)
                print('✅')
            except Exception:
                print('❌')


if __name__ == "__main__":
    main()
