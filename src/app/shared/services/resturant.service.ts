import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ResturantService {
  constructor(private http: HttpClient) {}

  getResturant(skip, special, name = undefined) {
    const params = { skip: skip } as any;
    if (special != undefined) {
      params['special'] = special;
    }
    if (name != undefined) {
      params['name'] = name;
    }
    const URL = `${environment.BASE_URL}/resturant`;
    return this.http.get(URL, { params: params });
  }

  getResturantById(id) {
    const URL = `${environment.BASE_URL}/resturant/${id}`;
    return this.http.get(URL);
  }

  getTableById(id, table_id) {
    const URL = `${environment.BASE_URL}/resturant/${id}/table/${table_id}`;
    return this.http.get(URL);
  }

  getCategory(resturant_id) {
    const URL = `${environment.BASE_URL}/category`;
    return this.http.get(URL, { params: { resturant_id: resturant_id } });
  }

  getSubCategory(id) {
    const URL = `${environment.BASE_URL}/subcategory`;
    return this.http.get(URL, { params: { parent_id: id } });
  }

  getResturantItems(resturant_id = undefined, subcategory_id = undefined) {
    const params = {} as any;
    if (subcategory_id != undefined && subcategory_id != '') {
      params['subcategory_id'] = subcategory_id;
    }
    if (resturant_id != undefined && resturant_id != '') {
      params['resturant_id'] = resturant_id;
    }
    const URL = `${environment.BASE_URL}/item`;
    return this.http.get(URL, {
      params: params,
    });
  }

  getItemById(id) {
    const URL = `${environment.BASE_URL}/item/${id}`;
    return this.http.get(URL);
  }
}
