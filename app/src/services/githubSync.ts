// services/githubSync.ts

import type { FinancialState } from '../types';

const GIST_FILENAME = 'flume-data.json';
const GIST_DESCRIPTION = 'flume - Dados de Gestão Financeira';

interface GistFile {
  content: string;
}

interface Gist {
  id: string;
  files: {
    [filename: string]: GistFile;
  };
}

export class GitHubSyncService {
  private token: string | null = null;
  private gistId: string | null = null;

  constructor() {
    // Carregar token e gistId do localStorage
    this.token = localStorage.getItem('github_token');
    this.gistId = localStorage.getItem('github_gist_id');
  }

  /**
   * Configura o token de acesso do GitHub
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('github_token', token);
  }

  /**
   * Remove o token (logout)
   */
  clearToken() {
    this.token = null;
    this.gistId = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_gist_id');
  }

  /**
   * Verifica se está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Busca ou cria o Gist com os dados
   */
  private async getOrCreateGist(): Promise<string> {
    if (!this.token) {
      throw new Error('Token do GitHub não configurado');
    }

    // Se já temos o ID do Gist, retornar
    if (this.gistId) {
      // Verificar se o Gist ainda existe
      try {
        const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
          headers: {
            Authorization: `token ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });

        if (response.ok) {
          return this.gistId;
        }
        // Se não existe mais, limpar e criar novo
        this.gistId = null;
        localStorage.removeItem('github_gist_id');
      } catch (error) {
        console.error('Erro ao verificar Gist:', error);
      }
    }

    // Buscar Gists existentes com nosso arquivo
    const gists = await this.listGists();
    const existingGist = gists.find((gist) => gist.files[GIST_FILENAME]);

    if (existingGist) {
      this.gistId = existingGist.id;
      localStorage.setItem('github_gist_id', this.gistId);
      return this.gistId;
    }

    // Criar novo Gist
    const newGist = await this.createGist();
    this.gistId = newGist.id;
    localStorage.setItem('github_gist_id', this.gistId);
    return this.gistId;
  }

  /**
   * Lista todos os Gists do usuário
   */
  private async listGists(): Promise<Gist[]> {
    if (!this.token) {
      throw new Error('Token do GitHub não configurado');
    }

    const response = await fetch('https://api.github.com/gists', {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao listar Gists: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Cria um novo Gist
   */
  private async createGist(): Promise<Gist> {
    if (!this.token) {
      throw new Error('Token do GitHub não configurado');
    }

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: '{}',
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar Gist: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Carrega os dados do Gist
   */
  async load(): Promise<FinancialState | null> {
    if (!this.token) {
      return null;
    }

    try {
      const gistId = await this.getOrCreateGist();

      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar Gist: ${response.statusText}`);
      }

      const gist: Gist = await response.json();
      const fileContent = gist.files[GIST_FILENAME]?.content;

      if (!fileContent || fileContent === '{}') {
        return null;
      }

      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Erro ao carregar dados do GitHub:', error);
      throw error;
    }
  }

  /**
   * Salva os dados no Gist
   */
  async save(data: Partial<FinancialState>): Promise<void> {
    if (!this.token) {
      throw new Error('Token do GitHub não configurado');
    }

    try {
      const gistId = await this.getOrCreateGist();

      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(data, null, 2),
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao salvar Gist: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao salvar dados no GitHub:', error);
      throw error;
    }
  }

  /**
   * Testa se o token é válido
   */
  async testToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const githubSync = new GitHubSyncService();
