from django.urls import path

from .views import AQIReadingListCreateView, LocationListCreateView

urlpatterns = [
    path('locations/', LocationListCreateView.as_view(), name='locations'),
    path('aqi-readings/', AQIReadingListCreateView.as_view(), name='aqi_readings'),
]
