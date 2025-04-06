# Application de Prédiction de Risque Cardiaque

Cette application web permet de prédire le risque cardiaque à partir de données médicales en utilisant un modèle de Machine Learning (Random Forest).

## Fonctionnalités

- Interface utilisateur intuitive et réactive construite avec Bootstrap
- API FastAPI pour le backend
- Stockage des prédictions dans SQLite
- Visualisations graphiques des résultats avec Chart.js
- Historique des prédictions avec DataTables

## Prérequis

- Python 3.8+
- pip (gestionnaire de paquets Python)

## Installation

1. Cloner ce dépôt:

```bash
git clone <url-du-dépôt>
cd Hypertension-risk-model/AppWeb
```

2. Créer un environnement virtuel et l'activer:

```bash
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
```

3. Installer les dépendances:

```bash
pip install -r requirements.txt
```

4. Préparer les modèles:
   - Placer les fichiers `modele_random_forest.pkl` et `scaler.pkl` dans le dossier `app/models/`

## Structure du projet

```
AppWeb/
├── app/
│   ├── database/         # Base de données SQLite
│   ├── models/           # Modèles ML préentraînés
│   ├── static/           # Ressources statiques (CSS, JS, images)
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── templates/        # Templates HTML
│   └── main.py           # Point d'entrée FastAPI
├── requirements.txt      # Dépendances
└── README.md             # Documentation
```

## Exécution de l'application

Pour démarrer l'application en mode développement:

```bash
uvicorn app.main:app --reload
```

L'application sera accessible à l'adresse: http://127.0.0.1:8000

## API Endpoints

- `GET /` - Page d'accueil avec formulaire de prédiction
- `POST /predict` - API pour soumettre les données et obtenir une prédiction
- `GET /history` - Page d'historique des prédictions
- `GET /api/history` - API pour récupérer l'historique des prédictions en JSON

## Déploiement en production

Pour un déploiement en production, nous recommandons:

1. Utiliser Gunicorn comme serveur WSGI:

```bash
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

2. Configurer un proxy inverse avec Nginx ou Apache

3. Sécuriser la base de données et gérer les sauvegardes

## Dépendances principales

- FastAPI: Framework web rapide pour construire des API
- Uvicorn: Serveur ASGI pour FastAPI
- SQLite: Base de données légère
- joblib: Pour charger les modèles de ML
- scikit-learn: Pour les fonctionnalités de ML
- Bootstrap: Framework CSS pour l'interface utilisateur
- Chart.js: Bibliothèque JavaScript pour les graphiques
- DataTables: Plugin jQuery pour les tableaux de données

## Licence

Ce projet est sous licence MIT.
