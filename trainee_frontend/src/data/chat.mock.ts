import type { ChatMessage } from "../types/course";

export const mockInstructorChat: ChatMessage[] = [
    { id: 1, sender: "instructor", text: "Hi! Have you started on the API contract design yet?", sentAt: "2026-08-15T10:00:00Z" },
    { id: 2, sender: "student", text: "Yes, I finished the routes. Should I add auth on every endPoint?", sentAt: "2026-08-15T10:02:00Z" },
    { id: 3, sender: "instructor", text: "Not on every endpoint. Only the ones that require user authentication.", sentAt: "2026-08-15T10:05:00Z" },
    { id: 4, sender: "student", text: "Got it! Thanks for the clarification.", sentAt: "2026-08-15T10:07:00Z" },
    { id: 5, sender: "instructor", text: "No problem! Let me know if you have any other questions.", sentAt: "2026-08-15T10:10:00Z" },
]