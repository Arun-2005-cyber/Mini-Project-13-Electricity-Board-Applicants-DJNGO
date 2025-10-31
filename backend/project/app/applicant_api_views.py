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

@csrf_exempt
def signup(request):
    # (keep your existing signup implementation)
    ...

@csrf_exempt
def login_view(request):
    # (keep your existing login implementation)
    ...

# If you still want separate URL endpoints for admin create/delete (optional)
@csrf_exempt
@require_http_methods(["POST"])
def create_applicant(request):
    # Require authentication + admin: use Token in header to find user
    token_key = request.META.get("HTTP_AUTHORIZATION", "").replace("Token ", "")
    from rest_framework.authtoken.models import Token as DRFToken
    try:
        token = DRFToken.objects.get(key=token_key)
        user = token.user
    except Exception:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if not user.is_staff:
        return JsonResponse({"error": "Not authorized"}, status=403)

    try:
        data = json.loads(request.body)
        applicant = Applicant.objects.create(
            Applicant_Name=data.get("Applicant_Name", ""),
            Gender=data.get("Gender", ""),
            District=data.get("District", ""),
            State=data.get("State", ""),
            Pincode=data.get("Pincode", 0),
            Ownership=data.get("Ownership", ""),
            GovtID_Type=data.get("GovtID_Type", ""),
            ID_Number=data.get("ID_Number", ""),
            Category=data.get("Category", ""),
        )
        return JsonResponse({"success": True, "id": applicant.id})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_applicant(request, id):
    token_key = request.META.get("HTTP_AUTHORIZATION", "").replace("Token ", "")
    from rest_framework.authtoken.models import Token as DRFToken
    try:
        token = DRFToken.objects.get(key=token_key)
        user = token.user
    except Exception:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if not user.is_staff:
        return JsonResponse({"error": "Not authorized"}, status=403)

    try:
        applicant = Applicant.objects.get(id=id)
        applicant.delete()
        return JsonResponse({"success": True})
    except Applicant.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)
