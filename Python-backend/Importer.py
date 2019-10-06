import pandas as pd
#import Datapoint as dp
import re

import sqlite3
from sqlite3 import Error


class Importer:

    def __init__(self):
        self.df = None
        self.completed = False
        self.df = None

    def create_connection(self, db_file):
        conn = None
        try:
            conn = sqlite3.connect(db_file, isolation_level=None)
            print(sqlite3.version)
        except Error as e:
            print(e)

        return conn
        # finally:
        #     if conn:
        #         conn.close()

    def create_table(self, cursor, create_table_sql):
        """"
        :param conn: Connection object
        :param create_table_sql: a CREATE TABLE statement
        :return:
        """
        try:
            cursor.execute(create_table_sql)
        except Error as e:
            print(e)

    def create_insert_data(self, cursor, data):
        """
        Create a new data entry into the import_data table
        :param connection:
        :param data:
        :return: data id
        """
        sql = ''' INSERT INTO import_data(test1_Year,test1_m,test1_d,test1_Time,test1_Cloud,test1_Horizontal,Fredericksburg,College,Planetary)
                      VALUES(?,?,?,?,?,?,?,?,?)'''
        cursor.execute(sql, data)
        return cursor.lastrowid

    def insert_all(self, connection):
        self.df = self.df.fillna(-1)

        for index, row in self.df.iterrows():
            data = []
            data.append(row['test1_Year'])
            data.append(row['test1_m'])
            data.append(row['test1_d'])
            data.append(row['test1_Time'])
            data.append(row['test1_Cloud amount (1/8)'])
            data.append(row['test1_Horizontal visibility (m)'])
            data.append(row['Fredericksburg'])
            data.append(row['College'])
            data.append(row['Planetary'])
            data = tuple(data)
            ide = self.create_insert_data(connection, data)
            print(ide)

    def import_all(self, weather_paths, k_index_paths):
        ''' Main importer for the data '''
        self.df = self.__load_all_weather(weather_paths) #self.__import_weather('Weather\\' + weather_paths[0])
        self.df = self.__load_all_kIndex(k_index_paths, self.df)
        self.completed = True
        print(self.completed)
        print(self.df.head())
        # print(self.df.columns)
        print(self.df.dtypes)
        # print(self.df.iloc[1])

    def __import_weather(self, path):
        ''' Import data from a weather station in csv '''

        df = pd.read_csv("Weather\\" + path)
        df = df.drop('Time zone', axis = 1)
        df = self.__replace(df, 'Time')
        df = df[df.Time.isin([0, 3, 6, 9, 12, 15, 18, 21])] #Time of the k Index messurement
        #rename columns
        path = path.split('.')[0]

        i = 0
        indexes = {}

        while i < len(df.columns):
            indexes[df.columns[i]] = path + '_' + df.columns[i]
            i += 1

        return df.rename(columns = indexes)

    def __import_kIndex(self, path):
        ''' Import  '''

        data = open('GeoData\\' + path).read().split('\n')
        data.remove('')
        data = list(filter(lambda x: x[0].isdigit(), data))

        result = self.__parse_data(data)
        #df = self.__to_dataframe(result, df)

        return result

    def __replace(self, df, cat):
        ''' replace object values with numerical '''

        labels = df[cat].astype('category').cat.categories.tolist()
        replace_map = {cat : {k: v for k,v in zip(labels,list(range(0,len(labels))))}}
        df.replace(replace_map, inplace = True)

        return df

    def __parse_data(self, data):
        ''' Parses a GeoData txt file returns a list of the data '''

        result = []

        for elem in data:
            year = int(elem[:4])
            month = int(elem[5:7])
            day = int(elem[8:10])

            k1 = list(map(int, re.split(' |-', elem[18:33])))
            k2 = list(map(int, re.split(' |-', elem[41:56])))
            k3 = list(map(int, re.split(' |-', elem[64:79])))

            result.append((year, month, day, k1, k2, k3))

        return result

    def __to_dataframe(self, data, df):
        ''' Merges geo and weather data '''

        k1 = []
        k2 = []
        k3 = []

        for elem in data:
             k1.extend(elem[3])
             k2.extend(elem[4])
             k3.extend(elem[5])

        print(df)
        print(df.shape)
        print(len(k1))
        df['Fredericksburg'] = k1
        df['College'] = k2
        df['Planetary'] = k3

        return df

    def __load_all_weather(self, path_list):
        ''' Loads multiple weather files '''

        frames = []

        for path in path_list:
            frames.append(self.__import_weather(path))

        df = pd.concat(frames, axis=1, sort=True)
        return df

    def __load_all_kIndex(self, path_list, df):
        ''' Loads multiple GeoData files '''

        results = []

        for path in path_list:
            results.extend(self.__import_kIndex(path))

        return self.__to_dataframe(results, df)


x = Importer()
sql_create_table = """ CREATE TABLE IF NOT EXISTS import_data (
                                        id integer PRIMARY KEY,
                                        test1_Year integer NOT NULL,
                                        test1_m integer  NOT NULL,
                                        test1_d integer NOT NULL,
                                        test1_Time integer NOT NULL,
                                        test1_Cloud float NOT NULL,
                                        test1_Horizontal float NOT NULL,
                                        Fredericksburg integer NOT NULL,
                                        College integer NOT NULL,
                                        Planetary integer NOT NULL
                                    ); """

conn = x.create_connection(r"db/ds_project.db")
cursor = conn.cursor()
x.create_table(cursor, sql_create_table)
x.import_all(['test1.csv'], ['2017_DGD.txt', '2018_DGD.txt'])
x.insert_all(cursor)
# print(x.df.Time)