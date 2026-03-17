from django.contrib import admin

from .models import AQIReading, Location


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'latitude', 'longitude')


@admin.register(AQIReading)
class AQIReadingAdmin(admin.ModelAdmin):
    list_display = ('location', 'timestamp', 'aqi_value', 'source_type', 'created_by', 'created_at')
    list_filter = ('location', 'source_type')
    search_fields = ('location__name',)
