import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'app-scope-dialog',
  imports: [ MatDialogModule,
    MatIconModule,
    MatButtonModule,
    CommonModule],
  templateUrl: './scope-dialog.component.html',
  styleUrl: './scope-dialog.component.scss'
})
export class ScopeDialogComponent {

  constructor(private dialogRef: MatDialogRef<ScopeDialogComponent>) {
  }

  onCancel() {
   this.dialogRef.close();
  }
 
}
