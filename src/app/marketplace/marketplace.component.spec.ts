import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarketplaceComponent } from './marketplace.component';
import { ProductComponent } from './product/product.component';

describe('MarketplaceComponent', () => {
  let component: MarketplaceComponent;
  let fixture: ComponentFixture<MarketplaceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MarketplaceComponent, ProductComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render product cards for mock products', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const productEls = compiled.querySelectorAll('app-product');
    expect(productEls.length).toBe(component.products.length);
  });
});
