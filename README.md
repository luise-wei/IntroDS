This is a project for the course "Introduction to Data Science" at University of Helsinki in the first autumn term.

The steps we have to take are:
1) Find a real-world problem
2) Find data for it
3) Clean/ Prepare the data for the usage
4) throw some statistics (Linear Regression) or ML/DL-algorithms on the data
5) Present the results in an enduser-appropirate wa eg. webapp, mobile app, presentation, blog, ..
6) write a report about the progress 

approximate timeframe: 6-7 weeks, accompanying the lecture of Teemu Roos.

--- P R O J E C T - O U T L I N E ---

A. Title of the project	
Northern Lights App
            
B. Elevator pitch [max 400 characters]
Since we're all ERASMUS exchange students at Helsinki University, we also want to experience a lot besides the student life. 
Amongst other things, we also want to see the northern lights or Aurora Borealis in Finland. Therefor, we want to examine data from the past about its occurrence. We hope to get some insights, to determine favorable time and location, so we know when and where to go.

----------------------

To fulfill this task, we will examine weather data (2010 until today) from the Finnisch Meterological Institute (FMI), which is available on their download page[1].
They also have a general information page about auroras and space weather[2].
Additionally, we will examine meterological data (K-indices) from some stations (Fredericksburg and College) from several years.
In a best case scenario, we also use Twitter as a data source. Thereby we will search for specific and according hashtags like #northernLights, #auroraborealis and #finland.

The data sources are quite distinct and so is the given data structure.
Thus, we have to bring the data to a for us usable format.
Then we probably have to clean the data and search for some bias (e.g in Twitter data it is likely to get some #thowback, so there are entries for the summer, even if there was no aurora visible at that time)
We also have to enhance the data with location information, if not given (e.g. dataset from one wether station, may not include the nameof the station).

Since we want to learn from the previous data and events, it is our goal to predict northern lights events.

[1]https://en.ilmatieteenlaitos.fi/download-observations#!/
[2]https://en.ilmatieteenlaitos.fi/auroras-and-space-weather

 
# Task: Describe the data science challenges related to the following themes. 
# A good project should include interesting challenges under most of 
# the themes. So for example, a project that begins with a single clean
# data set and a clear task (e.g., predict a given response), isn't a good 
# choice for your project.		
            
C. Data: sources, wrangling, management	
Our sources are as stated in the pitch:
* FMI database
* Meterological data for kindices
* perhaps Twitter data 

Given data structures will be:
* FMI: csv data over about 10 years of ca. 10 equally distributed stations around Finland
* Meterological data base: csv data over abou 30 years of two stations and a planetary calculation fpr k indices
* Twitter data: JSON objects with differing attributes, according to what the user published (e.g. location in not always given)

Data Management:
* thinking about a data format for an database entry
* selecting a data base (probably sql and for python the library sqlite)
* collecting data once and then work on that database, no further/ incoming data stream

Wrangling:
* enhancing and cleaning the data
* normalize data if necessary
* for twitter data: clean data in terms of lowering, stemming, removing stop ords (similar to exercises of week 1)
* consider bias in the data sets, maybe do further operation to minimise its effects
            
D. Data analysis: statistics, machine learning	
* visualise the given data, prhaps for each step of the wrangling - to see what a single steps effects
* visualise data for examination, trends etc.
* do some general statistics (mean, median, quantitative and/or qualitative examination, ...)
* use linear regression for trend development
* try to use machine learning to make better predictions
            
E. Communication of results: summarization & visualization
* create a webapp which displays the current situation, probably some earlier data, monthly trend and forecast
* have a single page application
            
F. Operationalization: creating added value, end-user point of view
* further ideas: 
    * embedded twitter-feed/ news feed 
    *  background information about auroras in general and how the prediction was made (just if anybody has further interest in the topic)