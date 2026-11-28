import { API_URL } from "./apiConfig";
const DEFAULT_TIMEOUT_MS = 4000;

export interface FetchTimeoutOptions extends RequestInit {
    timeoutMs?: number; 
}

export class TimeoutError extends Error {
    constructor(timeoutMs: number) {
        super(`Tempo limete de ${timeoutMs}ms foi ultrapassado ao conectar ao servico.`);
        this.name = `TimeoutError`;
    }
}

export async function fetchComTimeout(
    endpoint: string,
    options: FetchTimeoutOptions = {},
): Promise<Response> {
    const {timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, ...fetchOptions} = options

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    if (externalSignal) {
        if (externalSignal.aborted) {
        controller.abort();
        } else {
            externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
        }
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

    try {
        return await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        });
    } catch (error: any) {
        if (error?.name === 'AbortError') {
        throw new TimeoutError(timeoutMs);
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

export async function postMedicaoComTimeout<TResponse = unknown>(
  endpoint: string,
  body: unknown,
  token?: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<TResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetchComTimeout(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    timeoutMs,
  });

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Erro HTTP (${response.status}): ${erroTexto}`);
  }

  return (await response.json()) as TResponse;
}