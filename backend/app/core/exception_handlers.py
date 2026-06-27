"""
Global exception handlers for FastAPI.

Registers handlers for:
- TeenVerseError subclasses → structured JSON responses
- Pydantic ValidationError → 422 with field details
- Unhandled exceptions → 500 with correlation ID (no stack leak)
"""

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.exceptions import TeenVerseError

logger = logging.getLogger("teenverse.exceptions")


def register_exception_handlers(app: FastAPI) -> None:
    """Attach all global exception handlers to the FastAPI app."""

    @app.exception_handler(TeenVerseError)
    async def handle_domain_error(
        request: Request, exc: TeenVerseError
    ) -> JSONResponse:
        """Handle all TeenVerse domain exceptions."""
        correlation_id = str(uuid.uuid4())[:8]
        logger.warning(
            "[%s] %s: %s (path=%s)",
            correlation_id,
            exc.__class__.__name__,
            exc.detail,
            request.url.path,
        )
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.__class__.__name__,
                "detail": exc.detail,
                "correlation_id": correlation_id,
            },
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        """Return a cleaner 422 for Pydantic validation errors."""
        errors = []
        for err in exc.errors():
            field = " → ".join(str(loc) for loc in err.get("loc", []))
            errors.append({
                "field": field,
                "message": err.get("msg", "Invalid value"),
                "type": err.get("type", "value_error"),
            })

        return JSONResponse(
            status_code=422,
            content={
                "error": "ValidationError",
                "detail": "One or more fields failed validation",
                "errors": errors,
            },
        )

    @app.exception_handler(Exception)
    async def handle_unhandled_error(
        request: Request, exc: Exception
    ) -> JSONResponse:
        """Catch-all for unhandled exceptions — never leaks stack traces."""
        correlation_id = str(uuid.uuid4())[:8]
        logger.exception(
            "[%s] Unhandled exception on %s %s",
            correlation_id,
            request.method,
            request.url.path,
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "InternalServerError",
                "detail": "An unexpected error occurred. Please try again later.",
                "correlation_id": correlation_id,
            },
        )
