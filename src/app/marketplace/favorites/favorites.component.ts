import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceService } from '../services/marketplace.service';
import { Product } from '../models/marketplace.models';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  Math = Math;
  favoriteProducts: Product[] = [];

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.marketplaceService.getFavorites().subscribe(favorites => {
      this.favoriteProducts = favorites;
    });
  }

  removeFromFavorites(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.removeFromFavorites(product.id);
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.addToCart(product, 1);
  }

  viewProductDetails(product: Product) {
    this.marketplaceService.addToRecentlyViewed(product);
    this.router.navigate(['/marketplace/product', product.id]);
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(price);
  }

  getStarArray(rating: number): string[] {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push('star');
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push('half');
      } else {
        stars.push('outline');
      }
    }
    return stars;
  }
}
