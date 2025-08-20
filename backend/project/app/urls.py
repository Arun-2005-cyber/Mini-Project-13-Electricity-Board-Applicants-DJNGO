from django.urls import path
from app import views
from .views import ConnectionListView

urlpatterns = [
    path("",views.index,name="index"),
    path("login/",views.login,name="login"),
    path("uploaddata", views.uploaddata, name="uploaddata"),
    path("getApplicantsData/",ConnectionListView.as_view(),name="connection_list"),
    path('update_applicant/<int:id>/', views.update_applicant, name='update_applicant'),
    path('connectionvisualization/',views.connectionvisualization,name='connectionvisualization'),
    path('connectionrequestdata/',views.connectionrequestdata,name='connectionrequestdata'),
    # path('login/',views.handlelogin,name='handlelogin')
]