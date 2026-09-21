from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class PermissionsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.specialist = User.objects.create_user(username='spec', password='pw', role='AUTHORIZATION_SPECIALIST')
        self.provider = User.objects.create_user(username='prov', password='pw', role='PROVIDER')
        self.billing = User.objects.create_user(username='bill', password='pw', role='BILLING')
        self.manager = User.objects.create_user(username='mgr', password='pw', role='OPS_MANAGER')
        self.users_url = reverse('user_list')

    def test_manager_can_access_users_list(self):
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_specialist_cannot_access_users_list(self):
        self.client.force_authenticate(user=self.specialist)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_provider_cannot_access_users_list(self):
        self.client.force_authenticate(user=self.provider)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_billing_cannot_access_users_list(self):
        self.client.force_authenticate(user=self.billing)
        response = self.client.get(self.users_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
