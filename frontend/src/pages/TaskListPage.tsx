import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
import { statusMapper, mapTaskFromAPI } from '../types';
import { useTaskStore } from '../store/taskStore';

export default function TaskListPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    
    const { tasks, setTasks, getAvailableAssignees, setAvailableAssignees, updateTaskAssignee, updateTaskStatus } = useTaskStore();
    const queryClient = trpc.useUtils();

    // Fetch tasks on mount and store in Zustand
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const fetchedTasks = await queryClient.tasks.getAll.fetch();
                setTasks(fetchedTasks.map(mapTaskFromAPI));
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [setTasks, queryClient]);
    
    const updateStatusMutation = trpc.tasks.updateStatus.useMutation();
    const assignDeveloperMutation = trpc.tasks.assignDeveloper.useMutation();

    const handleStatusChange = (taskId: string, newStatus: string) => {
        updateStatusMutation.mutate(
            { id: taskId, status: newStatus as any },
            {
                onSuccess: (updatedTask) => {
                    // Update the store with the new status from backend response
                    updateTaskStatus(taskId, updatedTask.status as any);
                }
            }
        );
    };

    const handleAssigneeChange = (taskId: string, newAssigneeId: string) => {
        assignDeveloperMutation.mutate(
            { 
                id: taskId, 
                assigneeId: newAssigneeId || null 
            },
            {
                onSuccess: (updatedTask) => {
                    // Update the store with the new assignee from backend response
                    updateTaskAssignee(taskId, updatedTask.assignee as any || null);
                }
            }
        );
    };

    const handleDropdownOpen = (taskId: string) => {
        // Check if we already have available assignees cached for this task
        const cached = getAvailableAssignees(taskId);
        if (!cached) {
            // Lazy load if not cached - imperatively fetch and cache
            queryClient.tasks.getAvailableAssignees.fetch({ id: taskId }).then((availableAssignees: any) => {
                setAvailableAssignees(taskId, availableAssignees);
            });
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">
                    Error loading tasks: {error.message}
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Task List</h1>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/create-task')}
                >
                    Create New Task
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task: any) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.skills?.map((s) => s.name).join(', ')}</TableCell>
                                <TableCell>
                                    <Select
                                        value={task.status}
                                        onChange={(e) =>
                                            handleStatusChange(task.id, e.target.value)
                                        }
                                        size="small"
                                    >
                                        <MenuItem value="TODO">{statusMapper.TODO}</MenuItem>
                                        <MenuItem value="IN_PROGRESS">{statusMapper.IN_PROGRESS}</MenuItem>
                                        <MenuItem value="DONE">{statusMapper.DONE}</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={task.assignee?.id || ''}
                                        onChange={(e) =>
                                            handleAssigneeChange(task.id, e.target.value)
                                        }
                                        onOpen={() => handleDropdownOpen(task.id)}
                                        size="small"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Unassigned</MenuItem>
                                        {(() => {
                                            const available = getAvailableAssignees(task.id);
                                            if (available) {
                                                return available.map((dev: any) => (
                                                    <MenuItem key={dev.id} value={dev.id}>
                                                        {dev.name}
                                                    </MenuItem>
                                                ));
                                            }
                                            if (task.assignee) {
                                                return (
                                                    <MenuItem key={task.assignee.id} value={task.assignee.id}>
                                                        {task.assignee.name}
                                                    </MenuItem>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
