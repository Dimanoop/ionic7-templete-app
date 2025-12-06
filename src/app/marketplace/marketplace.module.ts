import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplaceComponent } from './marketplace.component';
import { ProductComponent } from "./product/product.component"
import { ProductDetailComponent } from './product/product-detail.component';
import { CategoriesComponent } from './categories/categories.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { CartComponent } from './cart/cart.component';
import { FavoritesComponent } from './favorites/favorites.component';

@NgModule({
  declarations: [
    MarketplaceComponent,
    ProductComponent,
    ProductDetailComponent,
    CategoriesComponent,
    ProductsListComponent,
    CartComponent,
    FavoritesComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    HttpClientModule,
    MarketplaceRoutingModule
  ]
})
export class MarketplaceModule { }