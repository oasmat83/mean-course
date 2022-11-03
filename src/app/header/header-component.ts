import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.scss']
})

export class HeaderComponent implements OnInit, OnDestroy {
  private authListenerSubs: any;
  userIsAuthenticated = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
      });
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }

  onLogout() {
    this.authService.logout();
  }
}
