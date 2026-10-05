"""
Isolated Authentication Module for FastAPI using Clerk JWTs.
This module is strictly isolated and NOT imported into existing backend files.

To enforce authentication on FastAPI routes in the future, you can import
`get_current_user` into `api.py` and add it as a FastAPI dependency:

    from auth.auth import get_current_user
    @app.post("/chat")
    def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
        ...
"""

import os
import httpx
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

load_dotenv()

security = HTTPBearer()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_API_URL = "https://api.clerk.com/v1"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    """
    Validates the bearer token issued by Clerk via Clerk's session verification API.
    Raises HTTPException 401 if token is missing, expired, or invalid.
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not CLERK_SECRET_KEY:
        # In development without secret key configured on backend
        return {"sub": "authenticated_user", "token": token}

    try:
        # Verify the session token using Clerk's REST API
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{CLERK_API_URL}/tokens/verify",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                params={"token": token},
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired authentication token.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            data = response.json()
            return data

    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Authentication service unavailable: {str(e)}",
        )
