import type { Homework } from "../types/course";

export const mockHomeworks: Homework[] =[
    {
        id: 1,
        title: "Homework 1: API Contract Design",
        description: "Design the API contract for the new feature.",
        courseId: 1,
        tasks: [
            {
                id: "1-1",
                title: "Define API endpoints",
                type: "task",
                dueDate: "2026-08-20T23:59:59Z",
                status: "GRADED",
                score: 85,
                maxScore: 100,
            },
        ],
    },
    {
        id: 2,
        title: "Homework 2: Database Schema Design",
        description: "Design the database schema for the new feature.",
        courseId: 1,
        tasks: [
            {
                id: "2-1",
                title: "Identify entities and relationships",
                description: "Determine the entities and their relationships for the feature.",
                dueDate: "2026-08-25T23:59:59Z",
                type: "task",
                status: "NOT_SUBMITTED",
                maxScore: 100,

            },
            {
                id: "2-2",
                title: "Create ER diagram",
                description: "Draw an Entity-Relationship diagram based on the identified entities and relationships.",
                dueDate: "2026-08-30T23:59:59Z",
                type: "task",
                status: "SUBMITTED",
                maxScore: 100,
            },
        ],
    }
]