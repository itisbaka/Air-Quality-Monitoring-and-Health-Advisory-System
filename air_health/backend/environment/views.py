from rest_framework import generics, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny
from django.utils import timezone
import requests
import csv
from io import TextIOWrapper
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
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsEnvironmentalOfficer()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        location_id = self.request.query_params.get('location')
        queryset = super().get_queryset()
        if location_id:
            queryset = queryset.filter(location_id=location_id)
        return queryset


@api_view(['POST'])
@permission_classes([AllowAny])
def fetch_openaq_data(request):
    try:
        url = "https://api.openaq.org/v2/latest?limit=1"
        response = requests.get(url)
        data = response.json()

        # 🔥 SAFE CHECK
        results = data.get("results", [])
        if not results:
            return Response({"error": "No data from OpenAQ"}, status=400)

        result = results[0]

        location_name = result.get("location", "Unknown")
        measurements = result.get("measurements", [])

        # Extract values safely
        pm25 = None
        pm10 = None

        for m in measurements:
            if m.get("parameter") == "pm25":
                pm25 = m.get("value")
            if m.get("parameter") == "pm10":
                pm10 = m.get("value")

        if pm25 is not None:
              aqi_value = int(pm25)
        elif pm10 is not None:
              aqi_value = int(pm10)
        else:
             return Response({"error": "No usable AQI data"}, status=400)

        aqi_value = int(pm25)

        location, _ = Location.objects.get_or_create(name=location_name)

        reading = AQIReading.objects.create(
            location=location,
            aqi_value=aqi_value,
            timestamp=timezone.now(),
            source_type="api",
            pm25=pm25,
            pm10=pm10
        )

        return Response({
            "message": "Data fetched successfully",
            "aqi": reading.aqi_value,
            "location": location.name
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)
@api_view(['POST'])
@permission_classes([AllowAny])
def upload_csv(request):
    try:
        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No file uploaded"}, status=400)

        decoded_file = TextIOWrapper(file.file, encoding='utf-8')
        reader = csv.DictReader(decoded_file)

        created_count = 0

        for row in reader:
            location_name = row.get("location")
            aqi = int(row.get("aqi_value", 0))
            pm25 = float(row.get("pm25", 0))
            pm10 = float(row.get("pm10", 0))
            timestamp = row.get("timestamp")

            location, _ = Location.objects.get_or_create(name=location_name)

            AQIReading.objects.create(
                location=location,
                aqi_value=aqi,
                pm25=pm25,
                pm10=pm10,
                timestamp=timestamp,
                source_type="csv"
            )

            created_count += 1

        return Response({"message": f"{created_count} records uploaded"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)