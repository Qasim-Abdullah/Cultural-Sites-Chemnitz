
from django.urls import path
from .views import  CustomTokenObtainPairView,CustomTokenRefreshView,logout,is_authenticated,register,location_list,location,get_logged_in_user
urlpatterns = [
    
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',logout),
    path('authenticated/',is_authenticated),
    path('register/',register),
    path('location/', location_list, name='location'),
    path('locations/', location, name='locations'),
    path('user-info/',get_logged_in_user,name='user_info')
    
]