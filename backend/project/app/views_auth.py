from urllib import request
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import json, jwt, datetime
from django.conf import settings
from rest_framework.authtoken.models import Token
from .models import Applicant, Status, Connection
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from rest_framework.response import Response


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == "GET":
        # ✅ Admin-style view: show all applicants (not just created_by)
        applicants = Applicant.objects.all().order_by("-id")[:10]  # show recent 10 applicants
        total_count = Applicant.objects.count()

        applicant_list = applicants.values("id", "Applicant_Name")

        return Response({
            "username": user.username,
            "email": user.email,
            "total_applicants": total_count,
            "applicants": applicant_list,  # ✅ include id + name
        })

    if request.method == "PUT":
        new_username = request.data.get("username", user.username)
        new_email = request.data.get("email", user.email)

        if User.objects.exclude(id=user.id).filter(username=new_username).exists():
            return Response({"error": "Username already taken!"}, status=400)

        user.username = new_username
        user.email = new_email
        user.first_name = request.data.get("first_name", user.first_name)
        user.last_name = request.data.get("last_name", user.last_name)
        user.save()

        return Response({
            "username": user.username,
            "email": user.email
        }, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def signup(request):
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if not username or not email or not password:
            return JsonResponse({"status": "error", "message": "All fields are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({"status": "error", "message": "Username already taken"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"status": "error", "message": "Email already registered"}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()

        return JsonResponse({"status": "success", "message": "User created successfully"}, status=201)

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=400)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(username=username, password=password)
            if user:
                token, _ = Token.objects.get_or_create(user=user)
                return JsonResponse({
                    "status": "success",
                    "message": "Login successful",
                    "username": user.username,
                    "email": user.email,
                    "token": token.key,     # <---- THIS is the key line
                    "is_admin": user.is_staff,  # optional
                })
            else:
                return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_applicant(request):
    print("Authenticated user:", request.user)
    print("Is Authenticated:", request.user.is_authenticated)
    try:
        data = request.data

        applicant = Applicant.objects.create(
            created_by=request.user,
            Applicant_Name=data["Applicant_Name"],
            Gender=data["Gender"],
            District=data["District"],
            State=data["State"],
            Pincode=data["Pincode"],
            Ownership=data["Ownership"],
            GovtID_Type=data["GovtID_Type"],
            ID_Number=data["ID_Number"],
            Category=data["Category"],
        )

        return Response({"success": True, "id": applicant.id}, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_applicant(request, id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Invalid request"}, status=405)

    if not request.user.is_staff:
        return JsonResponse({"error": "Not authorized"}, status=403)

    try:
        applicant = Applicant.objects.get(id=id)
        applicant.delete()
        return JsonResponse({"success": True})
    except Applicant.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)
