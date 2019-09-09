import { Component, HostListener } from "@angular/core";
import { PlagPositionsService } from "../services/plag-positions.service";
import { WikipediaAPIService } from "../services/wikipedia-api.service";
import { AlertService } from "../services/alert.service";
import { PlagResponse } from "../models/responses/plag-response";
import { Plagarism } from "../models/plagarism";
import { TextShorteningService } from "../services/text-shortening.service";
import { SummarizedOutputTextPiece } from "../models/summarized-output-text-piece";
import { Router } from "@angular/router";
import { PdfGeneratorService } from "../services/pdf-generator.service";

/**
 * Displays json provided by PlagPositionsService
 */
@Component({
  selector: "app-output",
  templateUrl: "./output.component.html"
})
export class OutputComponent {
  /**
   * object read from json
   */
  plagResponse: PlagResponse;

  /**
   * input text with tags
   */
  tagged_input_text: string;

  /**
   * Show output text in shortened version of not
   */
  shortened_text: boolean;

  /**
   * Text splitted into normal text and plag pieces to make a shorter output version available
   */
  textPieces: SummarizedOutputTextPiece[];

  /**
   * plagiarised articles and excerpts
   */
  plags: Plagarism[];

  /**
   * list of articles for currently selected plagiarised part
   */
  articleListOfSelectedPlag: any;

  /**
   * text of selected article
   */
  textOfSelectedArticle: any;

  /**
   * id of clicked plagiarised part
   */
  clickedPlagId: number;

  /**
   * id of clicked article
   */
  clickedArticleId: number;

  /**
   * previously selected plagiarised part. used to reset highlighting
   */
  prevSelPlag: any;

  /**
   * previously selected article. used to reset highlighting
   */
  prevSelArticle: any;

  /**
   * wikipedia-internal article id for clicked article
   */
  clickedArticleWikiId: number;

  /**
   * wikipedia url of clicked article
   */
  articleUrl: any;

  /**
   * Initialises objects and subscribes to service
   * @param plagPositionsService service for getting mocked json
   * @param wikipediaAPIService service for querying wikipedia api
   * @param alertService service to show messageboxes
   * @param textShorteningService for shortening a given output text
   * @param router
   * @param pdfGenerator
   */
  constructor(
    private plagPositionsService: PlagPositionsService,
    private wikipediaAPIService: WikipediaAPIService,
    private alertService: AlertService,
    private textShorteningService: TextShorteningService,
    private router: Router,
    private pdfGenerator: PdfGeneratorService
  ) {
    this.tagged_input_text = "Lädt ..."; // displayed while service is loading

    // assigns plagResponse from json to local variable
    this.plagResponse = this.plagPositionsService.getPlagData();
    // In case user reload site in output route
    if (!this.plagResponse) {
      this.navigateToIndexRoute();
    } else {
      this.preparePlagiarismResponse();
      this.alertNumberOfPlags(this.plagResponse.plags.length);
    }
  }

  /**
   * Navigate back to index route
   */
  navigateToIndexRoute() {
    window.location.href = "/";
  }

  /**
   * Extract import information from plagResponse object to several variables
   */
  preparePlagiarismResponse() {
    // assigns tagged_input_text from json to local variable
    this.tagged_input_text = this.plagResponse.tagged_input_text;

    this.shortened_text = true;
    if (this.shortened_text) {
      this.textPieces = this.textShorteningService.shorteningText(
        this.tagged_input_text,
        100
      );
    }
    // assigns plags from json to local variable
    this.plags = this.plagResponse.plags;
  }
  /**
   * Alert the number of detected plagiarisms via alert servie
   * @param {number} plagCount
   */
  alertNumberOfPlags(plagCount: number) {
    if (plagCount === 0) {
      this.alertService.showAlert(
        "Keine Ergebnisse",
        "Keine Plagiate im Text gefunden.",
        "success"
      );
    } else {
      this.alertService.showAlert(
        "Potentielle Plagiate",
        plagCount + " potentielle Plagiate gefunden.",
        "warning"
      );
    }
  }

