from fastapi import FastAPI, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import os
import sqlite3
from datetime import datetime
import pandas as pd
from typing import Optional
from pydantic import BaseModel

# Variable globale pour stocker le modèle et le scaler
model = None
scaler = None
model_loaded = False

def create_app():
    # Création de l'application FastAPI
    app = FastAPI(title="Prédiction de Risque Cardiaque")

    # Configuration des middlewares
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Montage des fichiers statiques
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

    # Configuration des templates
    templates = Jinja2Templates(directory="app/templates")

    # Chargement du modèle et du scaler
    global model, scaler, model_loaded
    try:
        model = joblib.load("app/models/modele_random_forest.pkl")
        scaler = joblib.load("app/models/scaler.pkl")
        model_loaded = True
    except FileNotFoundError:
        model_loaded = False
        print("Attention: Les fichiers modèle ou scaler n'ont pas été trouvés.")

    # Initialisation de la base de données
    init_db()

    # Classe pour les données d'entrée
    class CardiacData(BaseModel):
        male: int
        age: float
        currentSmoker: int
        cigsPerDay: float
        BPMeds: int
        diabetes: int
        totChol: float
        sysBP: float
        diaBP: float
        BMI: float
        heartRate: float
        glucose: float

    # Connexion à la base de données
    def get_db():
        conn = sqlite3.connect("app/database/predictions.db", check_same_thread=False)
        try:
            yield conn
        finally:
            conn.close()

    @app.get("/", response_class=HTMLResponse)
    async def home(request: Request):
        return templates.TemplateResponse("index.html", {"request": request, "model_loaded": model_loaded})

    @app.post("/predict")
    async def predict(
        male: int = Form(...),
        age: float = Form(...),
        currentSmoker: int = Form(...),
        cigsPerDay: float = Form(...),
        BPMeds: int = Form(...),
        diabetes: int = Form(...),
        totChol: float = Form(...),
        sysBP: float = Form(...),
        diaBP: float = Form(...),
        BMI: float = Form(...),
        heartRate: float = Form(...),
        glucose: float = Form(...),
        conn: sqlite3.Connection = Depends(get_db)
    ):
        # Créer le vecteur d'entrée
        input_data = np.array([[male, age, currentSmoker, cigsPerDay, BPMeds, diabetes, 
                            totChol, sysBP, diaBP, BMI, heartRate, glucose]])
        
        # Appliquer le scaler
        input_scaled = scaler.transform(input_data)
        
        # Faire la prédiction
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]
        
        # Définir le niveau de risque
        risk_level = "Risque élevé" if prediction == 1 else "Risque faible"
        
        # Stocker la prédiction dans la base de données
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO predictions (
            date_prediction, male, age, currentSmoker, cigsPerDay, BPMeds, diabetes, 
            totChol, sysBP, diaBP, BMI, heartRate, glucose, risk_prediction, probability
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            male, age, currentSmoker, cigsPerDay, BPMeds, diabetes, 
            totChol, sysBP, diaBP, BMI, heartRate, glucose, 
            risk_level, float(probability)
        ))
        conn.commit()
        
        # Retourner le résultat
        return {
            "prediction": int(prediction),
            "probability": float(probability),
            "risk_level": risk_level
        }

    @app.get("/history")
    async def get_history(request: Request, conn: sqlite3.Connection = Depends(get_db)):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions ORDER BY date_prediction DESC")
        rows = cursor.fetchall()
        
        # Convertir en liste de dictionnaires
        columns = [col[0] for col in cursor.description]
        history = [dict(zip(columns, row)) for row in rows]
        
        return templates.TemplateResponse(
            "history.html", 
            {"request": request, "history": history}
        )

    @app.get("/api/history")
    async def api_history(conn: sqlite3.Connection = Depends(get_db)):
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM predictions ORDER BY date_prediction DESC")
        rows = cursor.fetchall()
        
        # Convertir en liste de dictionnaires
        columns = [col[0] for col in cursor.description]
        history = [dict(zip(columns, row)) for row in rows]
        
        return history

    return app

# Initialisation de la base de données
def init_db():
    conn = sqlite3.connect("app/database/predictions.db")
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_prediction TEXT,
        male INTEGER,
        age REAL,
        currentSmoker INTEGER,
        cigsPerDay REAL,
        BPMeds INTEGER,
        diabetes INTEGER,
        totChol REAL,
        sysBP REAL,
        diaBP REAL,
        BMI REAL,
        heartRate REAL,
        glucose REAL,
        risk_prediction TEXT,
        probability REAL
    )
    ''')
    conn.commit()
    conn.close()

# Création de l'application
app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 