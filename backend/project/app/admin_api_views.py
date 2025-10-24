from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Applicant
from .serializers import ApplicantSerializer
from django.shortcuts import get_object_or_404

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# GET all applicants, POST new one (if needed)
class ApplicantListAPIView(generics.ListCreateAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [IsAdminUser]

# Retrieve, update, or delete a specific applicant
class ApplicantDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [IsAdminUser]
