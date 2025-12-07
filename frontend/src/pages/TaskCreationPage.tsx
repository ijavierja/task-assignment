import {
    Box,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useNotification } from '../hooks/useNotification';
import TaskForm from '../components/TaskForm';
import { useTaskCreationStore } from '../store/taskCreationStore';

export default function TaskCreationPage() {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const { notification, showNotification, closeNotification } = useNotification();

    // Get store state and actions
    const mainTask = useTaskCreationStore((state) => state.mainTask);
    const initializeTask = useTaskCreationStore((state) => state.initializeTask);

    const { data: skills = [], isLoading: skillsLoading } = trpc.skills.getAll.useQuery();
    const createTaskMutation = trpc.tasks.create.useMutation({
        onSuccess: () => {
            showNotification('Task created successfully!', 'success');
            setTimeout(() => {
                navigate('/');
            }, 1000);
        },
        onError: (err) => {
            setError(err.message);
            showNotification('Failed to create task', 'error');
        },
    });

    // Initialize task on mount
    useEffect(() => {
        initializeTask();
    }, [initializeTask]);

    /**
     * Recursively create tasks and subtasks
     */
    const createTasksRecursively = async (
        taskData: typeof mainTask,
        parentTaskId?: string
    ): Promise<string> => {
        // Create the current task
        const createdTask = await createTaskMutation.mutateAsync({
            title: taskData.title,
            skillIds: taskData.skillIds,
            parentTaskId,
        });

        // Recursively create subtasks
        if (taskData.subtasks.length > 0) {
            for (const subtask of taskData.subtasks) {
                await createTasksRecursively(subtask, createdTask.id);
            }
        }

        return createdTask.id;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainTask.title.trim()) {
            setError('Please enter a task title');
            return;
        }
        if (mainTask.skillIds.length === 0) {
            setError('Please select at least one skill');
            return;
        }
        setError(null);

        try {
            // Create main task and all subtasks recursively
            await createTasksRecursively(mainTask);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create task');
        }
    };

    if (skillsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <h1>Create New Task</h1>
            </Box>

            <Box sx={{ maxWidth: 1200 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TaskForm
                            task={mainTask}
                            skills={skills}
                            maxDepth={3}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={createTaskMutation.isPending}
                            >
                                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Box>

            <Snackbar
                open={!!notification}
                autoHideDuration={3000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={closeNotification}
                    severity={notification?.type || 'info'}
                    sx={{ width: '100%' }}
                >
                    {notification?.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
