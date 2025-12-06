import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from '../models/marketplace.models';
import { MarketplaceService } from '../services/marketplace.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  selectedCategory: Category | null = null;
  showSubcategories = false;

  constructor(
    private marketplaceService: MarketplaceService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categories = this.marketplaceService.getCategories();
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.showSubcategories = true;
  }

  navigateToProducts(categoryId: string) {
    this.router.navigate(['/marketplace/products', categoryId]);
    this.showSubcategories = false;
  }

  navigateToSubcategoryProducts(subcategoryId: string) {
    this.router.navigate(['/marketplace/products', subcategoryId]);
    this.showSubcategories = false;
  }

  closeSubcategories() {
    this.showSubcategories = false;
    this.selectedCategory = null;
  }

  goToFavorites() {
    this.router.navigate(['/marketplace/favorites']);
  }

  goToCart() {
    this.router.navigate(['/marketplace/cart']);
  }

  getDiscountPercent(oldPrice: number | undefined, price: number | undefined): number {
    if (!oldPrice || !price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }
}
