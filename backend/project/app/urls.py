from django.urls import path
from app import views
from .views import ConnectionListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .api_views import RegisterAPIView, CurrentUserAPIView
from .admin_api_views import ApplicantListAPIView, ApplicantDetailAPIView
from app.views_auth import signup, login_view

urlpatterns = [
    path("",views.index,name="index"),
    path("api/signup/", signup, name="signup"),
    path("api/login/", login_view, name="login_api"),
    path('api/me/', CurrentUserAPIView.as_view(), name='api-me'),
    path("uploaddata", views.uploaddata, name="uploaddata"),
    path("getApplicantsData/",ConnectionListView.as_view(),name="connection_list"),
    path('update_applicant/<int:id>/', views.update_applicant, name='update_applicant'),
    path('connectionvisualization/',views.connectionvisualization,name='connectionvisualization'),
    path('connectionrequestdata/',views.connectionrequestdata,name='connectionrequestdata'),
    # path('login/',views.handlelogin,name='handlelogin')
]

urlpatterns += [
    path('admin/applicants/', ApplicantListAPIView.as_view(), name='admin-applicants'),
    path('admin/applicants/<int:pk>/', ApplicantDetailAPIView.as_view(), name='admin-applicant-detail'),
]