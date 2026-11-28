import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Categoria, ItemService } from '../../services/item.service';

@Component({
  selector: 'app-form-item',
  imports: [FormsModule, RouterLink],
  templateUrl: './form-item.html',
  styleUrl: './form-item.css',
})
export class FormItem implements OnInit {
  private service = inject(ItemService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  id: number | null = null;
  categorias = signal<Categoria[]>([]);
  salvando = signal(false);
  erro = signal('');
  fotoAtual: string | null = null;
  arquivo: File | null = null;

  form = {
    nome: '',
    descricao: '',
    categoria_id: null as number | null,
    local_encontrado: '',
    data_encontrado: '',
  };

  ngOnInit() {
    this.service.listarCategorias().subscribe((c) => this.categorias.set(c));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.service.buscarPorId(this.id).subscribe((item) => {
        this.form = {
          nome: item.nome,
          descricao: item.descricao,
          categoria_id: item.categoria_id,
          local_encontrado: item.local_encontrado,
          data_encontrado: item.data_encontrado.substring(0, 10),
        };
        this.fotoAtual = item.foto;
        this.cdr.markForCheck();
      });
    }
  }

  onArquivo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.arquivo = input.files?.[0] ?? null;
  }

  salvar() {
    const dados = new FormData();
    dados.append('nome', this.form.nome);
    dados.append('descricao', this.form.descricao);
    dados.append('categoria_id', String(this.form.categoria_id));
    dados.append('local_encontrado', this.form.local_encontrado);
    dados.append('data_encontrado', this.form.data_encontrado);
    if (this.arquivo) dados.append('foto', this.arquivo);

    this.salvando.set(true);
    this.erro.set('');

    const requisicao = this.id
      ? this.service.atualizar(this.id, dados)
      : this.service.criar(dados);

    requisicao.subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.erro.set('Não foi possível salvar o item. Tente novamente.');
        this.salvando.set(false);
      },
    });
  }
}