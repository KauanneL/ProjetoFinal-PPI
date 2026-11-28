import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Categoria, Item, ItemService } from '../../services/item.service';

@Component({
  selector: 'app-lista-itens',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './lista-itens.html',
  styleUrl: './lista-itens.css',
})
export class ListaItens implements OnInit {
  private service = inject(ItemService);

  itens = signal<Item[]>([]);
  categorias = signal<Categoria[]>([]);
  carregando = signal(false);
  erro = signal('');

  busca = '';
  categoriaId: number | null = null;

  ngOnInit() {
    this.service.listarCategorias().subscribe({
      next: (c) => this.categorias.set(c),
    });
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.erro.set('');
    this.service.listar(this.busca.trim(), this.categoriaId ?? undefined).subscribe({
      next: (lista) => {
        this.itens.set(lista);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Não foi possível carregar os itens. Verifique se o servidor está ligado.');
        this.carregando.set(false);
      },
    });
  }

  urlFoto(foto: string) {
    return this.service.urlFoto(foto);
  }

  selecionarCategoria(id: number | null) {
    this.categoriaId = id;
    this.carregar();
  }

  limpar() {
    this.busca = '';
    this.categoriaId = null;
    this.carregar();
  }
}