import pandas as import pd
import Importer
from sklearn import LinearRegression

class ML():

    def __init__(self):

        space_files = ['2010_DGD.txt', '2011_DGD.txt', '2012_DGD.txt', '2013_DGD.txt', '2014_DGD.txt', '2015_DGD.txt', '2016_DGD.txt']#, '2017_DGD.txt', '2018_DGD.txt']
        weather_files = ['Inari Nellim.csv', 'Rovaniemi Lentoasema.csv', 'Ranua lentokentta.csv', 'Vantaa Lentoasema.csv']
        self.df = Importer().import_all(weather_files, space_files)

    ### Linear Regression
    ### 

    def LinReg(self):

        linReg = LinearRegression()