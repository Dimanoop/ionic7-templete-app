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
    this.selectedSize = this.product.sizes?.[0] || '';
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
      this.marketplaceService.addToCart(this.product, this.quantity, {
        color: this.selectedColor,
        size: this.selectedSize
      });
      console.log('Added to cart:', {
        product: this.product,
        quantity: this.quantity,
        color: this.selectedColor,
        size: this.selectedSize,
      });
    }
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
