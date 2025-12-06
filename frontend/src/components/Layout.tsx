import { Outlet, Link } from 'react-router-dom';
import { AppBar, Container, Toolbar, Box, Button } from '@mui/material';

export default function Layout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                            <Box sx={{ fontSize: 24, fontWeight: 'bold' }}>Task Assignment</Box>
                        </Link>
                    </Box>
                    <Button color="inherit" component={Link} to="/">
                        Tasks
                    </Button>
                    <Button color="inherit" component={Link} to="/create-task">
                        Create Task
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
}
