from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AccountsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/auth/profile/'
        self.refresh_url = '/api/auth/refresh/'

        self.user_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'password': 'password123',
            'confirm_password': 'password123'
        }

    def test_user_registration_success(self):
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'john.doe@example.com')
        self.assertEqual(response.data['user']['first_name'], 'John')
        self.assertTrue(User.objects.filter(email='john.doe@example.com').exists())

    def test_user_registration_password_mismatch(self):
        data = self.user_data.copy()
        data['confirm_password'] = 'mismatchedpass'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_email(self):
        self.client.post(self.register_url, self.user_data, format='json')
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        self.client.post(self.register_url, self.user_data, format='json')
        login_data = {
            'email': 'john.doe@example.com',
            'password': 'password123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_user_login_invalid_credentials(self):
        login_data = {
            'email': 'nonexistent@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_token_refresh(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        refresh_token = reg_resp.data['tokens']['refresh']
        response = self.client.post(self.refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_get_profile_authenticated(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        access_token = reg_resp.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'john.doe@example.com')

    def test_update_profile(self):
        reg_resp = self.client.post(self.register_url, self.user_data, format='json')
        access_token = reg_resp.data['tokens']['access']

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        update_data = {'first_name': 'Johnny', 'last_name': 'Smith'}
        response = self.client.put(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Johnny')
        self.assertEqual(response.data['last_name'], 'Smith')
