from django.test import TestCase
from domain_applications.authorizations.workflow import advance_workflow
from domain_applications.authorizations.models import AuthorizationRequest
from django.contrib.auth import get_user_model

User = get_user_model()

class WorkflowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="test")
        self.auth_req = AuthorizationRequest(status=AuthorizationRequest.Status.DRAFT)
        
    def test_valid_transition(self):
        advance_workflow(self.auth_req, AuthorizationRequest.Status.READY_FOR_SUBMISSION, self.user)
        self.assertEqual(self.auth_req.status, AuthorizationRequest.Status.READY_FOR_SUBMISSION)

    def test_invalid_transition(self):
        with self.assertRaises(ValueError):
            advance_workflow(self.auth_req, AuthorizationRequest.Status.APPROVED, self.user)
