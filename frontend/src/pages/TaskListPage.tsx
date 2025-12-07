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
    Button,
    Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
import { mapTaskFromAPI } from '../types';
import { useTaskStore } from '../store/taskStore';
import { useNotification } from '../hooks/useNotification';
import SubtaskDialog from '../components/SubtaskDialog';
import TaskRow from '../components/TaskRow';

interface TaskWithSubtasks {
    id: string;
    title: string;
    status: string;
    assignee?: any;
    skills: any[];
    subtasks?: TaskWithSubtasks[];
    expanded?: boolean;
    parentTaskId?: string | null;
}

export default function TaskListPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [subtaskDialog, setSubtaskDialog] = useState<{
        open: boolean;
        parentTaskId: string;
        parentTaskTitle: string;
    }>({ open: false, parentTaskId: '', parentTaskTitle: '' });
    const [tasksWithSubtasks, setTasksWithSubtasks] = useState<TaskWithSubtasks[]>([]);
    const [taskMap, setTaskMap] = useState<Map<string, TaskWithSubtasks>>(new Map());
    
    const { setTasks, getAvailableAssignees, setAvailableAssignees, updateTaskAssignee, updateTaskStatus } = useTaskStore();
    const { notification, showNotification, closeNotification } = useNotification();
    const queryClient = trpc.useUtils();

    // Fetch all tasks and build hierarchy
    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true);
            try {
                const fetchedTasks = await queryClient.tasks.getAll.fetch();
                const mappedTasks = fetchedTasks.map(mapTaskFromAPI);
                setTasks(mappedTasks);

                // Build task hierarchy
                const taskMap = new Map<string, TaskWithSubtasks>();
                const rootTasks: TaskWithSubtasks[] = [];

                // First pass: create all task objects
                for (const task of mappedTasks) {
                    taskMap.set(task.id, {
                        ...task,
                        subtasks: [],
                        expanded: false,
                    });
                }

                // Second pass: build hierarchy
                for (const task of mappedTasks) {
                    if (task.parentTaskId) {
                        const parent = taskMap.get(task.parentTaskId);
                        if (parent) {
                            parent.subtasks = parent.subtasks || [];
                            parent.subtasks.push(taskMap.get(task.id)!);
                        }
                    } else {
                        rootTasks.push(taskMap.get(task.id)!);
                    }
                }

                setTasksWithSubtasks(rootTasks);
                setTaskMap(taskMap);
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
                    updateTaskStatus(taskId, updatedTask.status as any);
                    
                    // Update local state immediately
                    setTasksWithSubtasks((prevTasks) => 
                        updateTaskInHierarchy(prevTasks, taskId, { status: newStatus })
                    );

                    // Update taskMap to reflect new status for ancestor chain checks
                    setTaskMap((prevMap) => {
                        const newMap = new Map(prevMap);
                        const task = newMap.get(taskId);
                        if (task) {
                            task.status = newStatus;
                        }
                        return newMap;
                    });
                    
                    showNotification('Task status updated successfully', 'success');
                    // Refresh to update hierarchy
                    queryClient.tasks.getAll.invalidate();
                },
                onError: (err) => {
                    showNotification(err.message || 'Failed to update task status', 'error');
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
                    updateTaskAssignee(taskId, updatedTask.assignee as any || null);
                    
                    // Update local state immediately
                    setTasksWithSubtasks((prevTasks) => 
                        updateTaskInHierarchy(prevTasks, taskId, { assignee: updatedTask.assignee || undefined })
                    );
                    
                    const message = updatedTask.assignee 
                        ? `Task assigned to ${updatedTask.assignee.name}`
                        : 'Task unassigned';
                    showNotification(message, 'success');
                },
                onError: () => {
                    showNotification('Failed to update task assignment', 'error');
                }
            }
        );
    };

    const handleDropdownOpen = (taskId: string) => {
        const cached = getAvailableAssignees(taskId);
        if (!cached) {
            queryClient.tasks.getAvailableAssignees.fetch({ id: taskId }).then((availableAssignees: any) => {
                setAvailableAssignees(taskId, availableAssignees);
            });
        }
    };

    const toggleRowExpanded = (taskId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(taskId)) {
            newExpanded.delete(taskId);
        } else {
            newExpanded.add(taskId);
        }
        setExpandedRows(newExpanded);
    };

    const handleAddSubtask = (taskId: string, taskTitle: string) => {
        setSubtaskDialog({
            open: true,
            parentTaskId: taskId,
            parentTaskTitle: taskTitle,
        });
    };

    // Helper function to update a task in the hierarchy
    const updateTaskInHierarchy = (
        tasks: TaskWithSubtasks[],
        taskId: string,
        updates: Partial<TaskWithSubtasks>
    ): TaskWithSubtasks[] => {
        return tasks.map((task) => {
            if (task.id === taskId) {
                return { ...task, ...updates };
            }
            if (task.subtasks && task.subtasks.length > 0) {
                return {
                    ...task,
                    subtasks: updateTaskInHierarchy(task.subtasks, taskId, updates),
                };
            }
            return task;
        });
    };

    const addSubtaskToHierarchy = (
        tasks: TaskWithSubtasks[],
        parentTaskId: string,
        newSubtask: TaskWithSubtasks
    ): TaskWithSubtasks[] => {
        return tasks.map((task) => {
            if (task.id === parentTaskId) {
                return {
                    ...task,
                    subtasks: [newSubtask, ...(task.subtasks || [])],
                    expanded: true, // Auto-expand parent to show new subtask
                };
            }
            if (task.subtasks && task.subtasks.length > 0) {
                return {
                    ...task,
                    subtasks: addSubtaskToHierarchy(task.subtasks, parentTaskId, newSubtask),
                };
            }
            return task;
        });
    };

    const handleSubtaskCreated = async (newSubtask?: any) => {
        // If the new subtask is provided, add it to local state immediately
        if (newSubtask && subtaskDialog.parentTaskId) {
            const newTaskWithSubtasks: TaskWithSubtasks = {
                id: newSubtask.id,
                title: newSubtask.title,
                status: newSubtask.status || 'TODO',
                parentTaskId: newSubtask.parentTaskId,
                skills: newSubtask.skills || [],
                assignee: newSubtask.assignee || null,
                subtasks: [],
                expanded: false,
            };

            // Update hierarchy with new subtask
            setTasksWithSubtasks((prevTasks) => 
                addSubtaskToHierarchy(prevTasks, subtaskDialog.parentTaskId, newTaskWithSubtasks)
            );

            // Add to taskMap
            setTaskMap((prevMap) => {
                const newMap = new Map(prevMap);
                newMap.set(newSubtask.id, newTaskWithSubtasks);
                return newMap;
            });
        }

        // Refresh to get any data we might have missed
        queryClient.tasks.getAll.invalidate();
    };

    // Helper to check if any ancestor is DONE by traversing the task hierarchy
    const hasAncestorDone = (taskId: string, taskMap: Map<string, TaskWithSubtasks>): boolean => {
        const task = taskMap.get(taskId);
        if (!task || !task.parentTaskId) return false;

        const parentTask = taskMap.get(task.parentTaskId);
        if (!parentTask) return false;

        if (parentTask.status === 'DONE') return true;

        // Recursively check parent's parents
        return hasAncestorDone(parentTask.id, taskMap);
    };

    const renderTaskRow = (task: TaskWithSubtasks, level: number = 0, taskMap?: Map<string, TaskWithSubtasks>) => {
        const isExpanded = expandedRows.has(task.id);
        const hasAnyAncestorDone = taskMap ? hasAncestorDone(task.id, taskMap) : false;

        return [
            <TaskRow
                key={task.id}
                task={task}
                level={level}
                isExpanded={isExpanded}
                maxDepth={3}
                isAnyAncestorDone={hasAnyAncestorDone}
                onToggleExpand={toggleRowExpanded}
                onStatusChange={handleStatusChange}
                onAssigneeChange={handleAssigneeChange}
                onAddSubtask={handleAddSubtask}
                onDropdownOpen={handleDropdownOpen}
                getAvailableAssignees={getAvailableAssignees}
            />,
            // Subtasks rows
            ...((task.subtasks && task.subtasks.length > 0 && isExpanded)
                ? task.subtasks.flatMap((subtask) => renderTaskRow(subtask, level + 1, taskMap))
                : []),
        ];
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
                <h1>Tasks</h1>
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
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasksWithSubtasks.flatMap((task) => renderTaskRow(task, 0, taskMap))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Subtask Dialog */}
            <SubtaskDialog
                open={subtaskDialog.open}
                onClose={() => setSubtaskDialog({ open: false, parentTaskId: '', parentTaskTitle: '' })}
                parentTaskId={subtaskDialog.parentTaskId}
                parentTaskTitle={subtaskDialog.parentTaskTitle}
                onSubtaskCreated={handleSubtaskCreated}
            />

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
