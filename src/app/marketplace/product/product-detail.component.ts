import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Product, Review } from '../models/marketplace.models';
import { MarketplaceService } from '../services/marketplace.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  @Input() product: Product | null = null;
  @ViewChild('imageGallery') imageGallery!: ElementRef;

  quantity: number = 1;
  selectedColor: string = '';
  selectedSize: string = '';
  isFavorite: boolean = false;
  currentImageIndex: number = 0;

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private marketplaceService: MarketplaceService,
    private modalController?: ModalController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      if (productId && !this.product) {
        this.loadProduct(productId);
      } else if (this.product) {
        this.initializeProductDetails();
      }
    });
  }

  loadProduct(productId: string | number) {
    this.marketplaceService.getProductById(productId).subscribe(product => {
      if (product) {
        this.product = product;
        this.marketplaceService.addToRecentlyViewed(product);
        this.initializeProductDetails();
        this.checkFavorite();
      }
    });
  }

  initializeProductDetails() {
    if (!this.product) return;
    this.selectedColor = this.product.colors?.[0] || '';
    // Only auto-select size for categories that actually use size options (clothes, shoes, kids)
    if (this.showSizeOptions()) {
      this.selectedSize = this.product.sizes?.[0] || '';
    } else {
      this.selectedSize = '';
    }
    this.checkFavorite();
  }

  checkFavorite() {
    if (this.product) {
      this.isFavorite = this.marketplaceService.isFavorite(this.product.id);
    }
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.product) {
      // For categories like electronics we don't pass size as a clothing size
      const payload: any = { color: this.selectedColor };
      if (this.showSizeOptions() && this.selectedSize) {
        payload.size = this.selectedSize;
      }

      this.marketplaceService.addToCart(this.product, this.quantity, payload);
      console.log('Added to cart:', {
        product: this.product,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
      });
    }
  }

  // Return true if sizes are meaningful for this product (clothing, shoes, etc.)
  showSizeOptions(): boolean {
    if (!this.product) return false;
    const categoriesWithSizes = ['clothes', 'shoes', 'kids'];
    return !!(this.product.sizes && this.product.sizes.length > 0 && categoriesWithSizes.includes(this.product.categoryId));
  }

  // For certain categories (electronics) return top specs to highlight
  topSpecs(): { name: string; value: string }[] {
    if (!this.product || !this.product.specifications) return [];
    if (this.product.categoryId === 'electronics') {
      const keys = ['Процессор', 'ОЗУ', 'ОЗУ (RAM)', 'Оперативная память', 'Память', 'ПЗУ', 'Накопитель', 'Дисплей', 'Хранение', 'Объём памяти'];
      return this.product.specifications.filter(s => keys.includes(s.name)).slice(0, 3);
    }
    // For other categories we could prioritize other spec names (e.g., Материал for clothes)
    if (this.product.categoryId === 'clothes') {
      const keys = ['Материал', 'Размер', 'Плотность'];
      return this.product.specifications.filter(s => keys.includes(s.name)).slice(0, 3);
    }
    return [];
  }

  getSpecValue(name: string): string | undefined {
    return this.product?.specifications?.find(s => s.name === name)?.value;
  }

  buyNow() {
    if (this.product) {
      console.log('Buying now:', {
        product: this.product,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
      });
    }
  }

  closeModal() {
    this.modalController?.dismiss();
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  goToCart() {
    this.router.navigate(['/marketplace/cart']);
  }

  formatPrice(p: number | undefined, currency = '₽'): string {
    if (p == null) return '';
    return `${p.toLocaleString('ru-RU')} ${currency}`;
  }

  getAverageRating(): number {
    if (!this.product?.reviewsList || this.product.reviewsList.length === 0) return 0;
    const sum = this.product.reviewsList.reduce((acc: number, review: Review) => acc + review.rating, 0);
    return Math.round((sum / this.product.reviewsList.length) * 10) / 10;
  }

  getStarArray(rating: number): (string | 'half')[] {
    const stars: (string | 'half')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('star');
      } else if (rating > i - 1) {
        stars.push('half');
      } else {
        stars.push('outline');
      }
    }
    return stars;
  }

  getRatingDistribution(): { rating: number; count: number; percentage: number }[] {
    if (!this.product?.reviewsList || this.product.reviewsList.length === 0) {
      return [];
    }

    const totalReviews = this.product.reviewsList.length;
    const distribution = [
      { rating: 5, count: 0 },
      { rating: 4, count: 0 },
      { rating: 3, count: 0 },
      { rating: 2, count: 0 },
      { rating: 1, count: 0 }
    ];

    this.product.reviewsList.forEach(review => {
      const item = distribution.find(d => d.rating === Math.floor(review.rating));
      if (item) item.count++;
    });

    return distribution.map(item => ({
      ...item,
      percentage: Math.round((item.count / totalReviews) * 100)
    }));
  }

  toggleFavorite() {
    if (!this.product) return;
    if (this.isFavorite) {
      this.marketplaceService.removeFromFavorites(this.product.id);
    } else {
      this.marketplaceService.addToFavorites(this.product);
    }
    this.isFavorite = !this.isFavorite;
  }

  nextImage() {
    if (!this.product?.images) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
  }

  previousImage() {
    if (!this.product?.images) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
  }

  selectImage(index: number) {
    this.currentImageIndex = index;
  }
}
