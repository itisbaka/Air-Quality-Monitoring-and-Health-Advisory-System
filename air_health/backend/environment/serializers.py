from rest_framework import serializers

from .models import AQIReading, Location


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'latitude', 'longitude']
        read_only_fields = ['id']


class AQIReadingSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True
    )

    class Meta:
        model = AQIReading
        fields = [
            'id',
            'location',
            'location_id',
            'timestamp',
            'aqi_value',
            'source_type',
            'pm25',
            'pm10',
            'created_by',
            'created_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
    def validate_aqi_value(self, value):
        if value < 0 or value > 500:
              raise serializers.ValidationError("AQI must be between 0 and 500")
        return value