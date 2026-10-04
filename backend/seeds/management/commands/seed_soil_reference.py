from django.core.management.base import BaseCommand

from apps.projects.models import SoilReference

SOIL_REFERENCE_DATA = [
    ('Attock', 'Loamy Sand', 'Moderate', 'Suitable for shallow foundations with proper compaction.'),
    ('Chakwal', 'Silty Loam', 'Low', 'Generally stable; watch for seasonal moisture variation.'),
    ('Jhelum', 'Clay Loam', 'Moderate', 'May require improved drainage near slopes.'),
    ('Rawalpindi', 'Sandy Loam', 'Moderate', 'Rocky substrata common in hilly areas.'),
    ('Murree', 'Silty Clay', 'High', 'Steep terrain; erosion risk during heavy rain.'),
    ('Sargodha', 'Loam', 'Low', 'Good bearing capacity for residential construction.'),
    ('Khushab', 'Sandy Loam', 'Moderate', 'Check groundwater level before excavation.'),
    ('Mianwali', 'Loamy Sand', 'Moderate', 'Wind erosion possible in open plots.'),
    ('Bhakkar', 'Sandy Clay', 'Moderate', 'Shrink-swell behavior during monsoon.'),
    ('Gujranwala', 'Alluvial Loam', 'Low', 'Fertile alluvial soils with good stability.'),
    ('Gujrat', 'Silty Loam', 'Low', 'Suitable for standard strip foundations.'),
    ('Hafizabad', 'Loam', 'Low', 'Minimal special foundation requirements.'),
    ('Mandi Bahauddin', 'Clay Loam', 'Moderate', 'Monitor moisture content during curing.'),
    ('Sialkot', 'Silty Clay', 'Moderate', 'Drainage planning recommended near canals.'),
    ('Narowal', 'Loamy Sand', 'Low', 'Stable for typical single-storey housing.'),
    ('Faisalabad', 'Alluvial Loam', 'Low', 'High agricultural productivity soils.'),
    ('Jhang', 'Sandy Loam', 'Moderate', 'Floodplain areas need raised plinth.'),
    ('Toba Tek Singh', 'Loam', 'Low', 'Standard foundation practices apply.'),
    ('Chiniot', 'Silty Loam', 'Low', 'Good compaction characteristics.'),
    ('Lahore', 'Alluvial Silt', 'Moderate', 'High water table in some urban zones.'),
    ('Kasur', 'Loamy Sand', 'Moderate', 'Canal proximity may affect moisture.'),
    ('Nankana Sahib', 'Loam', 'Low', 'Generally favorable for construction.'),
    ('Sheikhupura', 'Silty Loam', 'Low', 'Stable alluvial deposits.'),
    ('Sahiwal', 'Alluvial Loam', 'Low', 'Excellent for conventional foundations.'),
    ('Okara', 'Loam', 'Low', 'Low susceptibility to settlement.'),
    ('Pakpattan', 'Sandy Loam', 'Moderate', 'Check salinity near agricultural fields.'),
    ('Multan', 'Silty Clay', 'Moderate', 'Hot climate; account for thermal expansion.'),
    ('Khanewal', 'Loam', 'Low', 'Good load-bearing for residential builds.'),
    ('Lodhran', 'Sandy Loam', 'Moderate', 'Desert fringe soils; windblown sand possible.'),
    ('Vehari', 'Loamy Sand', 'Moderate', 'Irrigated belt with variable moisture.'),
    ('D.G. Khan', 'Sandy Clay', 'High', 'Arid climate; deep foundations in loose sand.'),
    ('Layyah', 'Loamy Sand', 'Moderate', 'Riverine deposits near Indus tributaries.'),
    ('Muzaffargarh', 'Silty Clay', 'High', 'Flood-prone; elevate finished floor level.'),
    ('Rajanpur', 'Sandy Loam', 'High', 'Flash flood risk in kacha areas.'),
    ('Bahawalpur', 'Sandy Loam', 'Moderate', 'Cholistan fringe; shifting sand in open areas.'),
    ('Rahim Yar Khan', 'Loamy Sand', 'Moderate', 'Desert soils; compaction critical at DPC.'),
]


class Command(BaseCommand):
    help = 'Seed soil reference data for Punjab districts'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for district, soil_type, susceptibility, note in SOIL_REFERENCE_DATA:
            _, created = SoilReference.objects.update_or_create(
                district=district,
                defaults={
                    'dominant_soil_type': soil_type,
                    'susceptibility': susceptibility,
                    'note': note,
                },
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Soil reference seeded: {created_count} created, {updated_count} updated.'
            )
        )
