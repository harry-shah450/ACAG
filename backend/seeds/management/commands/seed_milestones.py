from django.core.management.base import BaseCommand

from apps.projects.models import MilestoneDefinition

MILESTONES = [
    (1, 'Site Preparation / Layout Marking', 2, 'Foundation'),
    (2, 'Excavation Completed', 3, 'Foundation'),
    (3, 'Foundation Completed', 8, 'Foundation'),
    (4, 'Foundation Backfilling Completed', 3, 'Foundation'),
    (5, 'Damp Proof Course (DPC) Completed', 4, 'Plinth'),
    (6, 'Plinth Filling & Compaction Completed', 4, 'Plinth'),
    (7, 'Wall Masonry up to Lintel Level Completed', 15, 'Roof'),
    (8, 'Lintel Completed', 5, 'Roof'),
    (9, 'Roof Slab (RCC) Cast Completed', 15, 'Roof'),
    (10, 'Plastering Completed', 10, 'Finishing'),
    (11, 'Flooring Completed', 8, 'Finishing'),
    (12, 'Doors & Windows Installed', 8, 'Finishing'),
    (13, 'Electrical & Plumbing Completed', 7, 'Finishing'),
    (14, 'Paint & Finishing Completed', 6, 'Finishing'),
    (15, 'House Construction Completed', 2, 'Finishing'),
]


class Command(BaseCommand):
    help = 'Seed the 15 construction milestone definitions'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for milestone_no, name, duration_days, phase in MILESTONES:
            _, created = MilestoneDefinition.objects.update_or_create(
                milestone_no=milestone_no,
                defaults={
                    'name': name,
                    'duration_days': duration_days,
                    'phase': phase,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Milestones seeded: {created_count} created, {updated_count} updated.'
            )
        )
