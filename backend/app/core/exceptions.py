"""
Domain-specific exceptions for the TeenVerse backend.

Each exception carries a status_code and human-safe message so the global
exception handler can return a consistent error response without leaking
internal details.
"""


class TeenVerseError(Exception):
    """Base exception for all TeenVerse domain errors."""

    status_code: int = 500
    detail: str = "An unexpected error occurred"

    def __init__(self, detail: str | None = None, status_code: int | None = None):
        self.detail = detail or self.__class__.detail
        self.status_code = status_code or self.__class__.status_code
        super().__init__(self.detail)


# ── Authentication & Authorization ────────────────────────────────────────

class AuthenticationError(TeenVerseError):
    """Invalid credentials, expired token, or missing auth header."""
    status_code = 401
    detail = "Invalid or expired authentication credentials"


class AuthorizationError(TeenVerseError):
    """User does not have permission for the requested action."""
    status_code = 403
    detail = "You do not have permission to perform this action"


# ── Resource errors ───────────────────────────────────────────────────────

class NotFoundError(TeenVerseError):
    """Requested resource does not exist."""
    status_code = 404
    detail = "Requested resource not found"


class ConflictError(TeenVerseError):
    """Action conflicts with existing state (e.g. duplicate email)."""
    status_code = 409
    detail = "Resource already exists"


# ── Validation ────────────────────────────────────────────────────────────

class ValidationError(TeenVerseError):
    """Input data fails domain-specific validation rules."""
    status_code = 422
    detail = "Input validation failed"


# ── ML Pipeline ───────────────────────────────────────────────────────────

class PredictionError(TeenVerseError):
    """ML model inference failed."""
    status_code = 500
    detail = "Risk prediction failed — please try again"


class PersonaClassificationError(TeenVerseError):
    """K-Means persona classification failed."""
    status_code = 500
    detail = "Persona classification failed"


class ModelNotLoadedError(TeenVerseError):
    """ML model file could not be loaded."""
    status_code = 503
    detail = "ML model is currently unavailable"


# ── External services ────────────────────────────────────────────────────

class ExternalServiceError(TeenVerseError):
    """Call to an external API (OpenRouter, etc.) failed."""
    status_code = 502
    detail = "External service is temporarily unavailable"


class RateLimitError(TeenVerseError):
    """Client has exceeded the allowed request rate."""
    status_code = 429
    detail = "Too many requests — please slow down"
