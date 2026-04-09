import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from './auth/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { FileUploaderPage } from './pages/FileUploaderPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { api } from './services/api';

vi.mock('./services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
      },
    },
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

function renderWithRouter(initialEntry: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<FileUploaderPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('authenticated routes', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: [] } as never);
  });

  it('redirects unauthenticated users to the login route', async () => {
    renderWithRouter('/');

    expect(await screen.findByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.queryByText(/arquivos enviados/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/senha/i)).toHaveValue('');
  });

  it('redirects unknown frontend routes to login when the user is unauthenticated', async () => {
    renderWithRouter('/rota-inexistente');

    expect(await screen.findByRole('heading', { name: /entrar/i })).toBeInTheDocument();
    expect(screen.queryByText(/sessao autenticada como/i)).not.toBeInTheDocument();
  });

  it('allows access to the protected route after login', async () => {
    mockedPost.mockResolvedValueOnce({
      data: {
        token: 'signed-token',
        user: { email: 'admin@example.com' },
      },
    } as never);

    renderWithRouter('/login');

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'supersecret' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/sessao autenticada como/i)).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(mockedGet).toHaveBeenCalledWith('/files');
  });

  it('shows an error when login fails', async () => {
    mockedPost.mockRejectedValueOnce(new Error('Unauthorized'));

    renderWithRouter('/login');

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText(/credenciais invalidas/i)).toBeInTheDocument();
    });
  });
});
