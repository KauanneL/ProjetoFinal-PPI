import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Item, ItemService } from '../../services/item.service';

@Component({
  selector: 'app-detalhe-item',
  imports: [RouterLink, DatePipe],
  templateUrl: './detalhe-item.html',
  styleUrl: './detalhe-item.css',
})
export class DetalheItem implements OnInit {
  private service = inject(ItemService);
  private route = inject(ActivatedRoute);

  item = signal<Item | null>(null);
  carregando = signal(true);
  erro = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.buscarPorId(id).subscribe({
      next: (item) => {
        this.item.set(item);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(
          e.status === 404 ? 'Item não encontrado.' : 'Não foi possível carregar o item.'
        );
        this.carregando.set(false);
      },
    });
  }

  urlFoto(foto: string) {
    return this.service.urlFoto(foto);
  }
}