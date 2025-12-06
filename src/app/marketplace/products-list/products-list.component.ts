import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, PopoverController, ModalController } from '@ionic/angular';
import { Product, FilterOptions } from '../models/marketplace.models';
import { MarketplaceService } from '../services/marketplace.service';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  Math = Math; // Для использования в шаблоне
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categoryId: string = '';
  categoryName: string = '';
  isLoading = false;
  showFilters = false;

  // Filter options
  sortBy: string = 'popularity';
  priceRange = { from: 0, to: 100000 };
  selectedBrands: string[] = [];
  minRating = 0;
  inStockOnly = false;

  // Pagination
  page = 1;
  pageSize = 20;

  // Available filter options
  brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Xiaomi', 'Huawei', 'OnePlus', 'Motorola'];
  sortOptions = [
    { value: 'popularity', label: 'По популярности' },
    { value: 'rating', label: 'По отзывам' },
    { value: 'priceLow', label: 'По возрастанию цены' },
    { value: 'priceHigh', label: 'По убыванию цены' },
    { value: 'new', label: 'По новизне' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public marketplaceService: MarketplaceService,
    private popoverController: PopoverController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = params['id'];
      this.loadProducts();
    });
  }

  loadProducts() {
    this.isLoading = true;

    this.marketplaceService.getProductsByCategory(this.categoryId).subscribe(products => {
      this.products = products;
      this.applyFilters();
      this.isLoading = false;
    });
  }

  applyFilters() {
    let result = [...this.products];

    if (this.priceRange.from > 0) {
      result = result.filter(p => p.price >= this.priceRange.from);
    }

    if (this.priceRange.to < 100000) {
      result = result.filter(p => p.price <= this.priceRange.to);
    }

    if (this.selectedBrands.length > 0) {
      result = result.filter(p => p.brand && this.selectedBrands.includes(p.brand));
    }

    if (this.minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= this.minRating);
    }

    if (this.inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    result = this.sortProducts(result);
    this.filteredProducts = result;
  }

  private sortProducts(products: Product[]): Product[] {
    const sorted = [...products];

    switch (this.sortBy) {
      case 'popularity':
        return sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      case 'rating':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'priceLow':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceHigh':
        return sorted.sort((a, b) => b.price - a.price);
      case 'new':
        return sorted.reverse();
      default:
        return sorted;
    }
  }

  onSortChange(event: any) {
    this.sortBy = event.detail.value;
    this.applyFilters();
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  resetFilters() {
    this.priceRange = { from: 0, to: 100000 };
    this.selectedBrands = [];
    this.minRating = 0;
    this.inStockOnly = false;
    this.sortBy = 'popularity';
    this.applyFilters();
  }

  viewProductDetails(product: Product) {
    this.marketplaceService.addToRecentlyViewed(product);
    this.router.navigate(['/marketplace/product', product.id]);
  }

  addToFavorites(product: Product, event: Event) {
    event.stopPropagation();
    this.marketplaceService.addToFavorites(product);
  }

  isFavorite(productId: string): boolean {
    return this.marketplaceService.isFavorite(productId);
  }

  addToCart(product: Product, quantity: number) {
    this.marketplaceService.addToCart(product, quantity);
  }

  scrollToTop() {
    this.content?.scrollToTop(300);
  }

  onLoadMore(event: any) {
    // Simulate loading more items
    setTimeout(() => {
      this.page++;
      event.target.complete();
    }, 500);
  }
}
