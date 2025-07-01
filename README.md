# Django + React 

#python import_geojson.py "D:\TUC\Datenbanken und Web-Techniken\backend\Chemnitz.geojson" Location
#command to updload data to Postgre

# Django + React Location Map App

This project is a full-stack web application built using **Django**, **React**, **Tailwind CSS**, and **PostgreSQL**. It displays geographic data (e.g., points of interest) on a map. Data is stored in a PostGIS-enabled PostgreSQL database and can be uploaded via a GeoJSON file.

---

## 🚀 Tech Stack

- **Frontend**: React, Tailwind CSS  
- **Backend**: Django, Django REST Framework  
- **Database**: PostgreSQL with PostGIS  
- **Auth**: JWT 

---

## ⚙️ Project Setup

### 1. Backend Setup (Django)

#### Install dependencies

Create a virtual environment and install the required packages:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Make sure PostgreSQL with PostGIS is running and configured in your settings.py

To load a GeoJSON file into the PostgreSQL/PostGIS database using Django, run the following command:
python import_geojson.py "D:\TUC\Datenbanken und Web-Techniken\backend\Chemnitz.geojson" Location
Replace the file path and model name (Location) with your own if needed.

Navigate to the frontend directory and install dependencies:

cd frontend
npm install

🧪 Testing & Dev
Start Django:

python manage.py runserver
Then start the React frontend:

npm start

📍 Notes
Ensure PostgreSQL has the PostGIS extension enabled.

Tailwind is used for fast and responsive UI development.

Cross-origin requests are handled with django-cors-headers.

GeoJSON import assumes Point geometry features.
