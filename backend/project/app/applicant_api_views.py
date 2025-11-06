# app/views_auth.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from rest_framework.authtoken.models import Token
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods

from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView

from .models import Applicant, Connection, Status
from .serializers import ApplicantSerializer,ConnectionSerializer
from django.utils import timezone


# ✅ List + Create applicant (Optional - used only if you need list)
class ApplicantListCreateAPIView(generics.ListCreateAPIView):
    queryset = Applicant.objects.all().order_by("-id")
    serializer_class = ApplicantSerializer


# ✅ Single applicant retrieve/update/delete
class ConnectionRetrieveUpdateDestroyAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer



# ✅ Correct Applicant create view (with auto Connection generation)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

class ApplicantCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("📩 Incoming POST data:", request.data)
        print("🧍 Authenticated user:", request.user)
        print("✅ Is Authenticated:", request.user.is_authenticated)

        serializer = ApplicantSerializer(data=request.data)

        try:
            if serializer.is_valid():
                applicant = serializer.save(created_by=request.user)
                # ✅ Default status = Pending
                default_status, _ = Status.objects.get_or_create(Status_Name="Pending")

                Connection.objects.create(
                    created_by=request.user,
                    Applicant=applicant,
                    Load_Applied=0,
                    Date_of_Application=timezone.now().date(),
                    Status=default_status,
                    Reviewer_ID=None,
                    Reviewer_Name=None,
                    Reviewer_Comments="Documents Verification in progress"
                )

                return Response(
                    {"message": "Applicant & Connection created successfully"},
                    status=status.HTTP_201_CREATED
                )

            else:
                print("❌ Serializer Validation Error:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            import traceback; traceback.print_exc()
            print("🔥 Server crashed on applicant create:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
