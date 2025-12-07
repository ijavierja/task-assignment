import {
    TableRow,
    TableCell,
    Box,
    IconButton,
    Select,
    MenuItem,
    Button,
    Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddIcon from '@mui/icons-material/Add';
import { statusMapper } from '../types';

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

interface TaskRowProps {
    task: TaskWithSubtasks;
    level: number;
    isExpanded: boolean;
    maxDepth?: number;
    isAnyAncestorDone?: boolean;
    onToggleExpand: (taskId: string) => void;
    onStatusChange: (taskId: string, status: string) => void;
    onAssigneeChange: (taskId: string, assigneeId: string) => void;
    onAddSubtask: (taskId: string, taskTitle: string) => void;
    onDropdownOpen: (taskId: string) => void;
    getAvailableAssignees: (taskId: string) => any[] | undefined;
}

export default function TaskRow({
    task,
    level,
    isExpanded,
    maxDepth = 3,
    isAnyAncestorDone,
    onToggleExpand,
    onStatusChange,
    onAssigneeChange,
    onAddSubtask,
    onDropdownOpen,
    getAvailableAssignees,
}: TaskRowProps) {
    const hasSubtasks = task.subtasks && task.subtasks.length > 0;
    const canAddSubtask = level < maxDepth && task.status !== 'DONE';

    // Check if any ancestor is Done
    const canMarkAsIncomplete = !isAnyAncestorDone;

    // Check if all subtasks are done
    const hasIncompletedSubtasks = (task: TaskWithSubtasks): boolean => {
        if (!task.subtasks || task.subtasks.length === 0) return false;

        return task.subtasks.some((subtask) => {
            if (subtask.status !== 'DONE') return true;
            return hasIncompletedSubtasks(subtask);
        });
    };

    const canMarkAsDone = !hasIncompletedSubtasks(task);

    // Progressive background color based on depth
    const getBackgroundColor = (level: number) => {
        if (level === 0) return 'inherit';
        // Create progressively darker backgrounds for each level
        const colors = [
            'rgba(0, 0, 0, 0.02)', // level 1 - very light
            'rgba(0, 0, 0, 0.06)', // level 2 - slightly darker
            'rgba(0, 0, 0, 0.10)', // level 3 - more visible
            'rgba(0, 0, 0, 0.14)', // level 4+ - darkest
        ];
        return colors[Math.min(level - 1, colors.length - 1)];
    };

    return (
        <TableRow sx={{ backgroundColor: getBackgroundColor(level) }}>
            <TableCell sx={{ pl: level * 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {hasSubtasks && (
                        <IconButton size="small" onClick={() => onToggleExpand(task.id)}>
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    )}
                    {!hasSubtasks && <Box sx={{ width: 40 }} />}
                    {task.title}
                </Box>
            </TableCell>
            <TableCell>{task.skills?.map((s) => s.name).join(', ')}</TableCell>
            <TableCell>
                <Select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    size="small"
                >
                    <MenuItem value="TODO" disabled={!canMarkAsIncomplete}>
                        {statusMapper.TODO}
                    </MenuItem>
                    <MenuItem value="IN_PROGRESS" disabled={!canMarkAsIncomplete}>
                        {statusMapper.IN_PROGRESS}
                    </MenuItem>
                    <MenuItem value="DONE" disabled={!canMarkAsDone}>
                        {statusMapper.DONE}
                    </MenuItem>
                </Select>
            </TableCell>
            <TableCell>
                <Select
                    value={task.assignee?.id || ''}
                    onChange={(e) => onAssigneeChange(task.id, e.target.value)}
                    onOpen={() => onDropdownOpen(task.id)}
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
            <TableCell>
                <Tooltip
                    title={
                        !canAddSubtask
                            ? task.status === 'DONE'
                                ? 'Cannot add subtasks to completed tasks'
                                : 'Maximum depth level (4) reached'
                            : ''
                    }
                    disableFocusListener={canAddSubtask}
                    disableHoverListener={canAddSubtask}
                    disableTouchListener={canAddSubtask}
                >
                    <span>
                        <Button
                            startIcon={<AddIcon />}
                            size="small"
                            variant="outlined"
                            onClick={() => onAddSubtask(task.id, task.title)}
                            disabled={!canAddSubtask}
                        >
                            Add Subtask
                        </Button>
                    </span>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
