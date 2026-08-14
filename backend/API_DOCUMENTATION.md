# Cherry Backend - API Documentation

## Base URL

```
http://localhost:3000
```

## Autenticación

Todos los endpoints (excepto Auth) requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

---

## 1. Auth (Públicos)

### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "message": "User registered. Please check your email to verify."
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Verify Email

```http
POST /auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

**Response:**

```json
{
  "message": "Email verified successfully"
}
```

### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**

```json
{
  "message": "If email exists, reset link sent"
}
```

### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newsecurepassword123"
}
```

**Response:**

```json
{
  "message": "Password reset successful"
}
```

### Get Current User (Requiere Auth)

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "theme": "light"
}
```

### Update Current User (Requiere Auth)

```http
PATCH /auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "theme": "dark"
}
```

Ambos campos son opcionales (`name` y `theme` con valores `light` | `dark`).

**Response:**

```json
{
  "email": "user@example.com",
  "name": "Jane Doe",
  "theme": "dark"
}
```

### Change Password (Requiere Auth)

```http
POST /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "securepassword123",
  "newPassword": "newsecurepassword456"
}
```

**Response:**

```json
{
  "message": "Password updated successfully"
}
```

### Delete Account (Requiere Auth)

```http
DELETE /auth/me
Authorization: Bearer <token>
```

Elimina la cuenta, sus proyectos (incluyendo los sandboxes Daytona), documentos y conversaciones de forma permanente.

**Response:**

```json
{
  "message": "Account deleted successfully"
}
```

---

## 2. Projects (Requiere Auth)

### Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Research Paper",
  "description": "Paper about quantum computing"
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "name": "My Research Paper",
  "description": "Paper about quantum computing",
  "userId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Nota:** Al crear un proyecto, automáticamente se crea un documento `main.tex` con plantilla IEEE.

### Get All Projects

```http
GET /projects
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid-string",
    "name": "My Research Paper",
    "description": "Paper about quantum computing",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Project by ID

```http
GET /projects/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid-string",
  "name": "My Research Paper",
  "description": "Paper about quantum computing",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Compiled PDF

```http
GET /projects/:id/pdf
Authorization: Bearer <token>
```

**Response:** Returns PDF file (application/pdf)

- Content-Disposition: `inline; filename="project-{id}.pdf"`

### Update Project

```http
PUT /projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "name": "Updated Name",
  "description": "Updated description",
  ...
}
```

### Delete Project

```http
DELETE /projects/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Project deleted"
}
```

---

## 3. Documents (LaTeX) (Requiere Auth)

### Create Document

```http
POST /projects/:projectId/documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "chapter1.tex",
  "content": "\\documentclass{article}\\n\\begin{document}\\nHello\\n\\end{document}",
  "template": "journal"
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "chapter1.tex",
  "content": "...",
  "projectId": "project-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get All Documents by Project

```http
GET /projects/:projectId/documents
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid-string",
    "title": "main.tex",
    "projectId": "project-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid-string",
    "title": "chapter1.tex",
    "projectId": "project-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Document by ID

```http
GET /documents/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "main.tex",
  "content": "\\documentclass[journal]{IEEEtran}...",
  "projectId": "project-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Document

```http
PATCH /documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "new-title.tex",
  "content": "new latex content..."
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "new-title.tex",
  "content": "new latex content...",
  ...
}
```

### Delete Document

```http
DELETE /documents/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Document deleted"
}
```

---

## 4. Conversations (Requiere Auth)

### Create Conversation

```http
POST /projects/:projectId/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Discussion about Introduction"
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "Discussion about Introduction",
  "projectId": "project-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Conversations by Project

```http
GET /projects/:projectId/conversations
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "uuid-string",
    "title": "Discussion about Introduction",
    "projectId": "project-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Conversation by ID (with Messages)

```http
GET /conversations/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "Discussion about Introduction",
  "projectId": "project-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "messages": [
    {
      "id": "uuid-string",
      "role": "user",
      "content": "Help me write the introduction",
      "conversationId": "conversation-uuid",
      "timestamp": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-string",
      "role": "assistant",
      "content": "I'd be happy to help you write the introduction...",
      "conversationId": "conversation-uuid",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Send Message (AI Chat)

```http
POST /conversations/:id/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Write the introduction for my paper about quantum computing"
}
```

**Response:**

```json
{
  "userMessage": {
    "id": "uuid-string",
    "role": "user",
    "content": "Write the introduction for my paper about quantum computing",
    "conversationId": "conversation-uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "assistantMessage": {
    "id": "uuid-string",
    "role": "assistant",
    "content": "Here's a draft for your introduction...",
    "conversationId": "conversation-uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete Conversation

```http
DELETE /conversations/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Conversation deleted"
}
```

---

## 5. AI Agent - Herramientas Disponibles

El agente de IA puede usar estas herramientas para ayudarte con LaTeX:

### read_latex_document

- **Parámetros:** `documentId` (título o UUID), `conversationId` (opcional)
- **Ejemplo:** Leer "main.tex"
- **Uso:** El agente puede leer documentos existentes

### write_latex_document

- **Parámetros:** `documentId`, `content`, `conversationId` (opcional)
- **Ejemplo:** Escribir contenido LaTeX en "chapter1.tex"
- **Uso:** Crea o modifica documentos. Si no existe, lo crea automáticamente

### list_latex_documents

- **Parámetros:** `projectId` o `conversationId`
- **Ejemplo:** Listar todos los documentos del proyecto actual
- **Uso:** Muestra los documentos disponibles con sus IDs y títulos

### compile_latex

- **Parámetros:** `conversationId`, `documentContent`, `filename`
- **Ejemplo:** Compilar "main.tex" a PDF
- **Uso:** Compila LaTeX a PDF usando Daytona sandbox. Retorna el PDF como base64

---

## Ejemplo de Flujo Completo

### 1. Registro y Login

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
# Obtiene el access_token
```

### 2. Crear Proyecto (auto-crea main.tex)

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Quantum Computing Paper"}'
```

### 3. Ver documentos del proyecto

```bash
curl -X GET http://localhost:3000/projects/<project-id>/documents \
  -H "Authorization: Bearer <token>"
```

### 4. Crear conversación

```bash
curl -X POST http://localhost:3000/projects/<project-id>/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Write Introduction"}'
```

### 5. Chatear con IA (para escribir LaTeX)

```bash
curl -X POST http://localhost:3000/conversations/<conversation-id>/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Write the introduction section in my main.tex file"}'
```

### 6. Compilar a PDF

```bash
# El agente puede compilar, o puedes usar el endpoint de proyecto
curl -X GET http://localhost:3000/projects/<project-id>/pdf \
  -H "Authorization: Bearer <token>"
```

---

## Códigos de Respuesta

| Código | Descripción           |
| ------ | --------------------- |
| 200    | OK                    |
| 201    | Created               |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 500    | Internal Server Error |

---

## Notas

- Todos los timestamps están en formato ISO 8601
- Los IDs son UUIDs
- El token JWT expira después de un tiempo configurable
- Los documentos LaTeX se almacenan con contenido en formato texto
- El PDF compilado se genera on-demand desde el código LaTeX
- Al crear un proyecto, se genera automáticamente un `main.tex` con plantilla IEEE
- El agente de IA puede crear, editar, leer y compilar documentos LaTeX
