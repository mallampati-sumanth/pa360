from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser', password='testpassword', role='AUTHORIZATION_SPECIALIST'
        )
        self.login_url = reverse('login')
        self.refresh_url = reverse('token_refresh')
        self.logout_url = reverse('logout')
        self.change_password_url = reverse('change_password')

    def test_login_success(self):
        data = {'username': 'testuser', 'password': 'testpassword'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'AUTHORIZATION_SPECIALIST')

    def test_login_with_email(self):
        self.user.email = 'testuser@example.com'
        self.user.save(update_fields=['email'])
        response = self.client.post(self.login_url, {
            'email': 'testuser@example.com',
            'password': 'testpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'testuser@example.com')

    def test_login_failure(self):
        data = {'username': 'testuser', 'password': 'wrongpassword'}
        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        login_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'testpassword'})
        refresh_token = login_response.data['refresh']
        response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_change_password(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'old_password': 'testpassword',
            'new_password': 'newtestpassword123'
        }
        response = self.client.post(self.change_password_url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify old password no longer works
        logout_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'testpassword'})
        self.assertEqual(logout_response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # Verify new password works
        login_response = self.client.post(self.login_url, {'username': 'testuser', 'password': 'newtestpassword123'})
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
