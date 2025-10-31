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

from .models import Applicant, Connection, Status
from .serializers import ApplicantSerializer
from django.utils import timezone


# ✅ List + Create applicant (Optional - used only if you need list)
class ApplicantListCreateAPIView(generics.ListCreateAPIView):
    queryset = Applicant.objects.all().order_by("-id")
    serializer_class = ApplicantSerializer


# ✅ Single applicant retrieve/update/delete
class ApplicantRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer


# ✅ Correct Applicant create view (with auto Connection generation)
class ApplicantCreateView(APIView):
    def post(self, request):
        serializer = ApplicantSerializer(data=request.data)

        if serializer.is_valid():
            applicant = serializer.save()

            # Default status = Pending
            default_status, _ = Status.objects.get_or_create(Status_Name="Pending")

            # Auto create connection entry
            Connection.objects.create(
                Applicant=applicant,
                Load_Applied=0,
                Date_of_Application=timezone.now().date(),
                Status=default_status,
                Reviewer_ID=None,
                Reviewer_Name=None,
                Reviewer_Comments="Documents Verification in progress"
            )

            return Response({"message": "Applicant & Connection created successfully"}, status=201)
        print("❌ Serializer Error:", serializer.errors)
        return Response(serializer.errors, status=400)
