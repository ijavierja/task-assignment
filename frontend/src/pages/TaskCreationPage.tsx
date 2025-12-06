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
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockSkills = ['React', 'TypeScript', 'PostgreSQL', 'Node.js', 'Documentation', 'UI/UX'];

export default function TaskCreationPage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

    const handleSkillsChange = (event: any) => {
        setSelectedSkills(event.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            alert('Please enter a task title');
            return;
        }
        if (selectedSkills.length === 0) {
            alert('Please select at least one skill');
            return;
        }
        console.log('Creating task:', { title, skills: selectedSkills });
        alert('Task created! (mock)');
        navigate('/');
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <h1>Create New Task</h1>
            </Box>

            <Paper sx={{ p: 4, maxWidth: 600 }}>
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
                                        {selected.map((value) => (
                                            <Chip key={value} label={value} />
                                        ))}
                                    </Box>
                                )}
                            >
                                {mockSkills.map((skill) => (
                                    <MenuItem key={skill} value={skill}>
                                        {skill}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button type="submit" variant="contained" color="primary">
                            Create Task
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/')}>
                            Cancel
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
}
