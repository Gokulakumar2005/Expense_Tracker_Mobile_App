from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates a default administrator superuser for Django Admin.'

    def handle(self, *args, **options):
        admin_email = 'admin@pockettrack.com'
        admin_pass = 'Admin@123456'

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                first_name='PocketTrack',
                last_name='Admin',
                password=admin_pass
            )
            self.stdout.write(self.style.SUCCESS(
                f"Superuser created successfully: {admin_email} / {admin_pass}"
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"Superuser {admin_email} already exists."
            ))
