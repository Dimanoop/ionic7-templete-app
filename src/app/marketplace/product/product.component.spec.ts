import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProductComponent } from './product.component';

describe('ProductComponent', () => {
  let component: ProductComponent;
  let fixture: ComponentFixture<ProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit addToCart when Add button clicked', () => {
    component.product = { id: 1, title: 'Test', price: 1000 } as any;
    spyOn(component.addToCart, 'emit');
    const btn = fixture.nativeElement.querySelector('ion-button[color="primary"]');
    btn.click();
    expect(component.addToCart.emit).toHaveBeenCalled();
  });
});
