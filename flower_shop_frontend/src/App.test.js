import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders login or shop', () => {
  render(<App />);
  const textInDoc = screen.getByText(/floral\.market/i);
  expect(textInDoc).toBeInTheDocument();
});
