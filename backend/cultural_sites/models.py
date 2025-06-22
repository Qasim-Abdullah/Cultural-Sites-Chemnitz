from django.contrib.auth.models import User
from django.contrib.gis.db import models

class Location(models.Model):
    osm_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    operator = models.CharField(max_length=255, blank=True, null=True)
    tourism = models.CharField(max_length=100, blank=True, null=True)
    wheelchair = models.CharField(max_length=100, blank=True, null=True)
    landuse = models.CharField(max_length=100, blank=True, null=True)
    wikidata = models.CharField(max_length=100, blank=True, null=True)
    geometry = models.PointField()  # requires PostGIS

    def __str__(self):
        return self.name or self.osm_id

class Note(models.Model):
    description = models.CharField(max_length=300)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.owner.username}"
