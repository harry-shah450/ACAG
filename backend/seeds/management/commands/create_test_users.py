from django.core.management.base import BaseCommand

from seeds.seed_data import ensure_admin_user


class Command(BaseCommand):
    help = 'Ensure the single demo admin user exists (username: admin, password: admin)'

    def handle(self, *args, **options):
        user, created = ensure_admin_user()
        action = 'Created' if created else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(
                f'{action} admin user: username=admin password=admin (id={user.id})'
            )
        )
        self.stdout.write(
            self.style.WARNING(
                'Other role-based test users are no longer seeded. '
                'Junior engineers come from the data migration / JuniorEngineer table.'
            )
        )
