from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed


class IsAuthenticatedOrDashboard(permissions.BasePermission):
    """
    Permite acceso autenticado O acceso anónimo desde el dashboard.
    El dashboard se identifica con el header: X-Dashboard: true
    """

    def has_permission(self, request, view):
        # Si es dashboard, permitir acceso
        if request.META.get('HTTP_X_DASHBOARD') == 'true':
            return True
        
        # Si es autenticado normalmente, permitir acceso
        if request.user and request.user.is_authenticated:
            return True
        
        # Rechazar acceso no autenticado
        return False


class DashboardReadOnly(permissions.BasePermission):
    """
    Permite lectura (GET) desde dashboard sin autenticación.
    Permite POST/PUT/PATCH/DELETE solo con autenticación.
    """

    def has_permission(self, request, view):
        # GET requests sin autenticación (acceso anónimo para lectura)
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Usuarios autenticados pueden hacer cualquier cosa
        if request.user and request.user.is_authenticated:
            return True
        
        return False
