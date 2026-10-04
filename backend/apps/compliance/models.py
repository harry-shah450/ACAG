from django.db import models

from apps.common.enums import HSECheckAnswer, HSECheckItem


class HSECheck(models.Model):
    visit = models.ForeignKey(
        'projects.Visit',
        on_delete=models.CASCADE,
        related_name='hse_checks',
    )
    item_key = models.CharField(max_length=50, choices=HSECheckItem.choices)
    answer = models.CharField(max_length=5, choices=HSECheckAnswer.choices)
    remarks = models.TextField(blank=True)
    photo_path = models.CharField(max_length=500, blank=True)

    class Meta:
        unique_together = ('visit', 'item_key')
        ordering = ['visit', 'item_key']

    def __str__(self):
        return f'{self.visit} - {self.get_item_key_display()}'


class ESSCheck(models.Model):
    visit = models.OneToOneField(
        'projects.Visit',
        on_delete=models.CASCADE,
        related_name='ess_check',
    )
    trees_requiring_permission = models.BooleanField(default=False)
    near_settlements = models.BooleanField(default=False)
    near_drainage_nullah = models.BooleanField(default=False)
    blocks_right_of_way = models.BooleanField(default=False)
    remarks = models.TextField(blank=True)
    photo_path = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return f'ESS Check for {self.visit}'
