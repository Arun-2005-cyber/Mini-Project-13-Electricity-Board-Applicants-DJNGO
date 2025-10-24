from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Applicant
from .serializers import ApplicantSerializer
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, filters
from rest_framework.pagination import PageNumberPagination

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

# GET all applicants, POST new one (if needed)
class ApplicantPagination(PageNumberPagination):
    page_size = 10  # 10 per page
    page_size_query_param = 'page_size'
    max_page_size = 100

class ApplicantListAPIView(generics.ListAPIView):
    queryset = Applicant.objects.all().order_by('-id')
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = ApplicantPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'email', 'status']  # Searchable fields
class ApplicantDetailAPIView(generics.RetrieveUpdateAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    permission_classes = [permissions.IsAdminUser]
