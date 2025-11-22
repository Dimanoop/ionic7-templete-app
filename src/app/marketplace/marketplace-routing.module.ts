import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarketplaceComponent } from './marketplace.component';
import {ProductComponent} from "./product/product.component"

const routes: Routes = [
  {
    path: '',
    component: MarketplaceComponent
  },
  {
    path:"product",
    component: ProductComponent
  }
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarketplaceRoutingModule {}