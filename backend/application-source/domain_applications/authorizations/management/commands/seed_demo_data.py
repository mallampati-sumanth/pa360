import os
import csv
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model
from domain_applications.patients.models import Patient
from domain_applications.providers.models import Provider
from domain_applications.payers.models import Payer
from domain_applications.plans.models import Plan
from domain_applications.services.models import Service
from domain_applications.authorizations.models import AuthorizationRequest
from domain_applications.payer_responses.models import PayerResponse

User = get_user_model()

class Command(BaseCommand):
    help = 'Load demo data from CSVs and create demo users'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting demo data seed...")
        
        # 1. Create Users
        users_to_create = [
            ("specialist@pa360.demo", "Specialist", "User", User.Role.AUTHORIZATION_SPECIALIST),
            ("provider@pa360.demo", "Provider", "User", User.Role.PROVIDER),
            ("billing@pa360.demo", "Billing", "User", User.Role.BILLING),
            ("manager@pa360.demo", "Manager", "User", User.Role.OPS_MANAGER),
        ]
        
        for email, first, last, role in users_to_create:
            username = email
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password="password123", # simple password for demo
                    first_name=first,
                    last_name=last,
                    role=role
                )
                from domain_applications.authentication.models import UserProfile
                UserProfile.objects.get_or_create(user=user)
                self.stdout.write(f"Created user: {username}")
        
        # Paths
        # BASE_DIR is backend/application-source
        data_dir = os.path.join(settings.BASE_DIR.parent.parent, "database", "demo-data")
        
        def safe_date(d):
            if not d: return None
            try:
                return datetime.strptime(d.split('T')[0], "%Y-%m-%d").date()
            except:
                return None
        
        def lower_reader(f):
            reader = csv.DictReader(f)
            reader.fieldnames = [name.lower() for name in reader.fieldnames] if reader.fieldnames else []
            return reader

        # Load Providers
        with open(os.path.join(data_dir, "providers.csv"), 'r') as f:
            for row in lower_reader(f):
                Provider.objects.update_or_create(
                    provider_id=row['provider_id'],
                    defaults={
                        'provider_name': row['provider_name'],
                        'npi': row.get('npi_number', ''),
                        'specialty': row.get('specialty', ''),
                        'contact_number': row.get('contact_number', ''),
                        'address': row.get('practice_location', '')
                    }
                )
        self.stdout.write("Loaded Providers")

        # Load Payers
        with open(os.path.join(data_dir, "payers.csv"), 'r') as f:
            for row in lower_reader(f):
                Payer.objects.update_or_create(
                    payer_id=row['payer_id'],
                    defaults={
                        'payer_name': row['payer_name'],
                        'contact_number': row.get('contact_number', ''),
                        'website': row.get('website', '')
                    }
                )
        self.stdout.write("Loaded Payers")

        # Load Plans
        with open(os.path.join(data_dir, "plans.csv"), 'r') as f:
            for row in lower_reader(f):
                Plan.objects.update_or_create(
                    plan_id=row['plan_id'],
                    defaults={
                        'plan_name': row['plan_name'],
                        'payer_id': row['payer_id'],
                        'plan_type': row.get('plan_type', '')
                    }
                )
        self.stdout.write("Loaded Plans")

        # Load Patients
        with open(os.path.join(data_dir, "patients.csv"), 'r') as f:
            for row in lower_reader(f):
                Patient.objects.update_or_create(
                    patient_id=row['patient_id'],
                    defaults={
                        'name': row.get('name', ''),
                        'date_of_birth': safe_date(row.get('date_of_birth')) or datetime(1980,1,1).date(),
                        'gender': row.get('gender') or 'O',
                        'insurance_id': row.get('insurance_id', ''),
                        'plan_id': row.get('plan_id') if row.get('plan_id') else None,
                        'contact_number': row.get('contact_number', ''),
                        'address': row.get('address', '')
                    }
                )
        self.stdout.write("Loaded Patients")
        
        # Load Services
        with open(os.path.join(data_dir, "services.csv"), 'r') as f:
            for row in lower_reader(f):
                Service.objects.update_or_create(
                    service_code=row['service_code'],
                    defaults={
                        'service_name': row.get('service_name', ''),
                        'service_category': row.get('service_category', ''),
                        'authorization_required': str(row.get('authorization_required', '')).lower() == 'true',
                        'base_price': row.get('base_price') if row.get('base_price') else 0.00
                    }
                )
        self.stdout.write("Loaded Services")
        
        # Load Authorizations
        with open(os.path.join(data_dir, "authorization_requests.csv"), 'r') as f:
            for row in lower_reader(f):
                try:
                    AuthorizationRequest.objects.update_or_create(
                        authorization_id=row['authorization_id'],
                        defaults={
                            'patient_id': row.get('patient_id'),
                            'provider_id': row.get('provider_id'),
                            'payer_id': row.get('payer_id'),
                            'plan_id': row.get('plan_id'),
                            'service_code_id': row.get('service_code'),
                            'diagnosis': row.get('diagnosis') or "Unknown",
                            'clinical_indication': row.get('clinical_indication') or "Unknown",
                            'status': row.get('status') or "Draft",
                            'priority': row.get('priority') or "ROUTINE",
                            'request_date': safe_date(row.get('request_date')) or datetime.now().date(),
                            'submission_date': safe_date(row.get('submission_date')),
                            'decision_date': safe_date(row.get('decision_date')),
                            'edge_case_type': row.get('edge_case_type', 'NONE'),
                        }
                    )
                except Exception as e:
                    self.stdout.write(f"Skip auth {row.get('authorization_id')}: {e}")
        self.stdout.write("Loaded Authorizations")

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo data'))
