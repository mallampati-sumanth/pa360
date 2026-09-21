# ADR-002: Use JWT Authentication (djangorestframework-simplejwt)

## Status
Accepted

## Context
PA360 has a Next.js frontend and Django REST API. Two authentication approaches were considered: Django session-based auth and JWT tokens.

## Decision
Use JWT tokens via djangorestframework-simplejwt. Access tokens: 60 minutes. Refresh tokens: 7 days with rotation.

## Consequences
- Pro: Stateless — Next.js frontend can authenticate independently
- Pro: Token rotation with blacklisting prevents token reuse after logout
- Pro: Role information embedded in token payload reduces DB queries per request
- Con: Token revocation requires blacklist table (included via simplejwt blacklist app)
- Security: Tokens stored in memory (Zustand) with httpOnly cookie for refresh token
- Every API endpoint re-checks the caller role from the token — frontend role display is informational only
