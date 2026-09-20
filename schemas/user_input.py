from pydantic import BaseModel, Field,computed_field
from typing import Annotated, Literal
from config.topCounties import top_Countries

# Request Body
class StudentData(BaseModel):

    Age: Annotated[
        int,
        Field(..., ge=0, description="Student Age")
    ]

    Gender: Annotated[
        Literal["Male", "Female"],
        Field(..., description="Student Gender")
    ]

    Country: Annotated[
        str,
        Field(..., description="Student Country")
    ]

    Academic_Level: Annotated[
        Literal["High School", "Undergraduate", "Graduate"],
        Field(..., description="Student Academic Level")
    ]

    Most_Used_Platform: Annotated[
        Literal[
            "Facebook", "LinkedIn", "Instagram", "Snapchat",
            "Twitter", "YouTube", "TikTok", "LINE",
            "KakaoTalk", "VKontakte", "WhatsApp", "WeChat"
        ],
        Field(..., description="Student Most Used Platform")
    ]

    Purpose_Of_Use: Annotated[
        Literal["Networking", "Education", "Entertainment", "News"],
        Field(..., description="Student Purpose Of Use")
    ]

    Avg_Daily_Usage_Hours: Annotated[
        float,
        Field(..., ge=0, le=24, description="Student Avg Daily Usage Hours")
    ]

    Daily_Unlocks: Annotated[
        int,
        Field(..., ge=0, description="Student Daily Unlocks")
    ]

    Study_Hours: Annotated[
        float,
        Field(..., ge=0, le=24, description="Student Study Hours")
    ]

    Physical_Activity_Hours: Annotated[
        float,
        Field(..., ge=0, le=24, description="Student Physical Activity Hours")
    ]

    Sleep_Hours_Per_Night: Annotated[
        float,
        Field(..., ge=0, le=24, description="Student Sleep Hours")
    ]

    Stress_Level: Annotated[
        Literal["Medium", "Low", "Very High", "High"],
        Field(..., description="Student Stress Level")
    ]

    @computed_field()
    @property
    def Grouped_country(self)->str:
        if self.Country in top_Countries:
            return self.Country
        else:
            return 'Other'

# Response Body
class PredictionResponse(BaseModel):
    Mental_Health_Score:float
