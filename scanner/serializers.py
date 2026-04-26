from rest_framework import serializers
from .models import TargetAsset, ScanLog, Vulnerability

class VulnerabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Vulnerability
        fields = ['id', 'technical_name', 'plain_language_alert', 'severity', 'is_false_positive']

class ScanLogSerializer(serializers.ModelSerializer):
    # This automatically nests the detected threats inside the scan report!
    vulnerabilities = VulnerabilitySerializer(many=True, read_only=True)

    class Meta:
        model = ScanLog
        fields = ['id', 'scan_type', 'status', 'started_at', 'completed_at', 'vulnerabilities']

class TargetAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetAsset
        fields = ['id', 'domain_url', 'is_verified', 'created_at']