import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showNav$: Observable<boolean>;
  theme: 'light' | 'dark' = 'light';
  isThemeAnimating = false;

  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {
    const isAuth = (url: string) => !url.startsWith('/login') && url !== '/';
    this.showNav$ = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => isAuth(e.urlAfterRedirects)),
      startWith(isAuth(this.router.url))
    );
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const saved = localStorage.getItem('processflow-theme') as 'light' | 'dark' | null;
    this.theme = saved ?? 'light';
    this.applyTheme(this.theme, false);
  }

  toggleTheme() {
    if (this.isThemeAnimating || !isPlatformBrowser(this.platformId)) return;
    this.isThemeAnimating = true;

    const curtain = document.getElementById('app-curtain');
    if (curtain) {
      curtain.classList.remove('active');
      void curtain.offsetWidth; // fuerza reflow para que la animación se reinicie
      curtain.classList.add('active');
    }

    setTimeout(() => {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(this.theme);
    }, 300);
    setTimeout(() => {
      this.isThemeAnimating = false;
      curtain?.classList.remove('active');
    }, 650);
  }

  private applyTheme(theme: 'light' | 'dark', save = true) {
    if (!isPlatformBrowser(this.platformId)) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (save) localStorage.setItem('processflow-theme', theme);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
