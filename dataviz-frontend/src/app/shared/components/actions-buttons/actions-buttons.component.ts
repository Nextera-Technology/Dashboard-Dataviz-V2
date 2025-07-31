import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ScopeDialogComponent } from '../action-dialogs/scope-dialog/scope-dialog.component';
import { InformationDialogComponent } from '../action-dialogs/information-dialog/information-dialog.component';
import { ShareDataService } from 'app/shared/services/share-data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actions-buttons',
  imports: [CommonModule],
  templateUrl: './actions-buttons.component.html',
  styleUrl: './actions-buttons.component.scss'
})
export class ActionsButtonsComponent implements OnInit {

  @Input() isDashboard: boolean;
  @Input() widget: any;
  description : string = "This is a sample description for the widget. It provides an overview of the data and insights available in this widget.";

  

  scopedata = [
    { name: 'Insertion rapide dans l’emploi', detail: 'majorité en emploi dès l’ES2 (105 à l’ES2, stable à 95 pour les ES3/ES4).' },
    { name: 'Service Tax', detail: 'Forte baisse de la recherche d’emploi : de 140 à l’ES1 à seulement 4 à l’ES4.' },
    { name: 'VAT', detail: 'Poursuite d’études très faible : entre 4 et 5 étudiants concernés par vague.' },
    { name: 'Federal Tax', detail: 'Inactivité marginale : très peu de cas (maximum 5 à l’ES2).' },
    { name: 'Import Duty', detail: 'Stabilité des réponses : légère hausse des non-réponses, mais données globalement fiables.' }
  ];
  constructor(private dialog: MatDialog, private shareDataService: ShareDataService) { 

  }

  ngOnInit(): void {
    this.isDashboard = this.shareDataService.getIsDashboard();
  }
  paragraphClicked(dialogType: string) {
   const dialogRef = this.dialog.open(InformationDialogComponent, {
      width: '70%',
      data: { widget: this.widget },
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'centered-dialog'
    });
      
  }
 
  scopeClicked(info: string): void {
    const dialogRef = this.dialog.open(ScopeDialogComponent, {
      width: '70%',
      data: { widget: this.widget },
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'centered-dialog'
    });

    dialogRef.afterClosed().subscribe(() => {
      // Dialog is closed, you can perform additional actions here if needed
    });
  }

   excelClicked(info:string): void {
    console.log("Excel action clicked");
  }

  getActionIcon(iconName: string): string {
    const iconMap: { [key: string]: string } = {
      "paragraph.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/paragraph.png",
      "excel.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/excel.png",
      "audience_4644048.png":
        "https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/audience_4644048.png",
    };
    return (
      iconMap[iconName] ||
      `https://staging-sg-map-bucket.s3.ap-southeast-1.amazonaws.com/public/${iconName}`
    );
  }

}
