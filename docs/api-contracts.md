# API Contracts (Auth)

Este documento define los endpoints y el formato de payloads del módulo de autenticación.

## Endpoints principales

- POST /auth/login
  - Request: { email, password }
  - Response: { token, refreshToken, user }

- POST /auth/register
  - Request: { fullName, relation, dob, email, phone, password }
  - Response: { message, user }

- POST /auth/request-reset
  - Request: { email }
  - Response: { message }

- POST /auth/verify-reset
  - Request: { email, code, password }
  - Response: { message }

- POST /auth/refresh
  - Request: { refreshToken }
  - Response: { token, refreshToken }

## Payload cifrado (opcional)
Cuando se use cifrado en cliente (negocio lo exige), el payload se enviará en este formato:

{
  "iv": "<base64>",
  "encryptedKey": "<base64>",
  "ciphertext": "<base64>",
  "keyId": "v1",
  "alg": "RSA-OAEP+A256GCM"
}

Cabeceras relacionadas:
- Authorization: Bearer <token>
- X-Enc-Key-Id: v1
- X-Enc-Alg: RSA-OAEP/AES-GCM

## Errores y mensajes
- Mantener mensajes neutrales para endpoints públicos (ej: "Si el correo existe, recibirás un código").
- Códigos HTTP: 400 (bad request), 401 (unauthorized), 429 (too many requests), 500 (server error).
