from django.db import models
from django.contrib.auth.models import User
import uuid

class TargetAsset(models.Model):
    """
    Represents the SME's website or web application being monitored.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assets')
    domain_url = models.URLField(max_length=255)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.domain_url} ({self.owner.username})"

class ScanLog(models.Model):
    """
    Tracks every automated security scan initiated by the ML engine or user.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    asset = models.ForeignKey(TargetAsset, on_delete=models.CASCADE, related_name='scans')
    scan_type = models.CharField(max_length=50, default="OWASP_Basic")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Scan {self.id} - {self.status}"

class Vulnerability(models.Model):
    """
    Logs specific threats detected during a scan, translating technical jargon into plain language.
    """
    SEVERITY_LEVELS = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scan = models.ForeignKey(ScanLog, on_delete=models.CASCADE, related_name='vulnerabilities')
    technical_name = models.CharField(max_length=255) # e.g., "Missing HSTS Header"
    plain_language_alert = models.TextField() # e.g., "Your customer data is not securely encrypted in transit."
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS)
    ml_confidence_score = models.FloatField(help_text="Confidence score from the threat defense model (0.0 to 1.0)")
    is_false_positive = models.BooleanField(default=False) # Used to train the ML model
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.technical_name} ({self.severity})"
