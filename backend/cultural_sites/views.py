from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Location
from .serializers import UserRegisterSerializer,LocationSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from django.db.models import Q
from rest_framework import status
# Create your views here.

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            #return super().post(request, *args, **kwargs)
            response=super().post( request,*args,**kwargs)
            token=response.data
            access_token=token['access']
            refresh_token=token['refresh']
            res =Response()
            res.data={'success':True}
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res
            
        except:
            return Response({'success':False})

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            
            tokens = response.data
            access_token = tokens['access']

            res = Response()

            res.data = {'refreshed': True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res

        except:
            return Response({'refreshed':False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'success':True})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    print(request.data)
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
        
    print(serializer.errors)
    return Response(serializer.errors,status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_logged_in_user(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
    })

@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {'success':True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('response_token', path='/', samesite='None')
        return res

    except:
        return Response({'success':False})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def location_list(request):
    if request.method == 'GET':
        locations = Location.objects.all()
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request):
    user = request.user
    user.delete()
    return Response({"message": "User deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def location(request):
    if request.method == 'GET':
        # Get query parameters for filtering
        location_type = request.GET.get('type', None)
        search_query = request.GET.get('search', None)
        city = request.GET.get('city', None)
        wheelchair_accessible = request.GET.get('wheelchair', None)
        
        # Start with all locations
        locations = Location.objects.all()
        
        # Filter by type (amenity, tourism, landuse)
        if location_type:
            locations = locations.filter(
                Q(amenity__icontains=location_type) |
                Q(tourism__icontains=location_type) |
                Q(landuse__icontains=location_type)
                
            )
        
        # Filter by search query (name or address)
        if search_query:
            locations = locations.filter(
                Q(name__icontains=search_query) |
                Q(addr_street__icontains=search_query) |
                Q(addr_city__icontains=search_query)
            )
        
        # Filter by city
        if city:
            locations = locations.filter(addr_city__iexact=city)
        
        # Filter by wheelchair accessibility
        if wheelchair_accessible:
            if wheelchair_accessible.lower() == 'true':
                locations = locations.filter(wheelchair='yes')
            elif wheelchair_accessible.lower() == 'limited':
                locations = locations.filter(wheelchair='limited')
            elif wheelchair_accessible.lower() == 'false':
                locations = locations.filter(
                    Q(wheelchair='no') | Q(wheelchair__isnull=True)
                )
        
        # Order by name for consistent results
        locations = locations.order_by('name')
        
        serializer = LocationSerializer(locations, many=True)
        "return Response(serializer.data)"
        return Response({
            "type": "FeatureCollection",
            "features": serializer.data
        })

    elif request.method == 'POST':
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)