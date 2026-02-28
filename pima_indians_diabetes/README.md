# Projekt aplikacji webowej do wstępnego wykrywania ryzyka cukrzycy

## Opis

Projekt obejmuje kompletny pipeline eksploracji danych wykorzystujący tematy poruszane w ramach laboratorium oraz porównanie wybranych klasyfikatorów.

Wybór najlepszego modelu nastąpił poprzez walidację krzyżową na podstawie metryk takich jak:

- Accuracy
- Precision
- Recall
- F1
- ROC-AUC

Do projektu wykorzystano zbiór danych [Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) z Kaggle.

Po wyborze modelu został on zapisany oraz zintegrowany z modułem REST API. Aplikacja webowa posiada interfejs użytkownika z:

- Kalkulatorem BMI
- Formularzem do wprowadzania danych
- Wizualizacją wyników predykcji

## Struktura projektu

- `archive/diabetes.csv` - wykorzystywany dataset
- `notebooks/analiza.ipynb` - Jupyter Notebook z eksploracją danych i wytrenowaniem modelu
- `models/` - zapisany model i wartości referencyjne
- `api/` - REST API (Python FastAPI)
- `frontend/` - aplikacja webowa (React)

---

## Sposób uruchomienia

### Backend (Terminal 1)

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload
```

API dostępne pod adresem: http://localhost:8000

### Frontend (Terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Aplikacja dostępna pod adresem: http://localhost:3000
