from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view

# We only import CustomUser now, NOT the default User!
from .models import CustomUser, TargetAsset, ScanLog, Vulnerability
from .serializers import RegisterSerializer, ScanLogSerializer
from .engine import run_security_scan

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['POST'])
def start_scan(request):
    url = request.data.get('domain_url')
    
    if not url:
        return Response({"error": "Please provide a website URL to scan."}, status=status.HTTP_400_BAD_REQUEST)

    # We use CustomUser here so the database doesn't crash!
    test_user, created = CustomUser.objects.get_or_create(username="sme_test_user")
    asset, created = TargetAsset.objects.get_or_create(owner=test_user, domain_url=url)
    
    # Create the log
    scan_log = ScanLog.objects.create(asset=asset, status='IN_PROGRESS')

    # TRIGGER THE SCANNING ENGINE
    detected_threats = run_security_scan(url)
    
    # Save the threats to the database
    for threat in detected_threats:
        Vulnerability.objects.create(
            scan=scan_log,
            technical_name=threat['technical_name'],
            plain_language_alert=threat['plain_language_alert'],
            severity=threat['severity'],
            ml_confidence_score=0.95 
        )
        
    # Mark scan as complete
    scan_log.status = 'COMPLETED'
    scan_log.save()

    # Send the final report back to the frontend
    serializer = ScanLogSerializer(scan_log)
    return Response(serializer.data, status=status.HTTP_201_CREATED)