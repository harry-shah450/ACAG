from django.db import migrations
from django.contrib.auth.hashers import make_password


def forwards(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    if not User.objects.filter(username='admin').exists():
        User.objects.create(
            username='admin',
            email='admin@acag.punjab.gov.pk',
            password=make_password('admin'),
            role='ADMIN',
            division='Lahore',
            district='Lahore',
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )


def backwards(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(username='admin').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_junior_engineer'),
        ('common', '0002_auditlog_user_agent_alter_auditlog_action_and_more'),
        ('projects', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
