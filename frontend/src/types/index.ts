enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

export type TaskStatusType = TaskStatus;
export { TaskStatus };

export const statusMapper: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.DONE]: 'Done',
};

export interface Skill {
    id: string;
    name: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    assigneeId?: string | null;
    parentTaskId?: string | null;
    assignee?: Developer | null;
    skills: Skill[];
    createdAt: string;
    updatedAt: string;
}

export interface Developer {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    skills?: Skill[];
    tasks?: Task[];
}

// Mapper to convert API response (with optional fields) to our strict Task type
export const mapTaskFromAPI = (task: any): Task => {
    if (!task.id || !task.title || !task.status || !task.createdAt || !task.updatedAt) {
        throw new Error('Invalid task: missing required fields');
    }

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as TaskStatus,
        assigneeId: task.assigneeId,
        parentTaskId: task.parentTaskId,
        assignee: task.assignee,
        skills: task.skills ?? [],
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
    };
};
