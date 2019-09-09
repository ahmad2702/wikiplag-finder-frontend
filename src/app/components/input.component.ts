import { Component } from "@angular/core";
import { PlagPositionsService } from "../services/plag-positions.service";
import { AlertService } from "../services/alert.service";
import { Router } from "@angular/router";
import { LocalStorageManagerService } from "../services/local-storage-manager.service";
import { PlagResponse } from "../models/responses/plag-response";

/**
 * Transmits inputText to PlagPositionsService
 * Capable of reading from .txt files
 */
@Component({
  selector: "app-input",
  templateUrl: "./input.component.html"
})
export class InputComponent {
  private inputText = "";
  private wordCount;
  private plagName = "Meine Beschreibung";
  private wordString;

  private storedRequests: PlagResponse[];
  myAnimationClasses = {
    bounceInLeft: true,
    bounceOutRight: false
  };

  textarea = {
    textareaNormal: true,
    showTextarea: true,
    displayNone: false
  };

  viewHistory = {
    viewHistoryExpanded: false,
    minimizeHistory: true
  };

  historyHidden = {
    historyHidden: true
  };

  historyRotateViewHistoryIcon = {
    historyRotateViewHistoryIcon: false
  };
  minimumTextLength = 100;
  loading = false;
  WCController: any;

  constructor(
    private plagPositionsService: PlagPositionsService,
    private alertService: AlertService,
    private router: Router,
    private localStorageManager: LocalStorageManagerService
  ) {
    this.storedRequests = this.localStorageManager.getRecentlyStoredRequests();
  }

  /**
   * Called when send button was clicked
   * Emits event to toggle components
   */
  send() {
    if (
      this.inputText !== "" &&
      this.inputText !== undefined &&
      this.minimumTextLength <= this.inputText.length
    ) {
      // Check if the give input is already stored in cache
      if (
        !this.localStorageManager.requestAlreadyInLocalStorage(this.inputText)
      ) {
        this.loadResponseFromServer();
      } else {
        this.loadResponseFromLocalStorage();
      }
    } else if (this.inputText === "" || this.inputText === undefined) {
      this.alertEmptyTextArea();
    } else {
      this.alertNotEnoughtCharsInTextArea();
    }
  }

  /**
   * Alert an empty text area to alert service
   */
  alertEmptyTextArea() {
    this.alertService.showAlert(
      "Bitte Text eingeben",
      "Bitte geben Sie einen Text zum analysieren ein!",
      "warning"
    );
  }

  /**
   * Send alert to alert service in case not enought chars are entered from user
   */
  alertNotEnoughtCharsInTextArea() {
    this.alertService.showAlert(
      "Bitte mehr Text eingeben",
      "Bitte geben " +
        "Sie mindestes " +
        this.minimumTextLength +
        " Zeichen zum analysieren ein!",
      "warning"
    );
  }

  /**
   * Delete all in local storage saved plagiarisms
   */
  deleteLocalStorage() {
    this.storedRequests = null;
    this.localStorageManager.clean();
  }

  /**
   * Send a request for a certain input text to server and handle changing to output component
   */
  loadResponseFromServer() {
    // post these json file to server
    this.loading = true;
    this.plagPositionsService.checkForPlag(this.inputText).subscribe(result => {
      // Apply plagiarism name and actual date to response object
      (<PlagResponse>result).name = this.plagName;
      (<PlagResponse>result).created_at = Date.now();

      this.localStorageManager.saveResponseToLocalStorage(
        this.inputText.toString(),
        JSON.stringify(result)
      );
      // console.log('Request is sent to server / mock file is loading ...');
      // set the data to the result
      this.loading = false;
      // console.log('sent to output component');
      // Wait before switching to other component to make a smooth fadeout animation
      this.applyAnimationClasses();
      setTimeout(() => this.router.navigate(["/output"]), 500);
    });
  }
  toggleHistory() {
    this.textarea = {
      textareaNormal: !this.textarea.textareaNormal,
      showTextarea: !this.textarea.showTextarea,
      displayNone: !this.textarea.displayNone
    };

    this.viewHistory = {
      viewHistoryExpanded: !this.viewHistory.viewHistoryExpanded,
      minimizeHistory: !this.viewHistory.minimizeHistory
    };

    this.historyHidden = {
      historyHidden: !this.historyHidden.historyHidden
    };

    this.historyRotateViewHistoryIcon = {
      historyRotateViewHistoryIcon: !this.historyRotateViewHistoryIcon
        .historyRotateViewHistoryIcon
    };
  }
  /**
   * Load a already performed request from local storage with a given input text
   */
  loadResponseFromLocalStorage() {
    // console.log('Loading data from local storage');
    this.plagPositionsService.data = <PlagResponse>(
      JSON.parse(
        this.localStorageManager.getResponseFromLocalStorage(this.inputText)
      )
    );
    // console.log('sent to output component');
    // Wait before switching to other component to make a smooth fadeout animation
    this.applyAnimationClasses();
    setTimeout(() => this.router.navigate(["/output"]), 500);
  }

  /**
   * Load a plag which is already stored in local stored
   * @param {number} id the id of the plagiarism
   */
  loadStoredPlagDataWithId(id: number) {
    // console.log('Loading data from local storage');
    this.plagPositionsService.data = this.storedRequests[id];
    // console.log('sent to output component');
    // Wait before switching to other component to make a smooth fadeout animation
    this.applyAnimationClasses();
    setTimeout(() => this.router.navigate(["/output"]), 500);
  }

  /**
   * Apply animation classes for fading out the input component
   */
  applyAnimationClasses() {
    // Animation handling
    this.myAnimationClasses = {
      bounceInLeft: false,
      bounceOutRight: true
    };
  }

  /**
   * open a given txt file and read into textarea using FileReader
   * @param event
   */
  openFile(event: Event) {
    const input: HTMLInputElement = <HTMLInputElement>event.target;
    for (let index = 0; index < input.files.length; index++) {
      const reader = new FileReader();

      reader.onload = () => {
        this.inputText = reader.result;
      };

      reader.readAsBinaryString(input.files[index]);
    }
  }
  /**
   * called when input of textarea changes
   * counts words of input
   */
  countWords() {
    this.wordCount = this.inputText.split(/\s+/); // it splits the text on space/tab/enter
    this.wordCount = (this.wordCount ? this.wordCount.length : "") - 1;
    if (this.wordCount === 1) {
      this.wordString = "Wort";
    } else {
      this.wordString = "Wörter";
    }
  }
}
