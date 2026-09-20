import pandas as pd
import joblib

model=joblib.load('model/Mental_Health_Model.pkl')

def _predict(data:dict):
    data=pd.DataFrame([data])
    prediction=model.predict(data)[0]
    return prediction