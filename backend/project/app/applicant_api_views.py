from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.pagination import PageNumberPagination
from .models import Applicant
from .serializers import ApplicantSerializer


class ApplicantPagination(PageNumberPagination):
    page_size = 10  
    page_size_query_param = 'page_size'
    max_page_size = 100


# ✅ Logged-in users CAN View + Add Applicants
class ApplicantListAPIView(generics.ListCreateAPIView):
    queryset = Applicant.objects.all().order_by('-id')
    serializer_class = ApplicantSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
    pagination_class = ApplicantPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['Applicant_Name', 'ID_Number', 'District', 'Category']
    

# ✅ Logged-in users CAN View + Edit + Delete Applicants
class ApplicantDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]
