import json
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import Point
from cultural_sites.models import Location

class Command(BaseCommand):
    help = 'Imports location data from a GeoJSON file into the database'

    def add_arguments(self, parser):
        parser.add_argument('geojson_file', type=str, help='Path to the GeoJSON file')

    def handle(self, *args, **options):
        file_path = options['geojson_file']

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error reading file: {e}"))
            return

        count = 0
        for feature in data.get('features', []):
            properties = feature.get('properties', {})
            geometry = feature.get('geometry')

            if geometry and geometry.get('type') == 'Point':
                coords = geometry.get('coordinates')
                if not coords or len(coords) != 2:
                    continue

                osm_id = str(properties.get('osm_id') or properties.get('@id') or '')

                if not osm_id:
                    continue

                location, created = Location.objects.update_or_create(
                    osm_id=osm_id,
                    defaults={
                        'geometry': Point(coords[0], coords[1]),
                        'name': properties.get('name'),
                        'website': properties.get('website'),
                        'operator': properties.get('operator'),
                        'tourism': properties.get('tourism'),
                        'amenity': properties.get('amenity'),
                        'landuse': properties.get('landuse'),
                        'wheelchair': properties.get('wheelchair'),
                        'wikidata': properties.get('wikidata'),
                    }
                )

                count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} locations.'))
