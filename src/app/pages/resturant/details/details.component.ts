import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { SwiperConfigInterface } from 'ngx-swiper-wrapper';
import { CartService } from 'src/app/shared/services/cart.service';
import { ResturantService } from 'src/app/shared/services/resturant.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  resturant = {} as any;
  categories = [];
  subCats = [];
  meals = [];
  imageBaseURL = environment.imageBaseUrl;
  resturant_id;
  subCatId;
  constructor(
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private resturantService: ResturantService,
    private cartService: CartService
  ) {
    this.route.params.subscribe((params) => {
      this.resturant_id = params['id'];
      this.getResturantById(params['id']);
      this.getItems();
    });
  }

  ngOnInit(): void {
    this.getCategory();
  }

  config: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 1,
    navigation: true,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
    // autoplay: true,
    keyboard: true,
    scrollbar: false,
    loop: true,
    speed: 700,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
  };

  filterConfig: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 1,
    navigation: false,
    // autoplay: true,
    keyboard: true,
    scrollbar: false,
    loop: false,
    speed: 700,
    observer: true,
    observeParents: true,
    observeSlideChildren: true,
    freeMode: true,
    spaceBetween: 20,
    centeredSlides: true,
    breakpoints: {
      576: {
        slidesPerView: 3,
      },
      768: {
        slidesPerView: 4,
      },
      320: {
        slidesPerView: 2,
      },
    },
  };

  getResturantById(id): void {
    this.spinner.show();
    this.resturantService.getResturantById(id).subscribe(
      (data) => {
        if (data['success']) {
          this.spinner.hide();
          this.resturant = data['data'];
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }

  getCategory(): void {
    this.spinner.show();
    this.resturantService.getCategory().subscribe(
      (data) => {
        if (data['success']) {
          this.spinner.hide();
          this.categories = data['data']['rows'];
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }

  onCatChanges(event): void {
    this.getSubCategory(event.target.value);
  }

  onSubCatChanges(event): void {
    this.subCatId = event.target.value;
    this.getItems();
  }

  getSubCategory(id): void {
    this.spinner.show();
    this.resturantService.getSubCategory(id).subscribe(
      (data) => {
        if (data['success']) {
          this.spinner.hide();
          this.subCats = data['data']['rows'];
        }
      },
      (err) => {
        this.spinner.hide();
        console.error(err);
      }
    );
  }

  getItems(): void {
    this.spinner.show();
    this.resturantService
      .getResturantItems(this.resturant_id, this.subCatId)
      .subscribe(
        (data) => {
          if (data['success']) {
            this.spinner.hide();
            this.meals = data['data']['rows'];
            this.meals.map((meal) => {
              meal['selectedQuantity'] = 1;
            });
          }
        },
        (err) => {
          this.spinner.hide();
          console.error(err);
        }
      );
  }

  changeQuantity(event, index): void {
    if (event == '+') {
      this.meals[index]['selectedQuantity'] =
        1 + parseInt(this.meals[index]['selectedQuantity']);
    } else {
      this.meals[index]['selectedQuantity'] =
        this.meals[index]['selectedQuantity'] == 1
          ? 1
          : parseInt(this.meals[index]['selectedQuantity']) - 1;
    }
  }

  addToCart(meal) {
    this.cartService.addToCart(meal);
  }
}
