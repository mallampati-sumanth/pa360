from django.test import TestCase
from domain_applications.authorizations.rules_engine import check_pa_requirement, get_required_information, check_completeness, should_route_to_human
from domain_applications.authorizations.models import AuthorizationRequest
from domain_applications.management.commands.load_demo_workbook import PRIORITY_MAP, STATUS_MAP
from domain_applications.plans.models import Plan
from domain_applications.services.models import Service

class RulesEngineTests(TestCase):
    def test_clean_workbook_values_are_normalized(self):
        self.assertEqual(STATUS_MAP['MISSING_INFORMATION'], AuthorizationRequest.Status.ADDITIONAL_INFO_REQUESTED)
        self.assertEqual(STATUS_MAP['NOT_REQUIRED'], AuthorizationRequest.Status.NOT_REQUIRED)
        self.assertEqual(STATUS_MAP['EXPIRED'], AuthorizationRequest.Status.EXPIRED)
        self.assertEqual(PRIORITY_MAP['HIGH'], AuthorizationRequest.Priority.URGENT)

    def test_check_pa_requirement_exempt(self):
        class MockPlan:
            pa_rules_summary = {'exempt_services': ['S123']}
        
        class MockService:
            service_code = 'S123'
            authorization_required = True
            
        result = check_pa_requirement(None, MockPlan(), MockService(), {})
        self.assertFalse(result.is_required)

    def test_check_pa_requirement_emergency(self):
        class MockPlan:
            pa_rules_summary = {}
        
        class MockService:
            service_code = 'S456'
            
        result = check_pa_requirement(None, MockPlan(), MockService(), {"is_emergency": True})
        self.assertTrue(result.is_required)
        self.assertTrue(result.needs_review)

    def test_check_completeness_incomplete(self):
        class MockAuthReq:
            diagnosis = ""
            clinical_indication = "Some notes"
            
        result = check_completeness(MockAuthReq())
        self.assertFalse(result.is_complete)
        self.assertIn("diagnosis", result.missing_fields)
