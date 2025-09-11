import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, NgZone, AfterViewInit, OnChanges, SimpleChanges, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import * as am5 from '@amcharts/amcharts5';
import * as am5flow from '@amcharts/amcharts5/flow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { TranslatePipe } from 'app/shared/pipes/translate.pipe';
import { ActionsButtonsComponent } from 'app/shared/components/actions-buttons/actions-buttons.component';

interface Widget {
  _id?: string;
  chartType?: string;
  data?: any[]; // expects array of { from, to, value }
  title?: string;
  background?: string;
}

@Component({
  selector: 'app-directed-chord-widget',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ActionsButtonsComponent, TranslatePipe],
  templateUrl: './directed-chord-widget.component.html',
  styleUrls: ['./directed-chord-widget.component.scss']
})
export class DirectedChordWidgetComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, DoCheck {
  @Input() widget: Widget | any = null;
  @Input() data: any[] | null = null;

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private root: any;
  private chart: any;
  private _fallbackId = `directed-chord-fallback-${Math.floor(Math.random() * 1000000)}`;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {}

  // Track background changes when widget object identity doesn't change
  private _lastBackground?: string | null = null;

  ngDoCheck(): void {
    const bg = this.widget?.background || null;
    if (this._lastBackground !== bg) {
      this._lastBackground = bg;
      // Recreate chart to pick up any visual changes that depend on container styling
      if (this.root) {
        this.disposeChart();
      }
      if (this.data && this.data.length > 0 && this.widget && this.widget._id) {
        this.zone.runOutsideAngular(() => setTimeout(() => this.createChart(), 0));
      }
    }
  }

  ngAfterViewInit(): void {
    // Try initial creation (if data present)
    if (this.data && this.data.length > 0 && this.widget && this.widget._id) {
      this.zone.runOutsideAngular(() => setTimeout(() => this.createChart(), 0));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const dataChanged = !!(changes['data'] && this.data && this.data.length > 0);
    const widgetChanged = !!changes['widget'];

    // If chart exists and either data or widget changed, dispose and recreate to reflect new config (eg background)
    if (this.root && (dataChanged || widgetChanged)) {
      this.disposeChart();
    }

    if (this.data && this.data.length > 0 && this.widget && this.widget._id) {
      this.zone.runOutsideAngular(() => setTimeout(() => this.createChart(), 0));
    } else if (!this.data || this.data.length === 0) {
      this.disposeChart();
    }
  }

  get totalData(): number {
    if (!this.data || this.data.length === 0) return 0;
    const first = this.data[0];
    // If backend already provides totalData use it
    if (first && first.totalData !== undefined) return first.totalData;

    // Count per-link (edge) occurrences. Count only edges with positive value.
    return this.data.reduce((count: number, item: any) => count + ((item && (item.value ?? 0) > 0) ? 1 : 0), 0);
  }

  ngOnDestroy(): void {
    if (this.root) {
      this.root.dispose();
    }
  }

  private createChart(): void {
    if (!this.widget || !this.widget._id) return;

    const divId = `directed-chord-div-${this.widget._id}`;
    const chartDiv = document.getElementById(divId);
    if (!chartDiv) return;

    // dispose existing root defensively
    if (this.root) {
      try { this.root.dispose(); } catch (e) { /* ignore */ }
      this.root = null;
      this.chart = null;
    }

    this.root = am5.Root.new(divId);
    // Remove amCharts watermark if present
    const anyRoot: any = this.root as any;
    if (anyRoot && anyRoot._logo && typeof anyRoot._logo.dispose === 'function') {
      try { anyRoot._logo.dispose(); } catch (e) {}
    }

    this.root.setThemes([am5themes_Animated.new(this.root)]);

    // adjust visual size based on widget dimensions
    const col = Number(this.widget.columnSize || 1);
    const row = Number(this.widget.rowSize || 1);
    const isOneByOne = col === 1 && row === 1;

    this.chart = this.root.container.children.push(
      am5flow.ChordDirected.new(this.root, {
        startAngle: 80,
        padAngle: 1,
        linkHeadRadius: undefined,
        sourceIdField: 'from',
        targetIdField: 'to',
        valueField: 'value'
      })
    );

    // Add inner padding so outer radial labels are not clipped
    this.chart.setAll({
      paddingTop: 60,
      paddingRight: 20,
      paddingBottom: 40,
      paddingLeft: 40
    });

    // Basic styling
    this.chart.nodes.labels.template.setAll({
      textType: 'radial',
      centerX: 0,
      fontSize: isOneByOne ? 7.5 : 9.5
    });
    this.chart.links.template.set('fillStyle', 'source');

    // Set data (expects objects with from,to,value)
    this.chart.data.setAll(this.data || []);

    this.chart.appear(800, 100);
  }

  private disposeChart(): void {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        try { this.root.dispose(); } catch (e) { console.error('dispose error', e); }
        this.root = null;
        this.chart = null;
      }
    });
  }
}


