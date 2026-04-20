from django.urls import path
from .views import (
    AQIReadingListCreateView,
    LocationListCreateView,
    fetch_openaq_data,
    upload_csv   # 🔥 ADD THIS
)

urlpatterns = [
    path('locations/', LocationListCreateView.as_view(), name='locations'),
    path('aqi-readings/', AQIReadingListCreateView.as_view(), name='aqi_readings'),
    path('fetch-openaq/', fetch_openaq_data, name='fetch_openaq'),
    path('upload-csv/', upload_csv),
]