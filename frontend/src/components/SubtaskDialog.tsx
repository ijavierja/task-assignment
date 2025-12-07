import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    Box,
    Button,
    Alert,
    FormHelperText,
} from '@mui/material';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

interface SubtaskDialogProps {
    open: boolean;
    onClose: () => void;
    parentTaskId: string;
    parentTaskTitle: string;
    onSubtaskCreated: (newSubtask?: any) => void;
}

export default function SubtaskDialog({
    open,
    onClose,
    parentTaskId,
    parentTaskTitle,
    onSubtaskCreated,
}: SubtaskDialogProps) {
    const [title, setTitle] = useState('');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { data: skills = [], isLoading: skillsLoading } = trpc.skills.getAll.useQuery();
    const createSubtaskMutation = trpc.tasks.create.useMutation({
        onSuccess: (data) => {
            setTitle('');
            setSelectedSkills([]);
            setError(null);
            onSubtaskCreated(data);
            onClose();
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleSkillsChange = (event: any) => {
        setSelectedSkills(event.target.value);
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            setError('Please enter a subtask title');
            return;
        }
        setError(null);
        createSubtaskMutation.mutate({
            title,
            skillIds: selectedSkills,
            parentTaskId,
        });
    };

    const handleClose = () => {
        setTitle('');
        setSelectedSkills([]);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Subtask to "{parentTaskTitle}"</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth
                        label="Subtask Title"
                        placeholder="e.g., Design UI mockup"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        variant="outlined"
                        disabled={createSubtaskMutation.isPending}
                    />

                    <FormControl
                        fullWidth
                        disabled={skillsLoading || createSubtaskMutation.isPending}
                    >
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
                                        return (
                                            <Chip key={skillId} label={skill?.name || skillId} />
                                        );
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
                        <FormHelperText>
                            Optional: Leave empty and skills will be automatically identified by AI
                        </FormHelperText>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={createSubtaskMutation.isPending}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={createSubtaskMutation.isPending}
                >
                    {createSubtaskMutation.isPending ? 'Creating...' : 'Add Subtask'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
