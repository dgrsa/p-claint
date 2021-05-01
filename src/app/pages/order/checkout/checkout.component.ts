import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { CartService } from 'src/app/shared/services/cart.service';
import { GeneralService } from 'src/app/shared/services/general.service';
import { HelperToolsService } from 'src/app/shared/services/helper-tools.service';
import { ResturantService } from 'src/app/shared/services/resturant.service';
import { ValidateFormService } from 'src/app/shared/services/validate-form.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  methods = [];
  public orderForm = new FormGroup({
    payment_id: new FormControl('', Validators.required),
    notes: new FormControl(''),
  });
  orderData = {} as any;
  imageBaseUrl = environment.imageBaseUrl;
  cartData = {} as any;
  mealsData = [];
  constructor(
    private spinner: NgxSpinnerService,
    private resturantService: ResturantService,
    private coockieService: CookieService,
    private validateForm: ValidateFormService,
    private authService: AuthService,
    private helperTool: HelperToolsService,
    private cartService: CartService,
    private router: Router
  ) {
    this.mealsData = this.cartService.CartData['mealsData'];
    this.cartData = this.cartService.CartData;
    this.orderData.tableNumber = parseInt(cartService.tableNumber);
    this.orderForm.patchValue(cartService.orderData);
  }

  ngOnInit(): void {
    this.getPaymentMethods();
  }

  getPaymentMethods(): void {
    this.spinner.show();
    this.resturantService
      .getResturantById(this.mealsData[0].resturant_id)
      .subscribe(
        (data) => {
          if (data['success']) {
            this.methods = data['data']['payments'];
            this.spinner.hide();
          }
        },
        (err) => {
          console.error(err);
          this.spinner.hide();
        }
      );
  }

  createOrder(): void {
    this.spinner.show();
    const meals = this.cartData.meals.map((product) => ({
      productId: product.id,
      quantity: product.quantity,
    }));
    this.orderData['products'] = meals;
    this.orderData['payment_id'] = this.orderForm.value.payment_id;
    this.orderData['resturant_id'] = this.mealsData[0].resturant_id;
    this.authService
      .createOrder(this.orderData, this.coockieService.get('BuserId'))
      .subscribe(
        (data) => {
          this.spinner.hide();
          if (data['success']) {
            this.helperTool.showAlertWithTranslation(
              '',
              'This order hass been created',
              'success'
            );
            environment.userCart = {
              totalPrice: 0,
              totalQuantity: 0,
              totalItems: 0,
              meals: [],
              mealsData: [],
            };
            this.cartService.emitChange(0);
            localStorage.setItem(
              'BrodoneCart',
              JSON.stringify(environment.userCart)
            );
            this.router.navigate(['/order/tracking']);
          } else {
            this.helperTool.showAlertWithTranslation(
              '',
              'Somthing wrong happend',
              'error'
            );
          }
        },
        (err) => {
          this.spinner.hide();
          this.helperTool.showAlertWithTranslation(
            '',
            'Somthing wrong happend',
            'error'
          );
        }
      );
  }

  validateOrderForm(): void {
    if (this.orderForm.valid) {
      if (this.orderData.tableNumber) {
        this.createOrder();
      } else {
        this.helperTool
          .showConfirmAlert('', 'Pleas, Scan QR code first')
          .then((__) => {
            this.router.navigate(['/scan-code'], {
              queryParams: { checkout: 1 },
            });
            this.cartService.orderData = this.orderForm.value;
          })
          .catch((err) => {
            // UserCanceld
          });
      }
    } else {
      this.validateForm.validateAllFormFields(this.orderForm);
    }
  }
}
