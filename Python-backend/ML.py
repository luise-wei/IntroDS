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
        self.df_split = self.split_sets()
        print('done')
        self.RunAll()

    ### Linear Regression
    ### 
    def RunAll(self):

        #print(self.Importer.df[self.Importer.df['Inari Nellim_Cloud amount (1/8)'].isnull()])

        for i in range(1): #len(self.Importer.stations)
            self.LinReg(self.df_split[i][0], self.df_split[i][1])
            self.RandForest(self.df_split[i][0], self.df_split[i][1])

    def split_sets(self):
        self.Importer.df = self.Importer.df.reset_index()
        complete_data = []

        for name in self.Importer.stations:
            data = []
            target = []

            for index, row in self.Importer.df.iterrows():
                data.append(np.array([row['Inari Nellim_m'], row['Inari Nellim_d'], row['Inari Nellim_Time'], row[name + '_Horizontal visibility (m)'], row[name + '_Cloud amount (1/8)']]))
                target.append(row[name])
            
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

    def RandForest(self, data, target): 
        x_train, x_test, y_train, y_test = train_test_split(data, target, test_size=0.2, random_state=0)
        #print(np.any(np.isnan(x_train)), np.all(np.isfinite(x_train)))
        clf = RandomForestClassifier(n_estimators=200)
        clf.fit(x_train, y_train)
        score = clf.score(x_test, y_test)
        

        print('Rand', score)

    def to_database(self):
        data = pd.DataFrame()


        conn = sqlite3.connect(self.Importer.db_name)
        data.to_sql("data", conn, if_exists="replace")
        conn.close()
        print("Modelcreation complete")

x = ML()