import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../api.config';

export interface Item {
  id: number;
  nome: string;
  descricao: string;
  categoria_id: number;
  categoria_nome?: string;
  local_encontrado: string;
  data_encontrado: string;
  foto: string | null;
  situacao: 'disponivel' | 'devolvido';
}

export interface Categoria {
  id: number;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class ItemService {
  private http = inject(HttpClient);
  private api = `${API_URL}/api/itens`;

  listar(busca = '', categoriaId?: number) {
    let params = new HttpParams();
    if (busca) params = params.set('busca', busca);
    if (categoriaId) params = params.set('categoria', categoriaId);
    return this.http.get<Item[]>(this.api, { params });
  }

  buscarPorId(id: number) {
    return this.http.get<Item>(`${this.api}/${id}`);
  }

  criar(dados: FormData) {
    return this.http.post(this.api, dados);
  }

  atualizar(id: number, dados: FormData) {
    return this.http.put(`${this.api}/${id}`, dados);
  }

  atualizarSituacao(id: number, situacao: 'disponivel' | 'devolvido') {
    return this.http.patch(`${this.api}/${id}/situacao`, { situacao });
  }

  registrarDevolucao(id: number, nome_retirante: string, data_devolucao: string) {
    return this.http.post(`${this.api}/${id}/devolucao`, { nome_retirante, data_devolucao });
  }

  excluir(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  listarCategorias() {
    return this.http.get<Categoria[]>(`${API_URL}/api/categorias`);
  }

  urlFoto(foto: string) {
    return `${API_URL}/uploads/${foto}`;
  }
}