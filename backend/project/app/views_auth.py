from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
import json, jwt, datetime
from django.conf import settings


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
            if user is not None:
                # ✅ Create JWT token
                payload = {
                    "id": user.id,
                    "username": user.username,
                    "is_admin": user.is_staff,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12),
                    "iat": datetime.datetime.utcnow()
                }

                token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

                return JsonResponse({
                    "status": "success",
                    "message": "Login successful",
                    "username": user.username,
                    "email": user.email,
                    "token": token,           # 🔥 send token to frontend
                    "is_admin": user.is_staff
                })
            else:
                return JsonResponse(
                    {"status": "error", "message": "Invalid credentials"},
                    status=401
                )

        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request method"}, status=405)
