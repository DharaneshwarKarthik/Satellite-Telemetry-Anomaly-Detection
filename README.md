# Satellite-Telemetry-Anomaly-Detection

Satellite sends a huge amount of telemetry data to the earth continuosly. In consequence, it increases the bandwith, storage therefore reduces the efficieny. 
*Summary*
We used TranAD. Defined as Transformer anamoly detection. The dataset which has been used for this project is GOCE Satellite telemtry dataset.
This system ignores normal data which are getting transmitted to the earth, rather it sends only the anamolous data. Those anamolous values are also stored in a log history page. Therefore it reduces unnecessary telemetry transmission of data to the earth. 
Also it sends an additional yet main info to the earth, which is the main feature of this system, the most possible problem of in which area there is a problem. 

# Existing systems
There are a lot of systems which already exists. Which are Rule based systems which are used in legacy spacecrafts, Statistical monitoring systems, ML based systems and DL based models. 
Undoubtedly DL models are going to perform well and, in line with efficiency where a huge computing and calculations are needed ML based systems can outperform DL based with respect to EFFICIENCY.


# How it works! 
The data is preprocessed and fed into the the TranAD model. The model learns from the dataset and assigns a threshold score. In this dataset, there are only non-anomaly values, this dataset has aa very few anomaly. If the model sees something abnormal, it doubts it and will mark it as an anomaly as per mathematical caluclations and, if the particular value score was more than the learned threshold, then its flagged as an anomaly. 

The another main feature of this system is, it also predicts in which part of the spacecraft the problem has occured
For example: Rotation of satellite, Battery, voltage, magnetometer, thermal sensor, and so on. 


# Postscript 
This project is still getting enhanced in the below listed follwings
1. Compressing data of normal and sending it to the earth, while sending raw data of before and after a some timestamp if there is an anomaly found. 
2. Now that the threshold is static, it can be switched for Dynamic threshold. 
3. The UI is getting new elements to increase the UX which will be helpful to make an informed decision. 
   







 
