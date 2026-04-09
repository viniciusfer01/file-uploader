import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthProvider } from '../auth/AuthContext';
import { FileUploaderPage } from './FileUploaderPage';
import { api } from '../services/api';
import { FileRecord } from '../types/file';

vi.mock('../services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(api.get);
const mockedPost = vi.mocked(api.post);

function renderPage() {
  window.localStorage.setItem('file-uploader.auth.token', 'signed-token');
  window.localStorage.setItem(
    'file-uploader.auth.user',
    JSON.stringify({ email: 'admin@example.com' }),
  );

  return render(
    <AuthProvider>
      <MemoryRouter>
        <FileUploaderPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

function createRecord(overrides: Partial<FileRecord> = {}): FileRecord {
  return {
    id: 'file-1',
    name: 'report.pdf',
    url: 'https://storage.example/report.pdf',
    type: 'application/pdf',
    size: 2048,
    createdAt: '2026-04-08T10:00:00.000Z',
    ...overrides,
  };
}

describe('FileUploaderPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockedGet.mockResolvedValue({ data: [] } as never);
  });

  it.each([
    ['image/png', 'preview.png'],
    ['image/jpeg', 'preview.jpeg'],
    ['application/pdf', 'preview.pdf'],
  ])('uploads a supported %s file', async (mimeType, fileName) => {
    const uploaded = createRecord({
      id: fileName,
      name: fileName,
      type: mimeType,
      url: `https://storage.example/${fileName}`,
    });

    mockedPost.mockResolvedValueOnce({ data: uploaded } as never);

    renderPage();

    const input = await screen.findByLabelText(/selecionar arquivo para upload/i);
    const file = new File(['file-bytes'], fileName, { type: mimeType });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    expect(mockedPost).toHaveBeenCalledWith(
      '/files',
      expect.any(FormData),
      expect.objectContaining({
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    );

    if (mimeType === 'application/pdf') {
      expect(await screen.findByRole('link', { name: /abrir arquivo/i })).toHaveAttribute(
        'href',
        uploaded.url,
      );
      expect(screen.getByText(/pdfs podem ser abertos em nova aba/i)).toBeInTheDocument();
    } else {
      expect(await screen.findByRole('img', { name: fileName })).toBeInTheDocument();
    }
  });

  it('rejects an unsupported file type before calling the API', async () => {
    renderPage();

    const input = await screen.findByLabelText(/selecionar arquivo para upload/i);
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(await screen.findByText(/formato invalido/i)).toBeInTheDocument();
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('loads previously uploaded files on mount', async () => {
    mockedGet.mockResolvedValueOnce({
      data: [
        createRecord({
          id: 'png-1',
          name: 'avatar.png',
          type: 'image/png',
          url: 'https://storage.example/avatar.png',
        }),
      ],
    } as never);

    renderPage();

    expect(await screen.findByText('avatar.png')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'avatar.png' })).toBeInTheDocument();
  });
});
