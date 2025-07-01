
from django.urls import path
from .views import  CustomTokenObtainPairView,CustomTokenRefreshView,logout,is_authenticated,register,location_list,location,get_logged_in_user,delete_user,add_to_favorites,remove_from_favorites,list_favorites
urlpatterns = [
    
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/',logout),
    path('authenticated/',is_authenticated),
    path('register/',register),
    path('location/', location_list, name='location'),
    path('locations/', location, name='locations'),
    path('user-info/',get_logged_in_user,name='user_info'),
    path('delete/',delete_user,name='delete'),
    path('add/',add_to_favorites,name='add_to_favorites'),
    path('remove/<int:location_id>/', remove_from_favorites, name='remove_from_favorites'),
    path('list/',list_favorites,name='list_favorites')
    
]