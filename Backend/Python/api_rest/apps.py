from django.apps import AppConfig


class ApiRestConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api_rest'
    
    def ready(self):
        """Se ejecuta cuando la app está lista. Importa signals para registrarlos."""
        import api_rest.signals  # noqa