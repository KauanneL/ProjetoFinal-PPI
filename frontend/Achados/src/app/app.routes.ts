import { Routes } from '@angular/router';
import { DetalheItem } from "./pages/detalhe-item/detalhe-item";
import { FormItem } from "./pages/form-item/form-item";
import { ListaItens } from "./pages/lista-itens/lista-itens";
import { Login } from "./pages/login/login";
import { PainelApoio } from "./pages/painel-apoio/painel-apoio";

export const routes: Routes = [
  { path: '', component: ListaItens },
  { path: 'item/:id', component: DetalheItem },
  { path: 'login', component: Login },
  { path: 'apoio', component: PainelApoio },
  { path: 'apoio/novo', component: FormItem },
  { path: 'apoio/editar/:id', component: FormItem },
];