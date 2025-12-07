import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Chip,
    Card,
    CardContent,
    IconButton,
    Collapse,
} from '@mui/material';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface SubtaskFormData {
    id: string; // temporary id for UI
    title: string;
    skillIds: string[];
    subtasks: SubtaskFormData[];
}

interface SubtaskFormProps {
    subtasks: SubtaskFormData[];
    onSubtasksChange: (subtasks: SubtaskFormData[]) => void;
    skills: any[];
    depth?: number;
    maxDepth?: number;
}

export default function SubtaskForm({
    subtasks,
    onSubtasksChange,
    skills,
    depth = 0,
    maxDepth = 3,
}: SubtaskFormProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const addSubtask = () => {
        const newSubtask: SubtaskFormData = {
            id: `temp_${Date.now()}_${Math.random()}`,
            title: '',
            skillIds: [],
            subtasks: [],
        };
        onSubtasksChange([...subtasks, newSubtask]);
    };

    const removeSubtask = (id: string) => {
        onSubtasksChange(subtasks.filter((s) => s.id !== id));
    };

    const updateSubtask = (id: string, updates: Partial<SubtaskFormData>) => {
        const updated = subtasks.map((s) => (s.id === id ? { ...s, ...updates } : s));
        onSubtasksChange(updated);
    };

    const updateSubtaskNested = (id: string, nestedSubtasks: SubtaskFormData[]) => {
        const updated = subtasks.map((s) => (s.id === id ? { ...s, subtasks: nestedSubtasks } : s));
        onSubtasksChange(updated);
    };

    const canAddMore = depth < maxDepth - 1;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {subtasks.map((subtask) => {
                const isAtMaxDepth = depth >= maxDepth - 1;

                return (
                    <Card
                        key={subtask.id}
                        sx={{
                            ml: depth * 2,
                            backgroundColor: depth > 0 ? 'action.hover' : 'background.paper',
                        }}
                    >
                        <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Subtask Title"
                                    placeholder="e.g., Implement feature"
                                    value={subtask.title}
                                    onChange={(e) =>
                                        updateSubtask(subtask.id, { title: e.target.value })
                                    }
                                    variant="outlined"
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => removeSubtask(subtask.id)}
                                    sx={{ mt: 1 }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id={`skills-label-${subtask.id}`}>
                                        Required Skills
                                    </InputLabel>
                                    <Select
                                        labelId={`skills-label-${subtask.id}`}
                                        id={`skills-${subtask.id}`}
                                        multiple
                                        value={subtask.skillIds}
                                        onChange={(e) =>
                                            updateSubtask(subtask.id, {
                                                skillIds: e.target.value as string[],
                                            })
                                        }
                                        input={<OutlinedInput label="Required Skills" />}
                                        renderValue={(selected) => (
                                            <Box
                                                sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                                            >
                                                {selected.map((skillId) => {
                                                    const skill = skills.find(
                                                        (s: any) => s.id === skillId
                                                    );
                                                    return (
                                                        <Chip
                                                            key={skillId}
                                                            label={skill?.name || skillId}
                                                            size="small"
                                                        />
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
                                </FormControl>
                            </Box>

                            {/* Nested subtasks */}
                            {subtask.subtasks.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => toggleExpanded(subtask.id)}
                                    >
                                        {expandedIds.has(subtask.id) ? (
                                            <ExpandLessIcon fontSize="small" />
                                        ) : (
                                            <ExpandMoreIcon fontSize="small" />
                                        )}
                                        <span style={{ fontSize: '0.875rem', marginLeft: '4px' }}>
                                            {subtask.subtasks.length} nested subtask(s)
                                        </span>
                                    </Box>

                                    <Collapse in={expandedIds.has(subtask.id)} timeout="auto">
                                        <Box sx={{ mt: 2 }}>
                                            <SubtaskForm
                                                subtasks={subtask.subtasks}
                                                onSubtasksChange={(updated) =>
                                                    updateSubtaskNested(subtask.id, updated)
                                                }
                                                skills={skills}
                                                depth={depth + 1}
                                                maxDepth={maxDepth}
                                            />
                                        </Box>
                                    </Collapse>
                                </Box>
                            )}

                            {/* Add nested subtask button - disabled at max depth */}
                            {canAddMore && !isAtMaxDepth && (
                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={() => {
                                        // Expand this subtask first
                                        const newExpanded = new Set(expandedIds);
                                        newExpanded.add(subtask.id);
                                        setExpandedIds(newExpanded);

                                        // Add new subtask
                                        const newSubtask: SubtaskFormData = {
                                            id: `temp_${Date.now()}_${Math.random()}`,
                                            title: '',
                                            skillIds: [],
                                            subtasks: [],
                                        };
                                        updateSubtaskNested(subtask.id, [
                                            ...subtask.subtasks,
                                            newSubtask,
                                        ]);
                                    }}
                                    size="small"
                                    variant="outlined"
                                >
                                    Add Nested Subtask
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {/* Add subtask at this level - disabled at max depth */}
            <Button
                startIcon={<AddIcon />}
                onClick={addSubtask}
                variant="outlined"
                disabled={depth >= maxDepth - 1}
                sx={{ alignSelf: 'flex-start', ml: depth * 2 }}
            >
                Add Subtask
            </Button>
        </Box>
    );
}
