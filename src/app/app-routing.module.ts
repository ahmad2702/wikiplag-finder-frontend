import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InputComponent } from './components/input.component';
import { OutputComponent } from './components/output.component';
import { ChangeToInputComponentGuardService } from './services/change-to-input-component-guard.service';

const routes: Routes = [
  { path: '', component: InputComponent, canActivate: [ChangeToInputComponentGuardService]},
  { path: 'output', component: OutputComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
