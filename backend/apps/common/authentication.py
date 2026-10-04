from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class FlexibleJWTAuthentication(JWTAuthentication):
    """
    Flexible JWT Authentication that supports:
    - Standard 'Bearer <token>'
    - 'JWT <token>'
    - Raw '<token>' (useful when pasted directly into Swagger UI with or without 'Bearer ' prefix)
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            try:
                raw_str = header.decode('utf-8').strip() if isinstance(header, bytes) else str(header).strip()
                if raw_str.lower().startswith('bearer '):
                    raw_str = raw_str[7:].strip()
                elif raw_str.lower().startswith('jwt '):
                    raw_str = raw_str[4:].strip()
                raw_token = raw_str.encode('utf-8')
            except Exception:
                return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            return None
