# Messenger

A full-stack real-time messenger with private and group chats, friend management, online status tracking and peer-to-peer audio/video calls powered by WebRTC.

The project is built with a **Spring Boot** backend and a **React + TypeScript** frontend.

## Features

### Authentication

* User registration and authentication
* JWT-based authentication
* Access and refresh tokens
* Protected application routes
* Secure WebSocket authentication

### Profiles and Friends

* User profiles
* Profile avatars
* Friend requests
* Friends list
* Online friends
* Real-time online/offline status updates

### Chats and Messaging

* Private chats
* Group chats
* Real-time messaging
* Message history
* Pagination for chat messages
* Chat participant management

### Real-Time Communication

* WebSocket communication using STOMP
* Real-time message delivery
* Online presence tracking
* Call signaling

### Audio and Video Calls

* Peer-to-peer audio and video calls
* WebRTC
* Incoming call handling
* Call acceptance and rejection
* WebSocket/STOMP signaling

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* PostgreSQL
* JWT
* WebSocket
* STOMP
* Maven

### Frontend

* React
* TypeScript
* Vite
* React Router
* Zustand
* WebSocket / STOMP
* WebRTC

### Infrastructure

* Docker
* Docker Compose
* PostgreSQL

---

## Architecture

The application consists of a frontend and backend:

```text
┌──────────────────────────────┐
│         React Client         │
│                              │
│  React • TypeScript • Vite   │
│                              │
│  WebRTC • STOMP • Zustand    │
└───────────────┬──────────────┘
                │
                │ HTTP / HTTPS
                │ WebSocket
                ▼
┌──────────────────────────────┐
│        Spring Boot API       │
│                              │
│ Spring Security • JWT        │
│ JPA • WebSocket • STOMP      │
└───────┬──────────────────────┘
        │
        │
        ▼
┌─────────────┐
│ PostgreSQL  │
└─────────────┘

```

For audio and video calls, WebRTC establishes a peer-to-peer connection between users.

```text
User A                         User B
  │                              │
  │──── WebSocket Signaling ────►│
  │◄─── WebSocket Signaling ─────│
  │                              │
  │══════ WebRTC Connection ═════│
  │                              │
  │──── Audio / Video Stream ───►│
```

The backend is used for WebRTC signaling, while the media stream is transferred directly between peers when a direct connection can be established.

---

## Project Structure

```text
messenger
├── backend
│   ├── src
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
└── LICENSE
```

---

# WebSocket Communication

The application uses **STOMP over WebSocket** for real-time communication.

WebSocket functionality includes:

* Real-time messages
* Online/offline status updates
* Friend status updates
* WebRTC signaling
* Incoming call notifications

User-specific events are delivered through private queues.

Example:

```text
/user/queue/presence
```

This allows the backend to send real-time events directly to a specific authenticated user.

---

# WebRTC Calls

Audio and video calls use WebRTC.

The typical connection flow is:

```text
Caller
  │
  │ 1. Create RTCPeerConnection
  │
  ▼
Create Offer
  │
  │ 2. Send SDP Offer through WebSocket
  ▼
Callee
  │
  │ 3. Receive incoming call
  │
  ▼
Create Answer
  │
  │ 4. Send SDP Answer through WebSocket
  ▼
Caller
  │
  │ 5. Exchange ICE candidates
  │
  ▼
Peer-to-Peer Connection
  │
  ▼
Audio / Video Stream
```

The backend acts as a signaling server and does not process the media stream itself.

---

# Security

The application uses JWT-based authentication.

The general authentication flow is:

```text
User
  │
  ▼
Login
  │
  ▼
Spring Security
  │
  ▼
Access Token + Refresh Token (stored in Cookie)
  │
  ├── Access Token → API requests
  │
  └── Refresh Token → Token renewal
```

WebSocket connections are also authenticated to ensure that user-specific events and messages are delivered only to authorized users.

---

# License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
