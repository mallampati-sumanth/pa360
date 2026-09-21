from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class ApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='spec', password='pw', role='AUTHORIZATION_SPECIALIST')
        self.client.force_authenticate(user=self.user)
        self.url = '/api/v1/authorizations/'

    def test_list_authorizations(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
