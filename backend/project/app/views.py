from typing import Any
from django.db.models.query import QuerySet
from django.shortcuts import render,HttpResponse
import pandas as pd
from .models import Applicant,Status,Connection
from datetime import datetime
from django.views.generic import ListView
from django.http import JsonResponse
from django.core.paginator import Paginator
import json
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Applicant
from .serializers import ApplicantSerializer
from rest_framework.authentication import TokenAuthentication

# Create your views here.
def index(request):
    return render(request,"index.html")

def login(request):
    return render(request,"login.html")

def uploaddata(request):
    try:
        filepath = 'Electricity_board_connection_case_study.csv'
        df = pd.read_csv(filepath, encoding='latin-1')

        for index, row in df.iterrows():
            applicant, _ = Applicant.objects.get_or_create(
                Applicant_Name=row['Applicant_Name'],
                Gender=row['Gender'],
                District=row['District'],
                State=row['State'],
                Pincode=row['Pincode'],
                Ownership=row['Ownership'],
                GovtID_Type=row['GovtID_Type'],
                ID_Number=row['ID_Number'],
                Category=row['Category']
            )

            status, _ = Status.objects.get_or_create(Status_Name=row['Status'])

            # Fixed date format to match '5/29/2025'
            Date_of_Application = datetime.strptime(row['Date_of_Application'], "%m/%d/%Y")

            if not pd.isna(row['Date_of_Approval']):
                Date_of_Approval = datetime.strptime(row['Date_of_Approval'], "%m/%d/%Y")
            else:
                Date_of_Approval = None

            Modified_Date = datetime.strptime(row['Modified_Date'], "%m/%d/%Y")

            Connection.objects.get_or_create(
                Applicant=applicant,
                Load_Applied=row['Load_Applied'],
                Date_of_Application=Date_of_Application,
                Date_of_Approval=Date_of_Approval,
                Modified_Date=Modified_Date,
                Status=status,
                Reviewer_ID=row['Reviewer_ID'],
                Reviewer_Name=row['Reviewer_Name'],
                Reviewer_Comments=row['Reviewer_Comments']
            )

            print(f"Uploaded ID: {row['ID']}")

    except Exception as e:
        return HttpResponse(f"File data is not uploaded or not updated: {e}")

    return HttpResponse("File data is uploaded or updated successfully")


class ConnectionListView(ListView):
    model=Connection
    context_object_name='connection'
    paginate_by=50

    def get_queryset(self):
        queryset=super().get_queryset()
        search_query=self.request.GET.get('search')

        #Reterieve date range parameters
        start_date_param= self.request.GET.get('start_date')
        end_date_param= self.request.GET.get('end_date')

        #Parse date range parameters if provided
        start_date= parse_date(start_date_param) if start_date_param else None
        end_date= parse_date(end_date_param) if end_date_param else None

        # Filter connections queryset based on the search query
        if search_query:
            queryset=queryset.filter(id__icontains=search_query)

         # Filter connections queryset based on the date range
        if start_date and end_date:
            queryset=queryset.filter(Date_of_Application__gte=start_date,Date_of_Application__lte=end_date)

        return queryset 
    
    def get_context_data(self, **kwargs):
        context=super().get_context_data(**kwargs)
        context['search_query']=self.request.GET.get('search')
        return context 
    
    def render_to_response(self, context, **response_kwargs):
        serialized_data=[
            {
                'id':conn.id,
                'Load_Applied':conn.Load_Applied,
                'Date_of_Application':conn.Date_of_Application,
                'Status':conn.Status.Status_Name,
                'Applicant':{
                    'Applicant_Name':conn.Applicant.Applicant_Name,
                    'Gender':conn.Applicant.Gender,
                    'District':conn.Applicant.District,
                    'State':conn.Applicant.State,
                    'Pincode':conn.Applicant.Pincode,
                    'Ownership':conn.Applicant.Ownership,
                    'GovtID_Type':conn.Applicant.GovtID_Type,
                    'ID_Number':conn.Applicant.ID_Number,
                    'Category':conn.Applicant.Category,
                },
                'Reviewer_ID':conn.Reviewer_ID,
                'Reviewer_Name':conn.Reviewer_Name,
                'Reviewer_Comments':conn.Reviewer_Comments,

            }

            for conn in context['connection']
        ]


        paginator=Paginator(serialized_data,self.paginate_by)
        page_number=self.request.GET.get('page')
        page_obj=paginator.get_page(page_number)

        response_data={
            'data':page_obj.object_list,
            'search_query':context['search_query'],
            'total_pages':24,
            'current_pages':page_obj.number
        }

        return JsonResponse(response_data)
    
