from django.contrib.auth import get_user_model


class LocalDemoUserMiddleware:
    """Provide a specialist identity only for the local SQLite demo mode."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not getattr(request.user, 'is_authenticated', False):
            user_model = get_user_model()
            request.user, _ = user_model.objects.get_or_create(
                username='demo.specialist',
                defaults={
                    'email': 'demo.specialist@pa360.local',
                    'first_name': 'Jessica',
                    'last_name': 'Smith',
                    'role': user_model.Role.AUTHORIZATION_SPECIALIST,
                    'is_staff': True,
                },
            )
        return self.get_response(request)
