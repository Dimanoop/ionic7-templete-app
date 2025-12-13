import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { MarketplaceService } from './marketplace.service';
import { Product } from '../models/marketplace.models';

@Injectable({ providedIn: 'root' })
export class ProductResolver implements Resolve<Product | undefined> {
  constructor(private marketplaceService: MarketplaceService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product | undefined> | Promise<Product | undefined> | Product | undefined {
    const id = route.paramMap.get('id') || undefined;
    if (!id) return undefined;
    return this.marketplaceService.getProductById(id);
  }
}
