#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Checking psycopg2 installation..."
python -c "import psycopg2; print('psycopg2 imported successfully')"

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Running migrations..."
python manage.py migrate

echo "Loading GeoJSON data..."
python manage.py import_geojson "Chemnitz.geojson"

echo "Build completed successfully!"