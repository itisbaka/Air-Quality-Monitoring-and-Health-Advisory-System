from django.conf import settings
from django.db import models


class Location(models.Model):
    """A physical location where AQI readings are recorded."""

    name = models.CharField(max_length=120)
    latitude = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    longitude = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)

    def __str__(self):
        return self.name


class AQIReading(models.Model):
    """An Air Quality Index measurement for a location at a point in time."""

    class SourceType(models.TextChoices):
        MANUAL = 'manual', 'Manual Entry'
        SENSOR = 'sensor', 'Sensor'
        IMPORT = 'import', 'Import'

    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='readings')
    timestamp = models.DateTimeField()
    aqi_value = models.PositiveIntegerField()
    source_type = models.CharField(
        max_length=16,
        choices=SourceType.choices,
        default=SourceType.MANUAL,
        help_text='How this AQI reading was created.',
    )
    pm25 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='PM2.5 concentration (µg/m³)')
    pm10 = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text='PM10 concentration (µg/m³)')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.location} @ {self.timestamp:%Y-%m-%d %H:%M} -> AQI {self.aqi_value}"
