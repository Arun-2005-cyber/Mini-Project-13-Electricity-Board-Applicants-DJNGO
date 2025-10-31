# app/urls.py
from django.urls import path
from app import views
from .views import ConnectionListView
from .api_views import RegisterAPIView, CurrentUserAPIView
from .applicant_api_views import (
    ApplicantListCreateAPIView,
    ApplicantRetrieveUpdateDestroyAPIView,ApplicantCreateView
)
from app.views_auth import signup, login_view, create_applicant, delete_applicant

urlpatterns = [
    path("", views.index, name="index"),
    path("signup/", signup, name="signup"),
    path("login/", login_view, name="login_api"),
    path('me/', CurrentUserAPIView.as_view(), name='api-me'),
    path("uploaddata", views.uploaddata, name="uploaddata"),
    path("getApplicantsData/",ConnectionListView.as_view(),name="connection_list"),
    path('update_applicant/<int:id>/', views.update_applicant, name='update_applicant'),
    path('connectionvisualization/',views.connectionvisualization,name='connectionvisualization'),
    path('connectionrequestdata/',views.connectionrequestdata,name='connectionrequestdata'),

    # new REST endpoints (DRF)
    path('applicant/', ApplicantListCreateAPIView.as_view(), name='applicant-list'),
    path('applicant/<int:pk>/', ApplicantRetrieveUpdateDestroyAPIView.as_view(), name='applicant-detail'),
    path('applicant/create/', ApplicantCreateView.as_view()),

    # optional older admin endpoints (if you still want them)
    path("admin/applicant/add/", create_applicant, name="create-applicant"),
    path("admin/applicant/delete/<int:id>/", delete_applicant, name="delete-applicant"),
]
