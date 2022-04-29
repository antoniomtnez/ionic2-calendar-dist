var DayViewComponent_1;
import { __decorate } from "tslib";
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnChanges, HostBinding, Input, Output, EventEmitter, SimpleChanges, ViewChild, ViewEncapsulation, TemplateRef, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CalendarService } from './calendar.service';
let DayViewComponent = DayViewComponent_1 = class DayViewComponent {
    constructor(calendarService, elm) {
        this.calendarService = calendarService;
        this.elm = elm;
        this.class = true;
        this.dir = '';
        this.scrollToHour = 0;
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter(true);
        this.views = [];
        this.currentViewIndex = 0;
        this.direction = 0;
        this.mode = 'day';
        this.inited = false;
        this.callbackOnInit = true;
    }
    static createDateObjects(startTime, startHour, endHour, timeInterval) {
        const rows = [], currentHour = 0, currentDate = startTime.getDate();
        let time, hourStep, minStep;
        if (timeInterval < 1) {
            hourStep = Math.floor(1 / timeInterval);
            minStep = 60;
        }
        else {
            hourStep = 1;
            minStep = Math.floor(60 / timeInterval);
        }
        for (let hour = startHour; hour < endHour; hour += hourStep) {
            for (let interval = 0; interval < 60; interval += minStep) {
                time = new Date(startTime.getTime());
                time.setHours(currentHour + hour, interval);
                time.setDate(currentDate);
                rows.push({
                    time,
                    events: []
                });
            }
        }
        return rows;
    }
    static compareEventByStartOffset(eventA, eventB) {
        return eventA.startOffset - eventB.startOffset;
    }
    static calculateWidth(orderedEvents, size, hourParts) {
        const totalSize = size * hourParts, cells = new Array(totalSize);
        // sort by position in descending order, the right most columns should be calculated first
        orderedEvents.sort((eventA, eventB) => {
            return eventB.position - eventA.position;
        });
        for (let i = 0; i < totalSize; i += 1) {
            cells[i] = {
                calculated: false,
                events: []
            };
        }
        const len = orderedEvents.length;
        for (let i = 0; i < len; i += 1) {
            const event = orderedEvents[i];
            let index = event.startIndex * hourParts + event.startOffset;
            while (index < event.endIndex * hourParts - event.endOffset) {
                cells[index].events.push(event);
                index += 1;
            }
        }
        let i = 0;
        while (i < len) {
            let event = orderedEvents[i];
            if (!event.overlapNumber) {
                const overlapNumber = event.position + 1;
                event.overlapNumber = overlapNumber;
                const eventQueue = [event];
                while (event = eventQueue.shift()) {
                    let index = event.startIndex * hourParts + event.startOffset;
                    while (index < event.endIndex * hourParts - event.endOffset) {
                        if (!cells[index].calculated) {
                            cells[index].calculated = true;
                            if (cells[index].events) {
                                const eventCountInCell = cells[index].events.length;
                                for (let j = 0; j < eventCountInCell; j += 1) {
                                    const currentEventInCell = cells[index].events[j];
                                    if (!currentEventInCell.overlapNumber) {
                                        currentEventInCell.overlapNumber = overlapNumber;
                                        eventQueue.push(currentEventInCell);
                                    }
                                }
                            }
                        }
                        index += 1;
                    }
                }
            }
            i += 1;
        }
    }
    ngOnInit() {
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
        if (this.dateFormatter && this.dateFormatter.formatDayViewTitle) {
            this.formatTitle = this.dateFormatter.formatDayViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatDayTitle);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatDayViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatDayViewHourColumn;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatHourColumnLabel = function (date) {
                return datePipe.transform(date, this.formatHourColumn);
            };
        }
        if (this.lockSwipeToPrev) {
            this.slider.lockSwipeToPrev(true);
        }
        if (this.lockSwipes) {
            this.slider.lockSwipes(true);
        }
        this.refreshView();
        this.hourColumnLabels = this.getHourColumnLabels();
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
    ngAfterViewInit() {
        const title = this.getTitle();
        this.onTitleChanged.emit(title);
        if (this.scrollToHour > 0) {
            const hourColumns = this.elm.nativeElement.querySelector('.dayview-normal-event-container').querySelectorAll('.calendar-hour-column');
            const me = this;
            setTimeout(() => {
                me.initScrollPosition = hourColumns[me.scrollToHour - me.startHour].offsetTop;
            }, 50);
        }
    }
    ngOnChanges(changes) {
        if (!this.inited) {
            return;
        }
        if ((changes.startHour || changes.endHour) && (!changes.startHour.isFirstChange() || !changes.endHour.isFirstChange())) {
            this.views = undefined;
            this.hourRange = (this.endHour - this.startHour) * this.hourSegments;
            this.direction = 0;
            this.refreshView();
            this.hourColumnLabels = this.getHourColumnLabels();
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
        const adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacentDate);
        this.refreshView();
        this.direction = 0;
    }
    getHourColumnLabels() {
        const hourColumnLabels = [];
        for (let hour = 0, length = this.views[0].rows.length; hour < length; hour += 1) {
            // handle edge case for DST
            if (hour === 0 && this.views[0].rows[hour].time.getHours() !== this.startHour) {
                const time = new Date(this.views[0].rows[hour].time);
                time.setDate(time.getDate() + 1);
                time.setHours(this.startHour);
                hourColumnLabels.push(this.formatHourColumnLabel(time));
            }
            else {
                hourColumnLabels.push(this.formatHourColumnLabel(this.views[0].rows[hour].time));
            }
        }
        return hourColumnLabels;
    }
    getViewData(startTime) {
        return {
            rows: DayViewComponent_1.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            allDayEvents: []
        };
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), date = currentDate.getDate(), startTime = new Date(year, month, date, 12, 0, 0), endTime = new Date(year, month, date + 1, 12, 0, 0);
        return {
            startTime,
            endTime
        };
    }
    onDataLoaded() {
        const eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = this.range.startTime, endTime = this.range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, rows = this.views[currentViewIndex].rows, allDayEvents = this.views[currentViewIndex].allDayEvents = [], oneHour = 3600000, eps = 0.016, rangeStartRowIndex = this.startHour * this.hourSegments, rangeEndRowIndex = this.endHour * this.hourSegments;
        let normalEventInRange = false;
        for (let hour = 0; hour < this.hourRange; hour += 1) {
            rows[hour].events = [];
        }
        for (let i = 0; i < len; i += 1) {
            const event = eventSource[i];
            const eventStartTime = event.startTime;
            const eventEndTime = event.endTime;
            let eventUTCStartTime, eventUTCEndTime;
            if (event.allDay) {
                eventUTCStartTime = eventStartTime.getTime();
                eventUTCEndTime = eventEndTime.getTime();
            }
            else {
                eventUTCStartTime = Date.UTC(eventStartTime.getFullYear(), eventStartTime.getMonth(), eventStartTime.getDate());
                eventUTCEndTime = Date.UTC(eventEndTime.getFullYear(), eventEndTime.getMonth(), eventEndTime.getDate() + 1);
            }
            if (eventUTCEndTime <= utcStartTime || eventUTCStartTime >= utcEndTime || eventStartTime >= eventEndTime) {
                continue;
            }
            if (event.allDay) {
                allDayEvents.push({
                    event
                });
            }
            else {
                normalEventInRange = true;
                let timeDifferenceStart;
                if (eventUTCStartTime < utcStartTime) {
                    timeDifferenceStart = 0;
                }
                else {
                    timeDifferenceStart = (eventStartTime.getHours() + eventStartTime.getMinutes() / 60) * this.hourSegments;
                }
                let timeDifferenceEnd;
                if (eventUTCEndTime > utcEndTime) {
                    timeDifferenceEnd = (utcEndTime - utcStartTime) / oneHour * this.hourSegments;
                }
                else {
                    timeDifferenceEnd = (eventEndTime.getHours() + eventEndTime.getMinutes() / 60) * this.hourSegments;
                }
                let startIndex = Math.floor(timeDifferenceStart);
                let endIndex = Math.ceil(timeDifferenceEnd - eps);
                let startOffset = 0;
                let endOffset = 0;
                if (this.hourParts !== 1) {
                    if (startIndex < rangeStartRowIndex) {
                        startOffset = 0;
                    }
                    else {
                        startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                    }
                    if (endIndex > rangeEndRowIndex) {
                        endOffset = 0;
                    }
                    else {
                        endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                    }
                }
                if (startIndex < rangeStartRowIndex) {
                    startIndex = 0;
                }
                else {
                    startIndex -= rangeStartRowIndex;
                }
                if (endIndex > rangeEndRowIndex) {
                    endIndex = rangeEndRowIndex;
                }
                endIndex -= rangeStartRowIndex;
                if (startIndex < endIndex) {
                    const displayEvent = {
                        event,
                        startIndex,
                        endIndex,
                        startOffset,
                        endOffset
                    };
                    let eventSet = rows[startIndex].events;
                    if (eventSet) {
                        eventSet.push(displayEvent);
                    }
                    else {
                        eventSet = [];
                        eventSet.push(displayEvent);
                        rows[startIndex].events = eventSet;
                    }
                }
            }
        }
        if (normalEventInRange) {
            let orderedEvents = [];
            for (let hour = 0; hour < this.hourRange; hour += 1) {
                if (rows[hour].events) {
                    rows[hour].events.sort(DayViewComponent_1.compareEventByStartOffset);
                    orderedEvents = orderedEvents.concat(rows[hour].events);
                }
            }
            if (orderedEvents.length > 0) {
                this.placeEvents(orderedEvents);
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
        this.calendarService.rangeChanged(this);
    }
    getTitle() {
        const startingDate = new Date(this.range.startTime.getTime());
        startingDate.setHours(12, 0, 0, 0);
        return this.formatTitle(startingDate);
    }
    select(selectedTime, events) {
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedTime);
        }
        this.onTimeSelected.emit({
            selectedTime,
            events: events.map(e => e.event),
            disabled
        });
    }
    placeEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
        DayViewComponent_1.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
    }
    placeAllDayEvents(orderedEvents) {
        this.calculatePosition(orderedEvents);
    }
    overlap(event1, event2) {
        let earlyEvent = event1, lateEvent = event2;
        if (event1.startIndex > event2.startIndex || (event1.startIndex === event2.startIndex && event1.startOffset > event2.startOffset)) {
            earlyEvent = event2;
            lateEvent = event1;
        }
        if (earlyEvent.endIndex <= lateEvent.startIndex) {
            return false;
        }
        else {
            return !(earlyEvent.endIndex - lateEvent.startIndex === 1 && earlyEvent.endOffset + lateEvent.startOffset >= this.hourParts);
        }
    }
    calculatePosition(events) {
        const len = events.length, isForbidden = new Array(len);
        let maxColumn = 0, col;
        for (let i = 0; i < len; i += 1) {
            for (col = 0; col < maxColumn; col += 1) {
                isForbidden[col] = false;
            }
            for (let j = 0; j < i; j += 1) {
                if (this.overlap(events[i], events[j])) {
                    isForbidden[events[j].position] = true;
                }
            }
            for (col = 0; col < maxColumn; col += 1) {
                if (!isForbidden[col]) {
                    break;
                }
            }
            if (col < maxColumn) {
                events[i].position = col;
            }
            else {
                events[i].position = maxColumn++;
            }
        }
        if (this.dir === 'rtl') {
            for (let i = 0; i < len; i += 1) {
                events[i].position = maxColumn - 1 - events[i].position;
            }
        }
    }
    eventSelected(event) {
        this.onEventSelected.emit(event);
    }
    setScrollPosition(scrollPosition) {
        this.initScrollPosition = scrollPosition;
    }
};
DayViewComponent.ctorParameters = () => [
    { type: CalendarService },
    { type: ElementRef }
];
__decorate([
    ViewChild('daySlider', { static: true })
], DayViewComponent.prototype, "slider", void 0);
__decorate([
    HostBinding('class.dayview')
], DayViewComponent.prototype, "class", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewAllDayEventTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewNormalEventTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewInactiveAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dayviewInactiveNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "formatHourColumn", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "formatDayTitle", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "allDayLabel", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "hourParts", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "eventSource", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "markDisabled", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "locale", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dateFormatter", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "dir", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "scrollToHour", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "preserveScrollPosition", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "lockSwipeToPrev", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "lockSwipes", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "startHour", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "endHour", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "sliderOptions", void 0);
__decorate([
    Input()
], DayViewComponent.prototype, "hourSegments", void 0);
__decorate([
    Output()
], DayViewComponent.prototype, "onRangeChanged", void 0);
__decorate([
    Output()
], DayViewComponent.prototype, "onEventSelected", void 0);
__decorate([
    Output()
], DayViewComponent.prototype, "onTimeSelected", void 0);
__decorate([
    Output()
], DayViewComponent.prototype, "onTitleChanged", void 0);
DayViewComponent = DayViewComponent_1 = __decorate([
    Component({
        selector: 'dayview',
        template: `
        <ion-slides #daySlider [options]="sliderOptions" [dir]="dir" (ionSlideDidChange)="onSlideChanged()" class="slides-container">
            <ion-slide class="slide-container">
                <div class="dayview-allday-table">
                    <div class="dayview-allday-label">{{allDayLabel}}</div>
                    <div class="dayview-allday-content-wrapper scroll-content">
                        <table class="table table-bordered dayview-allday-content-table">
                            <tbody>
                            <tr>
                                <td class="calendar-cell" [ngClass]="{'calendar-event-wrap':views[0].allDayEvents.length>0}"
                                    [ngStyle]="{height: 25*views[0].allDayEvents.length+'px'}"
                                    *ngIf="0===currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[0].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}">
                                    </ng-template>
                                </td>
                                <td class="calendar-cell" *ngIf="0!==currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewInactiveAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[0].allDayEvents}">
                                    </ng-template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <init-position-scroll *ngIf="0===currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition" [emitEvent]="preserveScrollPosition"
                                      (onScroll)="setScrollPosition($event)">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[0].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell" tappable (click)="select(tm.time, tm.events)">
                                <ng-template [ngTemplateOutlet]="dayviewNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
                <init-position-scroll *ngIf="0!==currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[0].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell">
                                <ng-template [ngTemplateOutlet]="dayviewInactiveNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
            </ion-slide>
            <ion-slide class="slide-container">
                <div class="dayview-allday-table">
                    <div class="dayview-allday-label">{{allDayLabel}}</div>
                    <div class="dayview-allday-content-wrapper scroll-content">
                        <table class="table table-bordered dayview-allday-content-table">
                            <tbody>
                            <tr>
                                <td class="calendar-cell" [ngClass]="{'calendar-event-wrap':views[1].allDayEvents.length>0}"
                                    [ngStyle]="{height: 25*views[1].allDayEvents.length+'px'}"
                                    *ngIf="1===currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[1].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}">
                                    </ng-template>
                                </td>
                                <td class="calendar-cell" *ngIf="1!==currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewInactiveAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[1].allDayEvents}">
                                    </ng-template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <init-position-scroll *ngIf="1===currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition" [emitEvent]="preserveScrollPosition"
                                      (onScroll)="setScrollPosition($event)">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[1].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell" tappable (click)="select(tm.time, tm.events)">
                                <ng-template [ngTemplateOutlet]="dayviewNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
                <init-position-scroll *ngIf="1!==currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[1].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell">
                                <ng-template [ngTemplateOutlet]="dayviewInactiveNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
            </ion-slide>
            <ion-slide class="slide-container">
                <div class="dayview-allday-table">
                    <div class="dayview-allday-label">{{allDayLabel}}</div>
                    <div class="dayview-allday-content-wrapper scroll-content">
                        <table class="table table-bordered dayview-allday-content-table">
                            <tbody>
                            <tr>
                                <td class="calendar-cell" [ngClass]="{'calendar-event-wrap':views[2].allDayEvents.length>0}"
                                    [ngStyle]="{height: 25*views[2].allDayEvents.length+'px'}"
                                    *ngIf="2===currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[2].allDayEvents,eventTemplate:dayviewAllDayEventTemplate}">
                                    </ng-template>
                                </td>
                                <td class="calendar-cell" *ngIf="2!==currentViewIndex">
                                    <ng-template [ngTemplateOutlet]="dayviewInactiveAllDayEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{allDayEvents:views[2].allDayEvents}">
                                    </ng-template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <init-position-scroll *ngIf="2===currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition" [emitEvent]="preserveScrollPosition"
                                      (onScroll)="setScrollPosition($event)">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[2].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell" tappable (click)="select(tm.time, tm.events)">
                                <ng-template [ngTemplateOutlet]="dayviewNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:dayviewNormalEventTemplate}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
                <init-position-scroll *ngIf="2!==currentViewIndex" class="dayview-normal-event-container"
                                      [initPosition]="initScrollPosition">
                    <table class="table table-bordered table-fixed dayview-normal-event-table">
                        <tbody>
                        <tr *ngFor="let tm of views[2].rows; let i = index">
                            <td class="calendar-hour-column text-center">
                                {{hourColumnLabels[i]}}
                            </td>
                            <td class="calendar-cell">
                                <ng-template [ngTemplateOutlet]="dayviewInactiveNormalEventSectionTemplate"
                                             [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                </ng-template>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </init-position-scroll>
            </ion-slide>
        </ion-slides>
    `,
        encapsulation: ViewEncapsulation.None,
        styles: [`
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

        .calendar-hour-column {
            width: 50px;
            white-space: nowrap;
        }

        .calendar-event-wrap {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .calendar-event {
            position: absolute;
            padding: 2px;
            cursor: pointer;
            z-index: 10000;
        }

        .slides-container {
            height: 100%;
        }

        .slide-container {
            display: block;
        }

        .calendar-cell {
            padding: 0 !important;
            height: 37px;
        }

        .dayview-allday-label {
            float: left;
            height: 100%;
            line-height: 50px;
            text-align: center;
            width: 50px;
            border-left: 1px solid #ddd;
        }

        [dir="rtl"] .dayview-allday-label {
            border-right: 1px solid #ddd;
            float: right;
        }

        .dayview-allday-content-wrapper {
            margin-left: 50px;
            overflow: hidden;
            height: 51px;
        }

        [dir="rtl"] .dayview-allday-content-wrapper {
            margin-left: 0;
            margin-right: 50px;
        }

        .dayview-allday-content-table {
            min-height: 50px;
        }

        .dayview-allday-content-table td {
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }

        .dayview-allday-table {
            height: 50px;
            position: relative;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
        }

        .dayview-normal-event-container {
            margin-top: 50px;
            overflow: hidden;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            position: absolute;
            font-size: 14px;
        }

        .scroll-content {
            overflow-y: auto;
            overflow-x: hidden;
        }

        ::-webkit-scrollbar,
        *::-webkit-scrollbar {
            display: none;
        }

        .table > tbody > tr > td.calendar-hour-column {
            padding-left: 0;
            padding-right: 0;
            vertical-align: middle;
        }

        @media (max-width: 750px) {
            .dayview-allday-label, .calendar-hour-column {
                width: 31px;
                font-size: 12px;
            }

            .dayview-allday-label {
                padding-top: 4px;
            }

            .table > tbody > tr > td.calendar-hour-column {
                padding-left: 0;
                padding-right: 0;
                vertical-align: middle;
                line-height: 12px;
            }

            .dayview-allday-label {
                line-height: 20px;
            }

            .dayview-allday-content-wrapper {
                margin-left: 31px;
            }

            [dir="rtl"] .dayview-allday-content-wrapper {
                margin-left: 0;
                margin-right: 31px;
            }
        }
    `]
    })
], DayViewComponent);
export { DayViewComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF5dmlldy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL2lvbmljMi1jYWxlbmRhci8iLCJzb3VyY2VzIjpbImRheXZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFekMsT0FBTyxFQUNILFNBQVMsRUFDVCxNQUFNLEVBQ04sU0FBUyxFQUNULFdBQVcsRUFDWCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixhQUFhLEVBQ2IsU0FBUyxFQUNULGlCQUFpQixFQUNqQixXQUFXLEVBQ1gsVUFBVSxFQUNWLGFBQWEsRUFBRSxTQUFTLEVBQzNCLE1BQU0sZUFBZSxDQUFDO0FBY3ZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQWlYbkQsSUFBYSxnQkFBZ0Isd0JBQTdCLE1BQWEsZ0JBQWdCO0lBRXpCLFlBQW9CLGVBQWdDLEVBQVUsR0FBZTtRQUF6RCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFZO1FBSS9DLFVBQUssR0FBRyxJQUFJLENBQUM7UUFpQmxDLFFBQUcsR0FBRyxFQUFFLENBQUM7UUFDVCxpQkFBWSxHQUFHLENBQUMsQ0FBQztRQVNoQixtQkFBYyxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFDNUMsb0JBQWUsR0FBRyxJQUFJLFlBQVksRUFBVSxDQUFDO1FBQzdDLG1CQUFjLEdBQUcsSUFBSSxZQUFZLEVBQWlCLENBQUM7UUFDbkQsbUJBQWMsR0FBRyxJQUFJLFlBQVksQ0FBUyxJQUFJLENBQUMsQ0FBQztRQUVuRCxVQUFLLEdBQWUsRUFBRSxDQUFDO1FBQ3ZCLHFCQUFnQixHQUFHLENBQUMsQ0FBQztRQUNyQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsU0FBSSxHQUFpQixLQUFLLENBQUM7UUFHMUIsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUNmLG1CQUFjLEdBQUcsSUFBSSxDQUFDO0lBMUM5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dUxUO1FBbUxELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO2lCQWxMNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQWlMUjtLQUVKLENBQUM7R0FDVyxnQkFBZ0IsQ0FzakI1QjtTQXRqQlksZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtEYXRlUGlwZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtJb25TbGlkZXN9IGZyb20gJ0Bpb25pYy9hbmd1bGFyJztcclxuaW1wb3J0IHtcclxuICAgIENvbXBvbmVudCxcclxuICAgIE9uSW5pdCxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIEhvc3RCaW5kaW5nLFxyXG4gICAgSW5wdXQsXHJcbiAgICBPdXRwdXQsXHJcbiAgICBFdmVudEVtaXR0ZXIsXHJcbiAgICBTaW1wbGVDaGFuZ2VzLFxyXG4gICAgVmlld0NoaWxkLFxyXG4gICAgVmlld0VuY2Fwc3VsYXRpb24sXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIEVsZW1lbnRSZWYsXHJcbiAgICBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3lcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIElDYWxlbmRhckNvbXBvbmVudCxcclxuICAgIElEYXlWaWV3LFxyXG4gICAgSURheVZpZXdSb3csXHJcbiAgICBJRGlzcGxheUV2ZW50LFxyXG4gICAgSUV2ZW50LFxyXG4gICAgSVRpbWVTZWxlY3RlZCxcclxuICAgIElSYW5nZSxcclxuICAgIENhbGVuZGFyTW9kZSxcclxuICAgIElEYXRlRm9ybWF0dGVyXHJcbn0gZnJvbSAnLi9jYWxlbmRhcic7XHJcbmltcG9ydCB7Q2FsZW5kYXJTZXJ2aWNlfSBmcm9tICcuL2NhbGVuZGFyLnNlcnZpY2UnO1xyXG5pbXBvcnQge0lEaXNwbGF5QWxsRGF5RXZlbnQsIElEYXlWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0LCBJRGF5Vmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dH0gZnJvbSAnLi9jYWxlbmRhcic7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAnZGF5dmlldycsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxpb24tc2xpZGVzICNkYXlTbGlkZXIgW29wdGlvbnNdPVwic2xpZGVyT3B0aW9uc1wiIFtkaXJdPVwiZGlyXCIgKGlvblNsaWRlRGlkQ2hhbmdlKT1cIm9uU2xpZGVDaGFuZ2VkKClcIiBjbGFzcz1cInNsaWRlcy1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgPGlvbi1zbGlkZSBjbGFzcz1cInNsaWRlLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheXZpZXctYWxsZGF5LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheXZpZXctYWxsZGF5LWxhYmVsXCI+e3thbGxEYXlMYWJlbH19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRheXZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciBzY3JvbGwtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCBkYXl2aWV3LWFsbGRheS1jb250ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiIFtuZ0NsYXNzXT1cInsnY2FsZW5kYXItZXZlbnQtd3JhcCc6dmlld3NbMF0uYWxsRGF5RXZlbnRzLmxlbmd0aD4wfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1N0eWxlXT1cIntoZWlnaHQ6IDI1KnZpZXdzWzBdLmFsbERheUV2ZW50cy5sZW5ndGgrJ3B4J31cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqbmdJZj1cIjA9PT1jdXJyZW50Vmlld0luZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJkYXl2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInthbGxEYXlFdmVudHM6dmlld3NbMF0uYWxsRGF5RXZlbnRzLGV2ZW50VGVtcGxhdGU6ZGF5dmlld0FsbERheUV2ZW50VGVtcGxhdGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCIgKm5nSWY9XCIwIT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwiZGF5dmlld0luYWN0aXZlQWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInthbGxEYXlFdmVudHM6dmlld3NbMF0uYWxsRGF5RXZlbnRzfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGluaXQtcG9zaXRpb24tc2Nyb2xsICpuZ0lmPVwiMD09PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cImRheXZpZXctbm9ybWFsLWV2ZW50LWNvbnRhaW5lclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2luaXRQb3NpdGlvbl09XCJpbml0U2Nyb2xsUG9zaXRpb25cIiBbZW1pdEV2ZW50XT1cInByZXNlcnZlU2Nyb2xsUG9zaXRpb25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChvblNjcm9sbCk9XCJzZXRTY3JvbGxQb3NpdGlvbigkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgZGF5dmlldy1ub3JtYWwtZXZlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHRtIG9mIHZpZXdzWzBdLnJvd3M7IGxldCBpID0gaW5kZXhcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3tob3VyQ29sdW1uTGFiZWxzW2ldfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCIgdGFwcGFibGUgKGNsaWNrKT1cInNlbGVjdCh0bS50aW1lLCB0bS5ldmVudHMpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImRheXZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dG06dG0sIGhvdXJQYXJ0czogaG91clBhcnRzLCBldmVudFRlbXBsYXRlOmRheXZpZXdOb3JtYWxFdmVudFRlbXBsYXRlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICA8L2luaXQtcG9zaXRpb24tc2Nyb2xsPlxyXG4gICAgICAgICAgICAgICAgPGluaXQtcG9zaXRpb24tc2Nyb2xsICpuZ0lmPVwiMCE9PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cImRheXZpZXctbm9ybWFsLWV2ZW50LWNvbnRhaW5lclwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2luaXRQb3NpdGlvbl09XCJpbml0U2Nyb2xsUG9zaXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBkYXl2aWV3LW5vcm1hbC1ldmVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgdG0gb2Ygdmlld3NbMF0ucm93czsgbGV0IGkgPSBpbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItaG91ci1jb2x1bW4gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e2hvdXJDb2x1bW5MYWJlbHNbaV19fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWNlbGxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwiZGF5dmlld0luYWN0aXZlTm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3RtOnRtLCBob3VyUGFydHM6IGhvdXJQYXJ0c31cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9pbml0LXBvc2l0aW9uLXNjcm9sbD5cclxuICAgICAgICAgICAgPC9pb24tc2xpZGU+XHJcbiAgICAgICAgICAgIDxpb24tc2xpZGUgY2xhc3M9XCJzbGlkZS1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXl2aWV3LWFsbGRheS10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXl2aWV3LWFsbGRheS1sYWJlbFwiPnt7YWxsRGF5TGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkYXl2aWV3LWFsbGRheS1jb250ZW50LXdyYXBwZXIgc2Nyb2xsLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgZGF5dmlldy1hbGxkYXktY29udGVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWNlbGxcIiBbbmdDbGFzc109XCJ7J2NhbGVuZGFyLWV2ZW50LXdyYXAnOnZpZXdzWzFdLmFsbERheUV2ZW50cy5sZW5ndGg+MH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJ7aGVpZ2h0OiAyNSp2aWV3c1sxXS5hbGxEYXlFdmVudHMubGVuZ3RoKydweCd9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKm5nSWY9XCIxPT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwiZGF5dmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7YWxsRGF5RXZlbnRzOnZpZXdzWzFdLmFsbERheUV2ZW50cyxldmVudFRlbXBsYXRlOmRheXZpZXdBbGxEYXlFdmVudFRlbXBsYXRlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiICpuZ0lmPVwiMSE9PWN1cnJlbnRWaWV3SW5kZXhcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImRheXZpZXdJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7YWxsRGF5RXZlbnRzOnZpZXdzWzFdLmFsbERheUV2ZW50c31cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxpbml0LXBvc2l0aW9uLXNjcm9sbCAqbmdJZj1cIjE9PT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJkYXl2aWV3LW5vcm1hbC1ldmVudC1jb250YWluZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtpbml0UG9zaXRpb25dPVwiaW5pdFNjcm9sbFBvc2l0aW9uXCIgW2VtaXRFdmVudF09XCJwcmVzZXJ2ZVNjcm9sbFBvc2l0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAob25TY3JvbGwpPVwic2V0U2Nyb2xsUG9zaXRpb24oJGV2ZW50KVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIGRheXZpZXctbm9ybWFsLWV2ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCB0bSBvZiB2aWV3c1sxXS5yb3dzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1ob3VyLWNvbHVtbiB0ZXh0LWNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7aG91ckNvbHVtbkxhYmVsc1tpXX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiIHRhcHBhYmxlIChjbGljayk9XCJzZWxlY3QodG0udGltZSwgdG0uZXZlbnRzKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJkYXl2aWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3RtOnRtLCBob3VyUGFydHM6IGhvdXJQYXJ0cywgZXZlbnRUZW1wbGF0ZTpkYXl2aWV3Tm9ybWFsRXZlbnRUZW1wbGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9pbml0LXBvc2l0aW9uLXNjcm9sbD5cclxuICAgICAgICAgICAgICAgIDxpbml0LXBvc2l0aW9uLXNjcm9sbCAqbmdJZj1cIjEhPT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJkYXl2aWV3LW5vcm1hbC1ldmVudC1jb250YWluZXJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtpbml0UG9zaXRpb25dPVwiaW5pdFNjcm9sbFBvc2l0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgZGF5dmlldy1ub3JtYWwtZXZlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHRtIG9mIHZpZXdzWzFdLnJvd3M7IGxldCBpID0gaW5kZXhcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3tob3VyQ29sdW1uTGFiZWxzW2ldfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImRheXZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt0bTp0bSwgaG91clBhcnRzOiBob3VyUGFydHN9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvaW5pdC1wb3NpdGlvbi1zY3JvbGw+XHJcbiAgICAgICAgICAgIDwvaW9uLXNsaWRlPlxyXG4gICAgICAgICAgICA8aW9uLXNsaWRlIGNsYXNzPVwic2xpZGUtY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5dmlldy1hbGxkYXktdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5dmlldy1hbGxkYXktbGFiZWxcIj57e2FsbERheUxhYmVsfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGF5dmlldy1hbGxkYXktY29udGVudC13cmFwcGVyIHNjcm9sbC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIGRheXZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCIgW25nQ2xhc3NdPVwieydjYWxlbmRhci1ldmVudC13cmFwJzp2aWV3c1syXS5hbGxEYXlFdmVudHMubGVuZ3RoPjB9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nU3R5bGVdPVwie2hlaWdodDogMjUqdmlld3NbMl0uYWxsRGF5RXZlbnRzLmxlbmd0aCsncHgnfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpuZ0lmPVwiMj09PWN1cnJlbnRWaWV3SW5kZXhcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cImRheXZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie2FsbERheUV2ZW50czp2aWV3c1syXS5hbGxEYXlFdmVudHMsZXZlbnRUZW1wbGF0ZTpkYXl2aWV3QWxsRGF5RXZlbnRUZW1wbGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWNlbGxcIiAqbmdJZj1cIjIhPT1jdXJyZW50Vmlld0luZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJkYXl2aWV3SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie2FsbERheUV2ZW50czp2aWV3c1syXS5hbGxEYXlFdmVudHN9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8aW5pdC1wb3NpdGlvbi1zY3JvbGwgKm5nSWY9XCIyPT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwiZGF5dmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaW5pdFBvc2l0aW9uXT1cImluaXRTY3JvbGxQb3NpdGlvblwiIFtlbWl0RXZlbnRdPVwicHJlc2VydmVTY3JvbGxQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG9uU2Nyb2xsKT1cInNldFNjcm9sbFBvc2l0aW9uKCRldmVudClcIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBkYXl2aWV3LW5vcm1hbC1ldmVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgdG0gb2Ygdmlld3NbMl0ucm93czsgbGV0IGkgPSBpbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItaG91ci1jb2x1bW4gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e2hvdXJDb2x1bW5MYWJlbHNbaV19fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWNlbGxcIiB0YXBwYWJsZSAoY2xpY2spPVwic2VsZWN0KHRtLnRpbWUsIHRtLmV2ZW50cylcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwiZGF5dmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt0bTp0bSwgaG91clBhcnRzOiBob3VyUGFydHMsIGV2ZW50VGVtcGxhdGU6ZGF5dmlld05vcm1hbEV2ZW50VGVtcGxhdGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvaW5pdC1wb3NpdGlvbi1zY3JvbGw+XHJcbiAgICAgICAgICAgICAgICA8aW5pdC1wb3NpdGlvbi1zY3JvbGwgKm5nSWY9XCIyIT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwiZGF5dmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaW5pdFBvc2l0aW9uXT1cImluaXRTY3JvbGxQb3NpdGlvblwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIGRheXZpZXctbm9ybWFsLWV2ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCB0bSBvZiB2aWV3c1syXS5yb3dzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3M9XCJjYWxlbmRhci1ob3VyLWNvbHVtbiB0ZXh0LWNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7aG91ckNvbHVtbkxhYmVsc1tpXX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJkYXl2aWV3SW5hY3RpdmVOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dG06dG0sIGhvdXJQYXJ0czogaG91clBhcnRzfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICA8L2luaXQtcG9zaXRpb24tc2Nyb2xsPlxyXG4gICAgICAgICAgICA8L2lvbi1zbGlkZT5cclxuICAgICAgICA8L2lvbi1zbGlkZXM+XHJcbiAgICBgLFxyXG4gICAgc3R5bGVzOiBbYFxyXG4gICAgICAgIC50YWJsZS1maXhlZCB7XHJcbiAgICAgICAgICAgIHRhYmxlLWxheW91dDogZml4ZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUge1xyXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICAgICAgbWF4LXdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUgPiB0Zm9vdCA+IHRyID4gdGgsIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0ZCxcclxuICAgICAgICAudGFibGUgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZSA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDhweDtcclxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUgPiB0aGVhZCA+IHRyID4gdGgge1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xyXG4gICAgICAgICAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkOmZpcnN0LWNoaWxkID4gdHI6Zmlyc3QtY2hpbGQgPiB0aCwgLnRhYmxlID4gdGhlYWQ6Zmlyc3QtY2hpbGQgPiB0cjpmaXJzdC1jaGlsZCA+IHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGJvZHkgKyB0Ym9keSB7XHJcbiAgICAgICAgICAgIGJvcmRlci10b3A6IDJweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkIHtcclxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlLWJvcmRlcmVkID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUtYm9yZGVyZWQgPiB0Zm9vdCA+IHRyID4gdGgsXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkID4gdGhlYWQgPiB0ciA+IHRkLCAudGFibGUtYm9yZGVyZWQgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZS1ib3JkZXJlZCA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUtYm9yZGVyZWQgPiB0aGVhZCA+IHRyID4gdGgsIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDJweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1zdHJpcGVkID4gdGJvZHkgPiB0cjpudGgtY2hpbGQob2RkKSA+IHRkLCAudGFibGUtc3RyaXBlZCA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKG9kZCkgPiB0aCB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY5ZjlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5jYWxlbmRhci1ob3VyLWNvbHVtbiB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1MHB4O1xyXG4gICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLmNhbGVuZGFyLWV2ZW50LXdyYXAge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuY2FsZW5kYXItZXZlbnQge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDJweDtcclxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICAgICAgICB6LWluZGV4OiAxMDAwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5zbGlkZXMtY29udGFpbmVyIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnNsaWRlLWNvbnRhaW5lciB7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IGJsb2NrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLmNhbGVuZGFyLWNlbGwge1xyXG4gICAgICAgICAgICBwYWRkaW5nOiAwICFpbXBvcnRhbnQ7XHJcbiAgICAgICAgICAgIGhlaWdodDogMzdweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5kYXl2aWV3LWFsbGRheS1sYWJlbCB7XHJcbiAgICAgICAgICAgIGZsb2F0OiBsZWZ0O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XHJcbiAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiA1MHB4O1xyXG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1MHB4O1xyXG4gICAgICAgICAgICBib3JkZXItbGVmdDogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBbZGlyPVwicnRsXCJdIC5kYXl2aWV3LWFsbGRheS1sYWJlbCB7XHJcbiAgICAgICAgICAgIGJvcmRlci1yaWdodDogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgICAgIGZsb2F0OiByaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5kYXl2aWV3LWFsbGRheS1jb250ZW50LXdyYXBwZXIge1xyXG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogNTBweDtcclxuICAgICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgICAgICAgICAgaGVpZ2h0OiA1MXB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgW2Rpcj1cInJ0bFwiXSAuZGF5dmlldy1hbGxkYXktY29udGVudC13cmFwcGVyIHtcclxuICAgICAgICAgICAgbWFyZ2luLWxlZnQ6IDA7XHJcbiAgICAgICAgICAgIG1hcmdpbi1yaWdodDogNTBweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5kYXl2aWV3LWFsbGRheS1jb250ZW50LXRhYmxlIHtcclxuICAgICAgICAgICAgbWluLWhlaWdodDogNTBweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5kYXl2aWV3LWFsbGRheS1jb250ZW50LXRhYmxlIHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgICAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLmRheXZpZXctYWxsZGF5LXRhYmxlIHtcclxuICAgICAgICAgICAgaGVpZ2h0OiA1MHB4O1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b206IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgICAgICBmb250LXNpemU6IDE0cHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuZGF5dmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyIHtcclxuICAgICAgICAgICAgbWFyZ2luLXRvcDogNTBweDtcclxuICAgICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgICAgICAgICAgbGVmdDogMDtcclxuICAgICAgICAgICAgcmlnaHQ6IDA7XHJcbiAgICAgICAgICAgIHRvcDogMDtcclxuICAgICAgICAgICAgYm90dG9tOiAwO1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5zY3JvbGwtY29udGVudCB7XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIDo6LXdlYmtpdC1zY3JvbGxiYXIsXHJcbiAgICAgICAgKjo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRkLmNhbGVuZGFyLWhvdXItY29sdW1uIHtcclxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAwO1xyXG4gICAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiAwO1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQG1lZGlhIChtYXgtd2lkdGg6IDc1MHB4KSB7XHJcbiAgICAgICAgICAgIC5kYXl2aWV3LWFsbGRheS1sYWJlbCwgLmNhbGVuZGFyLWhvdXItY29sdW1uIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAzMXB4O1xyXG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAuZGF5dmlldy1hbGxkYXktbGFiZWwge1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZy10b3A6IDRweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRkLmNhbGVuZGFyLWhvdXItY29sdW1uIHtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmctbGVmdDogMDtcclxuICAgICAgICAgICAgICAgIHBhZGRpbmctcmlnaHQ6IDA7XHJcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xyXG4gICAgICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDEycHg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC5kYXl2aWV3LWFsbGRheS1sYWJlbCB7XHJcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMjBweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLmRheXZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciB7XHJcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogMzFweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgW2Rpcj1cInJ0bFwiXSAuZGF5dmlldy1hbGxkYXktY29udGVudC13cmFwcGVyIHtcclxuICAgICAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAwO1xyXG4gICAgICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiAzMXB4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgYF0sXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBEYXlWaWV3Q29tcG9uZW50IGltcGxlbWVudHMgSUNhbGVuZGFyQ29tcG9uZW50LCBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNhbGVuZGFyU2VydmljZTogQ2FsZW5kYXJTZXJ2aWNlLCBwcml2YXRlIGVsbTogRWxlbWVudFJlZikge1xyXG4gICAgfVxyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2RheVNsaWRlcicsIHtzdGF0aWM6IHRydWV9KSBzbGlkZXI6IElvblNsaWRlcztcclxuICAgIEBIb3N0QmluZGluZygnY2xhc3MuZGF5dmlldycpIGNsYXNzID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBkYXl2aWV3QWxsRGF5RXZlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SURpc3BsYXlBbGxEYXlFdmVudD47XHJcbiAgICBASW5wdXQoKSBkYXl2aWV3Tm9ybWFsRXZlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SURpc3BsYXlFdmVudD47XHJcbiAgICBASW5wdXQoKSBkYXl2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGU6IFRlbXBsYXRlUmVmPElEYXlWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0PjtcclxuICAgIEBJbnB1dCgpIGRheXZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZTogVGVtcGxhdGVSZWY8SURheVZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgZGF5dmlld0luYWN0aXZlQWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGU6IFRlbXBsYXRlUmVmPElEYXlWaWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVDb250ZXh0PjtcclxuICAgIEBJbnB1dCgpIGRheXZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJRGF5Vmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcblxyXG4gICAgQElucHV0KCkgZm9ybWF0SG91ckNvbHVtbjogc3RyaW5nO1xyXG4gICAgQElucHV0KCkgZm9ybWF0RGF5VGl0bGU6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGFsbERheUxhYmVsOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBob3VyUGFydHM6IG51bWJlcjtcclxuICAgIEBJbnB1dCgpIGV2ZW50U291cmNlOiBJRXZlbnRbXTtcclxuICAgIEBJbnB1dCgpIG1hcmtEaXNhYmxlZDogKGRhdGU6IERhdGUpID0+IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBsb2NhbGU6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGRhdGVGb3JtYXR0ZXI6IElEYXRlRm9ybWF0dGVyO1xyXG4gICAgQElucHV0KCkgZGlyID0gJyc7XHJcbiAgICBASW5wdXQoKSBzY3JvbGxUb0hvdXIgPSAwO1xyXG4gICAgQElucHV0KCkgcHJlc2VydmVTY3JvbGxQb3NpdGlvbjogYm9vbGVhbjtcclxuICAgIEBJbnB1dCgpIGxvY2tTd2lwZVRvUHJldjogYm9vbGVhbjtcclxuICAgIEBJbnB1dCgpIGxvY2tTd2lwZXM6IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBzdGFydEhvdXI6IG51bWJlcjtcclxuICAgIEBJbnB1dCgpIGVuZEhvdXI6IG51bWJlcjtcclxuICAgIEBJbnB1dCgpIHNsaWRlck9wdGlvbnM6IGFueTtcclxuICAgIEBJbnB1dCgpIGhvdXJTZWdtZW50czogbnVtYmVyO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblJhbmdlQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SVJhbmdlPigpO1xyXG4gICAgQE91dHB1dCgpIG9uRXZlbnRTZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SUV2ZW50PigpO1xyXG4gICAgQE91dHB1dCgpIG9uVGltZVNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJVGltZVNlbGVjdGVkPigpO1xyXG4gICAgQE91dHB1dCgpIG9uVGl0bGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KHRydWUpO1xyXG5cclxuICAgIHB1YmxpYyB2aWV3czogSURheVZpZXdbXSA9IFtdO1xyXG4gICAgcHVibGljIGN1cnJlbnRWaWV3SW5kZXggPSAwO1xyXG4gICAgcHVibGljIGRpcmVjdGlvbiA9IDA7XHJcbiAgICBwdWJsaWMgbW9kZTogQ2FsZW5kYXJNb2RlID0gJ2RheSc7XHJcbiAgICBwdWJsaWMgcmFuZ2U6IElSYW5nZTtcclxuXHJcbiAgICBwcml2YXRlIGluaXRlZCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFja09uSW5pdCA9IHRydWU7XHJcbiAgICBwcml2YXRlIGN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAgIHByaXZhdGUgZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgICBwcml2YXRlIHNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gICAgcHJpdmF0ZSBzbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgICBwdWJsaWMgaG91ckNvbHVtbkxhYmVsczogc3RyaW5nW107XHJcbiAgICBwdWJsaWMgaW5pdFNjcm9sbFBvc2l0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZvcm1hdFRpdGxlOiAoZGF0ZTogRGF0ZSkgPT4gc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBmb3JtYXRIb3VyQ29sdW1uTGFiZWw6IChkYXRlOiBEYXRlKSA9PiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGhvdXJSYW5nZTogbnVtYmVyO1xyXG5cclxuICAgIHN0YXRpYyBjcmVhdGVEYXRlT2JqZWN0cyhzdGFydFRpbWU6IERhdGUsIHN0YXJ0SG91cjogbnVtYmVyLCBlbmRIb3VyOiBudW1iZXIsIHRpbWVJbnRlcnZhbDogbnVtYmVyKTogSURheVZpZXdSb3dbXSB7XHJcbiAgICAgICAgY29uc3Qgcm93czogSURheVZpZXdSb3dbXSA9IFtdLFxyXG4gICAgICAgICAgICBjdXJyZW50SG91ciA9IDAsXHJcbiAgICAgICAgICAgIGN1cnJlbnREYXRlID0gc3RhcnRUaW1lLmdldERhdGUoKTtcclxuICAgICAgICBsZXQgdGltZTogRGF0ZSxcclxuICAgICAgICAgICAgaG91clN0ZXAsXHJcbiAgICAgICAgICAgIG1pblN0ZXA7XHJcblxyXG4gICAgICAgIGlmICh0aW1lSW50ZXJ2YWwgPCAxKSB7XHJcbiAgICAgICAgICAgIGhvdXJTdGVwID0gTWF0aC5mbG9vcigxIC8gdGltZUludGVydmFsKTtcclxuICAgICAgICAgICAgbWluU3RlcCA9IDYwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhvdXJTdGVwID0gMTtcclxuICAgICAgICAgICAgbWluU3RlcCA9IE1hdGguZmxvb3IoNjAgLyB0aW1lSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaG91ciA9IHN0YXJ0SG91cjsgaG91ciA8IGVuZEhvdXI7IGhvdXIgKz0gaG91clN0ZXApIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW50ZXJ2YWwgPSAwOyBpbnRlcnZhbCA8IDYwOyBpbnRlcnZhbCArPSBtaW5TdGVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lID0gbmV3IERhdGUoc3RhcnRUaW1lLmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgICB0aW1lLnNldEhvdXJzKGN1cnJlbnRIb3VyICsgaG91ciwgaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgdGltZS5zZXREYXRlKGN1cnJlbnREYXRlKTtcclxuICAgICAgICAgICAgICAgIHJvd3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudHM6IFtdXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcm93cztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBjb21wYXJlRXZlbnRCeVN0YXJ0T2Zmc2V0KGV2ZW50QTogSURpc3BsYXlFdmVudCwgZXZlbnRCOiBJRGlzcGxheUV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIGV2ZW50QS5zdGFydE9mZnNldCAtIGV2ZW50Qi5zdGFydE9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVXaWR0aChvcmRlcmVkRXZlbnRzOiBJRGlzcGxheUV2ZW50W10sIHNpemU6IG51bWJlciwgaG91clBhcnRzOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB0b3RhbFNpemUgPSBzaXplICogaG91clBhcnRzLFxyXG4gICAgICAgICAgICBjZWxsczogeyBjYWxjdWxhdGVkOiBib29sZWFuOyBldmVudHM6IElEaXNwbGF5RXZlbnRbXTsgfVtdID0gbmV3IEFycmF5KHRvdGFsU2l6ZSk7XHJcblxyXG4gICAgICAgIC8vIHNvcnQgYnkgcG9zaXRpb24gaW4gZGVzY2VuZGluZyBvcmRlciwgdGhlIHJpZ2h0IG1vc3QgY29sdW1ucyBzaG91bGQgYmUgY2FsY3VsYXRlZCBmaXJzdFxyXG4gICAgICAgIG9yZGVyZWRFdmVudHMuc29ydCgoZXZlbnRBLCBldmVudEIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50Qi5wb3NpdGlvbiAtIGV2ZW50QS5wb3NpdGlvbjtcclxuICAgICAgICB9KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvdGFsU2l6ZTsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNlbGxzW2ldID0ge1xyXG4gICAgICAgICAgICAgICAgY2FsY3VsYXRlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBldmVudHM6IFtdXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGxlbiA9IG9yZGVyZWRFdmVudHMubGVuZ3RoO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBvcmRlcmVkRXZlbnRzW2ldO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBldmVudC5zdGFydEluZGV4ICogaG91clBhcnRzICsgZXZlbnQuc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICAgIHdoaWxlIChpbmRleCA8IGV2ZW50LmVuZEluZGV4ICogaG91clBhcnRzIC0gZXZlbnQuZW5kT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBjZWxsc1tpbmRleF0uZXZlbnRzLnB1c2goZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgIHdoaWxlIChpIDwgbGVuKSB7XHJcbiAgICAgICAgICAgIGxldCBldmVudCA9IG9yZGVyZWRFdmVudHNbaV07XHJcbiAgICAgICAgICAgIGlmICghZXZlbnQub3ZlcmxhcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3ZlcmxhcE51bWJlciA9IGV2ZW50LnBvc2l0aW9uICsgMTtcclxuICAgICAgICAgICAgICAgIGV2ZW50Lm92ZXJsYXBOdW1iZXIgPSBvdmVybGFwTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRRdWV1ZSA9IFtldmVudF07XHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoZXZlbnQgPSBldmVudFF1ZXVlLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSBldmVudC5zdGFydEluZGV4ICogaG91clBhcnRzICsgZXZlbnQuc3RhcnRPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGluZGV4IDwgZXZlbnQuZW5kSW5kZXggKiBob3VyUGFydHMgLSBldmVudC5lbmRPZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjZWxsc1tpbmRleF0uY2FsY3VsYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbHNbaW5kZXhdLmNhbGN1bGF0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNlbGxzW2luZGV4XS5ldmVudHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudENvdW50SW5DZWxsID0gY2VsbHNbaW5kZXhdLmV2ZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBldmVudENvdW50SW5DZWxsOyBqICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEV2ZW50SW5DZWxsID0gY2VsbHNbaW5kZXhdLmV2ZW50c1tqXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdXJyZW50RXZlbnRJbkNlbGwub3ZlcmxhcE51bWJlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEV2ZW50SW5DZWxsLm92ZXJsYXBOdW1iZXIgPSBvdmVybGFwTnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRRdWV1ZS5wdXNoKGN1cnJlbnRFdmVudEluQ2VsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSArPSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2xpZGVyT3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlck9wdGlvbnMgPSB7fTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zbGlkZXJPcHRpb25zLmxvb3AgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmhvdXJSYW5nZSA9ICh0aGlzLmVuZEhvdXIgLSB0aGlzLnN0YXJ0SG91cikgKiB0aGlzLmhvdXJTZWdtZW50cztcclxuICAgICAgICBpZiAodGhpcy5kYXRlRm9ybWF0dGVyICYmIHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXREYXlWaWV3VGl0bGUpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXRUaXRsZSA9IHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXREYXlWaWV3VGl0bGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZVBpcGUgPSBuZXcgRGF0ZVBpcGUodGhpcy5sb2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFRpdGxlID0gZnVuY3Rpb24oZGF0ZTogRGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGVQaXBlLnRyYW5zZm9ybShkYXRlLCB0aGlzLmZvcm1hdERheVRpdGxlKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRhdGVGb3JtYXR0ZXIgJiYgdGhpcy5kYXRlRm9ybWF0dGVyLmZvcm1hdERheVZpZXdIb3VyQ29sdW1uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0SG91ckNvbHVtbkxhYmVsID0gdGhpcy5kYXRlRm9ybWF0dGVyLmZvcm1hdERheVZpZXdIb3VyQ29sdW1uO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVQaXBlID0gbmV3IERhdGVQaXBlKHRoaXMubG9jYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXRIb3VyQ29sdW1uTGFiZWwgPSBmdW5jdGlvbihkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGUsIHRoaXMuZm9ybWF0SG91ckNvbHVtbik7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2NrU3dpcGVUb1ByZXYpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIubG9ja1N3aXBlVG9QcmV2KHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubG9ja1N3aXBlcykge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVzKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIHRoaXMuaG91ckNvbHVtbkxhYmVscyA9IHRoaXMuZ2V0SG91ckNvbHVtbkxhYmVscygpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbiA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnQkLnN1YnNjcmliZShjdXJyZW50RGF0ZSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5ldmVudFNvdXJjZUNoYW5nZWQkLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMub25EYXRhTG9hZGVkKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2xpZGVDaGFuZ2VkJC5zdWJzY3JpYmUoZGlyZWN0aW9uID0+IHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVOZXh0KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVQcmV2KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zbGlkZVVwZGF0ZWRTdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5zbGlkZVVwZGF0ZWQkLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKTtcclxuICAgICAgICB0aGlzLm9uVGl0bGVDaGFuZ2VkLmVtaXQodGl0bGUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zY3JvbGxUb0hvdXIgPiAwKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhvdXJDb2x1bW5zID0gdGhpcy5lbG0ubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGF5dmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyJykucXVlcnlTZWxlY3RvckFsbCgnLmNhbGVuZGFyLWhvdXItY29sdW1uJyk7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lID0gdGhpcztcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBtZS5pbml0U2Nyb2xsUG9zaXRpb24gPSBob3VyQ29sdW1uc1ttZS5zY3JvbGxUb0hvdXIgLSBtZS5zdGFydEhvdXJdLm9mZnNldFRvcDtcclxuICAgICAgICAgICAgfSwgNTApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmluaXRlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgoY2hhbmdlcy5zdGFydEhvdXIgfHwgY2hhbmdlcy5lbmRIb3VyKSAmJiAoIWNoYW5nZXMuc3RhcnRIb3VyLmlzRmlyc3RDaGFuZ2UoKSB8fCAhY2hhbmdlcy5lbmRIb3VyLmlzRmlyc3RDaGFuZ2UoKSkpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3cyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5ob3VyUmFuZ2UgPSAodGhpcy5lbmRIb3VyIC0gdGhpcy5zdGFydEhvdXIpICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJDb2x1bW5MYWJlbHMgPSB0aGlzLmdldEhvdXJDb2x1bW5MYWJlbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV2ZW50U291cmNlQ2hhbmdlID0gY2hhbmdlcy5ldmVudFNvdXJjZTtcclxuICAgICAgICBpZiAoZXZlbnRTb3VyY2VDaGFuZ2UgJiYgZXZlbnRTb3VyY2VDaGFuZ2UuY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25EYXRhTG9hZGVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb2NrU3dpcGVUb1ByZXYgPSBjaGFuZ2VzLmxvY2tTd2lwZVRvUHJldjtcclxuICAgICAgICBpZiAobG9ja1N3aXBlVG9QcmV2KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLmxvY2tTd2lwZVRvUHJldihsb2NrU3dpcGVUb1ByZXYuY3VycmVudFZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvY2tTd2lwZXMgPSBjaGFuZ2VzLmxvY2tTd2lwZXM7XHJcbiAgICAgICAgaWYgKGxvY2tTd2lwZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIubG9ja1N3aXBlcyhsb2NrU3dpcGVzLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uU2xpZGVDaGFuZ2VkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrT25Jbml0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tPbkluaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGRpcmVjdGlvbiA9IDA7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFZpZXdJbmRleCA9IHRoaXMuY3VycmVudFZpZXdJbmRleDtcclxuXHJcbiAgICAgICAgdGhpcy5zbGlkZXIuZ2V0QWN0aXZlSW5kZXgoKS50aGVuKChjdXJyZW50U2xpZGVJbmRleCkgPT4ge1xyXG4gICAgICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IChjdXJyZW50U2xpZGVJbmRleCArIDIpICUgMztcclxuICAgICAgICAgICAgaWYoaXNOYU4oY3VycmVudFNsaWRlSW5kZXgpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGVJbmRleCA9IGN1cnJlbnRWaWV3SW5kZXg7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50U2xpZGVJbmRleCAtIGN1cnJlbnRWaWV3SW5kZXggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNsaWRlSW5kZXggPT09IDAgJiYgY3VycmVudFZpZXdJbmRleCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlVG8oMSwgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRWaWV3SW5kZXggLSBjdXJyZW50U2xpZGVJbmRleCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gLTE7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFNsaWRlSW5kZXggPT09IDIgJiYgY3VycmVudFZpZXdJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gLTE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZVRvKDMsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRWaWV3SW5kZXggPSBjdXJyZW50U2xpZGVJbmRleDtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlKGRpcmVjdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZShkaXJlY3Rpb246IG51bWJlcikge1xyXG4gICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgICAgY29uc3QgYWRqYWNlbnREYXRlID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuZ2V0QWRqYWNlbnRDYWxlbmRhckRhdGUodGhpcy5tb2RlLCBkaXJlY3Rpb24pO1xyXG4gICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNldEN1cnJlbnREYXRlKGFkamFjZW50RGF0ZSk7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEhvdXJDb2x1bW5MYWJlbHMoKTogc3RyaW5nW10ge1xyXG4gICAgICAgIGNvbnN0IGhvdXJDb2x1bW5MYWJlbHM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaG91ciA9IDAsIGxlbmd0aCA9IHRoaXMudmlld3NbMF0ucm93cy5sZW5ndGg7IGhvdXIgPCBsZW5ndGg7IGhvdXIgKz0gMSkge1xyXG4gICAgICAgICAgICAvLyBoYW5kbGUgZWRnZSBjYXNlIGZvciBEU1RcclxuICAgICAgICAgICAgaWYgKGhvdXIgPT09IDAgJiYgdGhpcy52aWV3c1swXS5yb3dzW2hvdXJdLnRpbWUuZ2V0SG91cnMoKSAhPT0gdGhpcy5zdGFydEhvdXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRpbWUgPSBuZXcgRGF0ZSh0aGlzLnZpZXdzWzBdLnJvd3NbaG91cl0udGltZSk7XHJcbiAgICAgICAgICAgICAgICB0aW1lLnNldERhdGUodGltZS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICAgICAgICAgIHRpbWUuc2V0SG91cnModGhpcy5zdGFydEhvdXIpO1xyXG4gICAgICAgICAgICAgICAgaG91ckNvbHVtbkxhYmVscy5wdXNoKHRoaXMuZm9ybWF0SG91ckNvbHVtbkxhYmVsKHRpbWUpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGhvdXJDb2x1bW5MYWJlbHMucHVzaCh0aGlzLmZvcm1hdEhvdXJDb2x1bW5MYWJlbCh0aGlzLnZpZXdzWzBdLnJvd3NbaG91cl0udGltZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VyQ29sdW1uTGFiZWxzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFZpZXdEYXRhKHN0YXJ0VGltZTogRGF0ZSk6IElEYXlWaWV3IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByb3dzOiBEYXlWaWV3Q29tcG9uZW50LmNyZWF0ZURhdGVPYmplY3RzKHN0YXJ0VGltZSwgdGhpcy5zdGFydEhvdXIsIHRoaXMuZW5kSG91ciwgdGhpcy5ob3VyU2VnbWVudHMpLFxyXG4gICAgICAgICAgICBhbGxEYXlFdmVudHM6IFtdXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRSYW5nZShjdXJyZW50RGF0ZTogRGF0ZSk6IElSYW5nZSB7XHJcbiAgICAgICAgY29uc3QgeWVhciA9IGN1cnJlbnREYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICAgIG1vbnRoID0gY3VycmVudERhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgICAgZGF0ZSA9IGN1cnJlbnREYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUsIDEyLCAwLCAwKSxcclxuICAgICAgICAgICAgZW5kVGltZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlICsgMSwgMTIsIDAsIDApO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzdGFydFRpbWUsXHJcbiAgICAgICAgICAgIGVuZFRpbWVcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIG9uRGF0YUxvYWRlZCgpIHtcclxuICAgICAgICBjb25zdCBldmVudFNvdXJjZSA9IHRoaXMuZXZlbnRTb3VyY2UsXHJcbiAgICAgICAgICAgIGxlbiA9IGV2ZW50U291cmNlID8gZXZlbnRTb3VyY2UubGVuZ3RoIDogMCxcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gdGhpcy5yYW5nZS5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSB0aGlzLnJhbmdlLmVuZFRpbWUsXHJcbiAgICAgICAgICAgIHV0Y1N0YXJ0VGltZSA9IERhdGUuVVRDKHN0YXJ0VGltZS5nZXRGdWxsWWVhcigpLCBzdGFydFRpbWUuZ2V0TW9udGgoKSwgc3RhcnRUaW1lLmdldERhdGUoKSksXHJcbiAgICAgICAgICAgIHV0Y0VuZFRpbWUgPSBEYXRlLlVUQyhlbmRUaW1lLmdldEZ1bGxZZWFyKCksIGVuZFRpbWUuZ2V0TW9udGgoKSwgZW5kVGltZS5nZXREYXRlKCkpLFxyXG4gICAgICAgICAgICBjdXJyZW50Vmlld0luZGV4ID0gdGhpcy5jdXJyZW50Vmlld0luZGV4LFxyXG4gICAgICAgICAgICByb3dzID0gdGhpcy52aWV3c1tjdXJyZW50Vmlld0luZGV4XS5yb3dzLFxyXG4gICAgICAgICAgICBhbGxEYXlFdmVudHM6IElEaXNwbGF5QWxsRGF5RXZlbnRbXSA9IHRoaXMudmlld3NbY3VycmVudFZpZXdJbmRleF0uYWxsRGF5RXZlbnRzID0gW10sXHJcbiAgICAgICAgICAgIG9uZUhvdXIgPSAzNjAwMDAwLFxyXG4gICAgICAgICAgICBlcHMgPSAwLjAxNixcclxuICAgICAgICAgICAgcmFuZ2VTdGFydFJvd0luZGV4ID0gdGhpcy5zdGFydEhvdXIgKiB0aGlzLmhvdXJTZWdtZW50cyxcclxuICAgICAgICAgICAgcmFuZ2VFbmRSb3dJbmRleCA9IHRoaXMuZW5kSG91ciAqIHRoaXMuaG91clNlZ21lbnRzO1xyXG4gICAgICAgIGxldCBub3JtYWxFdmVudEluUmFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaG91ciA9IDA7IGhvdXIgPCB0aGlzLmhvdXJSYW5nZTsgaG91ciArPSAxKSB7XHJcbiAgICAgICAgICAgIHJvd3NbaG91cl0uZXZlbnRzID0gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRTb3VyY2VbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U3RhcnRUaW1lID0gZXZlbnQuc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEVuZFRpbWUgPSBldmVudC5lbmRUaW1lO1xyXG4gICAgICAgICAgICBsZXQgZXZlbnRVVENTdGFydFRpbWU6IG51bWJlcixcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDRW5kVGltZTogbnVtYmVyO1xyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmFsbERheSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENTdGFydFRpbWUgPSBldmVudFN0YXJ0VGltZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ0VuZFRpbWUgPSBldmVudEVuZFRpbWUuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENTdGFydFRpbWUgPSBEYXRlLlVUQyhldmVudFN0YXJ0VGltZS5nZXRGdWxsWWVhcigpLCBldmVudFN0YXJ0VGltZS5nZXRNb250aCgpLCBldmVudFN0YXJ0VGltZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENFbmRUaW1lID0gRGF0ZS5VVEMoZXZlbnRFbmRUaW1lLmdldEZ1bGxZZWFyKCksIGV2ZW50RW5kVGltZS5nZXRNb250aCgpLCBldmVudEVuZFRpbWUuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudFVUQ0VuZFRpbWUgPD0gdXRjU3RhcnRUaW1lIHx8IGV2ZW50VVRDU3RhcnRUaW1lID49IHV0Y0VuZFRpbWUgfHwgZXZlbnRTdGFydFRpbWUgPj0gZXZlbnRFbmRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50LmFsbERheSkge1xyXG4gICAgICAgICAgICAgICAgYWxsRGF5RXZlbnRzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vcm1hbEV2ZW50SW5SYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVEaWZmZXJlbmNlU3RhcnQ6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudFVUQ1N0YXJ0VGltZSA8IHV0Y1N0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlU3RhcnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZVN0YXJ0ID0gKGV2ZW50U3RhcnRUaW1lLmdldEhvdXJzKCkgKyBldmVudFN0YXJ0VGltZS5nZXRNaW51dGVzKCkgLyA2MCkgKiB0aGlzLmhvdXJTZWdtZW50cztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZURpZmZlcmVuY2VFbmQ6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudFVUQ0VuZFRpbWUgPiB1dGNFbmRUaW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZURpZmZlcmVuY2VFbmQgPSAodXRjRW5kVGltZSAtIHV0Y1N0YXJ0VGltZSkgLyBvbmVIb3VyICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlRW5kID0gKGV2ZW50RW5kVGltZS5nZXRIb3VycygpICsgZXZlbnRFbmRUaW1lLmdldE1pbnV0ZXMoKSAvIDYwKSAqIHRoaXMuaG91clNlZ21lbnRzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBzdGFydEluZGV4ID0gTWF0aC5mbG9vcih0aW1lRGlmZmVyZW5jZVN0YXJ0KTtcclxuICAgICAgICAgICAgICAgIGxldCBlbmRJbmRleCA9IE1hdGguY2VpbCh0aW1lRGlmZmVyZW5jZUVuZCAtIGVwcyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZE9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3VyUGFydHMgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRJbmRleCA8IHJhbmdlU3RhcnRSb3dJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBNYXRoLmZsb29yKCh0aW1lRGlmZmVyZW5jZVN0YXJ0IC0gc3RhcnRJbmRleCkgKiB0aGlzLmhvdXJQYXJ0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRJbmRleCA+IHJhbmdlRW5kUm93SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW5kT2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRPZmZzZXQgPSBNYXRoLmZsb29yKChlbmRJbmRleCAtIHRpbWVEaWZmZXJlbmNlRW5kKSAqIHRoaXMuaG91clBhcnRzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXJ0SW5kZXggPCByYW5nZVN0YXJ0Um93SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRJbmRleCAtPSByYW5nZVN0YXJ0Um93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZW5kSW5kZXggPiByYW5nZUVuZFJvd0luZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kSW5kZXggPSByYW5nZUVuZFJvd0luZGV4O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZW5kSW5kZXggLT0gcmFuZ2VTdGFydFJvd0luZGV4O1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdGFydEluZGV4IDwgZW5kSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5RXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydEluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRPZmZzZXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZE9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBldmVudFNldCA9IHJvd3Nbc3RhcnRJbmRleF0uZXZlbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudFNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudFNldC5wdXNoKGRpc3BsYXlFdmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQucHVzaChkaXNwbGF5RXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3dzW3N0YXJ0SW5kZXhdLmV2ZW50cyA9IGV2ZW50U2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG5vcm1hbEV2ZW50SW5SYW5nZSkge1xyXG4gICAgICAgICAgICBsZXQgb3JkZXJlZEV2ZW50czogSURpc3BsYXlFdmVudFtdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IGhvdXIgPSAwOyBob3VyIDwgdGhpcy5ob3VyUmFuZ2U7IGhvdXIgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvd3NbaG91cl0uZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcm93c1tob3VyXS5ldmVudHMuc29ydChEYXlWaWV3Q29tcG9uZW50LmNvbXBhcmVFdmVudEJ5U3RhcnRPZmZzZXQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBvcmRlcmVkRXZlbnRzID0gb3JkZXJlZEV2ZW50cy5jb25jYXQocm93c1tob3VyXS5ldmVudHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvcmRlcmVkRXZlbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxhY2VFdmVudHMob3JkZXJlZEV2ZW50cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVmcmVzaFZpZXcoKSB7XHJcbiAgICAgICAgdGhpcy5yYW5nZSA9IHRoaXMuZ2V0UmFuZ2UodGhpcy5jYWxlbmRhclNlcnZpY2UuY3VycmVudERhdGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKTtcclxuICAgICAgICAgICAgdGhpcy5vblRpdGxlQ2hhbmdlZC5lbWl0KHRpdGxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnBvcHVsYXRlQWRqYWNlbnRWaWV3cyh0aGlzKTtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5yYW5nZUNoYW5nZWQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBzdGFydGluZ0RhdGUgPSBuZXcgRGF0ZSh0aGlzLnJhbmdlLnN0YXJ0VGltZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIHN0YXJ0aW5nRGF0ZS5zZXRIb3VycygxMiwgMCwgMCwgMCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9ybWF0VGl0bGUoc3RhcnRpbmdEYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3Qoc2VsZWN0ZWRUaW1lOiBEYXRlLCBldmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRoaXMubWFya0Rpc2FibGVkKHNlbGVjdGVkVGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9uVGltZVNlbGVjdGVkLmVtaXQoe1xyXG4gICAgICAgICAgICBzZWxlY3RlZFRpbWUsXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLm1hcChlID0+IGUuZXZlbnQpLFxyXG4gICAgICAgICAgICBkaXNhYmxlZFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYWNlRXZlbnRzKG9yZGVyZWRFdmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb24ob3JkZXJlZEV2ZW50cyk7XHJcbiAgICAgICAgRGF5Vmlld0NvbXBvbmVudC5jYWxjdWxhdGVXaWR0aChvcmRlcmVkRXZlbnRzLCB0aGlzLmhvdXJSYW5nZSwgdGhpcy5ob3VyUGFydHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYWNlQWxsRGF5RXZlbnRzKG9yZGVyZWRFdmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb24ob3JkZXJlZEV2ZW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgb3ZlcmxhcChldmVudDE6IElEaXNwbGF5RXZlbnQsIGV2ZW50MjogSURpc3BsYXlFdmVudCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBlYXJseUV2ZW50ID0gZXZlbnQxLFxyXG4gICAgICAgICAgICBsYXRlRXZlbnQgPSBldmVudDI7XHJcbiAgICAgICAgaWYgKGV2ZW50MS5zdGFydEluZGV4ID4gZXZlbnQyLnN0YXJ0SW5kZXggfHwgKGV2ZW50MS5zdGFydEluZGV4ID09PSBldmVudDIuc3RhcnRJbmRleCAmJiBldmVudDEuc3RhcnRPZmZzZXQgPiBldmVudDIuc3RhcnRPZmZzZXQpKSB7XHJcbiAgICAgICAgICAgIGVhcmx5RXZlbnQgPSBldmVudDI7XHJcbiAgICAgICAgICAgIGxhdGVFdmVudCA9IGV2ZW50MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlYXJseUV2ZW50LmVuZEluZGV4IDw9IGxhdGVFdmVudC5zdGFydEluZGV4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gIShlYXJseUV2ZW50LmVuZEluZGV4IC0gbGF0ZUV2ZW50LnN0YXJ0SW5kZXggPT09IDEgJiYgZWFybHlFdmVudC5lbmRPZmZzZXQgKyBsYXRlRXZlbnQuc3RhcnRPZmZzZXQgPj0gdGhpcy5ob3VyUGFydHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjYWxjdWxhdGVQb3NpdGlvbihldmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIGNvbnN0IGxlbiA9IGV2ZW50cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGlzRm9yYmlkZGVuOiBib29sZWFuW10gPSBuZXcgQXJyYXkobGVuKTtcclxuICAgICAgICBsZXQgbWF4Q29sdW1uID0gMCxcclxuICAgICAgICAgICAgY29sOiBudW1iZXI7XHJcblxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgbWF4Q29sdW1uOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgaXNGb3JiaWRkZW5bY29sXSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgaTsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vdmVybGFwKGV2ZW50c1tpXSwgZXZlbnRzW2pdKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlzRm9yYmlkZGVuW2V2ZW50c1tqXS5wb3NpdGlvbl0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAoY29sID0gMDsgY29sIDwgbWF4Q29sdW1uOyBjb2wgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpc0ZvcmJpZGRlbltjb2xdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNvbCA8IG1heENvbHVtbikge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW2ldLnBvc2l0aW9uID0gY29sO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW2ldLnBvc2l0aW9uID0gbWF4Q29sdW1uKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpciA9PT0gJ3J0bCcpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRzW2ldLnBvc2l0aW9uID0gbWF4Q29sdW1uIC0gMSAtIGV2ZW50c1tpXS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBldmVudFNlbGVjdGVkKGV2ZW50OiBJRXZlbnQpIHtcclxuICAgICAgICB0aGlzLm9uRXZlbnRTZWxlY3RlZC5lbWl0KGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRTY3JvbGxQb3NpdGlvbihzY3JvbGxQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbml0U2Nyb2xsUG9zaXRpb24gPSBzY3JvbGxQb3NpdGlvbjtcclxuICAgIH1cclxufVxyXG4iXX0=