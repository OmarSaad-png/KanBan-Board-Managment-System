# React Kanban Board

A modern task management system built with React, TypeScript, and WebSocket for real-time updates. This project implements a role-based Kanban board system with team collaboration features.

## Features

- 🔐 Role-based access control (Team Leader, Team Member, Client)
- 📊 Real-time task updates using WebSocket
- 📈 KPI tracking and performance dashboard
- 💬 Real-time chat functionality
- 📎 File attachments support
- 📅 Task scheduling with priority-based due dates
- ⛓️ Task dependencies management
- ✅ Task approval workflow

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- WebSocket for real-time communications
- JSON Server for backend mock
- Vite for build tooling

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/OmarSaad-png/KanBan-Board-Managment-System
cd [File Dest]
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Start the JSON server (in a separate terminal):

```bash
npm run server
```

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run lint` - Runs ESLint
- `npm run preview` - Preview the production build
- `npm run server` - Starts the JSON server for API mocking

## Project Structure

```
src/
├── components/
│   ├── common/
│   ├── dashboards/
│   ├── modals/
│   └── chat/
├── utils/
├── App.tsx
└── main.tsx
```

## User Roles

### Team Leader
- Create and assign tasks
- Approve/reject completed tasks
- View KPI dashboard
- Manage team members

### Team Member
- Update task status
- Upload attachments
- Submit tasks for approval
- Chat with team and clients

### Client
- View assigned tasks
- Chat with team members
- Track task progress

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
