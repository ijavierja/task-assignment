import { Outlet, Link } from 'react-router-dom';
import { AppBar, Container, Toolbar, Box, Button } from '@mui/material';

export default function Layout() {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                        <img 
                            src="/htx_vertical_logo_reverse.png" 
                            alt="logo" 
                            style={{ height: 40, width: 'auto' }}
                        />
                        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                            <Box sx={{ fontSize: 24, fontWeight: 'bold', marginLeft: '16px' }}>Task Assignment</Box>
                        </Link>
                    </Box>
                    <Button color="inherit" component={Link} to="/">
                        Tasks
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
                <Outlet />
            </Container>
        </Box>
    );
}
