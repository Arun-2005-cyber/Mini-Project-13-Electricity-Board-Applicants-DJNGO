from django.urls import path
from app import views
from .views import ConnectionListView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .api_views import RegisterAPIView, CurrentUserAPIView
from .admin_api_views import ApplicantListAPIView, ApplicantDetailAPIView
from app.views_auth import delete_applicant, signup, login_view,create_applicant

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
    path("admin/applicant/add/", create_applicant, name="create-applicant"),
    path("admin/applicant/delete/<int:id>/", delete_applicant, name="delete-applicant"),

    # path('login/',views.handlelogin,name='handlelogin')
]

  

