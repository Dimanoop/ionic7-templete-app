import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { MarketplaceComponent } from './marketplace.component';
import {ProductComponent} from "./product/product.component"

@NgModule({
  declarations: [
    MarketplaceComponent,
    ProductComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    MarketplaceRoutingModule
  ]
})
export class MarketplaceModule { }