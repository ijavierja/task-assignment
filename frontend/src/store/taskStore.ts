import { create } from 'zustand';
import type { Developer, Task, TaskStatus } from '../types';

interface TaskState {
    // Tasks
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    getTask: (id: string) => Task | undefined;
    updateTaskAssignee: (taskId: string, assignee: Developer | null) => void;
    updateTaskStatus: (taskId: string, status: TaskStatus) => void;

    // Available assignees cache for each task (filtered by skills)
    availableAssigneesByTask: Record<string, Developer[]>;
    setAvailableAssignees: (taskId: string, developers: Developer[]) => void;
    getAvailableAssignees: (taskId: string) => Developer[] | undefined;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    // Tasks
    tasks: [],
    setTasks: (tasks: Task[]) => set({ tasks }),
    getTask: (id: string) => get().tasks.find((task) => task.id === id),
    updateTaskAssignee: (taskId: string, assignee: Developer | null) =>
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId ? { ...task, assignee } : task
            ),
        })),
    updateTaskStatus: (taskId: string, status: TaskStatus) =>
        set((state) => ({
            tasks: state.tasks.map((task) =>
                task.id === taskId ? { ...task, status } : task
            ),
        })),

    // Available assignees
    availableAssigneesByTask: {},
    setAvailableAssignees: (taskId: string, developers: Developer[]) =>
        set((state) => ({
            availableAssigneesByTask: {
                ...state.availableAssigneesByTask,
                [taskId]: developers,
            },
        })),
    getAvailableAssignees: (taskId: string) => get().availableAssigneesByTask[taskId],
}));
