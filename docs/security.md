# Security Guidelines

Este documento describe las decisiones y recomendaciones de seguridad para el módulo de autenticación.

## Recomendaciones generales
- TLS es obligatorio para todas las comunicaciones.
- El cifrado cliente (Web Crypto) solo debe usarse si el requisito de negocio lo exige (E2E confidentiality). No reemplaza validación server-side.
- Evitar almacenar claves privadas en el cliente.

## Password policy
- Requisitos mínimos: 8 caracteres, al menos 1 mayúscula, 1 número y 1 caracter especial.
- Validar tanto en cliente (UX) como en servidor (enforcement).

## Password reset flow
1. Usuario solicita reset con email.
2. El servidor envía un código de 6 dígitos (caduca en 10–15 minutos).
3. Usuario verifica código y establece nueva contraseña.

## Key management
- Server publica `keyId` y la clave pública para cifrar claves simétricas.
- Implementar rotación de claves con ventana de aceptación y log de cambios.

## Protecciones adicionales
- Rate limiting para endpoints sensibles (login, request-reset).
- Limitar intentos de verificación de código y aplicar bloqueos temporales.
- No revelar existencia de usuarios en respuestas públicas.

## Logging & Monitoring
- Auditar intentos de login fallidos y eventos de seguridad importantes.
- Monitorear patrones de abuso y alertas.
