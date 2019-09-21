import pandas as pd
#import Datapoint as dp
import re


class Importer():
    

    def __init__(self):
        self.df = None
        self.completed = False
        self.df = None

    def import_all(self, weather_paths, k_index_paths):
        ''' Main importer for the data '''
        self.df = self.__load_all_weather(weather_paths) #self.__import_weather('Weather\\' + weather_paths[0])
        self.df = self.__load_all_kIndex(k_index_paths, self.df)
        self.completed = True
        print(self.completed)
        print(self.df.head())

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
x.import_all(['test1.csv'], ['2017_DGD.txt', '2018_DGD.txt'])
#print(x.df.Time)