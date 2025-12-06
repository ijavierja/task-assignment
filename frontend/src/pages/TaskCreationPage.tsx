import {
    Box,
    Paper,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '../utils/trpc';
import { useNotification } from '../hooks/useNotification';

export default function TaskCreationPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { notification, showNotification, closeNotification } = useNotification();

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

    const handleSkillsChange = (event: any) => {
        setSelectedSkills(event.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Please enter a task title');
            return;
        }
        if (selectedSkills.length === 0) {
            setError('Please select at least one skill');
            return;
        }
        setError(null);
        createTaskMutation.mutate({
            title,
            skillIds: selectedSkills,
        });
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

            <Paper sx={{ p: 4, maxWidth: 600 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Task Title"
                            placeholder="e.g., Build login form"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            variant="outlined"
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel id="skills-label">Required Skills</InputLabel>
                            <Select
                                labelId="skills-label"
                                id="skills"
                                multiple
                                value={selectedSkills}
                                onChange={handleSkillsChange}
                                input={<OutlinedInput label="Required Skills" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((skillId) => {
                                            const skill = skills.find((s: any) => s.id === skillId);
                                            return <Chip key={skillId} label={skill?.name || skillId} />;
                                        })}
                                    </Box>
                                )}
                            >
                                {skills.map((skill: any) => (
                                    <MenuItem key={skill.id} value={skill.id}>
                                        {skill.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
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
                </form>
            </Paper>

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
