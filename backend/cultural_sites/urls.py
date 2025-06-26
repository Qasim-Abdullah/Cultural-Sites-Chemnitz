
from django.urls import path
from .views import get_notes, CustomTokenObtainPairView,CustomTokenRefreshView,logout,is_authenticated,register,create_note,location_list,location
urlpatterns = [
    
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('notes/',get_notes , name='get_notes'),
    path('logout/',logout),
    path('authenticated/',is_authenticated),
    path('register/',register),
    path('create/', create_note, name='create_note'),
    path('location/', location_list, name='location'),
    path('locations/', location, name='locations')
    
]