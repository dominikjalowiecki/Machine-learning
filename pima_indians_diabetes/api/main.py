import logging
from pathlib import Path
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Pima Indians Diabetes API",
    description="REST API aplikacji do predykcji cukrzycy na podstawie danych medycznych pacjenta.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent.parent / "models" / "pima_pipeline.pkl"

pipeline = None

@app.on_event("startup")
async def load_model():
    global pipeline
    try:
        pipeline = joblib.load(MODEL_PATH)
        logger.info(f"Model załadowany pomyślnie: {MODEL_PATH}")
    except Exception as e:
        logger.error(f"Błąd ładowania modelu: {e}")
        raise

class DiabetesInput(BaseModel):
    Pregnancies: int = Field(ge=0, le=20, description="Liczba ciąż")
    Glucose: float = Field(gt=0, le=250, description="Stężenie glukozy (mg/dL)")
    BloodPressure: float = Field(gt=0, le=200, description="Ciśnienie krwi (mm Hg)")
    SkinThickness: float = Field(ge=0, le=100, description="Grubość fałdu skórnego (mm)")
    Insulin: float = Field(ge=0, le=900, description="Poziom insuliny (μU/mL)")
    BMI: float = Field(gt=0, le=70, description="Wskaźnik masy ciała (kg/m²)")
    DiabetesPedigreeFunction: float = Field(gt=0, le=3, description="Funkcja rodowodu cukrzycy")
    Age: int = Field(ge=18, le=99, description="Wiek")

    @field_validator('Glucose', 'BloodPressure', 'BMI', 'DiabetesPedigreeFunction')
    @classmethod
    def check_positive(cls, v, info):
        if v <= 0:
            raise ValueError(f'{info.field_name} musi być większe od 0')
        return v

class DiabetesPrediction(BaseModel):
    prediction: int = Field(description="Predykcja: 0 = brak cukrzycy, 1 = cukrzyca")
    probability: float = Field(description="Prawdopodobieństwo cukrzycy")
    input_data: dict = Field(description="Dane wejściowe użyte do predykcji")

@app.post("/predict", response_model=DiabetesPrediction)
async def predict(data: DiabetesInput):
    if pipeline is None:
        logger.error("Model nie został załadowany")
        raise HTTPException(status_code=500, detail="Model nie jest dostępny")

    try:
        features = np.array([[
            data.Pregnancies,
            data.Glucose,
            data.BloodPressure,
            data.SkinThickness,
            data.Insulin,
            data.BMI,
            data.DiabetesPedigreeFunction,
            data.Age
        ]])

        prediction = pipeline.predict(features)[0]
        probability = pipeline.predict_proba(features)[0][1]

        logger.info(f"Predykcja: {prediction}, Prawdopodobieństwo: {probability:.4f}")

        return DiabetesPrediction(
            prediction=int(prediction),
            probability=float(probability),
            input_data=data.model_dump()
        )
    
    except Exception as e:
        logger.error(f"Błąd podczas predykcji: {e}")
        raise HTTPException(status_code=500, detail=f"Błąd predykcji: {str(e)}")

@app.get("/")
async def root():
    return {
        "message": "REST API aplikacji do predykcji cukrzycy",
        "docs": "/docs",
    }