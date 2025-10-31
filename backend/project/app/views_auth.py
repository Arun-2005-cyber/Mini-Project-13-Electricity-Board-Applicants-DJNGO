from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import json, jwt, datetime
from django.conf import settings
from rest_framework.authtoken.models import Token
from .models import Applicant, Status, Connection


@csrf_exempt
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



@csrf_exempt
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


@csrf_exempt
def create_applicant(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    if not request.user.is_staff:  # only admin can create
        return JsonResponse({"error": "Not authorized"}, status=403)

    try:
        data = json.loads(request.body)

        applicant = Applicant.objects.create(
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

        return JsonResponse({"success": True, "id": applicant.id})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
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
