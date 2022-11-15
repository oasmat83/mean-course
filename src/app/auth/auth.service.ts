import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
// import { Globals } from '../globals';
import { AuthData } from './auth-data-model';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

const BACKEND_URL = environment.apiUrl + '/user/'
//injecting Service to Root (app.module.ts)
@Injectable({providedIn: 'root'})

export class AuthService {
  private isAuthenticated = false;
  private token: any;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  private userId: string | undefined | null;

  constructor(private http: HttpClient, private router: Router) {}

  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }

  getIsAuth () {
    return this.isAuthenticated;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post(BACKEND_URL + '/signup', authData)
    .subscribe(response => {
      this.router.navigate(["/"]);
    }, error => {
      this.authStatusListener.next(false);
    })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{token: string, expiresIn: number, userId: string, pagination: { perPage: number}}>(BACKEND_URL + '/login', authData)
    .subscribe(response => {
      this.token = response.token;
      if (response.token) {
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.authStatusListener.next(true);
        const perPage = response.pagination.perPage;
        const now = new Date();
        const expiration = new Date(now.getTime() + expiresInDuration * 1000);
        this.saveAuthData(this.token, expiration, this.userId, perPage);
        this.router.navigate(["/"]);
      }
    }, error => {
      this.authStatusListener.next(false);
    })
  }

  autoAuthUser() {
    const authInformation:any = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn:any = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  updatePage(page: number) {
    const data = {
      perPage: page
    };
    this.http.put<any>(BACKEND_URL + 'update/' + this.getUserId(), data)
    .subscribe(response => {
      console.log(response);
    }, error => {
      this.authStatusListener.next(false);
    });
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData (token: string, expirationDate: Date, userId: string, perPage: number) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem("perPage", perPage.toString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('perPage');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

}
