from django.contrib.gis.db import models

class Location(models.Model):
    # Unique identifier from OSM
    osm_id = models.CharField(max_length=100, unique=True, db_index=True)
    
    # Geometry field for storing point coordinates
    geometry = models.PointField()
    
    # Basic information
    name = models.CharField(max_length=255, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    operator = models.CharField(max_length=255, blank=True, null=True)
    
    # Classification fields
    tourism = models.CharField(max_length=100, blank=True, null=True)
    amenity = models.CharField(max_length=100, blank=True, null=True)
    landuse = models.CharField(max_length=100, blank=True, null=True)
    
    # Accessibility
    wheelchair = models.CharField(max_length=100, blank=True, null=True)
    
    # External references
    wikidata = models.CharField(max_length=100, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cultural_sites_location'
        indexes = [
            models.Index(fields=['osm_id']),
            models.Index(fields=['name']),
            models.Index(fields=['tourism']),
            models.Index(fields=['amenity']),
        ]
    
    def __str__(self):
        return self.name or self.osm_id or f'Location {self.id}'
    
    @property
    def coordinates(self):
        """Return coordinates as [longitude, latitude]"""
        if self.geometry:
            return [self.geometry.x, self.geometry.y]
        return None
    
    @property
    def latitude(self):
        """Return latitude"""
        if self.geometry:
            return self.geometry.y
        return None
    
    @property
    def longitude(self):
        """Return longitude"""
        if self.geometry:
            return self.geometry.x
        return None