@csrf_exempt
def update_applicant(request, id):
    if request.method == 'GET':
        try:
            applicant = Applicant.objects.get(pk=id)
            connection = Connection.objects.get(Applicant=applicant)

            applicant_data = {
                "Applicant_Name": applicant.Applicant_Name,
                "Gender": applicant.Gender,
                "District": applicant.District,
                "State": applicant.State,
                "Pincode": applicant.Pincode,
                "Ownership": applicant.Ownership,
                "GovtID_Type": applicant.GovtID_Type,
                "ID_Number": applicant.ID_Number,
                "Category": applicant.Category
            }

            connection_data = {
                "Load_Applied": connection.Load_Applied,
                "Date_of_Application": connection.Date_of_Application,
                "Date_of_Approval": connection.Date_of_Approval,
                "Modified_Date": connection.Modified_Date,
                "Status": connection.Status.Status_Name,
                "Reviewer_ID": connection.Reviewer_ID,
                "Reviewer_Name": connection.Reviewer_Name,
                "Reviewer_Comments": connection.Reviewer_Comments
            }

            return JsonResponse({'applicant': applicant_data, 'connection': connection_data})

        except Applicant.DoesNotExist:
            return JsonResponse({'error': "Applicant not found"}, status=404)
        except Connection.DoesNotExist:
            return JsonResponse({'error': "Connection not found"}, status=404)

    elif request.method == 'POST':
        try:
            applicant = Applicant.objects.get(pk=id)
            connection = Connection.objects.get(Applicant=applicant)
            data = json.loads(request.body)

            status_name = data.get('connection', {}).get('Status')
            status_instance = Status.objects.filter(Status_Name=status_name).first()

            if status_instance:
                applicant_data = data.get('applicant', {})
                for key, value in applicant_data.items():
                    setattr(applicant, key, value)
                applicant.save()

                connection_data = data.get('connection', {})
                for key, value in connection_data.items():
                    if key != 'Status':
                        setattr(connection, key, value)

                connection.Status = status_instance
                connection.save()

                return JsonResponse({'success': 'Applicant details updated successfully'})
            else:
                return JsonResponse({'error': 'Invalid status value'}, status=400)

        except Applicant.DoesNotExist:
            return JsonResponse({'error': 'Applicant not found'}, status=404)
        except Connection.DoesNotExist:
            return JsonResponse({'error': 'Connection not found'}, status=404)

        

def connectionvisualization(request):
    connection_requests = Connection.objects.all().values('Date_of_Application__year','Date_of_Application__month').annotate(total_requests=Count('id'))

    labels=[f"{x['Date_of_Application__year']}-{x['Date_of_Application__month']}" for x in connection_requests]
    total_requests=[x['total_requests'] for x in connection_requests] 

    context={
        'labels':labels,
        'total_requests':total_requests,
    }   

    return render(request, 'connectionvisualization.html',context)

def connectionrequestdata(request):
    selected_status=request.GET.get('status')
    if selected_status:
        filtered_connections=Connection.objects.filter(Status__Status_Name=selected_status)    
    else:
        filtered_connections=Connection.objects.all()

    data=filtered_connections.annotate(month=TruncMonth('Date_of_Application')).values('month').annotate(total_request=Count('id'))
    print("DEBUG DATA:", list(data))
    labels=[entry['month'].strftime('%B %Y')for entry in data]
    total_requests=[entry['total_request'] for entry in data]

    return JsonResponse({'labels':labels,'total_requests':total_requests})    

# ✅ View all applicants (Admin only)
@api_view(['GET','PATCH'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAdminUser])
def admin_applicant_list(request):
    applicants = Applicant.objects.all()
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)

# ✅ Delete applicant (Admin only)
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_applicant(request, id):
    try:
        applicant = Applicant.objects.get(id=id)
        applicant.delete()
        return Response({'message': 'Applicant deleted successfully'})
    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=404)