import pandas as pd
from Importer import Importer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import sqlite3
import numpy as np

class ML():

    def __init__(self):

        space_files = ['2010_DGD.txt', '2011_DGD.txt', '2012_DGD.txt', '2013_DGD.txt', '2014_DGD.txt', '2015_DGD.txt', '2016_DGD.txt']#, '2017_DGD.txt', '2018_DGD.txt']
        weather_files = ['Inari Nellim.csv', 'Rovaniemi Lentoasema.csv', 'Ranua lentokentta.csv', 'Vantaa Lentoasema.csv']
        self.Importer = Importer()
        while (not self.Importer.completed):
            self.Importer.import_all(weather_files, space_files)
        self.Importer.to_json('Datafile.json')
        #self.Importer.df = pd.read_json("Datafile.json")
        self.df_split = self.split_sets()
        print("Import done")
        self.result = self.create_output(self.Importer.df)
        self.RunAll(self.result)
        self.to_database()

    ### Linear Regression
    ###
    def RunAll(self, result):
        res = []

        for i in range(len(self.Importer.stations)):
            df = result.iloc[:, [0, 1, 2, (i*2+3),(i*2+4), -1]]# + result.iloc[:, [(i*2+3),(i*2+4)]] + result.iloc[:, [-1]]
            #print(df.head())
            #self.LinReg(self.df_split[i][0], self.df_split[i][1])
            x = self.RandForest(self.df_split[i][0], self.df_split[i][1], df)
            result[self.Importer.stations[i] + ' Proba'] = x
            print(x)

        print(result.head())
        print(result.columns)
        return res

    def split_sets(self, weather = False):
        self.Importer.df = self.Importer.df.reset_index()
        complete_data = []

        for name in self.Importer.stations:
            data = []
            target = []

            for index, row in self.Importer.df.iterrows():
                if weather: #only weather prediction
                    target.append(row[name])
                    data.append(np.array([row['Inari Nellim_m'], row['Inari Nellim_d'], row['Inari Nellim_Time'],
                    row[name + '_Horizontal visibility (m)'], row[name + '_Cloud amount (1/8)']]))
                else:
                    target.append(row[name + ' Overall'])
                    data.append(np.array([row['Inari Nellim_m'], row['Inari Nellim_d'], row['Inari Nellim_Time'],
                    row[name + '_Horizontal visibility (m)'], row[name + '_Cloud amount (1/8)'], row['College']]))

            complete_data.append((data, target))

        return complete_data

    def LinReg(self, data, target):

        x_train, x_test, y_train, y_test = train_test_split(data, target, test_size=0.2, random_state=0)
        print(x_train[0], y_train[0])
        model = LogisticRegression()
        model.fit(x_train, y_train)

        score = model.score(x_test, y_test)

        predictions = model.predict(x_test[:1])
        print('LinReg: ',  score)
        print('Pred: ',  predictions)

    def RandForest(self, data, target, result):
        x_train, x_test, y_train, y_test = train_test_split(data, target, test_size=0.2, random_state=0)
        #print(np.any(np.isnan(x_train)), np.all(np.isfinite(x_train)))
        clf = RandomForestClassifier(n_estimators=200)
        clf.fit(x_train, y_train)
        score = clf.score(x_test, y_test)

        #proba = clf.predict_proba(result)
        proba = clf.predict_proba(result)[:,1]
        print('Predict ', clf.predict(result))
        print('Rand', score)
        return proba

    def to_database(self):
        conn = sqlite3.connect(self.Importer.db_name)
        self.result.to_sql("data", conn, if_exists="replace")
        conn.close()
        print("Modelcreation complete")

    def create_output(self, df):
        #df[self.Importer.df['Inari Nellim_Cloud amount (1/8)'].isnull()]
        data = []
        for month in range(1, 13):
            month_df = df[df['Inari Nellim_m'] == month]
            for day in range(1, 32):
                day_df = month_df[month_df['Inari Nellim_d'] == day]
                for time in range(0, 22, 3):
                    temp_df = day_df[day_df['Inari Nellim_Time'] == time]
                    if not temp_df.empty:
                        row = {'Month': month, 'Day': day, 'Time': time,
                            'Inari Nellim_Cloud amount (1/8)': temp_df['Inari Nellim_Cloud amount (1/8)'].mode()[0],
                            'Inari Nellim_Horizontal visibility (m)':int(temp_df['Inari Nellim_Horizontal visibility (m)'].mean()),
                            'Rovaniemi Lentoasema_Cloud amount (1/8)':temp_df['Rovaniemi Lentoasema_Cloud amount (1/8)'].mode()[0],
                            'Rovaniemi Lentoasema_Horizontal visibility (m)':int(temp_df['Rovaniemi Lentoasema_Horizontal visibility (m)'].mean()),
                            'Ranua lentokentta_Cloud amount (1/8)':temp_df['Ranua lentokentta_Cloud amount (1/8)'].mode()[0],
                            'Ranua lentokentta_Horizontal visibility (m)':int(temp_df['Ranua lentokentta_Horizontal visibility (m)'].mean()),
                            'Vantaa Lentoasema_Cloud amount (1/8)':temp_df['Vantaa Lentoasema_Cloud amount (1/8)'].mode()[0],
                            'Vantaa Lentoasema_Horizontal visibility (m)':int(temp_df['Vantaa Lentoasema_Horizontal visibility (m)'].mean()),
                            'College':temp_df['College'].mode()[0] }
                        data.append(row)

            print('One Month done, %s remaining' % (12-month))

        result = pd.DataFrame(data)
        print(result.head())
        return result


x = ML()
