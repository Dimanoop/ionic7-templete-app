import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import { ProductComponent } from "./product/product.component"
import { CategoriesComponent } from './categories/categories.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductDetailComponent } from './product/product-detail.component';
import { ProductResolver } from './services/product-resolver.service';
import { CartComponent } from './cart/cart.component';
import { FavoritesComponent } from './favorites/favorites.component';

const routes: Routes = [
  {
    path: '',
    component: MarketplaceComponent
  },
  {
    path: 'categories',
    component: CategoriesComponent
  },
  {
    path: 'products/:id',
    component: ProductsListComponent
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    resolve: { product: ProductResolver }
  },
  {
    path: 'product',
    component: ProductComponent
  },
  {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'favorites',
    component: FavoritesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceRoutingModule {}