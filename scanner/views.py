import razorpay
from django.conf import settings
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

# We only import CustomUser now, NOT the default User!
from .models import CustomUser, TargetAsset, ScanLog, Vulnerability
from .serializers import RegisterSerializer, ScanLogSerializer
from .engine import run_security_scan

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
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

@api_view(['GET'])
def get_scan_history(request):
    # Find the same user we used for the scanner
    test_user, created = CustomUser.objects.get_or_create(username="sme_test_user")
    
    # Grab all their past scans, ordered by newest first (-id)
    logs = ScanLog.objects.filter(asset__owner=test_user).order_by('-id')
    
    # Translate it to JSON and send it to React
    serializer = ScanLogSerializer(logs, many=True)
    return Response(serializer.data)
# Initialize Razorpay Client
razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

@api_view(['POST'])
def create_subscription(request):
    try:
        # We charge ₹999 for the Premium Tier (Razorpay calculates in paise, so multiply by 100)
        amount = 999 * 100 
        currency = "INR"

        # Ask Razorpay to create a secure order
        razorpay_order = razorpay_client.order.create(dict(
            amount=amount,
            currency=currency,
            payment_capture='0'
        ))

        # Send the order ID back to React so it can open the payment popup
        return Response({
            'order_id': razorpay_order['id'],
            'amount': amount,
            'currency': currency,
            'key_id': settings.RAZORPAY_KEY_ID
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)