import { create } from 'zustand';

export interface TaskFormData {
    id: string;
    title: string;
    skillIds: string[];
    subtasks: TaskFormData[];
}

interface TaskCreationState {
    mainTask: TaskFormData;
    
    // Actions
    initializeTask: () => void;
    updateTaskField: (id: string, field: 'title' | 'skillIds', value: string | string[]) => void;
    addSubtask: (parentTaskId: string) => void;
    removeSubtask: (parentTaskId: string, taskId: string) => void;
    updateSubtask: (parentTaskId: string, updatedSubtask: TaskFormData) => void;
    getTaskById: (id: string) => TaskFormData | null;
}

// Helper function to find and update a task by ID in the tree
const updateTaskInTree = (
    task: TaskFormData,
    targetId: string,
    updater: (task: TaskFormData) => TaskFormData
): TaskFormData => {
    if (task.id === targetId) {
        return updater(task);
    }
    
    return {
        ...task,
        subtasks: task.subtasks.map(subtask =>
            updateTaskInTree(subtask, targetId, updater)
        ),
    };
};

// Helper function to find a task by ID in the tree
const findTaskInTree = (task: TaskFormData, id: string): TaskFormData | null => {
    if (task.id === id) {
        return task;
    }
    
    for (const subtask of task.subtasks) {
        const found = findTaskInTree(subtask, id);
        if (found) return found;
    }
    
    return null;
};

export const useTaskCreationStore = create<TaskCreationState>((set, get) => ({
    mainTask: {
        id: 'main',
        title: '',
        skillIds: [],
        subtasks: [],
    },

    initializeTask: () => {
        set({
            mainTask: {
                id: 'main',
                title: '',
                skillIds: [],
                subtasks: [],
            },
        });
    },

    updateTaskField: (id: string, field: 'title' | 'skillIds', value: string | string[]) => {
        set((state) => ({
            mainTask: updateTaskInTree(state.mainTask, id, (task) => ({
                ...task,
                [field]: value,
            })),
        }));
    },

    addSubtask: (parentTaskId: string) => {
        const newSubtask: TaskFormData = {
            id: `temp_${Date.now()}_${Math.random()}`,
            title: '',
            skillIds: [],
            subtasks: [],
        };

        set((state) => ({
            mainTask: updateTaskInTree(state.mainTask, parentTaskId, (task) => ({
                ...task,
                subtasks: [...task.subtasks, newSubtask],
            })),
        }));
    },

    removeSubtask: (parentTaskId: string, taskId: string) => {
        set((state) => ({
            mainTask: updateTaskInTree(state.mainTask, parentTaskId, (task) => ({
                ...task,
                subtasks: task.subtasks.filter((s) => s.id !== taskId),
            })),
        }));
    },

    updateSubtask: (parentTaskId: string, updatedSubtask: TaskFormData) => {
        set((state) => ({
            mainTask: updateTaskInTree(state.mainTask, parentTaskId, (task) => ({
                ...task,
                subtasks: task.subtasks.map((s) =>
                    s.id === updatedSubtask.id ? updatedSubtask : s
                ),
            })),
        }));
    },

    getTaskById: (id: string) => {
        const state = get();
        return findTaskInTree(state.mainTask, id);
    },
}));
