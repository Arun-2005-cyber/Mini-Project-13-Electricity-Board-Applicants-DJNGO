# app/views_auth.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from rest_framework.authtoken.models import Token
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from .models import Applicant
from rest_framework import generics
from .serializers import ApplicantSerializer


# If you still want separate URL endpoints for admin create/delete (optional)
class ApplicantListCreateAPIView(generics.ListCreateAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer

class ApplicantRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer