from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('authorizations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='authorizationrequest',
            name='services',
            field=models.ManyToManyField(blank=True, related_name='authorization_requests', to='services.service'),
        ),
    ]