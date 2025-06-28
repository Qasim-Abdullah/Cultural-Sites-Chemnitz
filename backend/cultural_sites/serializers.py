from rest_framework import serializers
from .models import  Location
from django.contrib.auth.models import User
from rest_framework_gis.serializers import GeoFeatureModelSerializer

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['first_name','last_name','username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class LocationSerializer(GeoFeatureModelSerializer):
    class Meta:
        model = Location
        geo_field = "geometry"  # required for GeoJSON output
        fields = "__all__"