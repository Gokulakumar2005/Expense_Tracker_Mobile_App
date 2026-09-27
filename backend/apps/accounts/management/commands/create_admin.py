import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates an administrator superuser from environment variables.'

    def handle(self, *args, **options):
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@pockettrack.com')
        admin_pass = os.getenv('ADMIN_PASSWORD')

        if not admin_pass:
            self.stdout.write(self.style.ERROR(
                "ADMIN_PASSWORD is not set in the environment (.env)."
            ))
            return

        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_superuser(
                email=admin_email,
                first_name='PocketTrack',
                last_name='Admin',
                password=admin_pass
            )
            self.stdout.write(self.style.SUCCESS(
                f"Superuser created successfully: {admin_email}"
            ))
        else:
            self.stdout.write(self.style.WARNING(
                f"Superuser {admin_email} already exists."
            ))
