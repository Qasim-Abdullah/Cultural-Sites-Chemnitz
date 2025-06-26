import os
import sys
import json
from pathlib import Path

# GDAL Configuration - Set this BEFORE importing Django
os.environ['GDAL_LIBRARY_PATH'] = r'C:\OSGeo4W\bin\gdal311.dll'
os.environ['GEOS_LIBRARY_PATH'] = r'C:\OSGeo4W\bin\geos_c.dll'

# Add your Django project root to Python path
project_root = Path(__file__).resolve().parent
sys.path.append(str(project_root))

# Setup Django environment BEFORE importing Django modules
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Import and setup Django
import django
django.setup()

# NOW import Django GIS modules after setup
from django.contrib.gis.geos import GEOSGeometry
from django.core.exceptions import ValidationError

# Import your models after Django setup
from cultural_sites.models import *  # Adjust based on your actual models

def load_geojson_to_postgres(geojson_file_path, model_class=None):
    
    try:
        # Read GeoJSON file
        with open(geojson_file_path, 'r', encoding='utf-8') as file:
            geojson_data = json.load(file)
        
        print(f"✅ Successfully loaded GeoJSON file: {geojson_file_path}")
        print(f"📊 Total features: {len(geojson_data.get('features', []))}")
        
        # Process each feature
        created_count = 0
        updated_count = 0
        error_count = 0
        
        for i, feature in enumerate(geojson_data.get('features', [])):
            try:
                # Extract geometry
                geometry = feature.get('geometry')
                properties = feature.get('properties', {})
                
                if not geometry:
                    print(f"⚠️  Feature {i+1}: No geometry found, skipping")
                    continue
                
                # Convert geometry to Django Point (your model uses PointField)
                geos_geom = GEOSGeometry(json.dumps(geometry))
                
                # Ensure it's a Point geometry
                if geos_geom.geom_type != 'Point':
                    print(f"⚠️  Feature {i+1}: Expected Point geometry, got {geos_geom.geom_type}, skipping")
                    continue
                
                # If no model class provided, just print the data
                if model_class is None:
                    print(f"\n🗺️  Feature {i+1}:")
                    print(f"   Geometry Type: {geos_geom.geom_type}")
                    print(f"   Coordinates: {geos_geom.coords}")
                    print(f"   Properties: {properties}")
                    created_count += 1
                else:
                    # Map GeoJSON properties to Location model fields
                    instance_data = {
                        'geometry': geos_geom,
                        'osm_id': properties.get('osm_id') or properties.get('id') or f'generated_{i+1}',
                        'name': properties.get('name'),
                        'website': properties.get('website'),
                        'operator': properties.get('operator'),
                        'tourism': properties.get('tourism'),
                        'wheelchair': properties.get('wheelchair'),
                        'landuse': properties.get('landuse'),
                        'wikidata': properties.get('wikidata'),
                        'amenity': properties.get('amenity'),
                    }
                    
                    # Clean the data - truncate strings that are too long
                    if instance_data['osm_id'] and len(instance_data['osm_id']) > 100:
                        instance_data['osm_id'] = instance_data['osm_id'][:100]
                    
                    for field in ['name', 'operator']:
                        if instance_data[field] and len(instance_data[field]) > 255:
                            instance_data[field] = instance_data[field][:255]
                    
                    for field in ['tourism', 'wheelchair', 'landuse', 'wikidata','amenity']:
                        if instance_data[field] and len(instance_data[field]) > 100:
                            instance_data[field] = instance_data[field][:100]
                    
                    # Try to get existing location by osm_id, or create new one
                    location, created = model_class.objects.get_or_create(
                        osm_id=instance_data['osm_id'],
                        defaults=instance_data
                    )
                    
                    if created:
                        print(f"✅ Feature {i+1}: Created new Location '{location.name or location.osm_id}'")
                        created_count += 1
                    else:
                        # Update existing location with new data
                        updated_fields = []
                        for field, value in instance_data.items():
                            if field != 'osm_id' and value is not None:
                                current_value = getattr(location, field)
                                if current_value != value:
                                    setattr(location, field, value)
                                    updated_fields.append(field)
                        
                        if updated_fields:
                            location.save()
                            print(f"🔄 Feature {i+1}: Updated Location '{location.name or location.osm_id}' - fields: {', '.join(updated_fields)}")
                            updated_count += 1
                        else:
                            print(f"ℹ️  Feature {i+1}: No changes for Location '{location.name or location.osm_id}'")
                    
            except ValidationError as e:
                print(f"❌ Feature {i+1}: Validation error - {e}")
                error_count += 1
            except Exception as e:
                print(f"❌ Feature {i+1}: Error - {e}")
                error_count += 1
        
        # Summary
        print(f"\n📋 SUMMARY:")
        print(f"   ✅ Created: {created_count}")
        print(f"   🔄 Updated: {updated_count}")
        print(f"   ❌ Errors: {error_count}")
        print(f"   📊 Total features processed: {len(geojson_data.get('features', []))}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ Error: GeoJSON file not found at {geojson_file_path}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format - {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def show_model_field_mapping():
    """
    Show the field mapping for the Location model
    """
    mapping_info = '''
📝 GeoJSON Property → Location Model Field Mapping:
===============================================

Required Fields:
- osm_id: Unique identifier (will use 'osm_id', 'id', or generate one)
- geometry: Point coordinates (must be Point geometry type)

Optional Fields:
- name → name (max 255 chars)
- website → website (must be valid URL format)
- operator → operator (max 255 chars) 
- tourism → tourism (max 100 chars)
- wheelchair → wheelchair (max 100 chars)
- landuse → landuse (max 100 chars)
- wikidata → wikidata (max 100 chars)

Expected GeoJSON Structure:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "osm_id": "way/123456789",
        "name": "Cultural Site Name",
        "tourism": "museum",
        "website": "https://example.com",
        "operator": "Site Operator",
        "wheelchair": "yes",
        "landuse": "commercial",
        "wikidata": "Q123456"
      }
    }
  ]
}
'''
    print(mapping_info)

def main():
    """
    Main function to run the GeoJSON loader
    """
    print("🚀 GeoJSON to PostgreSQL Loader")
    print("=" * 40)
    
    # Check command line arguments
    if len(sys.argv) < 2:
        print("Usage: python import_geojson.py <path_to_geojson_file> [Location]")
        print("\nExamples:")
        print("  python import_geojson.py data/cultural_sites.geojson")
        print("  python import_geojson.py data/cultural_sites.geojson Location")
        print("\nIf no model name is provided, the script will just display the data.")
        show_model_field_mapping()
        return
    
    geojson_file = sys.argv[1]
    model_name = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Try to get the model class if model name is provided
    model_class = None
    if model_name:
        try:
            # Try to import the model from cultural_sites app
            from cultural_sites import models as app_models
            model_class = getattr(app_models, model_name)
            print(f"📦 Using model: {model_name}")
        except AttributeError:
            print(f"❌ Model '{model_name}' not found in cultural_sites app")
            print("Available models might include:")
            try:
                for attr_name in dir(app_models):
                    attr = getattr(app_models, attr_name)
                    if hasattr(attr, '_meta') and hasattr(attr._meta, 'model_name'):
                        print(f"   - {attr_name}")
            except:
                pass
            return
        except Exception as e:
            print(f"❌ Error importing model: {e}")
            return
    
    # Load the GeoJSON data
    success = load_geojson_to_postgres(geojson_file, model_class)
    
    if success:
        print("\n🎉 GeoJSON loading completed!")
        if model_class:
            print(f"💾 Data saved to PostgreSQL table: {model_class._meta.db_table}")
    else:
        print("\n💥 GeoJSON loading failed!")

if __name__ == "__main__":
    main()
