import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Select,
    MenuItem,
} from '@mui/material';
import { useState } from 'react';

const mockTasks = [
    {
        id: 1,
        title: 'Build login form',
        status: 'TODO',
        assignee: null,
        skills: ['React', 'TypeScript'],
    },
    {
        id: 2,
        title: 'Setup database',
        status: 'IN_PROGRESS',
        assignee: 'John Doe',
        skills: ['PostgreSQL'],
    },
    {
        id: 3,
        title: 'API documentation',
        status: 'DONE',
        assignee: 'Jane Smith',
        skills: ['Documentation'],
    },
];

const mockDevelopers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams'];

export default function TaskListPage() {
    const [tasks, setTasks] = useState(mockTasks);

    const handleStatusChange = (taskId: number, newStatus: string) => {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)));
    };

    const handleAssigneeChange = (taskId: number, newAssignee: string) => {
        setTasks(
            tasks.map((task) => (task.id === taskId ? { ...task, assignee: newAssignee } : task))
        );
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <h1>Task List</h1>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.id}</TableCell>
                                <TableCell>{task.title}</TableCell>
                                <TableCell>{task.skills.join(', ')}</TableCell>
                                <TableCell>
                                    <Select
                                        value={task.status}
                                        onChange={(e) =>
                                            handleStatusChange(task.id, e.target.value)
                                        }
                                        size="small"
                                    >
                                        <MenuItem value="TODO">TODO</MenuItem>
                                        <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                                        <MenuItem value="DONE">DONE</MenuItem>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={task.assignee || ''}
                                        onChange={(e) =>
                                            handleAssigneeChange(task.id, e.target.value)
                                        }
                                        size="small"
                                        displayEmpty
                                    >
                                        <MenuItem value="">Unassigned</MenuItem>
                                        {mockDevelopers.map((dev) => (
                                            <MenuItem key={dev} value={dev}>
                                                {dev}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell align="center">
                                    <Button size="small" variant="outlined">
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
