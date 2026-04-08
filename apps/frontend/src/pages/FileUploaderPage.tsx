import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { FileRecord } from '../types/file';

export const acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

export function FileUploaderPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFiles();
  }, []);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? files[0] ?? null,
    [files, selectedFileId],
  );

  async function loadFiles() {
    try {
      const response = await api.get<FileRecord[]>('/files');
      setFiles(response.data);
      setSelectedFileId((current) => current ?? response.data[0]?.id ?? null);
    } catch {
      setError('Nao foi possivel carregar os arquivos.');
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setError('Formato invalido. Envie JPG, PNG ou PDF.');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post<FileRecord>('/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles((current) => [response.data, ...current]);
      setSelectedFileId(response.data.id);
      event.target.value = '';
    } catch {
      setError('Falha ao enviar o arquivo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(13,148,136,0.12),_transparent_35%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-4 py-10 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">
            File Uploader
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">
            Upload com metadados em banco e arquivo fora do banco
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            A API envia arquivos para um bucket S3 compatível, salva apenas a URL e exibe a
            lista para preview ou download.
          </p>

          <label
            className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-teal-300 bg-teal-50 px-6 py-12 text-center transition hover:border-teal-500 hover:bg-teal-100"
            htmlFor="file-upload-input"
          >
            <span className="text-lg font-semibold text-teal-900">
              {uploading ? 'Enviando arquivo...' : 'Selecionar imagem ou PDF'}
            </span>
            <span className="mt-2 text-sm text-teal-800">Tipos aceitos: JPG, PNG e PDF.</span>
            <input
              aria-label="Selecionar arquivo para upload"
              className="hidden"
              id="file-upload-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleUpload}
            />
          </label>

          {error ? (
            <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Arquivos enviados</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                {files.length} itens
              </span>
            </div>

            <ul className="space-y-3">
              {files.map((file) => {
                const active = file.id === selectedFile?.id;
                return (
                  <li key={file.id}>
                    <button
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedFileId(file.id)}
                      type="button"
                    >
                      <span>
                        <span className="block font-medium">{file.name}</span>
                        <span className="mt-1 block text-sm text-slate-500">
                          {new Date(file.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {file.type.includes('pdf') ? 'PDF' : 'Imagem'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">Preview</h2>
            {selectedFile ? (
              <a
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                href={selectedFile.url}
                target="_blank"
                rel="noreferrer"
              >
                Abrir arquivo
              </a>
            ) : null}
          </div>

          {!selectedFile ? (
            <div className="mt-6 rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center text-slate-300">
              Nenhum arquivo selecionado.
            </div>
          ) : selectedFile.type.includes('pdf') ? (
            <div className="mt-6 rounded-3xl bg-white/5 p-6">
              <p className="text-lg font-semibold">{selectedFile.name}</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                PDFs podem ser abertos em nova aba ou baixados diretamente pelo link acima.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-3xl bg-white/5">
              <img className="h-[420px] w-full object-cover" src={selectedFile.url} alt={selectedFile.name} />
            </div>
          )}

          {selectedFile ? (
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-2xl bg-white/5 p-4">
                <dt className="text-slate-400">Tipo</dt>
                <dd className="mt-2 font-medium text-white">{selectedFile.type}</dd>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <dt className="text-slate-400">Tamanho</dt>
                <dd className="mt-2 font-medium text-white">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </dd>
              </div>
            </dl>
          ) : null}
        </section>
      </div>
    </main>
  );
}
