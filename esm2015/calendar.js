import { __decorate, __param } from "tslib";
import { Component, EventEmitter, Input, Output, Inject, LOCALE_ID } from '@angular/core';
import { CalendarService } from './calendar.service';
export var Step;
(function (Step) {
    Step[Step["QuarterHour"] = 15] = "QuarterHour";
    Step[Step["HalfHour"] = 30] = "HalfHour";
    Step[Step["Hour"] = 60] = "Hour";
})(Step || (Step = {}));
let CalendarComponent = class CalendarComponent {
    constructor(calendarService, appLocale) {
        this.calendarService = calendarService;
        this.appLocale = appLocale;
        this.eventSource = [];
        this.calendarMode = 'month';
        this.formatDay = 'd';
        this.formatDayHeader = 'EEE';
        this.formatDayTitle = 'MMMM dd, yyyy';
        this.formatWeekTitle = 'MMMM yyyy, \'Week\' w';
        this.formatMonthTitle = 'MMMM yyyy';
        this.formatWeekViewDayHeader = 'EEE d';
        this.formatHourColumn = 'ha';
        this.showEventDetail = true;
        this.startingDayMonth = 0;
        this.startingDayWeek = 0;
        this.allDayLabel = 'all day';
        this.noEventsLabel = 'No Events';
        this.queryMode = 'local';
        this.step = Step.Hour;
        this.timeInterval = 60;
        this.autoSelect = true;
        this.dir = "";
        this.scrollToHour = 0;
        this.preserveScrollPosition = false;
        this.lockSwipeToPrev = false;
        this.lockSwipes = false;
        this.locale = "";
        this.startHour = 0;
        this.endHour = 24;
        this.onCurrentDateChanged = new EventEmitter();
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onDayHeaderSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter();
        this.hourParts = 1;
        this.hourSegments = 1;
        this.locale = appLocale;
    }
    get currentDate() {
        return this._currentDate;
    }
    set currentDate(val) {
        if (!val) {
            val = new Date();
        }
        this._currentDate = val;
        this.calendarService.setCurrentDate(val, true);
        this.onCurrentDateChanged.emit(this._currentDate);
    }
    ngOnInit() {
        if (this.autoSelect) {
            if (this.autoSelect.toString() === 'false') {
                this.autoSelect = false;
            }
            else {
                this.autoSelect = true;
            }
        }
        this.hourSegments = 60 / this.timeInterval;
        this.hourParts = 60 / this.step;
        if (this.hourParts <= this.hourSegments) {
            this.hourParts = 1;
        }
        else {
            this.hourParts = this.hourParts / this.hourSegments;
        }
        this.startHour = parseInt(this.startHour.toString());
        this.endHour = parseInt(this.endHour.toString());
        this.calendarService.queryMode = this.queryMode;
        this.currentDateChangedFromChildrenSubscription = this.calendarService.currentDateChangedFromChildren$.subscribe(currentDate => {
            this._currentDate = currentDate;
            this.onCurrentDateChanged.emit(currentDate);
        });
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromChildrenSubscription) {
            this.currentDateChangedFromChildrenSubscription.unsubscribe();
            this.currentDateChangedFromChildrenSubscription = null;
        }
    }
    rangeChanged(range) {
        this.onRangeChanged.emit(range);
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
    timeSelected(timeSelected) {
        this.onTimeSelected.emit(timeSelected);
    }
    daySelected(daySelected) {
        this.onDayHeaderSelected.emit(daySelected);
    }
    titleChanged(title) {
        this.onTitleChanged.emit(title);
    }
    loadEvents() {
        this.calendarService.loadEvents();
    }
    slideNext() {
        this.calendarService.slide(1);
    }
    slidePrev() {
        this.calendarService.slide(-1);
    }
    update() {
        this.calendarService.update();
    }
};
CalendarComponent.ctorParameters = () => [
    { type: CalendarService },
    { type: String, decorators: [{ type: Inject, args: [LOCALE_ID,] }] }
];
__decorate([
    Input()
], CalendarComponent.prototype, "currentDate", null);
__decorate([
    Input()
], CalendarComponent.prototype, "eventSource", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "calendarMode", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatDay", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatDayHeader", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatDayTitle", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatWeekTitle", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatMonthTitle", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatWeekViewDayHeader", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "formatHourColumn", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "showEventDetail", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "startingDayMonth", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "startingDayWeek", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "allDayLabel", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "noEventsLabel", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "queryMode", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "step", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "timeInterval", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "autoSelect", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "markDisabled", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "monthviewDisplayEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "monthviewInactiveDisplayEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "monthviewEventDetailTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewHeaderTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewAllDayEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewNormalEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewAllDayEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewNormalEventTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewInactiveAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "weekviewInactiveNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewInactiveAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dayviewInactiveNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dateFormatter", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "dir", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "scrollToHour", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "preserveScrollPosition", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "lockSwipeToPrev", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "lockSwipes", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "locale", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "startHour", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "endHour", void 0);
__decorate([
    Input()
], CalendarComponent.prototype, "sliderOptions", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onCurrentDateChanged", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onRangeChanged", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onEventSelected", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onTimeSelected", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onDayHeaderSelected", void 0);
__decorate([
    Output()
], CalendarComponent.prototype, "onTitleChanged", void 0);
CalendarComponent = __decorate([
    Component({
        selector: 'calendar',
        template: `
        <ng-template #monthviewDefaultDisplayEventTemplate let-view="view" let-row="row" let-col="col">
            {{view.dates[row*7+col].label}}
        </ng-template>
        <ng-template #monthviewDefaultEventDetailTemplate let-showEventDetail="showEventDetail" let-selectedDate="selectedDate" let-noEventsLabel="noEventsLabel">
            <ion-list class="event-detail-container" has-bouncing="false" *ngIf="showEventDetail" overflow-scroll="false">
                <ion-item *ngFor="let event of selectedDate?.events" (click)="eventSelected(event)">
                        <span *ngIf="!event.allDay" class="monthview-eventdetail-timecolumn">{{event.startTime|date: 'HH:mm'}}
                            -
                            {{event.endTime|date: 'HH:mm'}}
                        </span>
                    <span *ngIf="event.allDay" class="monthview-eventdetail-timecolumn">{{allDayLabel}}</span>
                    <span class="event-detail">  |  {{event.title}}</span>
                </ion-item>
                <ion-item *ngIf="selectedDate?.events.length==0">
                    <div class="no-events-label">{{noEventsLabel}}</div>
                </ion-item>
            </ion-list>
        </ng-template>
        <ng-template #defaultWeekviewHeaderTemplate let-viewDate="viewDate">
            {{ viewDate.dayHeader }}
        </ng-template>
        <ng-template #defaultAllDayEventTemplate let-displayEvent="displayEvent">
            <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
        </ng-template>
        <ng-template #defaultNormalEventTemplate let-displayEvent="displayEvent">
            <div class="calendar-event-inner">{{displayEvent.event.title}}</div>
        </ng-template>
        <ng-template #defaultWeekViewAllDayEventSectionTemplate let-day="day" let-eventTemplate="eventTemplate">
            <div [ngClass]="{'calendar-event-wrap': day.events}" *ngIf="day.events"
                 [ngStyle]="{height: 25*day.events.length+'px'}">
                <div *ngFor="let displayEvent of day.events" class="calendar-event" tappable
                     (click)="eventSelected(displayEvent.event)"
                     [ngStyle]="{top: 25*displayEvent.position+'px', width: 100*(displayEvent.endIndex-displayEvent.startIndex)+'%', height: '25px'}">
                    <ng-template [ngTemplateOutlet]="eventTemplate"
                                 [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                    </ng-template>
                </div>
            </div>
        </ng-template>
        <ng-template #defaultDayViewAllDayEventSectionTemplate let-allDayEvents="allDayEvents" let-eventTemplate="eventTemplate">
            <div *ngFor="let displayEvent of allDayEvents; let eventIndex=index"
                 class="calendar-event" tappable
                 (click)="eventSelected(displayEvent.event)"
                 [ngStyle]="{top: 25*eventIndex+'px',width: '100%',height:'25px'}">
                <ng-template [ngTemplateOutlet]="eventTemplate"
                             [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                </ng-template>
            </div>
        </ng-template>
        <ng-template #defaultNormalEventSectionTemplate let-tm="tm" let-hourParts="hourParts" let-eventTemplate="eventTemplate">
            <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                <div *ngFor="let displayEvent of tm.events" class="calendar-event" tappable
                     (click)="eventSelected(displayEvent.event)"
                     [ngStyle]="{top: (37*displayEvent.startOffset/hourParts)+'px',left: 100/displayEvent.overlapNumber*displayEvent.position+'%', width: 100/displayEvent.overlapNumber+'%', height: 37*(displayEvent.endIndex -displayEvent.startIndex - (displayEvent.endOffset + displayEvent.startOffset)/hourParts)+'px'}">
                    <ng-template [ngTemplateOutlet]="eventTemplate"
                                 [ngTemplateOutletContext]="{displayEvent:displayEvent}">
                    </ng-template>
                </div>
            </div>
        </ng-template>
        <ng-template #defaultInactiveAllDayEventSectionTemplate>
        </ng-template>
        <ng-template #defaultInactiveNormalEventSectionTemplate>
        </ng-template>

        <div [ngSwitch]="calendarMode" class="{{calendarMode}}view-container">
            <monthview *ngSwitchCase="'month'"
                [formatDay]="formatDay"
                [formatDayHeader]="formatDayHeader"
                [formatMonthTitle]="formatMonthTitle"
                [startingDayMonth]="startingDayMonth"
                [showEventDetail]="showEventDetail"
                [noEventsLabel]="noEventsLabel"
                [autoSelect]="autoSelect"
                [eventSource]="eventSource"
                [markDisabled]="markDisabled"
                [monthviewDisplayEventTemplate]="monthviewDisplayEventTemplate||monthviewDefaultDisplayEventTemplate"
                [monthviewInactiveDisplayEventTemplate]="monthviewInactiveDisplayEventTemplate||monthviewDefaultDisplayEventTemplate"
                [monthviewEventDetailTemplate]="monthviewEventDetailTemplate||monthviewDefaultEventDetailTemplate"
                [locale]="locale"
                [dateFormatter]="dateFormatter"
                [dir]="dir"
                [lockSwipeToPrev]="lockSwipeToPrev"
                [lockSwipes]="lockSwipes"
                [sliderOptions]="sliderOptions"
                (onRangeChanged)="rangeChanged($event)"
                (onEventSelected)="eventSelected($event)"
                (onTimeSelected)="timeSelected($event)"
                (onTitleChanged)="titleChanged($event)">
            </monthview>
            <weekview *ngSwitchCase="'week'"
                [formatWeekTitle]="formatWeekTitle"
                [formatWeekViewDayHeader]="formatWeekViewDayHeader"
                [formatHourColumn]="formatHourColumn"
                [startingDayWeek]="startingDayWeek"
                [allDayLabel]="allDayLabel"
                [hourParts]="hourParts"
                [autoSelect]="autoSelect"
                [hourSegments]="hourSegments"
                [eventSource]="eventSource"
                [markDisabled]="markDisabled"
                [weekviewHeaderTemplate]="weekviewHeaderTemplate||defaultWeekviewHeaderTemplate"
                [weekviewAllDayEventTemplate]="weekviewAllDayEventTemplate||defaultAllDayEventTemplate"
                [weekviewNormalEventTemplate]="weekviewNormalEventTemplate||defaultNormalEventTemplate"
                [weekviewAllDayEventSectionTemplate]="weekviewAllDayEventSectionTemplate||defaultWeekViewAllDayEventSectionTemplate"
                [weekviewNormalEventSectionTemplate]="weekviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate"
                [weekviewInactiveAllDayEventSectionTemplate]="weekviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate"
                [weekviewInactiveNormalEventSectionTemplate]="weekviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate"
                [locale]="locale"
                [dateFormatter]="dateFormatter"
                [dir]="dir"
                [scrollToHour]="scrollToHour"
                [preserveScrollPosition]="preserveScrollPosition"
                [lockSwipeToPrev]="lockSwipeToPrev"
                [lockSwipes]="lockSwipes"
                [startHour]="startHour"
                [endHour]="endHour"
                [sliderOptions]="sliderOptions"
                (onRangeChanged)="rangeChanged($event)"
                (onEventSelected)="eventSelected($event)"
                (onDayHeaderSelected)="daySelected($event)"
                (onTimeSelected)="timeSelected($event)"
                (onTitleChanged)="titleChanged($event)">
            </weekview>
            <dayview *ngSwitchCase="'day'"
                [formatDayTitle]="formatDayTitle"
                [formatHourColumn]="formatHourColumn"
                [allDayLabel]="allDayLabel"
                [hourParts]="hourParts"
                [hourSegments]="hourSegments"
                [eventSource]="eventSource"
                [markDisabled]="markDisabled"
                [dayviewAllDayEventTemplate]="dayviewAllDayEventTemplate||defaultAllDayEventTemplate"
                [dayviewNormalEventTemplate]="dayviewNormalEventTemplate||defaultNormalEventTemplate"
                [dayviewAllDayEventSectionTemplate]="dayviewAllDayEventSectionTemplate||defaultDayViewAllDayEventSectionTemplate"
                [dayviewNormalEventSectionTemplate]="dayviewNormalEventSectionTemplate||defaultNormalEventSectionTemplate"
                [dayviewInactiveAllDayEventSectionTemplate]="dayviewInactiveAllDayEventSectionTemplate||defaultInactiveAllDayEventSectionTemplate"
                [dayviewInactiveNormalEventSectionTemplate]="dayviewInactiveNormalEventSectionTemplate||defaultInactiveNormalEventSectionTemplate"
                [locale]="locale"
                [dateFormatter]="dateFormatter"
                [dir]="dir"
                [scrollToHour]="scrollToHour"
                [preserveScrollPosition]="preserveScrollPosition"
                [lockSwipeToPrev]="lockSwipeToPrev"
                [lockSwipes]="lockSwipes"
                [startHour]="startHour"
                [endHour]="endHour"
                [sliderOptions]="sliderOptions"
                (onRangeChanged)="rangeChanged($event)"
                (onEventSelected)="eventSelected($event)"
                (onTimeSelected)="timeSelected($event)"
                (onTitleChanged)="titleChanged($event)">
            </dayview>
        </div>
    `,
        providers: [CalendarService],
        styles: [`
        :host > div { height: 100%; }

        .event-detail-container {
          border-top: 2px darkgrey solid;
        }

        .no-events-label {
          font-weight: bold;
          color: darkgrey;
          text-align: center;
        }

        .event-detail {
          cursor: pointer;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .monthview-eventdetail-timecolumn {
          width: 110px;
          overflow: hidden;
        }

        .calendar-event-inner {
          overflow: hidden;
          background-color: #3a87ad;
          color: white;
          height: 100%;
          width: 100%;
          padding: 2px;
          line-height: 15px;
          text-align: initial;
        }

        @media (max-width: 750px) {
          .calendar-event-inner {
            font-size: 12px;
          }
        }
    `]
    }),
    __param(1, Inject(LOCALE_ID))
], CalendarComponent);
export { CalendarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYzItY2FsZW5kYXIvIiwic291cmNlcyI6WyJjYWxlbmRhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFVLE1BQU0sRUFBZSxNQUFNLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRy9HLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQWlKckQsTUFBTSxDQUFOLElBQVksSUFJWDtBQUpELFdBQVksSUFBSTtJQUNaLDhDQUFnQixDQUFBO0lBQ2hCLHdDQUFhLENBQUE7SUFDYixnQ0FBUyxDQUFBO0FBQ2IsQ0FBQyxFQUpXLElBQUksS0FBSixJQUFJLFFBSWY7QUEyTUQsSUFBYSxpQkFBaUIsR0FBOUIsTUFBYSxpQkFBaUI7SUEwRTFCLFlBQW9CLGVBQStCLEVBQTZCLFNBQWdCO1FBQTVFLG9CQUFlLEdBQWYsZUFBZSxDQUFnQjtRQUE2QixjQUFTLEdBQVQsU0FBUyxDQUFPO1FBMUR2RixnQkFBVyxHQUFZLEVBQUUsQ0FBQztRQUMxQixpQkFBWSxHQUFnQixPQUFPLENBQUM7UUFDcEMsY0FBUyxHQUFVLEdBQUcsQ0FBQztRQUN2QixvQkFBZSxHQUFVLEtBQUssQ0FBQztRQUMvQixtQkFBYyxHQUFVLGVBQWUsQ0FBQztRQUN4QyxvQkFBZSxHQUFVLHVCQUF1QixDQUFDO1FBQ2pELHFCQUFnQixHQUFVLFdBQVcsQ0FBQztRQUN0Qyw0QkFBdUIsR0FBVSxPQUFPLENBQUM7UUFDekMscUJBQWdCLEdBQVUsSUFBSSxDQUFDO1FBQy9CLG9CQUFlLEdBQVcsSUFBSSxDQUFDO1FBQy9CLHFCQUFnQixHQUFVLENBQUMsQ0FBQztRQUM1QixvQkFBZSxHQUFVLENBQUMsQ0FBQztRQUMzQixnQkFBVyxHQUFVLFNBQVMsQ0FBQztRQUMvQixrQkFBYSxHQUFVLFdBQVcsQ0FBQztRQUNuQyxjQUFTLEdBQWEsT0FBTyxDQUFDO1FBQzlCLFNBQUksR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLGlCQUFZLEdBQVUsRUFBRSxDQUFDO1FBQ3pCLGVBQVUsR0FBVyxJQUFJLENBQUM7UUFtQjFCLFFBQUcsR0FBVSxFQUFFLENBQUM7UUFDaEIsaUJBQVksR0FBVSxDQUFDLENBQUM7UUFDeEIsMkJBQXNCLEdBQVcsS0FBSyxDQUFDO1FBQ3ZDLG9CQUFlLEdBQVcsS0FBSyxDQUFDO1FBQ2hDLGVBQVUsR0FBVyxLQUFLLENBQUM7UUFDM0IsV0FBTSxHQUFVLEVBQUUsQ0FBQztRQUNuQixjQUFTLEdBQVUsQ0FBQyxDQUFDO1FBQ3JCLFlBQU8sR0FBVSxFQUFFLENBQUM7UUFHbkIseUJBQW9CLEdBQUcsSUFBSSxZQUFZLEVBQVEsQ0FBQztRQUNoRCxtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFDNUMsb0JBQWUsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBQzdDLG1CQUFjLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7UUFDbkQsd0JBQW1CLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7UUFDeEQsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBRy9DLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxpQkFBWSxHQUFHLENBQUMsQ0FBQztRQUlwQixJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztJQUM1QixDQUFDO0lBMUVELElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsR0FBUTtRQUNwQixJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sR0FBRyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7U0FDcEI7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztRQUN4QixJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQWdFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsS0FBSyxPQUFPLEVBQUU7Z0JBQ3hDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2FBQzNCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO2FBQzFCO1NBQ0o7UUFDRCxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQzNDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBRyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7U0FDdEI7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRWhELElBQUksQ0FBQywwQ0FBMEMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLCtCQUErQixDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMzSCxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztZQUNoQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLElBQUksQ0FBQywwQ0FBMEMsRUFBRTtZQUNqRCxJQUFJLENBQUMsMENBQTBDLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDOUQsSUFBSSxDQUFDLDBDQUEwQyxHQUFHLElBQUksQ0FBQztTQUMxRDtJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBWTtRQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsYUFBYSxDQUFDLEtBQVk7UUFDdEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELFlBQVksQ0FBQyxZQUEwQjtRQUNuQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRUQsV0FBVyxDQUFDLFdBQXlCO1FBQ2pDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFZO1FBQ3JCLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxVQUFVO1FBQ04sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QyxDQUFDO0lBRUQsU0FBUztRQUNMLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxTQUFTO1FBQ0wsSUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsTUFBTTtRQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDbEMsQ0FBQztDQUNKLENBQUE7O1lBdkV1QyxlQUFlO3lDQUFHLE1BQU0sU0FBQyxTQUFTOztBQXhFdEU7SUFEQyxLQUFLLEVBQUU7b0RBR1A7QUFZUTtJQUFSLEtBQUssRUFBRTtzREFBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7dURBQXFDO0FBQ3BDO0lBQVIsS0FBSyxFQUFFO29EQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTswREFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7eURBQXlDO0FBQ3hDO0lBQVIsS0FBSyxFQUFFOzBEQUFrRDtBQUNqRDtJQUFSLEtBQUssRUFBRTsyREFBdUM7QUFDdEM7SUFBUixLQUFLLEVBQUU7a0VBQTBDO0FBQ3pDO0lBQVIsS0FBSyxFQUFFOzJEQUFnQztBQUMvQjtJQUFSLEtBQUssRUFBRTswREFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7MkRBQTZCO0FBQzVCO0lBQVIsS0FBSyxFQUFFOzBEQUE0QjtBQUMzQjtJQUFSLEtBQUssRUFBRTtzREFBZ0M7QUFDL0I7SUFBUixLQUFLLEVBQUU7d0RBQW9DO0FBQ25DO0lBQVIsS0FBSyxFQUFFO29EQUErQjtBQUM5QjtJQUFSLEtBQUssRUFBRTsrQ0FBdUI7QUFDdEI7SUFBUixLQUFLLEVBQUU7dURBQTBCO0FBQ3pCO0lBQVIsS0FBSyxFQUFFO3FEQUEyQjtBQUMxQjtJQUFSLEtBQUssRUFBRTt1REFBcUM7QUFDcEM7SUFBUixLQUFLLEVBQUU7d0VBQWtGO0FBQ2pGO0lBQVIsS0FBSyxFQUFFO2dGQUEwRjtBQUN6RjtJQUFSLEtBQUssRUFBRTt1RUFBZ0Y7QUFDL0U7SUFBUixLQUFLLEVBQUU7aUVBQTREO0FBQzNEO0lBQVIsS0FBSyxFQUFFO3NFQUE4RDtBQUM3RDtJQUFSLEtBQUssRUFBRTtzRUFBd0Q7QUFDdkQ7SUFBUixLQUFLLEVBQUU7cUVBQTZEO0FBQzVEO0lBQVIsS0FBSyxFQUFFO3FFQUF1RDtBQUN0RDtJQUFSLEtBQUssRUFBRTs2RUFBNEY7QUFDM0Y7SUFBUixLQUFLLEVBQUU7NkVBQTRGO0FBQzNGO0lBQVIsS0FBSyxFQUFFOzRFQUEwRjtBQUN6RjtJQUFSLEtBQUssRUFBRTs0RUFBMEY7QUFDekY7SUFBUixLQUFLLEVBQUU7cUZBQW9HO0FBQ25HO0lBQVIsS0FBSyxFQUFFO3FGQUFvRztBQUNuRztJQUFSLEtBQUssRUFBRTtvRkFBa0c7QUFDakc7SUFBUixLQUFLLEVBQUU7b0ZBQWtHO0FBQ2pHO0lBQVIsS0FBSyxFQUFFO3dEQUE4QjtBQUM3QjtJQUFSLEtBQUssRUFBRTs4Q0FBaUI7QUFDaEI7SUFBUixLQUFLLEVBQUU7dURBQXlCO0FBQ3hCO0lBQVIsS0FBSyxFQUFFO2lFQUF3QztBQUN2QztJQUFSLEtBQUssRUFBRTswREFBaUM7QUFDaEM7SUFBUixLQUFLLEVBQUU7cURBQTRCO0FBQzNCO0lBQVIsS0FBSyxFQUFFO2lEQUFvQjtBQUNuQjtJQUFSLEtBQUssRUFBRTtvREFBc0I7QUFDckI7SUFBUixLQUFLLEVBQUU7a0RBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFO3dEQUFtQjtBQUVqQjtJQUFULE1BQU0sRUFBRTsrREFBaUQ7QUFDaEQ7SUFBVCxNQUFNLEVBQUU7eURBQTZDO0FBQzVDO0lBQVQsTUFBTSxFQUFFOzBEQUE4QztBQUM3QztJQUFULE1BQU0sRUFBRTt5REFBb0Q7QUFDbkQ7SUFBVCxNQUFNLEVBQUU7OERBQXlEO0FBQ3hEO0lBQVQsTUFBTSxFQUFFO3lEQUE2QztBQW5FN0MsaUJBQWlCO0lBek03QixTQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsVUFBVTtRQUNwQixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBMkpUO1FBMENELFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQztpQkF6Q25COzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBd0NSO0tBRUosQ0FBQztJQTJFd0QsV0FBQSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUE7R0ExRTlELGlCQUFpQixDQWlKN0I7U0FqSlksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkluaXQsIE91dHB1dCwgVGVtcGxhdGVSZWYsIEluamVjdCwgTE9DQUxFX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuaW1wb3J0IHsgQ2FsZW5kYXJTZXJ2aWNlIH0gZnJvbSAnLi9jYWxlbmRhci5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSUV2ZW50IHtcclxuICAgIGFsbERheTogYm9vbGVhbjtcclxuICAgIGVuZFRpbWU6IERhdGU7XHJcbiAgICBzdGFydFRpbWU6IERhdGU7XHJcbiAgICB0aXRsZTogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElSYW5nZSB7XHJcbiAgICBzdGFydFRpbWU6IERhdGU7XHJcbiAgICBlbmRUaW1lOiBEYXRlO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElWaWV3IHtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRGF5VmlldyBleHRlbmRzIElWaWV3IHtcclxuICAgIGFsbERheUV2ZW50czogSURpc3BsYXlBbGxEYXlFdmVudFtdO1xyXG4gICAgcm93czogSURheVZpZXdSb3dbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRGF5Vmlld1JvdyB7XHJcbiAgICBldmVudHM6IElEaXNwbGF5RXZlbnRbXTtcclxuICAgIHRpbWU6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSU1vbnRoVmlldyBleHRlbmRzIElWaWV3IHtcclxuICAgIGRhdGVzOiBJTW9udGhWaWV3Um93W107XHJcbiAgICBkYXlIZWFkZXJzOiBzdHJpbmdbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJTW9udGhWaWV3Um93IHtcclxuICAgIGN1cnJlbnQ/OiBib29sZWFuO1xyXG4gICAgZGF0ZTogRGF0ZTtcclxuICAgIGV2ZW50czogSUV2ZW50W107XHJcbiAgICBoYXNFdmVudD86IGJvb2xlYW47XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG4gICAgc2Vjb25kYXJ5OiBib29sZWFuO1xyXG4gICAgc2VsZWN0ZWQ/OiBib29sZWFuO1xyXG4gICAgZGlzYWJsZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdlZWtWaWV3IGV4dGVuZHMgSVZpZXcge1xyXG4gICAgZGF0ZXM6IElXZWVrVmlld0RhdGVSb3dbXTtcclxuICAgIHJvd3M6IElXZWVrVmlld1Jvd1tdW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdlZWtWaWV3RGF0ZVJvdyB7XHJcbiAgICBjdXJyZW50PzogYm9vbGVhbjtcclxuICAgIGRhdGU6IERhdGU7XHJcbiAgICBldmVudHM6IElEaXNwbGF5RXZlbnRbXTtcclxuICAgIGhhc0V2ZW50PzogYm9vbGVhbjtcclxuICAgIHNlbGVjdGVkPzogYm9vbGVhbjtcclxuICAgIGRheUhlYWRlcjogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElXZWVrVmlld1JvdyB7XHJcbiAgICBldmVudHM6IElEaXNwbGF5RXZlbnRbXTtcclxuICAgIHRpbWU6IERhdGU7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSURpc3BsYXlFdmVudCB7XHJcbiAgICBlbmRJbmRleDogbnVtYmVyO1xyXG4gICAgZW5kT2Zmc2V0PzogbnVtYmVyO1xyXG4gICAgZXZlbnQ6IElFdmVudDtcclxuICAgIHN0YXJ0SW5kZXg6IG51bWJlcjtcclxuICAgIHN0YXJ0T2Zmc2V0PzogbnVtYmVyO1xyXG4gICAgb3ZlcmxhcE51bWJlcj86IG51bWJlcjtcclxuICAgIHBvc2l0aW9uPzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEaXNwbGF5V2Vla1ZpZXdIZWFkZXIge1xyXG4gICAgdmlld0RhdGU6IElXZWVrVmlld0RhdGVSb3c7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSURpc3BsYXlBbGxEYXlFdmVudCB7XHJcbiAgICBldmVudDogSUV2ZW50O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElDYWxlbmRhckNvbXBvbmVudCB7XHJcbiAgICBjdXJyZW50Vmlld0luZGV4OiBudW1iZXI7XHJcbiAgICBkaXJlY3Rpb246IG51bWJlcjtcclxuICAgIGV2ZW50U291cmNlOiBJRXZlbnRbXTtcclxuICAgIGdldFJhbmdlOiB7IChkYXRlOkRhdGUpOiBJUmFuZ2U7IH07XHJcbiAgICBnZXRWaWV3RGF0YTogeyAoZGF0ZTpEYXRlKTogSVZpZXcgfTtcclxuICAgIG1vZGU6IENhbGVuZGFyTW9kZTtcclxuICAgIHJhbmdlOiBJUmFuZ2U7XHJcbiAgICB2aWV3czogSVZpZXdbXTtcclxuICAgIG9uRGF0YUxvYWRlZDogeyAoKTogdm9pZCB9O1xyXG4gICAgb25SYW5nZUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxJUmFuZ2U+O1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElUaW1lU2VsZWN0ZWQge1xyXG4gICAgZXZlbnRzOiBJRXZlbnRbXTtcclxuICAgIHNlbGVjdGVkVGltZTogRGF0ZTtcclxuICAgIGRpc2FibGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElNb250aFZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZUNvbnRleHQge1xyXG4gICAgdmlldzogSVZpZXc7XHJcbiAgICByb3c6IG51bWJlcjtcclxuICAgIGNvbDogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElNb250aFZpZXdFdmVudERldGFpbFRlbXBsYXRlQ29udGV4dCB7XHJcbiAgICBzZWxlY3RlZERhdGU6IElUaW1lU2VsZWN0ZWQ7XHJcbiAgICBub0V2ZW50c0xhYmVsOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdlZWtWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0IHtcclxuICAgIGRheTogSVdlZWtWaWV3RGF0ZVJvdyxcclxuICAgIGV2ZW50VGVtcGxhdGU6IFRlbXBsYXRlUmVmPElEaXNwbGF5QWxsRGF5RXZlbnQ+XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVdlZWtWaWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0IHtcclxuICAgIHRtOiBJV2Vla1ZpZXdSb3csXHJcbiAgICBldmVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJRGlzcGxheUV2ZW50PlxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEYXlWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0IHtcclxuICAgIGFsbGRheUV2ZW50czogSURpc3BsYXlBbGxEYXlFdmVudFtdLFxyXG4gICAgZXZlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SURpc3BsYXlBbGxEYXlFdmVudD5cclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJRGF5Vmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dCB7XHJcbiAgICB0bTogSURheVZpZXdSb3csXHJcbiAgICBldmVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJRGlzcGxheUV2ZW50PlxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElEYXRlRm9ybWF0dGVyIHtcclxuICAgIGZvcm1hdE1vbnRoVmlld0RheT86IHsgKGRhdGU6RGF0ZSk6IHN0cmluZzsgfTtcclxuICAgIGZvcm1hdE1vbnRoVmlld0RheUhlYWRlcj86IHsgKGRhdGU6RGF0ZSk6IHN0cmluZzsgfTtcclxuICAgIGZvcm1hdE1vbnRoVmlld1RpdGxlPzogeyAoZGF0ZTpEYXRlKTogc3RyaW5nOyB9O1xyXG4gICAgZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXI/OiB7IChkYXRlOkRhdGUpOiBzdHJpbmc7IH07XHJcbiAgICBmb3JtYXRXZWVrVmlld1RpdGxlPzogeyAoZGF0ZTpEYXRlKTogc3RyaW5nOyB9O1xyXG4gICAgZm9ybWF0V2Vla1ZpZXdIb3VyQ29sdW1uPzogeyAoZGF0ZTpEYXRlKTogc3RyaW5nOyB9O1xyXG4gICAgZm9ybWF0RGF5Vmlld1RpdGxlPzogeyAoZGF0ZTpEYXRlKTogc3RyaW5nOyB9O1xyXG4gICAgZm9ybWF0RGF5Vmlld0hvdXJDb2x1bW4/OiB7IChkYXRlOkRhdGUpOiBzdHJpbmc7IH07XHJcbn1cclxuXHJcbmV4cG9ydCB0eXBlIENhbGVuZGFyTW9kZSA9ICdkYXknIHwgJ21vbnRoJyB8ICd3ZWVrJztcclxuXHJcbmV4cG9ydCB0eXBlIFF1ZXJ5TW9kZSA9ICdsb2NhbCcgfCAncmVtb3RlJztcclxuXHJcbmV4cG9ydCBlbnVtIFN0ZXAge1xyXG4gICAgUXVhcnRlckhvdXIgPSAxNSxcclxuICAgIEhhbGZIb3VyID0gMzAsXHJcbiAgICBIb3VyID0gNjBcclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ2NhbGVuZGFyJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPG5nLXRlbXBsYXRlICNtb250aHZpZXdEZWZhdWx0RGlzcGxheUV2ZW50VGVtcGxhdGUgbGV0LXZpZXc9XCJ2aWV3XCIgbGV0LXJvdz1cInJvd1wiIGxldC1jb2w9XCJjb2xcIj5cclxuICAgICAgICAgICAge3t2aWV3LmRhdGVzW3Jvdyo3K2NvbF0ubGFiZWx9fVxyXG4gICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPG5nLXRlbXBsYXRlICNtb250aHZpZXdEZWZhdWx0RXZlbnREZXRhaWxUZW1wbGF0ZSBsZXQtc2hvd0V2ZW50RGV0YWlsPVwic2hvd0V2ZW50RGV0YWlsXCIgbGV0LXNlbGVjdGVkRGF0ZT1cInNlbGVjdGVkRGF0ZVwiIGxldC1ub0V2ZW50c0xhYmVsPVwibm9FdmVudHNMYWJlbFwiPlxyXG4gICAgICAgICAgICA8aW9uLWxpc3QgY2xhc3M9XCJldmVudC1kZXRhaWwtY29udGFpbmVyXCIgaGFzLWJvdW5jaW5nPVwiZmFsc2VcIiAqbmdJZj1cInNob3dFdmVudERldGFpbFwiIG92ZXJmbG93LXNjcm9sbD1cImZhbHNlXCI+XHJcbiAgICAgICAgICAgICAgICA8aW9uLWl0ZW0gKm5nRm9yPVwibGV0IGV2ZW50IG9mIHNlbGVjdGVkRGF0ZT8uZXZlbnRzXCIgKGNsaWNrKT1cImV2ZW50U2VsZWN0ZWQoZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiIWV2ZW50LmFsbERheVwiIGNsYXNzPVwibW9udGh2aWV3LWV2ZW50ZGV0YWlsLXRpbWVjb2x1bW5cIj57e2V2ZW50LnN0YXJ0VGltZXxkYXRlOiAnSEg6bW0nfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7ZXZlbnQuZW5kVGltZXxkYXRlOiAnSEg6bW0nfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiZXZlbnQuYWxsRGF5XCIgY2xhc3M9XCJtb250aHZpZXctZXZlbnRkZXRhaWwtdGltZWNvbHVtblwiPnt7YWxsRGF5TGFiZWx9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImV2ZW50LWRldGFpbFwiPiAgfCAge3tldmVudC50aXRsZX19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9pb24taXRlbT5cclxuICAgICAgICAgICAgICAgIDxpb24taXRlbSAqbmdJZj1cInNlbGVjdGVkRGF0ZT8uZXZlbnRzLmxlbmd0aD09MFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJuby1ldmVudHMtbGFiZWxcIj57e25vRXZlbnRzTGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9pb24taXRlbT5cclxuICAgICAgICAgICAgPC9pb24tbGlzdD5cclxuICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgIDxuZy10ZW1wbGF0ZSAjZGVmYXVsdFdlZWt2aWV3SGVhZGVyVGVtcGxhdGUgbGV0LXZpZXdEYXRlPVwidmlld0RhdGVcIj5cclxuICAgICAgICAgICAge3sgdmlld0RhdGUuZGF5SGVhZGVyIH19XHJcbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8bmctdGVtcGxhdGUgI2RlZmF1bHRBbGxEYXlFdmVudFRlbXBsYXRlIGxldC1kaXNwbGF5RXZlbnQ9XCJkaXNwbGF5RXZlbnRcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhbGVuZGFyLWV2ZW50LWlubmVyXCI+e3tkaXNwbGF5RXZlbnQuZXZlbnQudGl0bGV9fTwvZGl2PlxyXG4gICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0Tm9ybWFsRXZlbnRUZW1wbGF0ZSBsZXQtZGlzcGxheUV2ZW50PVwiZGlzcGxheUV2ZW50XCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYWxlbmRhci1ldmVudC1pbm5lclwiPnt7ZGlzcGxheUV2ZW50LmV2ZW50LnRpdGxlfX08L2Rpdj5cclxuICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgIDxuZy10ZW1wbGF0ZSAjZGVmYXVsdFdlZWtWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGUgbGV0LWRheT1cImRheVwiIGxldC1ldmVudFRlbXBsYXRlPVwiZXZlbnRUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsnY2FsZW5kYXItZXZlbnQtd3JhcCc6IGRheS5ldmVudHN9XCIgKm5nSWY9XCJkYXkuZXZlbnRzXCJcclxuICAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJ7aGVpZ2h0OiAyNSpkYXkuZXZlbnRzLmxlbmd0aCsncHgnfVwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgZGlzcGxheUV2ZW50IG9mIGRheS5ldmVudHNcIiBjbGFzcz1cImNhbGVuZGFyLWV2ZW50XCIgdGFwcGFibGVcclxuICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cImV2ZW50U2VsZWN0ZWQoZGlzcGxheUV2ZW50LmV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgIFtuZ1N0eWxlXT1cInt0b3A6IDI1KmRpc3BsYXlFdmVudC5wb3NpdGlvbisncHgnLCB3aWR0aDogMTAwKihkaXNwbGF5RXZlbnQuZW5kSW5kZXgtZGlzcGxheUV2ZW50LnN0YXJ0SW5kZXgpKyclJywgaGVpZ2h0OiAnMjVweCd9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie2Rpc3BsYXlFdmVudDpkaXNwbGF5RXZlbnR9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgIDxuZy10ZW1wbGF0ZSAjZGVmYXVsdERheVZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZSBsZXQtYWxsRGF5RXZlbnRzPVwiYWxsRGF5RXZlbnRzXCIgbGV0LWV2ZW50VGVtcGxhdGU9XCJldmVudFRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgIDxkaXYgKm5nRm9yPVwibGV0IGRpc3BsYXlFdmVudCBvZiBhbGxEYXlFdmVudHM7IGxldCBldmVudEluZGV4PWluZGV4XCJcclxuICAgICAgICAgICAgICAgICBjbGFzcz1cImNhbGVuZGFyLWV2ZW50XCIgdGFwcGFibGVcclxuICAgICAgICAgICAgICAgICAoY2xpY2spPVwiZXZlbnRTZWxlY3RlZChkaXNwbGF5RXZlbnQuZXZlbnQpXCJcclxuICAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJ7dG9wOiAyNSpldmVudEluZGV4KydweCcsd2lkdGg6ICcxMDAlJyxoZWlnaHQ6JzI1cHgnfVwiPlxyXG4gICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGlzcGxheUV2ZW50OmRpc3BsYXlFdmVudH1cIj5cclxuICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGUgbGV0LXRtPVwidG1cIiBsZXQtaG91clBhcnRzPVwiaG91clBhcnRzXCIgbGV0LWV2ZW50VGVtcGxhdGU9XCJldmVudFRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgIDxkaXYgW25nQ2xhc3NdPVwieydjYWxlbmRhci1ldmVudC13cmFwJzogdG0uZXZlbnRzfVwiICpuZ0lmPVwidG0uZXZlbnRzXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2ICpuZ0Zvcj1cImxldCBkaXNwbGF5RXZlbnQgb2YgdG0uZXZlbnRzXCIgY2xhc3M9XCJjYWxlbmRhci1ldmVudFwiIHRhcHBhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJldmVudFNlbGVjdGVkKGRpc3BsYXlFdmVudC5ldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJ7dG9wOiAoMzcqZGlzcGxheUV2ZW50LnN0YXJ0T2Zmc2V0L2hvdXJQYXJ0cykrJ3B4JyxsZWZ0OiAxMDAvZGlzcGxheUV2ZW50Lm92ZXJsYXBOdW1iZXIqZGlzcGxheUV2ZW50LnBvc2l0aW9uKyclJywgd2lkdGg6IDEwMC9kaXNwbGF5RXZlbnQub3ZlcmxhcE51bWJlcisnJScsIGhlaWdodDogMzcqKGRpc3BsYXlFdmVudC5lbmRJbmRleCAtZGlzcGxheUV2ZW50LnN0YXJ0SW5kZXggLSAoZGlzcGxheUV2ZW50LmVuZE9mZnNldCArIGRpc3BsYXlFdmVudC5zdGFydE9mZnNldCkvaG91clBhcnRzKSsncHgnfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJldmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkaXNwbGF5RXZlbnQ6ZGlzcGxheUV2ZW50fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8bmctdGVtcGxhdGUgI2RlZmF1bHRJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlPlxyXG4gICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgPG5nLXRlbXBsYXRlICNkZWZhdWx0SW5hY3RpdmVOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZT5cclxuICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG5cclxuICAgICAgICA8ZGl2IFtuZ1N3aXRjaF09XCJjYWxlbmRhck1vZGVcIiBjbGFzcz1cInt7Y2FsZW5kYXJNb2RlfX12aWV3LWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICA8bW9udGh2aWV3ICpuZ1N3aXRjaENhc2U9XCInbW9udGgnXCJcclxuICAgICAgICAgICAgICAgIFtmb3JtYXREYXldPVwiZm9ybWF0RGF5XCJcclxuICAgICAgICAgICAgICAgIFtmb3JtYXREYXlIZWFkZXJdPVwiZm9ybWF0RGF5SGVhZGVyXCJcclxuICAgICAgICAgICAgICAgIFtmb3JtYXRNb250aFRpdGxlXT1cImZvcm1hdE1vbnRoVGl0bGVcIlxyXG4gICAgICAgICAgICAgICAgW3N0YXJ0aW5nRGF5TW9udGhdPVwic3RhcnRpbmdEYXlNb250aFwiXHJcbiAgICAgICAgICAgICAgICBbc2hvd0V2ZW50RGV0YWlsXT1cInNob3dFdmVudERldGFpbFwiXHJcbiAgICAgICAgICAgICAgICBbbm9FdmVudHNMYWJlbF09XCJub0V2ZW50c0xhYmVsXCJcclxuICAgICAgICAgICAgICAgIFthdXRvU2VsZWN0XT1cImF1dG9TZWxlY3RcIlxyXG4gICAgICAgICAgICAgICAgW2V2ZW50U291cmNlXT1cImV2ZW50U291cmNlXCJcclxuICAgICAgICAgICAgICAgIFttYXJrRGlzYWJsZWRdPVwibWFya0Rpc2FibGVkXCJcclxuICAgICAgICAgICAgICAgIFttb250aHZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZV09XCJtb250aHZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZXx8bW9udGh2aWV3RGVmYXVsdERpc3BsYXlFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFttb250aHZpZXdJbmFjdGl2ZURpc3BsYXlFdmVudFRlbXBsYXRlXT1cIm1vbnRodmlld0luYWN0aXZlRGlzcGxheUV2ZW50VGVtcGxhdGV8fG1vbnRodmlld0RlZmF1bHREaXNwbGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbbW9udGh2aWV3RXZlbnREZXRhaWxUZW1wbGF0ZV09XCJtb250aHZpZXdFdmVudERldGFpbFRlbXBsYXRlfHxtb250aHZpZXdEZWZhdWx0RXZlbnREZXRhaWxUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbbG9jYWxlXT1cImxvY2FsZVwiXHJcbiAgICAgICAgICAgICAgICBbZGF0ZUZvcm1hdHRlcl09XCJkYXRlRm9ybWF0dGVyXCJcclxuICAgICAgICAgICAgICAgIFtkaXJdPVwiZGlyXCJcclxuICAgICAgICAgICAgICAgIFtsb2NrU3dpcGVUb1ByZXZdPVwibG9ja1N3aXBlVG9QcmV2XCJcclxuICAgICAgICAgICAgICAgIFtsb2NrU3dpcGVzXT1cImxvY2tTd2lwZXNcIlxyXG4gICAgICAgICAgICAgICAgW3NsaWRlck9wdGlvbnNdPVwic2xpZGVyT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAob25SYW5nZUNoYW5nZWQpPVwicmFuZ2VDaGFuZ2VkKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgKG9uRXZlbnRTZWxlY3RlZCk9XCJldmVudFNlbGVjdGVkKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgKG9uVGltZVNlbGVjdGVkKT1cInRpbWVTZWxlY3RlZCgkZXZlbnQpXCJcclxuICAgICAgICAgICAgICAgIChvblRpdGxlQ2hhbmdlZCk9XCJ0aXRsZUNoYW5nZWQoJGV2ZW50KVwiPlxyXG4gICAgICAgICAgICA8L21vbnRodmlldz5cclxuICAgICAgICAgICAgPHdlZWt2aWV3ICpuZ1N3aXRjaENhc2U9XCInd2VlaydcIlxyXG4gICAgICAgICAgICAgICAgW2Zvcm1hdFdlZWtUaXRsZV09XCJmb3JtYXRXZWVrVGl0bGVcIlxyXG4gICAgICAgICAgICAgICAgW2Zvcm1hdFdlZWtWaWV3RGF5SGVhZGVyXT1cImZvcm1hdFdlZWtWaWV3RGF5SGVhZGVyXCJcclxuICAgICAgICAgICAgICAgIFtmb3JtYXRIb3VyQ29sdW1uXT1cImZvcm1hdEhvdXJDb2x1bW5cIlxyXG4gICAgICAgICAgICAgICAgW3N0YXJ0aW5nRGF5V2Vla109XCJzdGFydGluZ0RheVdlZWtcIlxyXG4gICAgICAgICAgICAgICAgW2FsbERheUxhYmVsXT1cImFsbERheUxhYmVsXCJcclxuICAgICAgICAgICAgICAgIFtob3VyUGFydHNdPVwiaG91clBhcnRzXCJcclxuICAgICAgICAgICAgICAgIFthdXRvU2VsZWN0XT1cImF1dG9TZWxlY3RcIlxyXG4gICAgICAgICAgICAgICAgW2hvdXJTZWdtZW50c109XCJob3VyU2VnbWVudHNcIlxyXG4gICAgICAgICAgICAgICAgW2V2ZW50U291cmNlXT1cImV2ZW50U291cmNlXCJcclxuICAgICAgICAgICAgICAgIFttYXJrRGlzYWJsZWRdPVwibWFya0Rpc2FibGVkXCJcclxuICAgICAgICAgICAgICAgIFt3ZWVrdmlld0hlYWRlclRlbXBsYXRlXT1cIndlZWt2aWV3SGVhZGVyVGVtcGxhdGV8fGRlZmF1bHRXZWVrdmlld0hlYWRlclRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFt3ZWVrdmlld0FsbERheUV2ZW50VGVtcGxhdGVdPVwid2Vla3ZpZXdBbGxEYXlFdmVudFRlbXBsYXRlfHxkZWZhdWx0QWxsRGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbd2Vla3ZpZXdOb3JtYWxFdmVudFRlbXBsYXRlXT1cIndlZWt2aWV3Tm9ybWFsRXZlbnRUZW1wbGF0ZXx8ZGVmYXVsdE5vcm1hbEV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgW3dlZWt2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwid2Vla3ZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZXx8ZGVmYXVsdFdlZWtWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgW3dlZWt2aWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwid2Vla3ZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZXx8ZGVmYXVsdE5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFt3ZWVrdmlld0luYWN0aXZlQWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwid2Vla3ZpZXdJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlfHxkZWZhdWx0SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbd2Vla3ZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXT1cIndlZWt2aWV3SW5hY3RpdmVOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZXx8ZGVmYXVsdEluYWN0aXZlTm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgW2xvY2FsZV09XCJsb2NhbGVcIlxyXG4gICAgICAgICAgICAgICAgW2RhdGVGb3JtYXR0ZXJdPVwiZGF0ZUZvcm1hdHRlclwiXHJcbiAgICAgICAgICAgICAgICBbZGlyXT1cImRpclwiXHJcbiAgICAgICAgICAgICAgICBbc2Nyb2xsVG9Ib3VyXT1cInNjcm9sbFRvSG91clwiXHJcbiAgICAgICAgICAgICAgICBbcHJlc2VydmVTY3JvbGxQb3NpdGlvbl09XCJwcmVzZXJ2ZVNjcm9sbFBvc2l0aW9uXCJcclxuICAgICAgICAgICAgICAgIFtsb2NrU3dpcGVUb1ByZXZdPVwibG9ja1N3aXBlVG9QcmV2XCJcclxuICAgICAgICAgICAgICAgIFtsb2NrU3dpcGVzXT1cImxvY2tTd2lwZXNcIlxyXG4gICAgICAgICAgICAgICAgW3N0YXJ0SG91cl09XCJzdGFydEhvdXJcIlxyXG4gICAgICAgICAgICAgICAgW2VuZEhvdXJdPVwiZW5kSG91clwiXHJcbiAgICAgICAgICAgICAgICBbc2xpZGVyT3B0aW9uc109XCJzbGlkZXJPcHRpb25zXCJcclxuICAgICAgICAgICAgICAgIChvblJhbmdlQ2hhbmdlZCk9XCJyYW5nZUNoYW5nZWQoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAob25FdmVudFNlbGVjdGVkKT1cImV2ZW50U2VsZWN0ZWQoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAob25EYXlIZWFkZXJTZWxlY3RlZCk9XCJkYXlTZWxlY3RlZCgkZXZlbnQpXCJcclxuICAgICAgICAgICAgICAgIChvblRpbWVTZWxlY3RlZCk9XCJ0aW1lU2VsZWN0ZWQoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAob25UaXRsZUNoYW5nZWQpPVwidGl0bGVDaGFuZ2VkKCRldmVudClcIj5cclxuICAgICAgICAgICAgPC93ZWVrdmlldz5cclxuICAgICAgICAgICAgPGRheXZpZXcgKm5nU3dpdGNoQ2FzZT1cIidkYXknXCJcclxuICAgICAgICAgICAgICAgIFtmb3JtYXREYXlUaXRsZV09XCJmb3JtYXREYXlUaXRsZVwiXHJcbiAgICAgICAgICAgICAgICBbZm9ybWF0SG91ckNvbHVtbl09XCJmb3JtYXRIb3VyQ29sdW1uXCJcclxuICAgICAgICAgICAgICAgIFthbGxEYXlMYWJlbF09XCJhbGxEYXlMYWJlbFwiXHJcbiAgICAgICAgICAgICAgICBbaG91clBhcnRzXT1cImhvdXJQYXJ0c1wiXHJcbiAgICAgICAgICAgICAgICBbaG91clNlZ21lbnRzXT1cImhvdXJTZWdtZW50c1wiXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRTb3VyY2VdPVwiZXZlbnRTb3VyY2VcIlxyXG4gICAgICAgICAgICAgICAgW21hcmtEaXNhYmxlZF09XCJtYXJrRGlzYWJsZWRcIlxyXG4gICAgICAgICAgICAgICAgW2RheXZpZXdBbGxEYXlFdmVudFRlbXBsYXRlXT1cImRheXZpZXdBbGxEYXlFdmVudFRlbXBsYXRlfHxkZWZhdWx0QWxsRGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbZGF5dmlld05vcm1hbEV2ZW50VGVtcGxhdGVdPVwiZGF5dmlld05vcm1hbEV2ZW50VGVtcGxhdGV8fGRlZmF1bHROb3JtYWxFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFtkYXl2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwiZGF5dmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlfHxkZWZhdWx0RGF5Vmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFtkYXl2aWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwiZGF5dmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlfHxkZWZhdWx0Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgW2RheXZpZXdJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlXT1cImRheXZpZXdJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlfHxkZWZhdWx0SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICBbZGF5dmlld0luYWN0aXZlTm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVdPVwiZGF5dmlld0luYWN0aXZlTm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGV8fGRlZmF1bHRJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgIFtsb2NhbGVdPVwibG9jYWxlXCJcclxuICAgICAgICAgICAgICAgIFtkYXRlRm9ybWF0dGVyXT1cImRhdGVGb3JtYXR0ZXJcIlxyXG4gICAgICAgICAgICAgICAgW2Rpcl09XCJkaXJcIlxyXG4gICAgICAgICAgICAgICAgW3Njcm9sbFRvSG91cl09XCJzY3JvbGxUb0hvdXJcIlxyXG4gICAgICAgICAgICAgICAgW3ByZXNlcnZlU2Nyb2xsUG9zaXRpb25dPVwicHJlc2VydmVTY3JvbGxQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICBbbG9ja1N3aXBlVG9QcmV2XT1cImxvY2tTd2lwZVRvUHJldlwiXHJcbiAgICAgICAgICAgICAgICBbbG9ja1N3aXBlc109XCJsb2NrU3dpcGVzXCJcclxuICAgICAgICAgICAgICAgIFtzdGFydEhvdXJdPVwic3RhcnRIb3VyXCJcclxuICAgICAgICAgICAgICAgIFtlbmRIb3VyXT1cImVuZEhvdXJcIlxyXG4gICAgICAgICAgICAgICAgW3NsaWRlck9wdGlvbnNdPVwic2xpZGVyT3B0aW9uc1wiXHJcbiAgICAgICAgICAgICAgICAob25SYW5nZUNoYW5nZWQpPVwicmFuZ2VDaGFuZ2VkKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgKG9uRXZlbnRTZWxlY3RlZCk9XCJldmVudFNlbGVjdGVkKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgKG9uVGltZVNlbGVjdGVkKT1cInRpbWVTZWxlY3RlZCgkZXZlbnQpXCJcclxuICAgICAgICAgICAgICAgIChvblRpdGxlQ2hhbmdlZCk9XCJ0aXRsZUNoYW5nZWQoJGV2ZW50KVwiPlxyXG4gICAgICAgICAgICA8L2RheXZpZXc+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgc3R5bGVzOiBbYFxyXG4gICAgICAgIDpob3N0ID4gZGl2IHsgaGVpZ2h0OiAxMDAlOyB9XHJcblxyXG4gICAgICAgIC5ldmVudC1kZXRhaWwtY29udGFpbmVyIHtcclxuICAgICAgICAgIGJvcmRlci10b3A6IDJweCBkYXJrZ3JleSBzb2xpZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5uby1ldmVudHMtbGFiZWwge1xyXG4gICAgICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XHJcbiAgICAgICAgICBjb2xvcjogZGFya2dyZXk7XHJcbiAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuZXZlbnQtZGV0YWlsIHtcclxuICAgICAgICAgIGN1cnNvcjogcG9pbnRlcjtcclxuICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbiAgICAgICAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctZXZlbnRkZXRhaWwtdGltZWNvbHVtbiB7XHJcbiAgICAgICAgICB3aWR0aDogMTEwcHg7XHJcbiAgICAgICAgICBvdmVyZmxvdzogaGlkZGVuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLmNhbGVuZGFyLWV2ZW50LWlubmVyIHtcclxuICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2E4N2FkO1xyXG4gICAgICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICAgICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgICAgICAgd2lkdGg6IDEwMCU7XHJcbiAgICAgICAgICBwYWRkaW5nOiAycHg7XHJcbiAgICAgICAgICBsaW5lLWhlaWdodDogMTVweDtcclxuICAgICAgICAgIHRleHQtYWxpZ246IGluaXRpYWw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBAbWVkaWEgKG1heC13aWR0aDogNzUwcHgpIHtcclxuICAgICAgICAgIC5jYWxlbmRhci1ldmVudC1pbm5lciB7XHJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICBgXSxcclxuICAgIHByb3ZpZGVyczogW0NhbGVuZGFyU2VydmljZV1cclxufSlcclxuZXhwb3J0IGNsYXNzIENhbGVuZGFyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcclxuICAgIEBJbnB1dCgpXHJcbiAgICBnZXQgY3VycmVudERhdGUoKTpEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY3VycmVudERhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGN1cnJlbnREYXRlKHZhbDpEYXRlKSB7XHJcbiAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgdmFsID0gbmV3IERhdGUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX2N1cnJlbnREYXRlID0gdmFsO1xyXG4gICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNldEN1cnJlbnREYXRlKHZhbCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5vbkN1cnJlbnREYXRlQ2hhbmdlZC5lbWl0KHRoaXMuX2N1cnJlbnREYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBldmVudFNvdXJjZTpJRXZlbnRbXSA9IFtdO1xyXG4gICAgQElucHV0KCkgY2FsZW5kYXJNb2RlOkNhbGVuZGFyTW9kZSA9ICdtb250aCc7XHJcbiAgICBASW5wdXQoKSBmb3JtYXREYXk6c3RyaW5nID0gJ2QnO1xyXG4gICAgQElucHV0KCkgZm9ybWF0RGF5SGVhZGVyOnN0cmluZyA9ICdFRUUnO1xyXG4gICAgQElucHV0KCkgZm9ybWF0RGF5VGl0bGU6c3RyaW5nID0gJ01NTU0gZGQsIHl5eXknO1xyXG4gICAgQElucHV0KCkgZm9ybWF0V2Vla1RpdGxlOnN0cmluZyA9ICdNTU1NIHl5eXksIFxcJ1dlZWtcXCcgdyc7XHJcbiAgICBASW5wdXQoKSBmb3JtYXRNb250aFRpdGxlOnN0cmluZyA9ICdNTU1NIHl5eXknO1xyXG4gICAgQElucHV0KCkgZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXI6c3RyaW5nID0gJ0VFRSBkJztcclxuICAgIEBJbnB1dCgpIGZvcm1hdEhvdXJDb2x1bW46c3RyaW5nID0gJ2hhJztcclxuICAgIEBJbnB1dCgpIHNob3dFdmVudERldGFpbDpib29sZWFuID0gdHJ1ZTtcclxuICAgIEBJbnB1dCgpIHN0YXJ0aW5nRGF5TW9udGg6bnVtYmVyID0gMDtcclxuICAgIEBJbnB1dCgpIHN0YXJ0aW5nRGF5V2VlazpudW1iZXIgPSAwO1xyXG4gICAgQElucHV0KCkgYWxsRGF5TGFiZWw6c3RyaW5nID0gJ2FsbCBkYXknO1xyXG4gICAgQElucHV0KCkgbm9FdmVudHNMYWJlbDpzdHJpbmcgPSAnTm8gRXZlbnRzJztcclxuICAgIEBJbnB1dCgpIHF1ZXJ5TW9kZTpRdWVyeU1vZGUgPSAnbG9jYWwnO1xyXG4gICAgQElucHV0KCkgc3RlcDpTdGVwID0gU3RlcC5Ib3VyO1xyXG4gICAgQElucHV0KCkgdGltZUludGVydmFsOm51bWJlciA9IDYwO1xyXG4gICAgQElucHV0KCkgYXV0b1NlbGVjdDpib29sZWFuID0gdHJ1ZTtcclxuICAgIEBJbnB1dCgpIG1hcmtEaXNhYmxlZDooZGF0ZTpEYXRlKSA9PiBib29sZWFuO1xyXG4gICAgQElucHV0KCkgbW9udGh2aWV3RGlzcGxheUV2ZW50VGVtcGxhdGU6VGVtcGxhdGVSZWY8SU1vbnRoVmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBtb250aHZpZXdJbmFjdGl2ZURpc3BsYXlFdmVudFRlbXBsYXRlOlRlbXBsYXRlUmVmPElNb250aFZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgbW9udGh2aWV3RXZlbnREZXRhaWxUZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJTW9udGhWaWV3RXZlbnREZXRhaWxUZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdIZWFkZXJUZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJRGlzcGxheVdlZWtWaWV3SGVhZGVyPjtcclxuICAgIEBJbnB1dCgpIHdlZWt2aWV3QWxsRGF5RXZlbnRUZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJRGlzcGxheUFsbERheUV2ZW50PjtcclxuICAgIEBJbnB1dCgpIHdlZWt2aWV3Tm9ybWFsRXZlbnRUZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJRGlzcGxheUV2ZW50PjtcclxuICAgIEBJbnB1dCgpIGRheXZpZXdBbGxEYXlFdmVudFRlbXBsYXRlOlRlbXBsYXRlUmVmPElEaXNwbGF5QWxsRGF5RXZlbnQ+O1xyXG4gICAgQElucHV0KCkgZGF5dmlld05vcm1hbEV2ZW50VGVtcGxhdGU6VGVtcGxhdGVSZWY8SURpc3BsYXlFdmVudD47XHJcbiAgICBASW5wdXQoKSB3ZWVrdmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlOlRlbXBsYXRlUmVmPElXZWVrVmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSB3ZWVrdmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOlRlbXBsYXRlUmVmPElXZWVrVmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBkYXl2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGU6VGVtcGxhdGVSZWY8SURheVZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgZGF5dmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOlRlbXBsYXRlUmVmPElEYXlWaWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0PjtcclxuICAgIEBJbnB1dCgpIHdlZWt2aWV3SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJV2Vla1ZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOlRlbXBsYXRlUmVmPElXZWVrVmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBkYXl2aWV3SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJRGF5Vmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBkYXl2aWV3SW5hY3RpdmVOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZTpUZW1wbGF0ZVJlZjxJRGF5Vmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBkYXRlRm9ybWF0dGVyOklEYXRlRm9ybWF0dGVyO1xyXG4gICAgQElucHV0KCkgZGlyOnN0cmluZyA9IFwiXCI7XHJcbiAgICBASW5wdXQoKSBzY3JvbGxUb0hvdXI6bnVtYmVyID0gMDtcclxuICAgIEBJbnB1dCgpIHByZXNlcnZlU2Nyb2xsUG9zaXRpb246Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgQElucHV0KCkgbG9ja1N3aXBlVG9QcmV2OmJvb2xlYW4gPSBmYWxzZTtcclxuICAgIEBJbnB1dCgpIGxvY2tTd2lwZXM6Ym9vbGVhbiA9IGZhbHNlO1xyXG4gICAgQElucHV0KCkgbG9jYWxlOnN0cmluZyA9IFwiXCI7XHJcbiAgICBASW5wdXQoKSBzdGFydEhvdXI6bnVtYmVyID0gMDtcclxuICAgIEBJbnB1dCgpIGVuZEhvdXI6bnVtYmVyID0gMjQ7XHJcbiAgICBASW5wdXQoKSBzbGlkZXJPcHRpb25zOmFueTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25DdXJyZW50RGF0ZUNoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPERhdGU+KCk7XHJcbiAgICBAT3V0cHV0KCkgb25SYW5nZUNoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElSYW5nZT4oKTtcclxuICAgIEBPdXRwdXQoKSBvbkV2ZW50U2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElFdmVudD4oKTtcclxuICAgIEBPdXRwdXQoKSBvblRpbWVTZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SVRpbWVTZWxlY3RlZD4oKTtcclxuICAgIEBPdXRwdXQoKSBvbkRheUhlYWRlclNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJVGltZVNlbGVjdGVkPigpO1xyXG4gICAgQE91dHB1dCgpIG9uVGl0bGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KCk7XHJcblxyXG4gICAgcHJpdmF0ZSBfY3VycmVudERhdGU6RGF0ZTtcclxuICAgIHB1YmxpYyBob3VyUGFydHMgPSAxO1xyXG4gICAgcHVibGljIGhvdXJTZWdtZW50cyA9IDE7XHJcbiAgICBwcml2YXRlIGN1cnJlbnREYXRlQ2hhbmdlZEZyb21DaGlsZHJlblN1YnNjcmlwdGlvbjpTdWJzY3JpcHRpb247XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjYWxlbmRhclNlcnZpY2U6Q2FsZW5kYXJTZXJ2aWNlLCBASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBhcHBMb2NhbGU6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5sb2NhbGUgPSBhcHBMb2NhbGU7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1NlbGVjdCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hdXRvU2VsZWN0LnRvU3RyaW5nKCkgPT09ICdmYWxzZScpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXV0b1NlbGVjdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvU2VsZWN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhvdXJTZWdtZW50cyA9IDYwIC8gdGhpcy50aW1lSW50ZXJ2YWw7XHJcbiAgICAgICAgdGhpcy5ob3VyUGFydHMgPSA2MCAvIHRoaXMuc3RlcDtcclxuICAgICAgICBpZih0aGlzLmhvdXJQYXJ0cyA8PSB0aGlzLmhvdXJTZWdtZW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJQYXJ0cyA9IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5ob3VyUGFydHMgPSB0aGlzLmhvdXJQYXJ0cyAvIHRoaXMuaG91clNlZ21lbnRzO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnN0YXJ0SG91ciA9IHBhcnNlSW50KHRoaXMuc3RhcnRIb3VyLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMuZW5kSG91ciA9IHBhcnNlSW50KHRoaXMuZW5kSG91ci50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5xdWVyeU1vZGUgPSB0aGlzLnF1ZXJ5TW9kZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tQ2hpbGRyZW5TdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tQ2hpbGRyZW4kLnN1YnNjcmliZShjdXJyZW50RGF0ZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1cnJlbnREYXRlID0gY3VycmVudERhdGU7XHJcbiAgICAgICAgICAgIHRoaXMub25DdXJyZW50RGF0ZUNoYW5nZWQuZW1pdChjdXJyZW50RGF0ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbUNoaWxkcmVuU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbUNoaWxkcmVuU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbUNoaWxkcmVuU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmFuZ2VDaGFuZ2VkKHJhbmdlOklSYW5nZSkge1xyXG4gICAgICAgIHRoaXMub25SYW5nZUNoYW5nZWQuZW1pdChyYW5nZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZXZlbnRTZWxlY3RlZChldmVudDpJRXZlbnQpIHtcclxuICAgICAgICB0aGlzLm9uRXZlbnRTZWxlY3RlZC5lbWl0KGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICB0aW1lU2VsZWN0ZWQodGltZVNlbGVjdGVkOklUaW1lU2VsZWN0ZWQpIHtcclxuICAgICAgICB0aGlzLm9uVGltZVNlbGVjdGVkLmVtaXQodGltZVNlbGVjdGVkKTtcclxuICAgIH1cclxuXHJcbiAgICBkYXlTZWxlY3RlZChkYXlTZWxlY3RlZDpJVGltZVNlbGVjdGVkKSB7XHJcbiAgICAgICAgdGhpcy5vbkRheUhlYWRlclNlbGVjdGVkLmVtaXQoZGF5U2VsZWN0ZWQpO1xyXG4gICAgfVxyXG5cclxuICAgIHRpdGxlQ2hhbmdlZCh0aXRsZTpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm9uVGl0bGVDaGFuZ2VkLmVtaXQodGl0bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRFdmVudHMoKSB7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2UubG9hZEV2ZW50cygpO1xyXG4gICAgfVxyXG5cclxuICAgIHNsaWRlTmV4dCgpIHtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5zbGlkZSgxKTtcclxuICAgIH1cclxuXHJcbiAgICBzbGlkZVByZXYoKSB7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2xpZGUoLTEpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS51cGRhdGUoKTtcclxuICAgIH1cclxufVxyXG4iXX0=