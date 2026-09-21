from django.urls import path, include

urlpatterns = [
    path('v1/auth/', include('domain_applications.authentication.urls')),
    path('v1/patients/', include('domain_applications.patients.urls')),
    path('v1/providers/', include('domain_applications.providers.urls')),
    path('v1/payers/', include('domain_applications.payers.urls')),
    path('v1/plans/', include('domain_applications.plans.urls')),
    path('v1/services/', include('domain_applications.services.urls')),
    path('v1/authorizations/', include('domain_applications.authorizations.urls')),
    path('v1/documents/', include('domain_applications.documents.urls')),
    path('v1/payer-responses/', include('domain_applications.payer_responses.urls')),
    path('v1/health/', include('domain_applications.health.urls')),
    path('v1/audit/', include('shared_services.audit.urls')),
    path('v1/sla/', include('shared_services.sla_monitor.urls')),
]
