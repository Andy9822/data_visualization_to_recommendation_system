import pandas
import numpy as np
from pandas.core.frame import DataFrame
from collections import defaultdict


def load_dataset(filename) -> DataFrame:
    df = pandas.read_csv(filename,  quotechar='"')
    filered_df = df[['title_ID', 'user_ID',
                     'playertype', 'deviceGroup', 'genres']]

    # In case there are some null values, we remove those rows
    null_rows, _ = np.where(pandas.isnull(filered_df))
    filered_df = filered_df.drop(null_rows)

    null_rows, null_columns = np.where(pandas.isnull(filered_df))
    if len(null_rows):
        raise ValueError(
            f"Null field found: on {filename}:", (null_rows, null_columns))

    return filered_df


def load_populated_datasets(filename) -> defaultdict:
    d = defaultdict(lambda: False)

    with open(filename) as file:
        while (line := file.readline().rstrip()):
            d[line] = True
    return d


def set_populated_dataset(filename, dataset_name):
    with open(filename, "a") as file_object:
        file_object.write(f"{dataset_name}\n")
