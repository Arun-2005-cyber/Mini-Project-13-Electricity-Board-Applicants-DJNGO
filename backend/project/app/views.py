from typing import Any
from django.db.models.query import QuerySet
from django.shortcuts import render, HttpResponse
import pandas as pd
from .models import Applicant, Status, Connection
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
from .serializers import ApplicantSerializer
from rest_framework.authentication import TokenAuthentication
from urllib.parse import unquote_plus
from django.http import JsonResponse
from django.db.models import Count
from django.db.models.functions import TruncMonth
from .models import Connection 
from rest_framework.permissions import AllowAny


# Create your views here.
def index(request):
    return render(request, "index.html")


def login(request):
    return render(request, "login.html")


def uploaddata(request):
    try:
        filepath = 'Electricity_board_connection_case_study.csv'
        df = pd.read_csv(filepath, encoding='latin-1')

        CHUNK_SIZE = 50
        total_rows = len(df)
        print(f"Uploading {total_rows} rows in chunks of {CHUNK_SIZE}...")

        for start in range(0, total_rows, CHUNK_SIZE):
            sub_df = df.iloc[start:start + CHUNK_SIZE]

            for index, row in sub_df.iterrows():
                applicant = Applicant.objects.filter(
                    Applicant_Name=row['Applicant_Name'],
                    Gender=row['Gender'],
                    District=row['District'],
                    State=row['State'],
                    Pincode=row['Pincode'],
                    Ownership=row['Ownership'],
                    GovtID_Type=row['GovtID_Type'],
                    ID_Number=row['ID_Number'],
                    Category=row['Category']
                ).first()

                if not applicant:
                    applicant = Applicant.objects.create(
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

                Date_of_Application = datetime.strptime(row['Date_of_Application'], "%m/%d/%Y")
                Date_of_Approval = None
                if not pd.isna(row.get('Date_of_Approval', None)):
                    try:
                        Date_of_Approval = datetime.strptime(row['Date_of_Approval'], "%m/%d/%Y")
                    except Exception:
                        # ignore malformed dates
                        Date_of_Approval = None
                Modified_Date = datetime.strptime(row['Modified_Date'], "%m/%d/%Y")

                Connection.objects.update_or_create(
                    Applicant=applicant,
                    Load_Applied=row['Load_Applied'],
                    Date_of_Application=Date_of_Application,
                    defaults={
                        'Date_of_Approval': Date_of_Approval,
                        'Modified_Date': Modified_Date,
                        'Status': status,
                        'Reviewer_ID': row.get('Reviewer_ID'),
                        'Reviewer_Name': row.get('Reviewer_Name'),
                        'Reviewer_Comments': row.get('Reviewer_Comments')
                    }
                )

                print(f"Processed ID: {row.get('ID')}")

            # Close DB connection per chunk to avoid long lived connection issues
            from django.db import connection
            connection.close()

        return HttpResponse("File data uploaded successfully in chunks.")

    except Exception as e:
        return HttpResponse(f"File data is not uploaded or not updated: {e}")


class ConnectionListView(ListView):
    model = Connection
    context_object_name = 'connection'
    paginate_by = 50
    ordering = ['id']

    def get_queryset(self):
        queryset = super().get_queryset().select_related('Applicant', 'Status').order_by(*self.ordering)
        search_query = self.request.GET.get('search', None)

        # Date filters
        start_date_param = self.request.GET.get('start_date')
        end_date_param = self.request.GET.get('end_date')
        start_date = parse_date(start_date_param) if start_date_param else None
        end_date = parse_date(end_date_param) if end_date_param else None

        # Apply search
        if search_query:
            try:
                search_int = int(search_query)
                queryset = queryset.filter(id=search_int)
            except ValueError:
                queryset = queryset.filter(Applicant__Applicant_Name__icontains=search_query)

        # Apply date filters
        if start_date and end_date:
            queryset = queryset.filter(Date_of_Application__range=[start_date, end_date])

        queryset = queryset.order_by('id')
        return queryset



    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['search_query'] = self.request.GET.get('search', '')
        return context

    def render_to_response(self, context, **response_kwargs):
        page_obj = context.get('page_obj')
        paginator = context.get('paginator')

        if not page_obj or not paginator:
            queryset = context.get('connection', self.get_queryset())
            page_obj = queryset
            total_pages = 1
            current_page_number = 1
            total_items = len(queryset)
            per_page = len(queryset)
            object_list = queryset
        else:
            object_list = page_obj.object_list
            total_pages = paginator.num_pages
            current_page_number = page_obj.number
            total_items = paginator.count
            per_page = self.paginate_by

        def serialize_conn(conn: Connection):
            fmt = lambda d: d.isoformat() if d else None
            return {
                'id': conn.id,
                'Load_Applied': conn.Load_Applied,
                'Date_of_Application': fmt(conn.Date_of_Application),
                'Date_of_Approval': fmt(getattr(conn, 'Date_of_Approval', None)),
                'Modified_Date': fmt(getattr(conn, 'Modified_Date', None)),
                'Status': conn.Status.Status_Name if conn.Status else None,
                'Applicant': {
                    'Applicant_Name': conn.Applicant.Applicant_Name,
                    'Gender': conn.Applicant.Gender,
                    'District': conn.Applicant.District,
                    'State': conn.Applicant.State,
                    'Pincode': conn.Applicant.Pincode,
                    'Ownership': conn.Applicant.Ownership,
                    'GovtID_Type': conn.Applicant.GovtID_Type,
                    'ID_Number': conn.Applicant.ID_Number,
                    'Category': conn.Applicant.Category,
                },
                'Reviewer_ID': getattr(conn, 'Reviewer_ID', None),
                'Reviewer_Name': getattr(conn, 'Reviewer_Name', None),
                'Reviewer_Comments': getattr(conn, 'Reviewer_Comments', None),
            }

        serialized_data = [serialize_conn(conn) for conn in object_list]

        response_data = {
            'data': serialized_data,  # ✅ Fixed: serialize_conn output, not page_obj.object_list
            'search_query': context.get('search_query'),
            'total_pages': total_pages,
            'current_page': current_page_number,
            'total_items': total_items,
            'per_page': per_page,
        }

        return JsonResponse(response_data, safe=False)



@csrf_exempt
def update_applicant(request, id):
    if request.method == 'GET':
        try:
            connection = Connection.objects.select_related('Applicant', 'Status').get(pk=id)
            applicant = connection.Applicant

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
                "Date_of_Application": connection.Date_of_Application.isoformat() if connection.Date_of_Application else None,
                "Date_of_Approval": connection.Date_of_Approval.isoformat() if connection.Date_of_Approval else None,
                "Modified_Date": connection.Modified_Date.isoformat() if connection.Modified_Date else None,
                "Status": connection.Status.Status_Name if connection.Status else None,
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
            connection = Connection.objects.select_related('Applicant', 'Status').get(pk=id)
            applicant = connection.Applicant
            data = json.loads(request.body)

            status_name = data.get('connection', {}).get('Status')
            status_instance = Status.objects.filter(Status_Name=status_name).first()

            if status_instance:
                applicant_data = data.get('applicant', {})
                for key, value in applicant_data.items():
                    if hasattr(applicant, key):
                        setattr(applicant, key, value)
                applicant.save()

                connection_data = data.get('connection', {})
                for key, value in connection_data.items():
                    if key != 'Status' and hasattr(connection, key):
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
    connection_requests = Connection.objects.all().values('Date_of_Application__year', 'Date_of_Application__month').annotate(total_requests=Count('id'))

    labels = [f"{x['Date_of_Application__year']}-{x['Date_of_Application__month']}" for x in connection_requests]
    total_requests = [x['total_requests'] for x in connection_requests]

    context = {
        'labels': labels,
        'total_requests': total_requests,
    }

    return render(request, 'connectionvisualization.html', context)


def connectionrequestdata(request):
    """
    API: /api/connectionrequestdata/?status=<status>
    - Accepts URL-encoded status (e.g. "Connection%20Released")
    - If status is missing or equals "all", returns data for all statuses
    - Returns JSON: { labels: [...], total_requests: [...] }
    """

    # decode and normalize status
    raw_status = request.GET.get('status', '') or ''
    selected_status = unquote_plus(raw_status).strip()
    print("DEBUG STATUS PARAM:", repr(selected_status))

    # filter connections based on status
    if selected_status and selected_status.lower() != "all":
        filtered_connections = Connection.objects.filter(Status__Status_Name__iexact=selected_status)
    else:
        filtered_connections = Connection.objects.all()

    # aggregate by month
    data_qs = (
        filtered_connections
        .annotate(month=TruncMonth('Date_of_Application'))
        .values('month')
        .annotate(total_request=Count('id'))
        .order_by('month')
    )

    labels = []
    total_requests = []
    for entry in data_qs:
        month = entry.get('month')
        if month:
            labels.append(month.strftime('%B %Y'))
            total_requests.append(entry.get('total_request', 0))

    # debug logs (safe now)
    print("DEBUG CONNECTIONS COUNT:", filtered_connections.count())
    print("DEBUG LABELS:", labels)
    print("DEBUG TOTAL_REQUESTS:", total_requests)

    return JsonResponse({
        'labels': labels,
        'total_requests': total_requests
    })

    
    print("DEBUG CONNECTIONS COUNT:", filtered_connections.count())
    print("DEBUG LABELS:", labels)
    print("DEBUG TOTAL_REQUESTS:", total_requests)

    """
    API: /api/connectionrequestdata/?status=<status>
    - Accepts URL-encoded status (e.g. "Connection%20Released")
    - If status is missing or equals "all", returns data for all statuses
    - Returns JSON: { labels: [...], total_requests: [...] }
    """
    # decode URL-encoded value (handles spaces and +)
    raw_status = request.GET.get('status', '') or ''
    selected_status = unquote_plus(raw_status).strip()
    print("DEBUG STATUS PARAM:", selected_status)
    # debug logging (optional; remove in production)
    print("connectionrequestdata - selected_status:", repr(selected_status))

    # use case-insensitive exact match; treat empty/"all" as no-filter
    if selected_status and selected_status.lower() != "all":
        filtered_connections = Connection.objects.filter(Status__Status_Name__iexact=selected_status)
    else:
        filtered_connections = Connection.objects.all()

    # Group by month and order by month (ascending)
    data_qs = (
        filtered_connections
        .annotate(month=TruncMonth('Date_of_Application'))
        .values('month')
        .annotate(total_request=Count('id'))
        .order_by('month')
    )

    # Prepare lists; ignore entries where month is None
    labels = []
    total_requests = []
    for entry in data_qs:
        m = entry.get('month')
        if m:
            labels.append(m.strftime('%B %Y'))
            total_requests.append(entry.get('total_request', 0))

    # Return an explicit, always-consistent JSON shape
    return JsonResponse({
        'labels': labels,
        'total_requests': total_requests
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_applicant_list(request):
    applicants = Applicant.objects.all()
    serializer = ApplicantSerializer(applicants, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([AllowAny])
def admin_delete_applicant(request, id):
    try:
        applicant = Applicant.objects.get(id=id)
        applicant.delete()
        return Response({'message': 'Applicant deleted successfully'})
    except Applicant.DoesNotExist:
        return Response({'error': 'Applicant not found'}, status=404)

