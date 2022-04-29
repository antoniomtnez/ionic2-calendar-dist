var MonthViewComponent_1;
import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CalendarService } from './calendar.service';
let MonthViewComponent = MonthViewComponent_1 = class MonthViewComponent {
    constructor(calendarService) {
        this.calendarService = calendarService;
        this.autoSelect = true;
        this.dir = '';
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter(true);
        this.onTitleChanged = new EventEmitter(true);
        this.views = [];
        this.currentViewIndex = 0;
        this.mode = 'month';
        this.direction = 0;
        this.moveOnSelected = false;
        this.inited = false;
        this.callbackOnInit = true;
    }
    ;
    static getDates(startDate, n) {
        const dates = new Array(n), current = new Date(startDate.getTime());
        let i = 0;
        while (i < n) {
            dates[i++] = new Date(current.getTime());
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    ngOnInit() {
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDay) {
            this.formatDayLabel = this.dateFormatter.formatMonthViewDay;
        }
        else {
            const dayLabelDatePipe = new DatePipe('en-US');
            this.formatDayLabel = function (date) {
                return dayLabelDatePipe.transform(date, this.formatDay);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDayHeader) {
            this.formatDayHeaderLabel = this.dateFormatter.formatMonthViewDayHeader;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatDayHeaderLabel = function (date) {
                return datePipe.transform(date, this.formatDayHeader);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewTitle) {
            this.formatTitle = this.dateFormatter.formatMonthViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatMonthTitle);
            };
        }
        if (this.lockSwipeToPrev) {
            this.slider.lockSwipeToPrev(true);
        }
        if (this.lockSwipes) {
            this.slider.lockSwipes(true);
        }
        this.refreshView();
        this.inited = true;
        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(currentDate => {
            this.refreshView();
        });
        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(() => {
            this.onDataLoaded();
        });
        this.slideChangedSubscription = this.calendarService.slideChanged$.subscribe(direction => {
            if (direction === 1) {
                this.slider.slideNext();
            }
            else if (direction === -1) {
                this.slider.slidePrev();
            }
        });
        this.slideUpdatedSubscription = this.calendarService.slideUpdated$.subscribe(() => {
            this.slider.update();
        });
    }
    ngOnDestroy() {
        if (this.currentDateChangedFromParentSubscription) {
            this.currentDateChangedFromParentSubscription.unsubscribe();
            this.currentDateChangedFromParentSubscription = null;
        }
        if (this.eventSourceChangedSubscription) {
            this.eventSourceChangedSubscription.unsubscribe();
            this.eventSourceChangedSubscription = null;
        }
        if (this.slideChangedSubscription) {
            this.slideChangedSubscription.unsubscribe();
            this.slideChangedSubscription = null;
        }
        if (this.slideUpdatedSubscription) {
            this.slideUpdatedSubscription.unsubscribe();
            this.slideUpdatedSubscription = null;
        }
    }
    ngOnChanges(changes) {
        if (!this.inited) {
            return;
        }
        const eventSourceChange = changes.eventSource;
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
        const lockSwipeToPrev = changes.lockSwipeToPrev;
        if (lockSwipeToPrev) {
            this.slider.lockSwipeToPrev(lockSwipeToPrev.currentValue);
        }
        const lockSwipes = changes.lockSwipes;
        if (lockSwipes) {
            this.slider.lockSwipes(lockSwipes.currentValue);
        }
    }
    ngAfterViewInit() {
        const title = this.getTitle();
        this.onTitleChanged.emit(title);
    }
    onSlideChanged() {
        if (this.callbackOnInit) {
            this.callbackOnInit = false;
            return;
        }
        let direction = 0;
        const currentViewIndex = this.currentViewIndex;
        this.slider.getActiveIndex().then((currentSlideIndex) => {
            currentSlideIndex = (currentSlideIndex + 2) % 3;
            if (isNaN(currentSlideIndex)) {
                currentSlideIndex = currentViewIndex;
            }
            if (currentSlideIndex - currentViewIndex === 1) {
                direction = 1;
            }
            else if (currentSlideIndex === 0 && currentViewIndex === 2) {
                direction = 1;
                this.slider.slideTo(1, 0, false);
            }
            else if (currentViewIndex - currentSlideIndex === 1) {
                direction = -1;
            }
            else if (currentSlideIndex === 2 && currentViewIndex === 0) {
                direction = -1;
                this.slider.slideTo(3, 0, false);
            }
            this.currentViewIndex = currentSlideIndex;
            this.move(direction);
        });
    }
    move(direction) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        if (!this.moveOnSelected) {
            const adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
            this.calendarService.setCurrentDate(adjacentDate);
        }
        this.refreshView();
        this.direction = 0;
        this.moveOnSelected = false;
    }
    createDateObject(date) {
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(date);
        }
        return {
            date,
            events: [],
            label: this.formatDayLabel(date),
            secondary: false,
            disabled
        };
    }
    getViewData(startTime) {
        const startDate = startTime, date = startDate.getDate(), month = (startDate.getMonth() + (date !== 1 ? 1 : 0)) % 12;
        const dates = MonthViewComponent_1.getDates(startDate, 42);
        const days = [];
        for (let i = 0; i < 42; i++) {
            const dateObject = this.createDateObject(dates[i]);
            dateObject.secondary = dates[i].getMonth() !== month;
            days[i] = dateObject;
        }
        const dayHeaders = [];
        for (let i = 0; i < 7; i++) {
            dayHeaders.push(this.formatDayHeaderLabel(days[i].date));
        }
        return {
            dates: days,
            dayHeaders
        };
    }
    getHighlightClass(date) {
        let className = '';
        if (date.hasEvent) {
            if (date.secondary) {
                className = 'monthview-secondary-with-event';
            }
            else {
                className = 'monthview-primary-with-event';
            }
        }
        if (date.selected) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-selected';
        }
        if (date.current) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-current';
        }
        if (date.secondary) {
            if (className) {
                className += ' ';
            }
            className += 'text-muted';
        }
        if (date.disabled) {
            if (className) {
                className += ' ';
            }
            className += 'monthview-disabled';
        }
        return className;
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), firstDayOfMonth = new Date(year, month, 1, 12, 0, 0), // set hour to 12 to avoid DST problem
        difference = this.startingDayMonth - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference, startDate = new Date(firstDayOfMonth.getTime());
        if (numDisplayedFromPreviousMonth > 0) {
            startDate.setDate(-numDisplayedFromPreviousMonth + 1);
        }
        const endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 42);
        return {
            startTime: startDate,
            endTime: endDate
        };
    }
    onDataLoaded() {
        const range = this.range, eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = range.startTime, endTime = range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, dates = this.views[currentViewIndex].dates, oneDay = 86400000, eps = 0.0006;
        for (let r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].hasEvent = false;
                dates[r].events = [];
            }
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i], eventStartTime = event.startTime, eventEndTime = event.endTime;
            let eventUTCStartTime, eventUTCEndTime;
            if (event.allDay) {
                eventUTCStartTime = eventStartTime.getTime();
                eventUTCEndTime = eventEndTime.getTime();
            }
            else {
                eventUTCStartTime = Date.UTC(eventStartTime.getFullYear(), eventStartTime.getMonth(), eventStartTime.getDate());
                eventUTCEndTime = Date.UTC(eventEndTime.getFullYear(), eventEndTime.getMonth(), eventEndTime.getDate() + 1);
            }
            if (eventUTCEndTime <= utcStartTime || eventUTCStartTime >= utcEndTime) {
                continue;
            }
            let timeDifferenceStart, timeDifferenceEnd;
            if (eventUTCStartTime < utcStartTime) {
                timeDifferenceStart = 0;
            }
            else {
                timeDifferenceStart = (eventUTCStartTime - utcStartTime) / oneDay;
            }
            if (eventUTCEndTime > utcEndTime) {
                timeDifferenceEnd = (utcEndTime - utcStartTime) / oneDay;
            }
            else {
                timeDifferenceEnd = (eventUTCEndTime - utcStartTime) / oneDay;
            }
            let index = Math.floor(timeDifferenceStart);
            const endIndex = Math.ceil(timeDifferenceEnd - eps);
            while (index < endIndex) {
                dates[index].hasEvent = true;
                let eventSet = dates[index].events;
                if (eventSet) {
                    eventSet.push(event);
                }
                else {
                    eventSet = [];
                    eventSet.push(event);
                    dates[index].events = eventSet;
                }
                index += 1;
            }
        }
        for (let r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].events.sort(this.compareEvent);
            }
        }
        if (this.autoSelect) {
            let findSelected = false;
            for (let r = 0; r < 42; r += 1) {
                if (dates[r].selected) {
                    this.selectedDate = dates[r];
                    findSelected = true;
                    break;
                }
            }
            if (findSelected) {
                this.onTimeSelected.emit({
                    selectedTime: this.selectedDate.date,
                    events: this.selectedDate.events,
                    disabled: this.selectedDate.disabled
                });
            }
        }
    }
    refreshView() {
        this.range = this.getRange(this.calendarService.currentDate);
        if (this.inited) {
            const title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.calendarService.populateAdjacentViews(this);
        this.updateCurrentView(this.range.startTime, this.views[this.currentViewIndex]);
        this.calendarService.rangeChanged(this);
    }
    getTitle() {
        const currentViewStartDate = this.range.startTime, date = currentViewStartDate.getDate(), month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12, year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0), headerDate = new Date(year, month, 1, 12, 0, 0, 0);
        return this.formatTitle(headerDate);
    }
    compareEvent(event1, event2) {
        if (event1.allDay) {
            return 1;
        }
        else if (event2.allDay) {
            return -1;
        }
        else {
            return (event1.startTime.getTime() - event2.startTime.getTime());
        }
    }
    select(viewDate) {
        if (!this.views) {
            return;
        }
        const selectedDate = viewDate.date, events = viewDate.events;
        if (!viewDate.disabled) {
            const dates = this.views[this.currentViewIndex].dates, currentCalendarDate = this.calendarService.currentDate, currentMonth = currentCalendarDate.getMonth(), currentYear = currentCalendarDate.getFullYear(), selectedMonth = selectedDate.getMonth(), selectedYear = selectedDate.getFullYear();
            let direction = 0;
            if (currentYear === selectedYear) {
                if (currentMonth !== selectedMonth) {
                    direction = currentMonth < selectedMonth ? 1 : -1;
                }
            }
            else {
                direction = currentYear < selectedYear ? 1 : -1;
            }
            this.calendarService.setCurrentDate(selectedDate);
            if (direction === 0) {
                const currentViewStartDate = this.range.startTime, oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
                for (let r = 0; r < 42; r += 1) {
                    dates[r].selected = false;
                }
                if (selectedDayDifference >= 0 && selectedDayDifference < 42) {
                    dates[selectedDayDifference].selected = true;
                    this.selectedDate = dates[selectedDayDifference];
                }
            }
            else {
                this.moveOnSelected = true;
                this.slideView(direction);
            }
        }
        this.onTimeSelected.emit({ selectedTime: selectedDate, events, disabled: viewDate.disabled });
    }
    slideView(direction) {
        if (direction === 1) {
            this.slider.slideNext();
        }
        else if (direction === -1) {
            this.slider.slidePrev();
        }
    }
    updateCurrentView(currentViewStartDate, view) {
        const currentCalendarDate = this.calendarService.currentDate, today = new Date(), oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay), currentDayDifference = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        for (let r = 0; r < 42; r += 1) {
            view.dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 42 && !view.dates[selectedDayDifference].disabled && (this.autoSelect || this.moveOnSelected)) {
            view.dates[selectedDayDifference].selected = true;
            this.selectedDate = view.dates[selectedDayDifference];
        }
        else {
            this.selectedDate = {
                date: null,
                events: [],
                label: null,
                secondary: null,
                disabled: false
            };
        }
        if (currentDayDifference >= 0 && currentDayDifference < 42) {
            view.dates[currentDayDifference].current = true;
        }
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
};
MonthViewComponent.ctorParameters = () => [
    { type: CalendarService }
];
__decorate([
    ViewChild('monthSlider', { static: true })
], MonthViewComponent.prototype, "slider", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "monthviewDisplayEventTemplate", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "monthviewInactiveDisplayEventTemplate", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "monthviewEventDetailTemplate", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "formatDay", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "formatDayHeader", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "formatMonthTitle", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "eventSource", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "startingDayMonth", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "showEventDetail", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "noEventsLabel", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "autoSelect", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "markDisabled", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "locale", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "dateFormatter", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "dir", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "lockSwipeToPrev", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "lockSwipes", void 0);
__decorate([
    Input()
], MonthViewComponent.prototype, "sliderOptions", void 0);
__decorate([
    Output()
], MonthViewComponent.prototype, "onRangeChanged", void 0);
__decorate([
    Output()
], MonthViewComponent.prototype, "onEventSelected", void 0);
__decorate([
    Output()
], MonthViewComponent.prototype, "onTimeSelected", void 0);
__decorate([
    Output()
], MonthViewComponent.prototype, "onTitleChanged", void 0);
MonthViewComponent = MonthViewComponent_1 = __decorate([
    Component({
        selector: 'monthview',
        template: `
        <div>
            <ion-slides #monthSlider [options]="sliderOptions" [dir]="dir" (ionSlideDidChange)="onSlideChanged()">
                <ion-slide>
                    <table *ngIf="0===currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr>
                            <th *ngFor="let dayHeader of views[0].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]" tappable (click)="select(views[0].dates[row*7+col])"
                                [ngClass]="getHighlightClass(views[0].dates[row*7+col])">
                                <ng-template [ngTemplateOutlet]="monthviewDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[0], row: row, col: col}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table *ngIf="0!==currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr class="text-center">
                            <th *ngFor="let dayHeader of views[0].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]">
                                <ng-template [ngTemplateOutlet]="monthviewInactiveDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[0], row: row, col: col}">
                                </ng-template>
                            </td>
                        <tr>
                        </tbody>
                    </table>
                </ion-slide>
                <ion-slide>
                    <table *ngIf="1===currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr>
                            <th *ngFor="let dayHeader of views[1].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]" tappable (click)="select(views[1].dates[row*7+col])"
                                [ngClass]="getHighlightClass(views[1].dates[row*7+col])">
                                <ng-template [ngTemplateOutlet]="monthviewDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[1], row: row, col: col}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table *ngIf="1!==currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr class="text-center">
                            <th *ngFor="let dayHeader of views[1].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]">
                                <ng-template [ngTemplateOutlet]="monthviewInactiveDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[1], row: row, col: col}">
                                </ng-template>
                            </td>
                        <tr>
                        </tbody>
                    </table>
                </ion-slide>
                <ion-slide>
                    <table *ngIf="2===currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr>
                            <th *ngFor="let dayHeader of views[2].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]" tappable (click)="select(views[2].dates[row*7+col])"
                                [ngClass]="getHighlightClass(views[2].dates[row*7+col])">
                                <ng-template [ngTemplateOutlet]="monthviewDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[2], row: row, col: col}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <table *ngIf="2!==currentViewIndex" class="table table-bordered table-fixed monthview-datetable">
                        <thead>
                        <tr class="text-center">
                            <th *ngFor="let dayHeader of views[2].dayHeaders">
                                <small>{{dayHeader}}</small>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr *ngFor="let row of [0,1,2,3,4,5]">
                            <td *ngFor="let col of [0,1,2,3,4,5,6]">
                                <ng-template [ngTemplateOutlet]="monthviewInactiveDisplayEventTemplate"
                                             [ngTemplateOutletContext]="{view: views[2], row: row, col: col}">
                                </ng-template>
                            </td>
                        <tr>
                        </tbody>
                    </table>
                </ion-slide>
            </ion-slides>
            <ng-template [ngTemplateOutlet]="monthviewEventDetailTemplate"
                         [ngTemplateOutletContext]="{showEventDetail:showEventDetail, selectedDate: selectedDate, noEventsLabel: noEventsLabel}">
            </ng-template>
        </div>
    `,
        styles: [`
        .text-muted {
            color: #999;
        }

        .table-fixed {
            table-layout: fixed;
        }

        .table {
            width: 100%;
            max-width: 100%;
            background-color: transparent;
        }

        .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td,
        .table > tbody > tr > td, .table > tfoot > tr > td {
            padding: 8px;
            line-height: 20px;
            vertical-align: top;
        }

        .table > thead > tr > th {
            vertical-align: bottom;
            border-bottom: 2px solid #ddd;
        }

        .table > thead:first-child > tr:first-child > th, .table > thead:first-child > tr:first-child > td {
            border-top: 0
        }

        .table > tbody + tbody {
            border-top: 2px solid #ddd;
        }

        .table-bordered {
            border: 1px solid #ddd;
        }

        .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th,
        .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td {
            border: 1px solid #ddd;
        }

        .table-bordered > thead > tr > th, .table-bordered > thead > tr > td {
            border-bottom-width: 2px;
        }

        .table-striped > tbody > tr:nth-child(odd) > td, .table-striped > tbody > tr:nth-child(odd) > th {
            background-color: #f9f9f9
        }

        .monthview-primary-with-event {
            background-color: #3a87ad;
            color: white;
        }

        .monthview-current {
            background-color: #f0f0f0;
        }

        .monthview-selected {
            background-color: #009900;
            color: white;
        }

        .monthview-datetable td.monthview-disabled {
            color: lightgrey;
            cursor: default;
        }

        .monthview-datetable th {
            text-align: center;
        }

        .monthview-datetable td {
            cursor: pointer;
            text-align: center;
        }

        .monthview-secondary-with-event {
            background-color: #d9edf7;
        }

        ::-webkit-scrollbar,
        *::-webkit-scrollbar {
            display: none;
        }
    `]
    })
], MonthViewComponent);
export { MonthViewComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGh2aWV3LmpzIiwic291cmNlUm9vdCI6Im5nOi8vaW9uaWMyLWNhbGVuZGFyLyIsInNvdXJjZXMiOlsibW9udGh2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFHVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFFWixTQUFTLEVBSVosTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBSXpDLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQTZObkQsSUFBYSxrQkFBa0IsMEJBQS9CLE1BQWEsa0JBQWtCO0lBRTNCLFlBQW9CLGVBQWdDO1FBQWhDLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQWlCM0MsZUFBVSxHQUFHLElBQUksQ0FBQztRQUlsQixRQUFHLEdBQUcsRUFBRSxDQUFDO1FBS1IsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBQzVDLG9CQUFlLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUM3QyxtQkFBYyxHQUFHLElBQUksWUFBWSxDQUFnQixJQUFJLENBQUMsQ0FBQztRQUN2RCxtQkFBYyxHQUFHLElBQUksWUFBWSxDQUFTLElBQUksQ0FBQyxDQUFDO1FBRW5ELFVBQUssR0FBaUIsRUFBRSxDQUFDO1FBQ3pCLHFCQUFnQixHQUFHLENBQUMsQ0FBQztRQUdyQixTQUFJLEdBQWlCLE9BQU8sQ0FBQztRQUM3QixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBRWIsbUJBQWMsR0FBRyxLQUFLLENBQUM7UUFDdkIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLG1CQUFjLEdBQUcsSUFBSSxDQUFDO0lBdkM5QixDQUFDO0lBQ0QsQ0FBQztJQWlERCxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQWUsRUFBRSxDQUFTO1FBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUN0QixPQUFP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Z0I7QUFDZjtJQUFSLEtBQUssRUFBRTt5REFBK0I7QUFDOUI7SUFBUixLQUFLLEVBQUU7K0NBQVU7QUFDVDtJQUFSLEtBQUssRUFBRTsyREFBMEI7QUFDekI7SUFBUixLQUFLLEVBQUU7c0RBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFO3lEQUFvQjtBQUVsQjtJQUFULE1BQU0sRUFBRTswREFBNkM7QUFDNUM7SUFBVCxNQUFNLEVBQUU7MkRBQThDO0FBQzdDO0lBQVQsTUFBTSxFQUFFOzBEQUF3RDtBQUN2RDtJQUFULE1BQU0sRUFBRTswREFBaUQ7QUEvQmpELGtCQUFrQjtJQTFOOUIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLFdBQVc7UUFDckIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQTZIVDtpQkFDUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXdGUjtLQUNKLENBQUM7R0FDVyxrQkFBa0IsQ0EyaEI5QjtTQTNoQlksa0JBQWtCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIENvbXBvbmVudCxcclxuICAgIE9uSW5pdCxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIElucHV0LFxyXG4gICAgT3V0cHV0LFxyXG4gICAgRXZlbnRFbWl0dGVyLFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIFZpZXdDaGlsZCxcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgQWZ0ZXJWaWV3SW5pdFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7RGF0ZVBpcGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7SW9uU2xpZGVzfSBmcm9tICdAaW9uaWMvYW5ndWxhcic7XHJcblxyXG5pbXBvcnQge0lDYWxlbmRhckNvbXBvbmVudCwgSUV2ZW50LCBJTW9udGhWaWV3LCBJTW9udGhWaWV3Um93LCBJVGltZVNlbGVjdGVkLCBJUmFuZ2UsIENhbGVuZGFyTW9kZSwgSURhdGVGb3JtYXR0ZXJ9IGZyb20gJy4vY2FsZW5kYXInO1xyXG5pbXBvcnQge0NhbGVuZGFyU2VydmljZX0gZnJvbSAnLi9jYWxlbmRhci5zZXJ2aWNlJztcclxuaW1wb3J0IHtJTW9udGhWaWV3RGlzcGxheUV2ZW50VGVtcGxhdGVDb250ZXh0fSBmcm9tICcuL2NhbGVuZGFyJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdtb250aHZpZXcnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICA8aW9uLXNsaWRlcyAjbW9udGhTbGlkZXIgW29wdGlvbnNdPVwic2xpZGVyT3B0aW9uc1wiIFtkaXJdPVwiZGlyXCIgKGlvblNsaWRlRGlkQ2hhbmdlKT1cIm9uU2xpZGVDaGFuZ2VkKClcIj5cclxuICAgICAgICAgICAgICAgIDxpb24tc2xpZGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlICpuZ0lmPVwiMD09PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIG1vbnRodmlldy1kYXRldGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggKm5nRm9yPVwibGV0IGRheUhlYWRlciBvZiB2aWV3c1swXS5kYXlIZWFkZXJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsPnt7ZGF5SGVhZGVyfX08L3NtYWxsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiBbMCwxLDIsMyw0LDVdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGNvbCBvZiBbMCwxLDIsMyw0LDUsNl1cIiB0YXBwYWJsZSAoY2xpY2spPVwic2VsZWN0KHZpZXdzWzBdLmRhdGVzW3Jvdyo3K2NvbF0pXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdDbGFzc109XCJnZXRIaWdobGlnaHRDbGFzcyh2aWV3c1swXS5kYXRlc1tyb3cqNytjb2xdKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJtb250aHZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlldzogdmlld3NbMF0sIHJvdzogcm93LCBjb2w6IGNvbH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSAqbmdJZj1cIjAhPT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBtb250aHZpZXctZGF0ZXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCAqbmdGb3I9XCJsZXQgZGF5SGVhZGVyIG9mIHZpZXdzWzBdLmRheUhlYWRlcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c21hbGw+e3tkYXlIZWFkZXJ9fTwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgcm93IG9mIFswLDEsMiwzLDQsNV1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgY29sIG9mIFswLDEsMiwzLDQsNSw2XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJtb250aHZpZXdJbmFjdGl2ZURpc3BsYXlFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt2aWV3OiB2aWV3c1swXSwgcm93OiByb3csIGNvbDogY29sfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvaW9uLXNsaWRlPlxyXG4gICAgICAgICAgICAgICAgPGlvbi1zbGlkZT5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgKm5nSWY9XCIxPT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgbW9udGh2aWV3LWRhdGV0YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCAqbmdGb3I9XCJsZXQgZGF5SGVhZGVyIG9mIHZpZXdzWzFdLmRheUhlYWRlcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c21hbGw+e3tkYXlIZWFkZXJ9fTwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgcm93IG9mIFswLDEsMiwzLDQsNV1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgY29sIG9mIFswLDEsMiwzLDQsNSw2XVwiIHRhcHBhYmxlIChjbGljayk9XCJzZWxlY3Qodmlld3NbMV0uZGF0ZXNbcm93KjcrY29sXSlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cImdldEhpZ2hsaWdodENsYXNzKHZpZXdzWzFdLmRhdGVzW3Jvdyo3K2NvbF0pXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm1vbnRodmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt2aWV3OiB2aWV3c1sxXSwgcm93OiByb3csIGNvbDogY29sfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlICpuZ0lmPVwiMSE9PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIG1vbnRodmlldy1kYXRldGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoICpuZ0Zvcj1cImxldCBkYXlIZWFkZXIgb2Ygdmlld3NbMV0uZGF5SGVhZGVyc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbD57e2RheUhlYWRlcn19PC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2YgWzAsMSwyLDMsNCw1XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBjb2wgb2YgWzAsMSwyLDMsNCw1LDZdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm1vbnRodmlld0luYWN0aXZlRGlzcGxheUV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3ZpZXc6IHZpZXdzWzFdLCByb3c6IHJvdywgY29sOiBjb2x9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9pb24tc2xpZGU+XHJcbiAgICAgICAgICAgICAgICA8aW9uLXNsaWRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSAqbmdJZj1cIjI9PT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBtb250aHZpZXctZGF0ZXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoICpuZ0Zvcj1cImxldCBkYXlIZWFkZXIgb2Ygdmlld3NbMl0uZGF5SGVhZGVyc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbD57e2RheUhlYWRlcn19PC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2YgWzAsMSwyLDMsNCw1XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBjb2wgb2YgWzAsMSwyLDMsNCw1LDZdXCIgdGFwcGFibGUgKGNsaWNrKT1cInNlbGVjdCh2aWV3c1syXS5kYXRlc1tyb3cqNytjb2xdKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwiZ2V0SGlnaGxpZ2h0Q2xhc3Modmlld3NbMl0uZGF0ZXNbcm93KjcrY29sXSlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibW9udGh2aWV3RGlzcGxheUV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3ZpZXc6IHZpZXdzWzJdLCByb3c6IHJvdywgY29sOiBjb2x9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgKm5nSWY9XCIyIT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgbW9udGh2aWV3LWRhdGV0YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cInRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggKm5nRm9yPVwibGV0IGRheUhlYWRlciBvZiB2aWV3c1syXS5kYXlIZWFkZXJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsPnt7ZGF5SGVhZGVyfX08L3NtYWxsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiBbMCwxLDIsMyw0LDVdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGNvbCBvZiBbMCwxLDIsMyw0LDUsNl1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibW9udGh2aWV3SW5hY3RpdmVEaXNwbGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlldzogdmlld3NbMl0sIHJvdzogcm93LCBjb2w6IGNvbH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICA8L2lvbi1zbGlkZT5cclxuICAgICAgICAgICAgPC9pb24tc2xpZGVzPlxyXG4gICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibW9udGh2aWV3RXZlbnREZXRhaWxUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3Nob3dFdmVudERldGFpbDpzaG93RXZlbnREZXRhaWwsIHNlbGVjdGVkRGF0ZTogc2VsZWN0ZWREYXRlLCBub0V2ZW50c0xhYmVsOiBub0V2ZW50c0xhYmVsfVwiPlxyXG4gICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIHN0eWxlczogW2BcclxuICAgICAgICAudGV4dC1tdXRlZCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiAjOTk5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLWZpeGVkIHtcclxuICAgICAgICAgICAgdGFibGUtbGF5b3V0OiBmaXhlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBtYXgtd2lkdGg6IDEwMCU7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGhlYWQgPiB0ciA+IHRoLCAudGFibGUgPiB0Ym9keSA+IHRyID4gdGgsIC50YWJsZSA+IHRmb290ID4gdHIgPiB0aCwgLnRhYmxlID4gdGhlYWQgPiB0ciA+IHRkLFxyXG4gICAgICAgIC50YWJsZSA+IHRib2R5ID4gdHIgPiB0ZCwgLnRhYmxlID4gdGZvb3QgPiB0ciA+IHRkIHtcclxuICAgICAgICAgICAgcGFkZGluZzogOHB4O1xyXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogMjBweDtcclxuICAgICAgICAgICAgdmVydGljYWwtYWxpZ246IHRvcDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0aCB7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiBib3R0b207XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDJweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGhlYWQ6Zmlyc3QtY2hpbGQgPiB0cjpmaXJzdC1jaGlsZCA+IHRoLCAudGFibGUgPiB0aGVhZDpmaXJzdC1jaGlsZCA+IHRyOmZpcnN0LWNoaWxkID4gdGQge1xyXG4gICAgICAgICAgICBib3JkZXItdG9wOiAwXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUgPiB0Ym9keSArIHRib2R5IHtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMnB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUtYm9yZGVyZWQge1xyXG4gICAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkID4gdGhlYWQgPiB0ciA+IHRoLCAudGFibGUtYm9yZGVyZWQgPiB0Ym9keSA+IHRyID4gdGgsIC50YWJsZS1ib3JkZXJlZCA+IHRmb290ID4gdHIgPiB0aCxcclxuICAgICAgICAudGFibGUtYm9yZGVyZWQgPiB0aGVhZCA+IHRyID4gdGQsIC50YWJsZS1ib3JkZXJlZCA+IHRib2R5ID4gdHIgPiB0ZCwgLnRhYmxlLWJvcmRlcmVkID4gdGZvb3QgPiB0ciA+IHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlLWJvcmRlcmVkID4gdGhlYWQgPiB0ciA+IHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbS13aWR0aDogMnB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLXN0cmlwZWQgPiB0Ym9keSA+IHRyOm50aC1jaGlsZChvZGQpID4gdGQsIC50YWJsZS1zdHJpcGVkID4gdGJvZHkgPiB0cjpudGgtY2hpbGQob2RkKSA+IHRoIHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Y5ZjlmOVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLm1vbnRodmlldy1wcmltYXJ5LXdpdGgtZXZlbnQge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjM2E4N2FkO1xyXG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAubW9udGh2aWV3LWN1cnJlbnQge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZjBmMGYwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLm1vbnRodmlldy1zZWxlY3RlZCB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICMwMDk5MDA7XHJcbiAgICAgICAgICAgIGNvbG9yOiB3aGl0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctZGF0ZXRhYmxlIHRkLm1vbnRodmlldy1kaXNhYmxlZCB7XHJcbiAgICAgICAgICAgIGNvbG9yOiBsaWdodGdyZXk7XHJcbiAgICAgICAgICAgIGN1cnNvcjogZGVmYXVsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctZGF0ZXRhYmxlIHRoIHtcclxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLm1vbnRodmlldy1kYXRldGFibGUgdGQge1xyXG4gICAgICAgICAgICBjdXJzb3I6IHBvaW50ZXI7XHJcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctc2Vjb25kYXJ5LXdpdGgtZXZlbnQge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjZDllZGY3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgOjotd2Via2l0LXNjcm9sbGJhcixcclxuICAgICAgICAqOjotd2Via2l0LXNjcm9sbGJhciB7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IG5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgYF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE1vbnRoVmlld0NvbXBvbmVudCBpbXBsZW1lbnRzIElDYWxlbmRhckNvbXBvbmVudCwgT25Jbml0LCBPbkRlc3Ryb3ksIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBjYWxlbmRhclNlcnZpY2U6IENhbGVuZGFyU2VydmljZSkge1xyXG4gICAgfVxyXG4gICAgO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ21vbnRoU2xpZGVyJywge3N0YXRpYzogdHJ1ZX0pIHNsaWRlcjogSW9uU2xpZGVzO1xyXG5cclxuICAgIEBJbnB1dCgpIG1vbnRodmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJTW9udGhWaWV3RGlzcGxheUV2ZW50VGVtcGxhdGVDb250ZXh0PjtcclxuICAgIEBJbnB1dCgpIG1vbnRodmlld0luYWN0aXZlRGlzcGxheUV2ZW50VGVtcGxhdGU6IFRlbXBsYXRlUmVmPElNb250aFZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgbW9udGh2aWV3RXZlbnREZXRhaWxUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SU1vbnRoVmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlQ29udGV4dD47XHJcblxyXG4gICAgQElucHV0KCkgZm9ybWF0RGF5OiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBmb3JtYXREYXlIZWFkZXI6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGZvcm1hdE1vbnRoVGl0bGU6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGV2ZW50U291cmNlOiBJRXZlbnRbXTtcclxuICAgIEBJbnB1dCgpIHN0YXJ0aW5nRGF5TW9udGg6IG51bWJlcjtcclxuICAgIEBJbnB1dCgpIHNob3dFdmVudERldGFpbDogYm9vbGVhbjtcclxuICAgIEBJbnB1dCgpIG5vRXZlbnRzTGFiZWw6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGF1dG9TZWxlY3QgPSB0cnVlO1xyXG4gICAgQElucHV0KCkgbWFya0Rpc2FibGVkOiAoZGF0ZTogRGF0ZSkgPT4gYm9vbGVhbjtcclxuICAgIEBJbnB1dCgpIGxvY2FsZTogc3RyaW5nO1xyXG4gICAgQElucHV0KCkgZGF0ZUZvcm1hdHRlcjogSURhdGVGb3JtYXR0ZXI7XHJcbiAgICBASW5wdXQoKSBkaXIgPSAnJztcclxuICAgIEBJbnB1dCgpIGxvY2tTd2lwZVRvUHJldjogYm9vbGVhbjtcclxuICAgIEBJbnB1dCgpIGxvY2tTd2lwZXM6IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBzbGlkZXJPcHRpb25zOiBhbnk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uUmFuZ2VDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxJUmFuZ2U+KCk7XHJcbiAgICBAT3V0cHV0KCkgb25FdmVudFNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJRXZlbnQ+KCk7XHJcbiAgICBAT3V0cHV0KCkgb25UaW1lU2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElUaW1lU2VsZWN0ZWQ+KHRydWUpO1xyXG4gICAgQE91dHB1dCgpIG9uVGl0bGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KHRydWUpO1xyXG5cclxuICAgIHB1YmxpYyB2aWV3czogSU1vbnRoVmlld1tdID0gW107XHJcbiAgICBwdWJsaWMgY3VycmVudFZpZXdJbmRleCA9IDA7XHJcbiAgICBwdWJsaWMgc2VsZWN0ZWREYXRlOiBJTW9udGhWaWV3Um93O1xyXG4gICAgcHVibGljIHJhbmdlOiBJUmFuZ2U7XHJcbiAgICBwdWJsaWMgbW9kZTogQ2FsZW5kYXJNb2RlID0gJ21vbnRoJztcclxuICAgIHB1YmxpYyBkaXJlY3Rpb24gPSAwO1xyXG5cclxuICAgIHByaXZhdGUgbW92ZU9uU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIHByaXZhdGUgaW5pdGVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrT25Jbml0ID0gdHJ1ZTtcclxuXHJcbiAgICBwcml2YXRlIGN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAgIHByaXZhdGUgZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgICBwcml2YXRlIHNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gICAgcHJpdmF0ZSBzbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgICBwcml2YXRlIGZvcm1hdERheUxhYmVsOiAoZGF0ZTogRGF0ZSkgPT4gc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBmb3JtYXREYXlIZWFkZXJMYWJlbDogKGRhdGU6IERhdGUpID0+IHN0cmluZztcclxuICAgIHByaXZhdGUgZm9ybWF0VGl0bGU6IChkYXRlOiBEYXRlKSA9PiBzdHJpbmc7XHJcblxyXG4gICAgc3RhdGljIGdldERhdGVzKHN0YXJ0RGF0ZTogRGF0ZSwgbjogbnVtYmVyKTogRGF0ZVtdIHtcclxuICAgICAgICBjb25zdCBkYXRlcyA9IG5ldyBBcnJheShuKSxcclxuICAgICAgICAgICAgY3VycmVudCA9IG5ldyBEYXRlKHN0YXJ0RGF0ZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IG4pIHtcclxuICAgICAgICAgICAgZGF0ZXNbaSsrXSA9IG5ldyBEYXRlKGN1cnJlbnQuZ2V0VGltZSgpKTtcclxuICAgICAgICAgICAgY3VycmVudC5zZXREYXRlKGN1cnJlbnQuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkYXRlcztcclxuICAgIH1cclxuXHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2xpZGVyT3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlck9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zbGlkZXJPcHRpb25zLmxvb3AgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5kYXRlRm9ybWF0dGVyICYmIHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdEYXkpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXREYXlMYWJlbCA9IHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdEYXk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGF5TGFiZWxEYXRlUGlwZSA9IG5ldyBEYXRlUGlwZSgnZW4tVVMnKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXREYXlMYWJlbCA9IGZ1bmN0aW9uKGRhdGU6IERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXlMYWJlbERhdGVQaXBlLnRyYW5zZm9ybShkYXRlLCB0aGlzLmZvcm1hdERheSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kYXRlRm9ybWF0dGVyICYmIHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdEYXlIZWFkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXREYXlIZWFkZXJMYWJlbCA9IHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdEYXlIZWFkZXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZVBpcGUgPSBuZXcgRGF0ZVBpcGUodGhpcy5sb2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdERheUhlYWRlckxhYmVsID0gZnVuY3Rpb24oZGF0ZTogRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVQaXBlLnRyYW5zZm9ybShkYXRlLCB0aGlzLmZvcm1hdERheUhlYWRlcik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5kYXRlRm9ybWF0dGVyICYmIHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdUaXRsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFRpdGxlID0gdGhpcy5kYXRlRm9ybWF0dGVyLmZvcm1hdE1vbnRoVmlld1RpdGxlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVQaXBlID0gbmV3IERhdGVQaXBlKHRoaXMubG9jYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXRUaXRsZSA9IGZ1bmN0aW9uKGRhdGU6IERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5mb3JtYXRNb250aFRpdGxlKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvY2tTd2lwZVRvUHJldikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVUb1ByZXYodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2NrU3dpcGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLmxvY2tTd2lwZXModHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50JC5zdWJzY3JpYmUoY3VycmVudERhdGUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuZXZlbnRTb3VyY2VDaGFuZ2VkJC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uRGF0YUxvYWRlZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNsaWRlQ2hhbmdlZCQuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlTmV4dCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlUHJldigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2xpZGVVcGRhdGVkJC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5zbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBldmVudFNvdXJjZUNoYW5nZSA9IGNoYW5nZXMuZXZlbnRTb3VyY2U7XHJcbiAgICAgICAgaWYgKGV2ZW50U291cmNlQ2hhbmdlICYmIGV2ZW50U291cmNlQ2hhbmdlLmN1cnJlbnRWYWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uRGF0YUxvYWRlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9ja1N3aXBlVG9QcmV2ID0gY2hhbmdlcy5sb2NrU3dpcGVUb1ByZXY7XHJcbiAgICAgICAgaWYgKGxvY2tTd2lwZVRvUHJldikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVUb1ByZXYobG9ja1N3aXBlVG9QcmV2LmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb2NrU3dpcGVzID0gY2hhbmdlcy5sb2NrU3dpcGVzO1xyXG4gICAgICAgIGlmIChsb2NrU3dpcGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLmxvY2tTd2lwZXMobG9ja1N3aXBlcy5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmdldFRpdGxlKCk7XHJcbiAgICAgICAgdGhpcy5vblRpdGxlQ2hhbmdlZC5lbWl0KHRpdGxlKTtcclxuICAgIH1cclxuXHJcbiAgICBvblNsaWRlQ2hhbmdlZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5jYWxsYmFja09uSW5pdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrT25Jbml0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSAwO1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3SW5kZXggPSB0aGlzLmN1cnJlbnRWaWV3SW5kZXg7XHJcblxyXG4gICAgICAgIHRoaXMuc2xpZGVyLmdldEFjdGl2ZUluZGV4KCkudGhlbigoY3VycmVudFNsaWRlSW5kZXgpID0+IHtcclxuICAgICAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSAoY3VycmVudFNsaWRlSW5kZXggKyAyKSAlIDM7XHJcbiAgICAgICAgICAgIGlmKGlzTmFOKGN1cnJlbnRTbGlkZUluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSBjdXJyZW50Vmlld0luZGV4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlSW5kZXggLSBjdXJyZW50Vmlld0luZGV4ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTbGlkZUluZGV4ID09PSAwICYmIGN1cnJlbnRWaWV3SW5kZXggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZVRvKDEsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Vmlld0luZGV4IC0gY3VycmVudFNsaWRlSW5kZXggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTbGlkZUluZGV4ID09PSAyICYmIGN1cnJlbnRWaWV3SW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVUbygzLCAwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Vmlld0luZGV4ID0gY3VycmVudFNsaWRlSW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZShkaXJlY3Rpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZGlyZWN0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgICAgIGlmICghdGhpcy5tb3ZlT25TZWxlY3RlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBhZGphY2VudERhdGUgPSB0aGlzLmNhbGVuZGFyU2VydmljZS5nZXRBZGphY2VudENhbGVuZGFyRGF0ZSh0aGlzLm1vZGUsIGRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNldEN1cnJlbnREYXRlKGFkamFjZW50RGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZlT25TZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZURhdGVPYmplY3QoZGF0ZTogRGF0ZSk6IElNb250aFZpZXdSb3cge1xyXG4gICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRoaXMubWFya0Rpc2FibGVkKGRhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGF0ZSxcclxuICAgICAgICAgICAgZXZlbnRzOiBbXSxcclxuICAgICAgICAgICAgbGFiZWw6IHRoaXMuZm9ybWF0RGF5TGFiZWwoZGF0ZSksXHJcbiAgICAgICAgICAgIHNlY29uZGFyeTogZmFsc2UsXHJcbiAgICAgICAgICAgIGRpc2FibGVkXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRWaWV3RGF0YShzdGFydFRpbWU6IERhdGUpOiBJTW9udGhWaWV3IHtcclxuICAgICAgICBjb25zdCBzdGFydERhdGUgPSBzdGFydFRpbWUsXHJcbiAgICAgICAgICAgIGRhdGUgPSBzdGFydERhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICBtb250aCA9IChzdGFydERhdGUuZ2V0TW9udGgoKSArIChkYXRlICE9PSAxID8gMSA6IDApKSAlIDEyO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRlcyA9IE1vbnRoVmlld0NvbXBvbmVudC5nZXREYXRlcyhzdGFydERhdGUsIDQyKTtcclxuICAgICAgICBjb25zdCBkYXlzOiBJTW9udGhWaWV3Um93W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQyOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZU9iamVjdCA9IHRoaXMuY3JlYXRlRGF0ZU9iamVjdChkYXRlc1tpXSk7XHJcbiAgICAgICAgICAgIGRhdGVPYmplY3Quc2Vjb25kYXJ5ID0gZGF0ZXNbaV0uZ2V0TW9udGgoKSAhPT0gbW9udGg7XHJcbiAgICAgICAgICAgIGRheXNbaV0gPSBkYXRlT2JqZWN0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF5SGVhZGVyczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBkYXlIZWFkZXJzLnB1c2godGhpcy5mb3JtYXREYXlIZWFkZXJMYWJlbChkYXlzW2ldLmRhdGUpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZGF0ZXM6IGRheXMsXHJcbiAgICAgICAgICAgIGRheUhlYWRlcnNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGdldEhpZ2hsaWdodENsYXNzKGRhdGU6IElNb250aFZpZXdSb3cpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKGRhdGUuaGFzRXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGUuc2Vjb25kYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAnbW9udGh2aWV3LXNlY29uZGFyeS13aXRoLWV2ZW50JztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9ICdtb250aHZpZXctcHJpbWFyeS13aXRoLWV2ZW50JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGUuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJ21vbnRodmlldy1zZWxlY3RlZCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGF0ZS5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICdtb250aHZpZXctY3VycmVudCc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZGF0ZS5zZWNvbmRhcnkpIHtcclxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJ3RleHQtbXV0ZWQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGUuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJ21vbnRodmlldy1kaXNhYmxlZCc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjbGFzc05hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UmFuZ2UoY3VycmVudERhdGU6IERhdGUpOiBJUmFuZ2Uge1xyXG4gICAgICAgIGNvbnN0IHllYXIgPSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgICBtb250aCA9IGN1cnJlbnREYXRlLmdldE1vbnRoKCksXHJcbiAgICAgICAgICAgIGZpcnN0RGF5T2ZNb250aCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxLCAxMiwgMCwgMCksIC8vIHNldCBob3VyIHRvIDEyIHRvIGF2b2lkIERTVCBwcm9ibGVtXHJcblxyXG4gICAgICAgICAgICBkaWZmZXJlbmNlID0gdGhpcy5zdGFydGluZ0RheU1vbnRoIC0gZmlyc3REYXlPZk1vbnRoLmdldERheSgpLFxyXG4gICAgICAgICAgICBudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA9IChkaWZmZXJlbmNlID4gMCkgPyA3IC0gZGlmZmVyZW5jZSA6IC1kaWZmZXJlbmNlLFxyXG4gICAgICAgICAgICBzdGFydERhdGUgPSBuZXcgRGF0ZShmaXJzdERheU9mTW9udGguZ2V0VGltZSgpKTtcclxuXHJcbiAgICAgICAgaWYgKG51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoID4gMCkge1xyXG4gICAgICAgICAgICBzdGFydERhdGUuc2V0RGF0ZSgtbnVtRGlzcGxheWVkRnJvbVByZXZpb3VzTW9udGggKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShzdGFydERhdGUuZ2V0VGltZSgpKTtcclxuICAgICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgKyA0Mik7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZTogc3RhcnREYXRlLFxyXG4gICAgICAgICAgICBlbmRUaW1lOiBlbmREYXRlXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBvbkRhdGFMb2FkZWQoKSB7XHJcbiAgICAgICAgY29uc3QgcmFuZ2UgPSB0aGlzLnJhbmdlLFxyXG4gICAgICAgICAgICBldmVudFNvdXJjZSA9IHRoaXMuZXZlbnRTb3VyY2UsXHJcbiAgICAgICAgICAgIGxlbiA9IGV2ZW50U291cmNlID8gZXZlbnRTb3VyY2UubGVuZ3RoIDogMCxcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gcmFuZ2Uuc3RhcnRUaW1lLFxyXG4gICAgICAgICAgICBlbmRUaW1lID0gcmFuZ2UuZW5kVGltZSxcclxuICAgICAgICAgICAgdXRjU3RhcnRUaW1lID0gRGF0ZS5VVEMoc3RhcnRUaW1lLmdldEZ1bGxZZWFyKCksIHN0YXJ0VGltZS5nZXRNb250aCgpLCBzdGFydFRpbWUuZ2V0RGF0ZSgpKSxcclxuICAgICAgICAgICAgdXRjRW5kVGltZSA9IERhdGUuVVRDKGVuZFRpbWUuZ2V0RnVsbFllYXIoKSwgZW5kVGltZS5nZXRNb250aCgpLCBlbmRUaW1lLmdldERhdGUoKSksXHJcbiAgICAgICAgICAgIGN1cnJlbnRWaWV3SW5kZXggPSB0aGlzLmN1cnJlbnRWaWV3SW5kZXgsXHJcbiAgICAgICAgICAgIGRhdGVzID0gdGhpcy52aWV3c1tjdXJyZW50Vmlld0luZGV4XS5kYXRlcyxcclxuICAgICAgICAgICAgb25lRGF5ID0gODY0MDAwMDAsXHJcbiAgICAgICAgICAgIGVwcyA9IDAuMDAwNjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCA0MjsgciArPSAxKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlc1tyXS5oYXNFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZXNbcl0uaGFzRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGRhdGVzW3JdLmV2ZW50cyA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRTb3VyY2VbaV0sXHJcbiAgICAgICAgICAgICAgICBldmVudFN0YXJ0VGltZSA9IGV2ZW50LnN0YXJ0VGltZSxcclxuICAgICAgICAgICAgICAgIGV2ZW50RW5kVGltZSA9IGV2ZW50LmVuZFRpbWU7XHJcblxyXG4gICAgICAgICAgICBsZXQgZXZlbnRVVENTdGFydFRpbWU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDRW5kVGltZTogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQuYWxsRGF5KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ1N0YXJ0VGltZSA9IGV2ZW50U3RhcnRUaW1lLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDRW5kVGltZSA9IGV2ZW50RW5kVGltZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ1N0YXJ0VGltZSA9IERhdGUuVVRDKGV2ZW50U3RhcnRUaW1lLmdldEZ1bGxZZWFyKCksIGV2ZW50U3RhcnRUaW1lLmdldE1vbnRoKCksIGV2ZW50U3RhcnRUaW1lLmdldERhdGUoKSk7XHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ0VuZFRpbWUgPSBEYXRlLlVUQyhldmVudEVuZFRpbWUuZ2V0RnVsbFllYXIoKSwgZXZlbnRFbmRUaW1lLmdldE1vbnRoKCksIGV2ZW50RW5kVGltZS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50VVRDRW5kVGltZSA8PSB1dGNTdGFydFRpbWUgfHwgZXZlbnRVVENTdGFydFRpbWUgPj0gdXRjRW5kVGltZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCB0aW1lRGlmZmVyZW5jZVN0YXJ0OiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZUVuZDogbnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50VVRDU3RhcnRUaW1lIDwgdXRjU3RhcnRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZVN0YXJ0ID0gMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlU3RhcnQgPSAoZXZlbnRVVENTdGFydFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lRGF5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnRVVENFbmRUaW1lID4gdXRjRW5kVGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGltZURpZmZlcmVuY2VFbmQgPSAodXRjRW5kVGltZSAtIHV0Y1N0YXJ0VGltZSkgLyBvbmVEYXk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZUVuZCA9IChldmVudFVUQ0VuZFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lRGF5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHRpbWVEaWZmZXJlbmNlU3RhcnQpO1xyXG4gICAgICAgICAgICBjb25zdCBlbmRJbmRleCA9IE1hdGguY2VpbCh0aW1lRGlmZmVyZW5jZUVuZCAtIGVwcyk7XHJcbiAgICAgICAgICAgIHdoaWxlIChpbmRleCA8IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlc1tpbmRleF0uaGFzRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50U2V0ID0gZGF0ZXNbaW5kZXhdLmV2ZW50cztcclxuICAgICAgICAgICAgICAgIGlmIChldmVudFNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50U2V0LnB1c2goZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudFNldCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50U2V0LnB1c2goZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzW2luZGV4XS5ldmVudHMgPSBldmVudFNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDI7IHIgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZXNbcl0uaGFzRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVzW3JdLmV2ZW50cy5zb3J0KHRoaXMuY29tcGFyZUV2ZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1NlbGVjdCkge1xyXG4gICAgICAgICAgICBsZXQgZmluZFNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDI7IHIgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGVzW3JdLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBkYXRlc1tyXTtcclxuICAgICAgICAgICAgICAgICAgICBmaW5kU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmluZFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uVGltZVNlbGVjdGVkLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVGltZTogdGhpcy5zZWxlY3RlZERhdGUuZGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudHM6IHRoaXMuc2VsZWN0ZWREYXRlLmV2ZW50cyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogdGhpcy5zZWxlY3RlZERhdGUuZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hWaWV3KCkge1xyXG4gICAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLmdldFJhbmdlKHRoaXMuY2FsZW5kYXJTZXJ2aWNlLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uVGl0bGVDaGFuZ2VkLmVtaXQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5wb3B1bGF0ZUFkamFjZW50Vmlld3ModGhpcyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDdXJyZW50Vmlldyh0aGlzLnJhbmdlLnN0YXJ0VGltZSwgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3SW5kZXhdKTtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5yYW5nZUNoYW5nZWQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Vmlld1N0YXJ0RGF0ZSA9IHRoaXMucmFuZ2Uuc3RhcnRUaW1lLFxyXG4gICAgICAgICAgICBkYXRlID0gY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RGF0ZSgpLFxyXG4gICAgICAgICAgICBtb250aCA9IChjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRNb250aCgpICsgKGRhdGUgIT09IDEgPyAxIDogMCkpICUgMTIsXHJcbiAgICAgICAgICAgIHllYXIgPSBjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpICsgKGRhdGUgIT09IDEgJiYgbW9udGggPT09IDAgPyAxIDogMCksXHJcbiAgICAgICAgICAgIGhlYWRlckRhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSwgMTIsIDAsIDAsIDApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdFRpdGxlKGhlYWRlckRhdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29tcGFyZUV2ZW50KGV2ZW50MTogSUV2ZW50LCBldmVudDI6IElFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGV2ZW50MS5hbGxEYXkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChldmVudDIuYWxsRGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gKGV2ZW50MS5zdGFydFRpbWUuZ2V0VGltZSgpIC0gZXZlbnQyLnN0YXJ0VGltZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3Qodmlld0RhdGU6IElNb250aFZpZXdSb3cpIHtcclxuICAgICAgICBpZiAoIXRoaXMudmlld3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWREYXRlID0gdmlld0RhdGUuZGF0ZSxcclxuICAgICAgICAgICAgZXZlbnRzID0gdmlld0RhdGUuZXZlbnRzO1xyXG5cclxuICAgICAgICBpZiAoIXZpZXdEYXRlLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVzID0gdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3SW5kZXhdLmRhdGVzLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudENhbGVuZGFyRGF0ZSA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLmN1cnJlbnREYXRlLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudE1vbnRoID0gY3VycmVudENhbGVuZGFyRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICAgICAgY3VycmVudFllYXIgPSBjdXJyZW50Q2FsZW5kYXJEYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZE1vbnRoID0gc2VsZWN0ZWREYXRlLmdldE1vbnRoKCksXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFllYXIgPSBzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFllYXIgPT09IHNlbGVjdGVkWWVhcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRNb250aCAhPT0gc2VsZWN0ZWRNb250aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IGN1cnJlbnRNb250aCA8IHNlbGVjdGVkTW9udGggPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjdXJyZW50WWVhciA8IHNlbGVjdGVkWWVhciA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2V0Q3VycmVudERhdGUoc2VsZWN0ZWREYXRlKTtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFZpZXdTdGFydERhdGUgPSB0aGlzLnJhbmdlLnN0YXJ0VGltZSxcclxuICAgICAgICAgICAgICAgICAgICBvbmVEYXkgPSA4NjQwMDAwMCxcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZERheURpZmZlcmVuY2UgPSBNYXRoLnJvdW5kKChEYXRlLlVUQyhzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSwgc2VsZWN0ZWREYXRlLmdldE1vbnRoKCksIHNlbGVjdGVkRGF0ZS5nZXREYXRlKCkpIC0gRGF0ZS5VVEMoY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RnVsbFllYXIoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0TW9udGgoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RGF0ZSgpKSkgLyBvbmVEYXkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDI7IHIgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzW3JdLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA+PSAwICYmIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA8IDQyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZXNbc2VsZWN0ZWREYXlEaWZmZXJlbmNlXS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSBkYXRlc1tzZWxlY3RlZERheURpZmZlcmVuY2VdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlT25TZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlVmlldyhkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9uVGltZVNlbGVjdGVkLmVtaXQoe3NlbGVjdGVkVGltZTogc2VsZWN0ZWREYXRlLCBldmVudHMsIGRpc2FibGVkOiB2aWV3RGF0ZS5kaXNhYmxlZH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNsaWRlVmlldyhkaXJlY3Rpb246IG51bWJlcikge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVOZXh0KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlUHJldigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVDdXJyZW50VmlldyhjdXJyZW50Vmlld1N0YXJ0RGF0ZTogRGF0ZSwgdmlldzogSU1vbnRoVmlldykge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDYWxlbmRhckRhdGUgPSB0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZSxcclxuICAgICAgICAgICAgdG9kYXkgPSBuZXcgRGF0ZSgpLFxyXG4gICAgICAgICAgICBvbmVEYXkgPSA4NjQwMDAwMCxcclxuICAgICAgICAgICAgc2VsZWN0ZWREYXlEaWZmZXJlbmNlID0gTWF0aC5yb3VuZCgoRGF0ZS5VVEMoY3VycmVudENhbGVuZGFyRGF0ZS5nZXRGdWxsWWVhcigpLCBjdXJyZW50Q2FsZW5kYXJEYXRlLmdldE1vbnRoKCksIGN1cnJlbnRDYWxlbmRhckRhdGUuZ2V0RGF0ZSgpKSAtIERhdGUuVVRDKGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldE1vbnRoKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldERhdGUoKSkpIC8gb25lRGF5KSxcclxuICAgICAgICAgICAgY3VycmVudERheURpZmZlcmVuY2UgPSBNYXRoLnJvdW5kKChEYXRlLlVUQyh0b2RheS5nZXRGdWxsWWVhcigpLCB0b2RheS5nZXRNb250aCgpLCB0b2RheS5nZXREYXRlKCkpIC0gRGF0ZS5VVEMoY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RnVsbFllYXIoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0TW9udGgoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RGF0ZSgpKSkgLyBvbmVEYXkpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDQyOyByICs9IDEpIHtcclxuICAgICAgICAgICAgdmlldy5kYXRlc1tyXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA+PSAwICYmIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA8IDQyICYmICF2aWV3LmRhdGVzW3NlbGVjdGVkRGF5RGlmZmVyZW5jZV0uZGlzYWJsZWQgJiYgKHRoaXMuYXV0b1NlbGVjdCB8fCB0aGlzLm1vdmVPblNlbGVjdGVkKSkge1xyXG4gICAgICAgICAgICB2aWV3LmRhdGVzW3NlbGVjdGVkRGF5RGlmZmVyZW5jZV0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IHZpZXcuZGF0ZXNbc2VsZWN0ZWREYXlEaWZmZXJlbmNlXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkRGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnk6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZDogZmFsc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChjdXJyZW50RGF5RGlmZmVyZW5jZSA+PSAwICYmIGN1cnJlbnREYXlEaWZmZXJlbmNlIDwgNDIpIHtcclxuICAgICAgICAgICAgdmlldy5kYXRlc1tjdXJyZW50RGF5RGlmZmVyZW5jZV0uY3VycmVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGV2ZW50U2VsZWN0ZWQoZXZlbnQ6IElFdmVudCkge1xyXG4gICAgICAgIHRoaXMub25FdmVudFNlbGVjdGVkLmVtaXQoZXZlbnQpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==