from django.core.management.base import BaseCommand

from apps.common.models import Division

DIVISIONS = [
    'Rawalpindi',
    'Sargodha',
    'Gujranwala',
    'Gujrat',
    'Faisalabad',
    'Lahore',
    'Sahiwal',
    'Multan',
    'D.G. Khan',
    'Bahawalpur',
]


class Command(BaseCommand):
    help = 'Seed ACAG division reference data'

    def handle(self, *args, **options):
        created_count = 0

        for name in DIVISIONS:
            _, created = Division.objects.get_or_create(name=name)
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Divisions seeded: {created_count} created, '
                f'{len(DIVISIONS) - created_count} already existed.'
            )
        )
