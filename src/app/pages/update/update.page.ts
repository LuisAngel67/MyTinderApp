import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Filepicker } from 'src/app/modules/core/providers/filepicker/filepicker';
import { Uploader } from 'src/app/modules/core/providers/Uploader/uploader';
import { Loader } from 'src/app/modules/core/providers/loader/loader';
import { Toast } from 'src/app/modules/core/providers/toast/toast';
import { Query } from 'src/app/modules/core/providers/query/query';
import { PASSIONS } from 'src/app/interfaces/passions';
import {
  Firestore,
  doc,
  docData,
  collection,
  collectionData,
  query,
  where,
  limit,
} from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-update',
  templateUrl: './update.page.html',
  styleUrls: ['./update.page.scss'],
  standalone: false,
})
export class UpdatePage implements OnInit {
  profileForm!: FormGroup;
  passions: string[] = [];
  initialPassions: string[] = PASSIONS.slice();
  selected: string[] = [];
  selectedPhotoUrl?: string | null;
  origProfile?: any;
  origPassions: string[] = [];
  editingPassions = false;
  passionsForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private readonly auth: Auth,
    private readonly firestore: Firestore,
    private readonly filepicker: Filepicker,
    private readonly uploader: Uploader,
    private readonly loader: Loader,
    private readonly toast: Toast,
    private readonly query: Query
  ) {}

  async ngOnInit() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      country: ['', Validators.required],
      showGenderProfile: [false],
    });

    const uid = this.auth.currentUid;
    if (!uid) return;

    await this.loader.show('Loading profile...');
    try {
      const ref = doc(this.firestore, `users`, uid);
      const p1 = firstValueFrom(docData(ref, { idField: 'uid' }));

      const imagesCol = collection(this.firestore, 'images');
      const q = query(imagesCol, where('uid', '==', uid), limit(1));
      const p2 = firstValueFrom(collectionData(q, { idField: 'id' }));

      const extraCol = collection(this.firestore, 'extraimages');
      const q2 = query(extraCol, where('uid', '==', uid));
      const p3 = firstValueFrom(collectionData(q2, { idField: 'id' }));

      const [d, rows, extra] = await Promise.all([p1, p2, p3]);

      if (d) {
        this.origProfile = d as any;
        const { name, lastName, country, passions } = d as any;
        this.profileForm.patchValue({
          name: name ?? '',
          lastName: lastName ?? '',
          country: country ?? '',
          showGenderProfile: (d as any).showGenderProfile ?? false,
        });
        if (Array.isArray(passions)) {
          this.passions = passions.slice();
          this.selected = passions.slice();
          this.origPassions = passions.slice();
        }
      }

      if (Array.isArray(rows) && rows.length > 0) {
        const r: any = rows[0];
        this.selectedPhotoUrl = r.url ?? null;
      }

      if (Array.isArray(extra) && extra.length > 0) {
        this.extraImages = extra.map((r: any) => ({ id: r.id, url: r.url }));
      }
    } catch (err) {
      console.error('UpdatePage init error', err);
      await this.toast.show('Could not load profile', 2500);
    } finally {
      await this.loader.hide();
    }
  }

  togglePassion(p: string) {
    const i = this.selected.indexOf(p);
    if (i >= 0) this.selected.splice(i, 1);
    else this.selected.push(p);
  }

  isSelected(p: string) {
    return this.selected.includes(p);
  }

  addPassion() {
    this.openPassionsEditor();
  }

  openPassionsEditor() {
    const group: any = {};
    for (const p of this.initialPassions) {
      group[p] = [this.selected.includes(p)];
    }
    this.passionsForm = this.fb.group(group);
    this.editingPassions = true;
  }

  cancelPassions() {
    this.editingPassions = false;
  }

  acceptPassions() {
    const values = this.passionsForm.value as Record<string, boolean>;
    const chosen = Object.keys(values).filter((k) => !!values[k]);
    this.passions = chosen.slice();
    this.selected = chosen.slice();
    this.editingPassions = false;
  }

  toggleEditorPassion(p: string) {
    if (!this.passionsForm) return;
    const current = this.passionsForm.get(p)?.value;
    this.passionsForm.patchValue({ [p]: !current });
  }

  isEditorSelected(p: string) {
    if (!this.passionsForm) return false;
    const c = this.passionsForm.get(p);
    return !!(c && c.value);
  }

  addMedia() {
    (async () => {
      try {
        await this.loader.show('Uploading image...');
        const ok = await this.filepicker.requestPermission();
        if (!ok) {
          await this.loader.hide();
          return;
        }

        const file = await this.filepicker.pickImage();
        if (!file) {
          await this.loader.hide();
          return;
        }

        const uid = this.auth.currentUid;
        const key = `images/extra_${uid}_${Date.now()}_${file.name}`;
        const publicUrl = await this.uploader.uploadToSupabase(file, key);
        if (!uid) {
          await this.loader.hide();
          await this.toast.show('No user signed in', 3000);
          return;
        }

        const docId = `${uid}_${Date.now()}`;
        await this.query.set('extraimages', docId, { uid, url: publicUrl });

        this.extraImages = this.extraImages || [];
        this.extraImages.unshift({ id: docId, url: publicUrl });

        await this.toast.show('Image added', 2000);
        await this.loader.hide();
      } catch (err) {
        await this.loader.hide();
        console.error('addMedia error', err);
        await this.toast.show('Image upload failed', 3000);
      }
    })();
  }

  extraImages: { id: string; url: string }[] = [];
  pendingProfilePhoto?: string | null;

  async onChangeProfilePhoto() {
    try {
      await this.loader.show('Uploading image...');
      const ok = await this.filepicker.requestPermission();
      if (!ok) {
        await this.loader.hide();
        return;
      }

      const file = await this.filepicker.pickImage();
      if (!file) {
        await this.loader.hide();
        return;
      }

      const uid = this.auth.currentUid ?? 'anon';
      const key = `images/profile_${uid}_${Date.now()}_${file.name}`;
      const publicUrl = await this.uploader.uploadToSupabase(file, key);

      this.pendingProfilePhoto = publicUrl;
      this.selectedPhotoUrl = publicUrl;

      await this.toast.show('Image ready to save', 2000);
      await this.loader.hide();
    } catch (err) {
      await this.loader.hide();
      console.error('onChangeProfilePhoto error', err);
      await this.toast.show('Image upload failed', 3000);
    }
  }

  async saveChanges() {
    const uid = this.auth.currentUid;
    if (!uid) {
      await this.toast.show('No user signed in', 3000);
      return;
    }

    if (!this.hasChanges()) {
      await this.toast.show('No changes to save', 1500);
      return;
    }

    try {
      await this.loader.show('Saving changes...');
      if (this.pendingProfilePhoto) {
        await this.query.set('images', uid, {
          uid,
          url: this.pendingProfilePhoto,
        });
        this.pendingProfilePhoto = null;
      }

      const profilePayload: any = { ...(this.origProfile ?? {}) };
      profilePayload.name =
        this.profileForm.get('name')?.value ?? profilePayload.name;
      profilePayload.lastName =
        this.profileForm.get('lastName')?.value ?? profilePayload.lastName;
      profilePayload.country =
        this.profileForm.get('country')?.value ?? profilePayload.country;
      profilePayload.showGenderProfile =
        this.profileForm.get('showGenderProfile')?.value ??
        profilePayload.showGenderProfile;
      profilePayload.passions = this.selected.slice();
      await this.query.set('users', uid, profilePayload);

      this.origProfile = profilePayload;
      this.origPassions = this.selected.slice();
      try {
        this.profileForm.markAsPristine();
      } catch (_) {}

      await this.toast.show('Profile updated', 2000);
      await this.loader.hide();
    } catch (err) {
      await this.loader.hide();
      console.error('saveChanges error', err);
      await this.toast.show('Save failed', 3000);
    }
  }

  hasChanges(): boolean {
    const name = this.profileForm.get('name')?.value ?? '';
    const lastName = this.profileForm.get('lastName')?.value ?? '';
    const country = this.profileForm.get('country')?.value ?? '';
    const passions = this.selected || [];
    const currentShowGender =
      this.profileForm.get('showGenderProfile')?.value ?? false;

    const origName = this.origProfile?.name ?? '';
    const origLast = this.origProfile?.lastName ?? '';
    const origCountry = this.origProfile?.country ?? '';

    if (this.pendingProfilePhoto) return true;
    if (name !== origName) return true;
    if (lastName !== origLast) return true;
    if (country !== origCountry) return true;

    const origShow = this.origProfile?.showGenderProfile ?? false;
    if (currentShowGender !== origShow) return true;

    const origSet = new Set(this.origPassions || []);
    const currSet = new Set(passions || []);
    if (origSet.size !== currSet.size) return true;
    for (const p of currSet) {
      if (!origSet.has(p)) return true;
    }
    return false;
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
