import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { InputComponent } from './components/input.component';
import { OutputComponent } from './components/output.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AlertService } from './services/alert.service';
import { FormsModule } from '@angular/forms';
import { PlagPositionsService } from './services/plag-positions.service';
import { HttpClientModule } from '@angular/common/http';
import { WikipediaAPIService } from './services/wikipedia-api.service';
import { TextShorteningService } from './services/text-shortening.service';
import { AppRoutingModule } from './app-routing.module';
import { NavigationComponent } from './components/navigation.component';
import { ChangeToInputComponentGuardService } from './services/change-to-input-component-guard.service';
import { LocalStorageManagerService } from './services/local-storage-manager.service';
import { PdfGeneratorService } from './services/pdf-generator.service';

@NgModule({
  declarations: [
    AppComponent,
    InputComponent,
    OutputComponent,
    SafeHtmlPipe,
    NavigationComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AlertService,
    PlagPositionsService,
    WikipediaAPIService,
    TextShorteningService,
    ChangeToInputComponentGuardService,
    LocalStorageManagerService,
    PdfGeneratorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