  changeViewState(index: number) {
    this.textPieces[index].active = !this.textPieces[index].active;
  }

  /**
   * Redirect request to pdf generator service
   */
  pdfExport() {
    this.pdfGenerator.generatePDF(this.plagResponse);
  }

  /**
   * Listen for click events in output component
   * @param event
   */
  @HostListener("click", ["$event"])
  onClick(event: any) {
    if (event.target.classList.contains("input_plag")) {
      this.clickedOnPlagiarism(event);
    }
    /*else if (event.target.classList.contains('article_box')) {
      this.clickedOnArticle(event);
    } else if (event.target.classList.contains('wiki_plag')) {
      this.clickedOnWikipediaArticle(event);
    }*/
  }

  showPlagOnWikipedia(id: any) {
    this.articleUrl = "https://de.wikipedia.org/?curid=" + id;
    window.open(this.articleUrl);
  }

  /**
   * Click event fired on a wikipedia excerpt
   * @param event
   */
  clickedOnWikipediaArticle(event: any) {
    // Open corresponding Wikipedia article in pop-up
    window.open(this.articleUrl);
  }

  /**
   * Click event fired on a plagiarism
   * @param event
   */
  clickedOnPlagiarism(event: any) {
    // clicked on input_plag
    this.clickedPlagId = event.target.id;
    // console.info('Clicked on plag with id ' + this.clickedPlagId);

    this.highlightSelectedPlag(event);

    // array of wiki_excerpts is assigned
    this.articleListOfSelectedPlag = this.plags[
      this.clickedPlagId
    ].wiki_excerpts;

    // reset textOfSelectedArticle
    this.textOfSelectedArticle = null;
  }

  /**
   * Click event fired on a article box
   * @param event
   */
  clickedOnArticle(event: any) {
    // clicked on article
    this.clickedArticleId = event.target.id;
    // console.info('Clicked on article with id ' + this.clickedArticleId);

    this.highlightSelectedArticle(event);

    this.getArticleURLFromWikipediaAPI();

    // excerpt text is assigned
    this.textOfSelectedArticle = this.articleListOfSelectedPlag[
      this.clickedArticleId
    ].excerpt;
  }

  /**
   * disables highlighting of previous selected plagiarised part and highlights selected plagiarised part
   * @param event event of clicked element
   */
  highlightSelectedPlag(event: any) {
    // disables highlighting
    if (this.prevSelPlag) {
      this.prevSelPlag.style.boxShadow = "none";
      this.prevSelPlag.style.backgroundColor = "rgba(255, 192, 0, 0.36)";
    }

    // highlighting
    event.target.style.boxShadow = "0 0 4px 1px gray";
    event.target.style.background = "lightcoral";
    this.prevSelPlag = event.target;
  }

  /**
   * disables highlighting of previous selected article and highlights selected article
   * @param event event of clicked element
   */
  highlightSelectedArticle(event: any) {
    // disables highlighting
    if (this.prevSelArticle) {
      this.prevSelArticle.classList.add("alert-info");
      this.prevSelArticle.classList.remove("alert-danger");
    }

    // highlighting
    event.target.classList.add("alert-danger");
    event.target.classList.remove("alert-info");
    this.prevSelArticle = event.target;
  }

  /**
   * get article url from wikipedia api
   */
  getArticleURLFromWikipediaAPI() {
    this.clickedArticleWikiId = this.plags[this.clickedPlagId].wiki_excerpts[
      this.clickedArticleId
    ].id;
    this.articleUrl =
      "https://de.wikipedia.org/?curid=" +
      this.plags[this.clickedPlagId].wiki_excerpts[this.clickedArticleId].id;
  }

  /**
   * called when 'Neuer Text' button was clicked
   */
  newInput() {
    this.router.navigate(["/"]);
  }
}
