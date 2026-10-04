from django.db import models


class UserRole(models.TextChoices):
    HOUSE_OWNER = 'HOUSE_OWNER', 'House Owner'
    FIELD_ENGINEER = 'FIELD_ENGINEER', 'Field Engineer'
    BACKEND_REVIEW_ENGINEER = 'BACKEND_REVIEW_ENGINEER', 'Backend Review Engineer'
    ADMIN = 'ADMIN', 'Admin'


class ProjectType(models.TextChoices):
    VACANT_PLOT = 'VACANT_PLOT', 'Vacant Plot'
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION', 'Under Construction'
    COMPLETED_HOME = 'COMPLETED_HOME', 'Completed Home'


class ComplianceStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    COMPLETED = 'COMPLETED', 'Completed'


class MilestoneStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    COMPLETED = 'COMPLETED', 'Completed'


class ReviewDecision(models.TextChoices):
    ACCEPTED = 'ACCEPTED', 'Accepted'
    OVERRIDDEN = 'OVERRIDDEN', 'Overridden'
    REJECTED = 'REJECTED', 'Rejected'


class QualityGrade(models.TextChoices):
    VERY_GOOD = 'VERY_GOOD', 'Very Good'
    GOOD = 'GOOD', 'Good'
    SATISFACTORY = 'SATISFACTORY', 'Satisfactory'
    NOT_SATISFACTORY = 'NOT_SATISFACTORY', 'Not Satisfactory'


class VisitNo(models.TextChoices):
    ONE = 'ONE', 'Visit 1'
    TWO = 'TWO', 'Visit 2'
    THREE = 'THREE', 'Visit 3'


class HSECheckItem(models.TextChoices):
    PPE_WORN = 'PPE_WORN', 'PPE Worn'
    DUST_MASKS_USED = 'DUST_MASKS_USED', 'Dust Masks Used'
    DRINKING_WATER_AVAILABLE = 'DRINKING_WATER_AVAILABLE', 'Drinking Water Available'
    NO_CHILD_LABOUR = 'NO_CHILD_LABOUR', 'No Child Labour'
    NO_INJURIES = 'NO_INJURIES', 'No Injuries'
    DEBRIS_DISPOSED_PROPERLY = 'DEBRIS_DISPOSED_PROPERLY', 'Debris Disposed Properly'


class NotificationType(models.TextChoices):
    INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED', 'Inspection Scheduled'
    QUALITY_ISSUE = 'QUALITY_ISSUE', 'Quality Issue'
    AI_VALIDATION_COMPLETE = 'AI_VALIDATION_COMPLETE', 'AI Validation Complete'
    MATERIAL_ALERT = 'MATERIAL_ALERT', 'Material Alert'
    CURING_REMINDER = 'CURING_REMINDER', 'Curing Reminder'
    RECTIFICATION_ISSUED = 'RECTIFICATION_ISSUED', 'Rectification Issued'
    HANDOVER_READY = 'HANDOVER_READY', 'Handover Ready'


class HandoverStatus(models.TextChoices):
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION', 'Under Construction'
    PENDING_HANDOVER = 'PENDING_HANDOVER', 'Pending Handover'
    HANDED_OVER = 'HANDED_OVER', 'Handed Over'


class ReportScope(models.TextChoices):
    DISTRICT = 'DISTRICT', 'District'
    DIVISION = 'DIVISION', 'Division'
    ALL = 'ALL', 'All'


class HSECheckAnswer(models.TextChoices):
    YES = 'YES', 'Yes'
    NO = 'NO', 'No'
    NA = 'NA', 'N/A'


class NotificationPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'


class MaterialType(models.TextChoices):
    BRICKS = 'BRICKS', 'Bricks'
    CEMENT = 'CEMENT', 'Cement'
    SAND = 'SAND', 'Sand'
    CRUSH = 'CRUSH', 'Crush'
    STEEL = 'STEEL', 'Steel'


class AuditAction(models.TextChoices):
    LOGIN = 'LOGIN', 'Login'
    LOGOUT = 'LOGOUT', 'Logout'
    CREATE = 'CREATE', 'Create'
    UPDATE = 'UPDATE', 'Update'
    DELETE = 'DELETE', 'Delete'
    ACTIVATE = 'ACTIVATE', 'Activate'
    DEACTIVATE = 'DEACTIVATE', 'Deactivate'


MILESTONE_NO_CHOICES = [(i, f'Milestone {i}') for i in range(1, 16)]
