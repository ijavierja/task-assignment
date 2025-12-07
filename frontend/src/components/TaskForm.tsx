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
    FormHelperText,
} from '@mui/material';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTaskCreationStore, type TaskFormData } from '../store/taskCreationStore';

interface TaskFormProps {
    task: TaskFormData;
    depth?: number;
    maxDepth?: number;
    skills: any[];
    parentTaskId?: string;
}

export default function TaskForm({
    task,
    depth = 0,
    maxDepth = 3,
    skills,
    parentTaskId = task.id,
}: TaskFormProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Get store actions
    const updateTaskField = useTaskCreationStore((state) => state.updateTaskField);
    const addSubtask = useTaskCreationStore((state) => state.addSubtask);
    const removeSubtask = useTaskCreationStore((state) => state.removeSubtask);

    const toggleExpanded = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const canAddMore = depth < maxDepth;
    const isAtMaxDepth = depth >= maxDepth;
    const isRoot = depth === 0;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card
                sx={{
                    ml: isRoot ? 0 : depth * 2,
                    backgroundColor: isRoot ? 'background.paper' : 'action.hover',
                }}
            >
                <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                        <TextField
                            fullWidth
                            size={isRoot ? 'medium' : 'small'}
                            label={isRoot ? 'Task Title' : 'Subtask Title'}
                            placeholder={
                                isRoot ? 'e.g., Build login form' : 'e.g., Implement feature'
                            }
                            value={task.title}
                            onChange={(e) => updateTaskField(task.id, 'title', e.target.value)}
                            variant="outlined"
                        />
                        {!isRoot && (
                            <IconButton
                                size="small"
                                onClick={() => removeSubtask(parentTaskId, task.id)}
                                sx={{ mt: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <FormControl fullWidth size={isRoot ? 'medium' : 'small'}>
                            <InputLabel id={`skills-label-${task.id}`}>Required Skills</InputLabel>
                            <Select
                                labelId={`skills-label-${task.id}`}
                                id={`skills-${task.id}`}
                                multiple
                                value={task.skillIds}
                                onChange={(e) =>
                                    updateTaskField(task.id, 'skillIds', e.target.value as string[])
                                }
                                input={<OutlinedInput label="Required Skills" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((skillId) => {
                                            const skill = skills.find((s: any) => s.id === skillId);
                                            return (
                                                <Chip
                                                    key={skillId}
                                                    label={skill?.name || skillId}
                                                    size={isRoot ? 'medium' : 'small'}
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
                            <FormHelperText>
                                Optional: Leave empty and skills will be automatically identified by
                                AI
                            </FormHelperText>
                        </FormControl>
                    </Box>

                    {/* Subtasks list - collapsible */}
                    {task.subtasks.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                }}
                                onClick={() => toggleExpanded(task.id)}
                            >
                                {expandedIds.has(task.id) ? (
                                    <ExpandLessIcon fontSize="small" />
                                ) : (
                                    <ExpandMoreIcon fontSize="small" />
                                )}
                                <span style={{ fontSize: '0.875rem', marginLeft: '4px' }}>
                                    {task.subtasks.length} subtask(s)
                                </span>
                            </Box>

                            <Collapse in={expandedIds.has(task.id)} timeout="auto">
                                <Box
                                    sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                                >
                                    {task.subtasks.map((subtask) => (
                                        <TaskForm
                                            key={subtask.id}
                                            task={subtask}
                                            skills={skills}
                                            depth={depth + 1}
                                            maxDepth={maxDepth}
                                            parentTaskId={task.id}
                                        />
                                    ))}
                                </Box>
                            </Collapse>
                        </Box>
                    )}

                    {/* Add subtask button - disabled at max depth */}
                    {canAddMore && !isAtMaxDepth && (
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => {
                                // Expand this task first
                                const newExpanded = new Set(expandedIds);
                                newExpanded.add(task.id);
                                setExpandedIds(newExpanded);

                                // Add new subtask
                                addSubtask(task.id);
                            }}
                            size="small"
                            variant="outlined"
                        >
                            {isRoot ? 'Add Subtask' : 'Add Nested Subtask'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
