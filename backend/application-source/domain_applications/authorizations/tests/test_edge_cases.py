from django.test import TestCase
from domain_applications.authorizations.edge_cases import handle_emergency_retro_auth, handle_newborn_new_enrollee
from domain_applications.authorizations.models import AuthorizationRequest

class EdgeCasesTests(TestCase):
    def test_handle_emergency_retro_auth(self):
        auth_req = AuthorizationRequest()
        result = handle_emergency_retro_auth(auth_req, {"reason": "Test"})
        self.assertTrue(result.success)
        self.assertEqual(auth_req.priority, AuthorizationRequest.Priority.EMERGENCY)
        self.assertTrue(auth_req.is_retro_auth)
        self.assertEqual(auth_req.status, AuthorizationRequest.Status.EXCEPTION)
