import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './components/input/input.component';
import { ButtonComponent } from './components/button/button.component';
import { LinkComponent } from './components/link/link.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const components = [InputComponent, ButtonComponent, LinkComponent];
const modules = [CommonModule, IonicModule, FormsModule, ReactiveFormsModule];

@NgModule({
  declarations: [components],
  imports: [modules],
  exports: [components, modules],
})
export class SharedModule {}
