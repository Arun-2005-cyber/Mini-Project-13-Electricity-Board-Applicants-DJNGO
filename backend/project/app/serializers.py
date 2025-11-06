from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Applicant, Connection, Status



class UserProfileSerializer(serializers.ModelSerializer):
    applicant_count = serializers.SerializerMethodField()
    applicants = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'applicant_count', 'applicants']

    def get_applicant_count(self, obj):
        return Applicant.objects.filter(created_by=obj).count()

    def get_applicants(self, obj):
        return Applicant.objects.filter(created_by=obj).values("id", "Applicant_Name")
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')


class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = '__all__'


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'


class ConnectionSerializer(serializers.ModelSerializer):
    Applicant = ApplicantSerializer(read_only=True)
    Status = StatusSerializer(read_only=True)

    class Meta:
        model = Connection
        fields = '__all__'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objectscreate_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
