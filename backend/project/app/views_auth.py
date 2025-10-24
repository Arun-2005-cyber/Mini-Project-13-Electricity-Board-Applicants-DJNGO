from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if not username or not password:
                return JsonResponse({"status": "error", "message": "Username and password required"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"status": "error", "message": "Username already exists"}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            return JsonResponse({"status": "success", "message": "User created successfully"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(username=username, password=password)
            if user is not None:
                return JsonResponse({
                    "status": "success",
                    "message": "Login successful",
                    "username": user.username,
                    "email": user.email,
                })
            else:
                return JsonResponse({"status": "error", "message": "Invalid credentials"}, status=401)
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    else:
        return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)
