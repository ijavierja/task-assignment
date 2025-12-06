import { render, screen } from '@testing-library/react';
import App from './App';

test('renders task assignment app', () => {
    render(<App />);
    expect(screen.getByText('Task Assignment')).toBeInTheDocument();
});

test('renders navigation links', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create task/i })).toBeInTheDocument();
});
