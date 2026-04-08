import { BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';

describe('FilesService', () => {
  const prismaService = {
    fileRecord: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const storageService = {
    upload: vi.fn(),
  };

  const service = new FilesService(prismaService as never, storageService as never);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ['image/png', 'image.png'],
    ['image/jpeg', 'image.jpeg'],
    ['application/pdf', 'document.pdf'],
  ])('stores metadata and URL for supported uploads: %s', async (mimetype, originalname) => {
    const file = {
      mimetype,
      originalname,
      size: 5120,
      buffer: Buffer.from('file-content'),
    } as Express.Multer.File;

    const savedRecord = {
      id: 'file-1',
      name: originalname,
      type: mimetype,
      size: 5120,
      url: 'https://storage.example/file-1',
      createdAt: new Date('2026-04-08T10:00:00.000Z'),
    };

    storageService.upload.mockResolvedValueOnce(savedRecord.url);
    prismaService.fileRecord.create.mockResolvedValueOnce(savedRecord);

    await expect(service.create(file)).resolves.toEqual(savedRecord);

    expect(storageService.upload).toHaveBeenCalledWith(file);
    expect(prismaService.fileRecord.create).toHaveBeenCalledWith({
      data: {
        name: originalname,
        type: mimetype,
        size: 5120,
        url: savedRecord.url,
      },
    });
  });

  it('normalizes filenames with accented characters before upload and persistence', async () => {
    const mojibakeName = 'ð§ª Teste TeÌcnico â Upload de Arquivos.pdf';
    const normalizedName = '🧪 Teste Técnico — Upload de Arquivos.pdf';
    const file = {
      mimetype: 'application/pdf',
      originalname: mojibakeName,
      size: 4096,
      buffer: Buffer.from('file-content'),
    } as Express.Multer.File;

    const savedRecord = {
      id: 'file-2',
      name: normalizedName,
      type: 'application/pdf',
      size: 4096,
      url: 'https://storage.example/file-2',
      createdAt: new Date('2026-04-08T10:05:00.000Z'),
    };

    storageService.upload.mockResolvedValueOnce(savedRecord.url);
    prismaService.fileRecord.create.mockResolvedValueOnce(savedRecord);

    await expect(service.create(file)).resolves.toEqual(savedRecord);

    expect(file.originalname).toBe(normalizedName);
    expect(storageService.upload).toHaveBeenCalledWith(file);
    expect(prismaService.fileRecord.create).toHaveBeenCalledWith({
      data: {
        name: normalizedName,
        type: 'application/pdf',
        size: 4096,
        url: savedRecord.url,
      },
    });
  });

  it('rejects unsupported file types', async () => {
    const file = {
      mimetype: 'text/plain',
      originalname: 'notes.txt',
      size: 128,
      buffer: Buffer.from('hello'),
    } as Express.Multer.File;

    await expect(service.create(file)).rejects.toBeInstanceOf(BadRequestException);
    expect(storageService.upload).not.toHaveBeenCalled();
    expect(prismaService.fileRecord.create).not.toHaveBeenCalled();
  });
});
