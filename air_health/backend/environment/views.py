from rest_framework import generics, permissions

from .models import AQIReading, Location
from .permissions import IsEnvironmentalOfficer
from .serializers import AQIReadingSerializer, LocationSerializer


class LocationListCreateView(generics.ListCreateAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]


class AQIReadingListCreateView(generics.ListCreateAPIView):
    queryset = AQIReading.objects.select_related('location', 'created_by').all()
    serializer_class = AQIReadingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Allow authenticated users to list readings, but only officers can create.
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsEnvironmentalOfficer()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        # For now, all authenticated users see all readings.
        location_id = self.request.query_params.get('location')
        queryset = super().get_queryset()
        if location_id:
           queryset = queryset.filter(location_id=location_id)

        return queryset
