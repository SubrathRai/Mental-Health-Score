from fastapi import FastAPI
from schemas.user_input import StudentData, PredictionResponse
from model.prediction import _predict
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Serve frontend files
app.mount("/static", StaticFiles(directory="frontend"), name="static")


# Serve index.html at the root URL
@app.get("/")
def home():
    return FileResponse("frontend/index.html")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Prediction API
@app.post("/predict", response_model=PredictionResponse)
def predict(data: StudentData):

    user_input = {
        "Age": data.Age,
        "Gender": data.Gender,
        "Country": data.Country,
        "Academic_Level": data.Academic_Level,
        "Most_Used_Platform": data.Most_Used_Platform,
        "Purpose_Of_Use": data.Purpose_Of_Use,
        "Avg_Daily_Usage_Hours": data.Avg_Daily_Usage_Hours,
        "Daily_Unlocks": data.Daily_Unlocks,
        "Study_Hours": data.Study_Hours,
        "Physical_Activity_Hours": data.Physical_Activity_Hours,
        "Sleep_Hours_Per_Night": data.Sleep_Hours_Per_Night,
        "Stress_Level": data.Stress_Level
    }

    prediction = _predict(user_input)

    return PredictionResponse(
        Mental_Health_Score=round(prediction, 2)
    )