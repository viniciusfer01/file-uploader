import { render, screen } from '@testing-library/react';
import { HelloWorldPage } from './HelloWorldPage';

describe('HelloWorldPage', () => {
  it('renders the hello_world heading and explanatory text', () => {
    render(<HelloWorldPage />);

    expect(
      screen.getByRole('heading', {
        name: /hello world/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/hello_world/i)).toBeInTheDocument();
    expect(screen.getByText(/react, vite, tailwind e vitest/i)).toBeInTheDocument();
  });
});

