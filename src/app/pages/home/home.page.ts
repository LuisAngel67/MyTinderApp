import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Toast } from 'src/app/modules/core/providers/toast/toast';
import {
  Firestore,
  collection,
  collectionData,
  query,
  limit,
  doc,
  docData,
  where,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';
import { MatchingService } from 'src/app/modules/core/services/matching/matching';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  bannerImageUrl?: string | null;
  suggestedProfile: any = null;
  isLoading = false;

  constructor(
    private router: Router,
    private readonly auth: Auth,
    private readonly toast: Toast,
    private readonly firestore: Firestore,
    private matching: MatchingService
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    const uid = this.auth.currentUid;
    if (!uid) return;

    this.isLoading = true;

    try {
      const meRef = doc(this.firestore, 'users', uid);
      const me = (await firstValueFrom(docData(meRef as any))) as any;
      const myGender = String((me && me.gender) || '').toLowerCase();
      const desired = myGender === 'male' ? 'female' : 'male';
      const usersCol = collection(this.firestore, 'users');
      const q = query(usersCol, where('gender', '==', desired), limit(10));
      const rows = (await firstValueFrom(
        collectionData(q as any) as any
      )) as any[];

      let picked: any = null;
      if (Array.isArray(rows) && rows.length > 0) {
        for (const r of rows) {
          const candidateUid =
            (r as any).uid ?? (r as any).id ?? (r as any).uid;
          if (!candidateUid) {
            picked = r;
            break;
          }
          if (String(candidateUid) !== String(uid)) {
            picked = r;
            break;
          }
        }
      }

      if (picked) {
        this.suggestedProfile = picked;

        const bd = picked.birthDate || picked.birthdate || picked.birth;
        if (bd) {
          try {
            const d = new Date(bd);
            if (!isNaN(d.getTime())) {
              const age = Math.abs(
                new Date(Date.now() - d.getTime()).getUTCFullYear() - 1970
              );
              this.suggestedProfile.age = age;
            }
          } catch (_) {}
        }

        const imagesCol = collection(this.firestore, 'images');
        const q2 = query(
          imagesCol,
          where('uid', '==', picked.uid || picked.id || picked.uid),
          limit(1)
        );
        const imgs = (await firstValueFrom(
          collectionData(q2 as any) as any
        )) as any[];
        if (Array.isArray(imgs) && imgs.length > 0) {
          this.bannerImageUrl = imgs[0].url ?? null;
        } else {
          this.bannerImageUrl = picked.photoUrl ?? picked.url ?? null;
        }
      } else {
        this.bannerImageUrl = null;
      }
    } catch (err) {
      console.warn('Could not load suggested profile', err);
      this.bannerImageUrl = null;
      this.suggestedProfile = null;
    } finally {
      setTimeout(() => (this.isLoading = false), 250);
    }
  }

  onMessages() {
    this.router.navigate(['/messages']);
  }

  onDiscover() {
    this.toast.show('Discover clicked', 1000);
  }

  goToUpdate() {
    this.router.navigate(['/update']);
  }

  async logout() {
    try {
      await this.auth.logout();
      await this.toast.show('Logged out', 1500, 'success');
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Logout failed', err);
      await this.toast.show('Could not log out', 2500, 'error');
    }
  }

  async openMatching() {
    try {
      const res = await this.matching.openMatching('mi_usuario_1');
      console.log('Resultado:', res);
    } catch (e) {
      console.error(e);
    }
  }
}
