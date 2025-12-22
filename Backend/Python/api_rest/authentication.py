import os
import jwt
import logging
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)

class JWTAuthentication(BaseAuthentication):
    """
    Autenticación JWT local (RS256)
    NO consulta al Auth Service
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        if not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        public_key = os.environ.get('JWT_PUBLIC_KEY')
        if not public_key:
            raise AuthenticationFailed('JWT_PUBLIC_KEY no configurada')
        
        # Reemplazar \n literal por saltos de línea reales (necesario para PEM)
        public_key = public_key.replace('\\n', '\n')
        
        logger.info(f"Public key starts with: {public_key[:50]}...")
        logger.info(f"Token (first 50 chars): {token[:50]}...")

        try:
            payload = jwt.decode(
                token,
                public_key,
                algorithms=['RS256'],
                options={
                    'require': ['sub']  # Solo requerir 'sub', exp/iat son opcionales
                }
            )
            logger.info(f"Token decoded successfully. Payload keys: {list(payload.keys())}")
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expirado')
        except jwt.InvalidTokenError as e:
            logger.error(f"JWT decode error: {type(e).__name__}: {e}")
            raise AuthenticationFailed(f'Token inválido: {type(e).__name__}')

        # Guardamos el payload para usarlo en permisos / vistas
        request.jwt_payload = payload

        # No usamos User de Django (el user vive en Auth Service)
        return (None, payload)
