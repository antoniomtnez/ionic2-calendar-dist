var WeekViewComponent_1;
import { __decorate } from "tslib";
import { DatePipe } from '@angular/common';
import { Component, OnInit, OnChanges, HostBinding, Input, Output, EventEmitter, SimpleChanges, ViewChild, ViewEncapsulation, TemplateRef, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CalendarService } from './calendar.service';
let WeekViewComponent = WeekViewComponent_1 = class WeekViewComponent {
    constructor(calendarService, elm) {
        this.calendarService = calendarService;
        this.elm = elm;
        this.class = true;
        this.autoSelect = true;
        this.dir = '';
        this.scrollToHour = 0;
        this.onRangeChanged = new EventEmitter();
        this.onEventSelected = new EventEmitter();
        this.onTimeSelected = new EventEmitter();
        this.onDayHeaderSelected = new EventEmitter();
        this.onTitleChanged = new EventEmitter(true);
        this.views = [];
        this.currentViewIndex = 0;
        this.direction = 0;
        this.mode = 'week';
        this.inited = false;
        this.callbackOnInit = true;
    }
    static createDateObjects(startTime, startHour, endHour, timeInterval) {
        const times = [], currentHour = 0, currentDate = startTime.getDate();
        let hourStep, minStep;
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
                const row = [];
                for (let day = 0; day < 7; day += 1) {
                    const time = new Date(startTime.getTime());
                    time.setHours(currentHour + hour, interval);
                    time.setDate(currentDate + day);
                    row.push({
                        events: [],
                        time
                    });
                }
                times.push(row);
            }
        }
        return times;
    }
    static getDates(startTime, n) {
        const dates = new Array(n), current = new Date(startTime.getTime());
        let i = 0;
        while (i < n) {
            dates[i++] = {
                date: new Date(current.getTime()),
                events: [],
                dayHeader: ''
            };
            current.setDate(current.getDate() + 1);
        }
        return dates;
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
        if (this.dateFormatter && this.dateFormatter.formatWeekViewDayHeader) {
            this.formatDayHeader = this.dateFormatter.formatWeekViewDayHeader;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatDayHeader = function (date) {
                return datePipe.transform(date, this.formatWeekViewDayHeader);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatWeekViewTitle) {
            this.formatTitle = this.dateFormatter.formatWeekViewTitle;
        }
        else {
            const datePipe = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe.transform(date, this.formatWeekTitle);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatWeekViewHourColumn) {
            this.formatHourColumnLabel = this.dateFormatter.formatWeekViewHourColumn;
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
            const hourColumns = this.elm.nativeElement.querySelector('.weekview-normal-event-container').querySelectorAll('.calendar-hour-column');
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
        const currentViewIndex = this.currentViewIndex;
        let direction = 0;
        this.slider.getActiveIndex().then(currentSlideIndex => {
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
        const adjacent = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
        this.calendarService.setCurrentDate(adjacent);
        this.refreshView();
        this.direction = 0;
    }
    getHourColumnLabels() {
        const hourColumnLabels = [];
        for (let hour = 0, length = this.views[0].rows.length; hour < length; hour += 1) {
            // handle edge case for DST
            if (hour === 0 && this.views[0].rows[hour][0].time.getHours() !== this.startHour) {
                const time = new Date(this.views[0].rows[hour][0].time);
                time.setDate(time.getDate() + 1);
                time.setHours(this.startHour);
                hourColumnLabels.push(this.formatHourColumnLabel(time));
            }
            else {
                hourColumnLabels.push(this.formatHourColumnLabel(this.views[0].rows[hour][0].time));
            }
        }
        return hourColumnLabels;
    }
    getViewData(startTime) {
        const dates = WeekViewComponent_1.getDates(startTime, 7);
        for (let i = 0; i < 7; i++) {
            dates[i].dayHeader = this.formatDayHeader(dates[i].date);
        }
        return {
            rows: WeekViewComponent_1.createDateObjects(startTime, this.startHour, this.endHour, this.hourSegments),
            dates
        };
    }
    getRange(currentDate) {
        const year = currentDate.getFullYear(), month = currentDate.getMonth(), date = currentDate.getDate(), day = currentDate.getDay();
        let difference = day - this.startingDayWeek;
        if (difference < 0) {
            difference += 7;
        }
        // set hour to 12 to avoid DST problem
        const firstDayOfWeek = new Date(year, month, date - difference, 12, 0, 0), endTime = new Date(year, month, date - difference + 7, 12, 0, 0);
        return {
            startTime: firstDayOfWeek,
            endTime
        };
    }
    onDataLoaded() {
        const eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = this.range.startTime, endTime = this.range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, rows = this.views[currentViewIndex].rows, dates = this.views[currentViewIndex].dates, oneHour = 3600000, oneDay = 86400000, 
        // add allday eps
        eps = 0.016, rangeStartRowIndex = this.startHour * this.hourSegments, rangeEndRowIndex = this.endHour * this.hourSegments, allRows = 24 * this.hourSegments;
        let allDayEventInRange = false, normalEventInRange = false;
        for (let i = 0; i < 7; i += 1) {
            dates[i].events = [];
            dates[i].hasEvent = false;
        }
        for (let day = 0; day < 7; day += 1) {
            for (let hour = 0; hour < this.hourRange; hour += 1) {
                rows[hour][day].events = [];
            }
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
                allDayEventInRange = true;
                let allDayStartIndex;
                if (eventUTCStartTime <= utcStartTime) {
                    allDayStartIndex = 0;
                }
                else {
                    allDayStartIndex = Math.round((eventUTCStartTime - utcStartTime) / oneDay);
                }
                let allDayEndIndex;
                if (eventUTCEndTime >= utcEndTime) {
                    allDayEndIndex = Math.round((utcEndTime - utcStartTime) / oneDay);
                }
                else {
                    allDayEndIndex = Math.round((eventUTCEndTime - utcStartTime) / oneDay);
                }
                const displayAllDayEvent = {
                    event,
                    startIndex: allDayStartIndex,
                    endIndex: allDayEndIndex
                };
                let eventSet = dates[allDayStartIndex].events;
                if (eventSet) {
                    eventSet.push(displayAllDayEvent);
                }
                else {
                    eventSet = [];
                    eventSet.push(displayAllDayEvent);
                    dates[allDayStartIndex].events = eventSet;
                }
                dates[allDayStartIndex].hasEvent = true;
            }
            else {
                normalEventInRange = true;
                let timeDifferenceStart;
                if (eventUTCStartTime < utcStartTime) {
                    timeDifferenceStart = 0;
                }
                else {
                    timeDifferenceStart = (eventUTCStartTime - utcStartTime) / oneHour * this.hourSegments + (eventStartTime.getHours() + eventStartTime.getMinutes() / 60) * this.hourSegments;
                }
                let timeDifferenceEnd;
                if (eventUTCEndTime > utcEndTime) {
                    timeDifferenceEnd = (utcEndTime - utcStartTime) / oneHour * this.hourSegments;
                }
                else {
                    timeDifferenceEnd = (eventUTCEndTime - oneDay - utcStartTime) / oneHour * this.hourSegments + (eventEndTime.getHours() + eventEndTime.getMinutes() / 60) * this.hourSegments;
                }
                const startIndex = Math.floor(timeDifferenceStart), endIndex = Math.ceil(timeDifferenceEnd - eps);
                let startRowIndex = startIndex % allRows, dayIndex = Math.floor(startIndex / allRows), endOfDay = dayIndex * allRows, startOffset = 0, endOffset = 0;
                if (this.hourParts !== 1) {
                    if (startRowIndex < rangeStartRowIndex) {
                        startOffset = 0;
                    }
                    else {
                        startOffset = Math.floor((timeDifferenceStart - startIndex) * this.hourParts);
                    }
                }
                do {
                    endOfDay += allRows;
                    let endRowIndex;
                    if (endOfDay < endIndex) {
                        endRowIndex = allRows;
                    }
                    else {
                        if (endOfDay === endIndex) {
                            endRowIndex = allRows;
                        }
                        else {
                            endRowIndex = endIndex % allRows;
                        }
                        if (this.hourParts !== 1) {
                            if (endRowIndex > rangeEndRowIndex) {
                                endOffset = 0;
                            }
                            else {
                                endOffset = Math.floor((endIndex - timeDifferenceEnd) * this.hourParts);
                            }
                        }
                    }
                    if (startRowIndex < rangeStartRowIndex) {
                        startRowIndex = 0;
                    }
                    else {
                        startRowIndex -= rangeStartRowIndex;
                    }
                    if (endRowIndex > rangeEndRowIndex) {
                        endRowIndex = rangeEndRowIndex;
                    }
                    endRowIndex -= rangeStartRowIndex;
                    if (startRowIndex < endRowIndex) {
                        const displayEvent = {
                            event,
                            startIndex: startRowIndex,
                            endIndex: endRowIndex,
                            startOffset,
                            endOffset
                        };
                        let eventSet = rows[startRowIndex][dayIndex].events;
                        if (eventSet) {
                            eventSet.push(displayEvent);
                        }
                        else {
                            eventSet = [];
                            eventSet.push(displayEvent);
                            rows[startRowIndex][dayIndex].events = eventSet;
                        }
                        dates[dayIndex].hasEvent = true;
                    }
                    startRowIndex = 0;
                    startOffset = 0;
                    dayIndex += 1;
                } while (endOfDay < endIndex);
            }
        }
        if (normalEventInRange) {
            for (let day = 0; day < 7; day += 1) {
                let orderedEvents = [];
                for (let hour = 0; hour < this.hourRange; hour += 1) {
                    if (rows[hour][day].events) {
                        rows[hour][day].events.sort(WeekViewComponent_1.compareEventByStartOffset);
                        orderedEvents = orderedEvents.concat(rows[hour][day].events);
                    }
                }
                if (orderedEvents.length > 0) {
                    this.placeEvents(orderedEvents);
                }
            }
        }
        if (allDayEventInRange) {
            let orderedAllDayEvents = [];
            for (let day = 0; day < 7; day += 1) {
                if (dates[day].events) {
                    orderedAllDayEvents = orderedAllDayEvents.concat(dates[day].events);
                }
            }
            if (orderedAllDayEvents.length > 0) {
                this.placeAllDayEvents(orderedAllDayEvents);
            }
        }
        if (this.autoSelect) {
            let findSelected = false;
            let selectedDate;
            for (let r = 0; r < 7; r += 1) {
                if (dates[r].selected) {
                    selectedDate = dates[r];
                    findSelected = true;
                    break;
                }
            }
            if (findSelected) {
                let disabled = false;
                if (this.markDisabled) {
                    disabled = this.markDisabled(selectedDate.date);
                }
                this.onTimeSelected.emit({
                    selectedTime: selectedDate.date,
                    events: selectedDate.events.map(e => e.event),
                    disabled
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
        const firstDayOfWeek = new Date(this.range.startTime.getTime());
        firstDayOfWeek.setHours(12, 0, 0, 0);
        return this.formatTitle(firstDayOfWeek);
    }
    getHighlightClass(date) {
        let className = '';
        if (date.hasEvent) {
            if (className) {
                className += ' ';
            }
            className = 'weekview-with-event';
        }
        if (date.selected) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-selected';
        }
        if (date.current) {
            if (className) {
                className += ' ';
            }
            className += 'weekview-current';
        }
        return className;
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
        WeekViewComponent_1.calculateWidth(orderedEvents, this.hourRange, this.hourParts);
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
        let maxColumn = 0;
        for (let i = 0; i < len; i += 1) {
            let col;
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
    updateCurrentView(currentViewStartDate, view) {
        const currentCalendarDate = this.calendarService.currentDate, today = new Date(), oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay), currentDayDifference = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        for (let r = 0; r < 7; r += 1) {
            view.dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 7 && this.autoSelect) {
            view.dates[selectedDayDifference].selected = true;
        }
        if (currentDayDifference >= 0 && currentDayDifference < 7) {
            view.dates[currentDayDifference].current = true;
        }
    }
    daySelected(viewDate) {
        const selectedDate = viewDate.date, dates = this.views[this.currentViewIndex].dates, currentViewStartDate = this.range.startTime, oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        this.calendarService.setCurrentDate(selectedDate);
        for (let r = 0; r < 7; r += 1) {
            dates[r].selected = false;
        }
        if (selectedDayDifference >= 0 && selectedDayDifference < 7) {
            dates[selectedDayDifference].selected = true;
        }
        let disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(selectedDate);
        }
        this.onDayHeaderSelected.emit({ selectedTime: selectedDate, events: viewDate.events.map(e => e.event), disabled });
    }
    setScrollPosition(scrollPosition) {
        this.initScrollPosition = scrollPosition;
    }
};
WeekViewComponent.ctorParameters = () => [
    { type: CalendarService },
    { type: ElementRef }
];
__decorate([
    ViewChild('weekSlider', { static: true })
], WeekViewComponent.prototype, "slider", void 0);
__decorate([
    HostBinding('class.weekview')
], WeekViewComponent.prototype, "class", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewHeaderTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewAllDayEventTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewNormalEventTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewInactiveAllDayEventSectionTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "weekviewInactiveNormalEventSectionTemplate", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "formatWeekTitle", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "formatWeekViewDayHeader", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "formatHourColumn", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "startingDayWeek", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "allDayLabel", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "hourParts", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "eventSource", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "autoSelect", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "markDisabled", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "locale", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "dateFormatter", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "dir", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "scrollToHour", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "preserveScrollPosition", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "lockSwipeToPrev", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "lockSwipes", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "startHour", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "endHour", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "sliderOptions", void 0);
__decorate([
    Input()
], WeekViewComponent.prototype, "hourSegments", void 0);
__decorate([
    Output()
], WeekViewComponent.prototype, "onRangeChanged", void 0);
__decorate([
    Output()
], WeekViewComponent.prototype, "onEventSelected", void 0);
__decorate([
    Output()
], WeekViewComponent.prototype, "onTimeSelected", void 0);
__decorate([
    Output()
], WeekViewComponent.prototype, "onDayHeaderSelected", void 0);
__decorate([
    Output()
], WeekViewComponent.prototype, "onTitleChanged", void 0);
WeekViewComponent = WeekViewComponent_1 = __decorate([
    Component({
        selector: 'weekview',
        template: `
        <ion-slides #weekSlider [options]="sliderOptions" [dir]="dir" (ionSlideDidChange)="onSlideChanged()"
                    class="slides-container">
            <ion-slide class="slide-container">
                <table class="table table-bordered table-fixed weekview-header">
                    <thead>
                    <tr>
                        <th class="calendar-hour-column"></th>
                        <th class="weekview-header text-center" *ngFor="let date of views[0].dates"
                            [ngClass]="getHighlightClass(date)"
                            (click)="daySelected(date)">
                            <ng-template [ngTemplateOutlet]="weekviewHeaderTemplate"
                                         [ngTemplateOutletContext]="{viewDate:date}">
                            </ng-template>
                        </th>
                    </tr>
                    </thead>
                </table>
                <div *ngIf="0===currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[0].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day, eventTemplate:weekviewAllDayEventTemplate}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition"
                                          [emitEvent]="preserveScrollPosition" (onScroll)="setScrollPosition($event)">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[0].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell" tappable
                                    (click)="select(tm.time, tm.events)">
                                    <ng-template [ngTemplateOutlet]="weekviewNormalEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}">
                                    </ng-template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
                <div *ngIf="0!==currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[0].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewInactiveAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[0].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell">
                                    <ng-template [ngTemplateOutlet]="weekviewInactiveNormalEventSectionTemplate"
                                                 [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                    </ng-template>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
            </ion-slide>
            <ion-slide class="slide-container">
                <table class="table table-bordered table-fixed weekview-header">
                    <thead>
                    <tr>
                        <th class="calendar-hour-column"></th>
                        <th class="weekview-header text-center" *ngFor="let date of views[1].dates"
                            [ngClass]="getHighlightClass(date)"
                            (click)="daySelected(date)">
                            <ng-template [ngTemplateOutlet]="weekviewHeaderTemplate"
                                         [ngTemplateOutletContext]="{viewDate:date}">
                            </ng-template>
                        </th>
                    </tr>
                    </thead>
                </table>
                <div *ngIf="1===currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[1].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day, eventTemplate:weekviewAllDayEventTemplate}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition"
                                          [emitEvent]="preserveScrollPosition" (onScroll)="setScrollPosition($event)">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[1].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell" tappable
                                    (click)="select(tm.time, tm.events)">
                                    <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                                        <ng-template [ngTemplateOutlet]="weekviewNormalEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}">
                                        </ng-template>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
                <div *ngIf="1!==currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[1].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewInactiveAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[1].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell">
                                    <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                                        <ng-template [ngTemplateOutlet]="weekviewInactiveNormalEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                        </ng-template>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
            </ion-slide>
            <ion-slide class="slide-container">
                <table class="table table-bordered table-fixed weekview-header">
                    <thead>
                    <tr>
                        <th class="calendar-hour-column"></th>
                        <th class="weekview-header text-center" *ngFor="let date of views[2].dates"
                            [ngClass]="getHighlightClass(date)"
                            (click)="daySelected(date)">
                            <ng-template [ngTemplateOutlet]="weekviewHeaderTemplate"
                                         [ngTemplateOutletContext]="{viewDate:date}">
                            </ng-template>
                        </th>
                    </tr>
                    </thead>
                </table>
                <div *ngIf="2===currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[2].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day, eventTemplate:weekviewAllDayEventTemplate}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition"
                                          [emitEvent]="preserveScrollPosition" (onScroll)="setScrollPosition($event)">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[2].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell" tappable
                                    (click)="select(tm.time, tm.events)">
                                    <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                                        <ng-template [ngTemplateOutlet]="weekviewNormalEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts, eventTemplate:weekviewNormalEventTemplate}">
                                        </ng-template>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
                <div *ngIf="2!==currentViewIndex">
                    <div class="weekview-allday-table">
                        <div class="weekview-allday-label">{{allDayLabel}}</div>
                        <div class="weekview-allday-content-wrapper scroll-content">
                            <table class="table table-fixed weekview-allday-content-table">
                                <tbody>
                                <tr>
                                    <td *ngFor="let day of views[2].dates" class="calendar-cell">
                                        <ng-template [ngTemplateOutlet]="weekviewInactiveAllDayEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{day:day}">
                                        </ng-template>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <init-position-scroll class="weekview-normal-event-container" [initPosition]="initScrollPosition">
                        <table class="table table-bordered table-fixed weekview-normal-event-table">
                            <tbody>
                            <tr *ngFor="let row of views[2].rows; let i = index">
                                <td class="calendar-hour-column text-center">
                                    {{hourColumnLabels[i]}}
                                </td>
                                <td *ngFor="let tm of row" class="calendar-cell">
                                    <div [ngClass]="{'calendar-event-wrap': tm.events}" *ngIf="tm.events">
                                        <ng-template [ngTemplateOutlet]="weekviewInactiveNormalEventSectionTemplate"
                                                     [ngTemplateOutletContext]="{tm:tm, hourParts: hourParts}">
                                        </ng-template>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </init-position-scroll>
                </div>
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

        .calendar-cell {
            padding: 0 !important;
            height: 37px;
        }

        .slides-container {
            height: 100%;
        }

        .slide-container {
            display: block;
        }

        .weekview-allday-label {
            float: left;
            height: 100%;
            line-height: 50px;
            text-align: center;
            width: 50px;
            border-left: 1px solid #ddd;
        }

        [dir="rtl"] .weekview-allday-label {
            float: right;
            border-right: 1px solid #ddd;
        }

        .weekview-allday-content-wrapper {
            margin-left: 50px;
            overflow: hidden;
            height: 51px;
        }

        [dir="rtl"] .weekview-allday-content-wrapper {
            margin-left: 0;
            margin-right: 50px;
        }

        .weekview-allday-content-table {
            min-height: 50px;
        }

        .weekview-allday-content-table td {
            border-left: 1px solid #ddd;
            border-right: 1px solid #ddd;
        }

        .weekview-header th {
            overflow: hidden;
            white-space: nowrap;
            font-size: 14px;
        }

        .weekview-allday-table {
            height: 50px;
            position: relative;
            border-bottom: 1px solid #ddd;
            font-size: 14px;
        }

        .weekview-normal-event-container {
            margin-top: 87px;
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
            .weekview-allday-label, .calendar-hour-column {
                width: 31px;
                font-size: 12px;
            }

            .weekview-allday-label {
                padding-top: 4px;
            }

            .table > tbody > tr > td.calendar-hour-column {
                padding-left: 0;
                padding-right: 0;
                vertical-align: middle;
                line-height: 12px;
            }

            .table > thead > tr > th.weekview-header {
                padding-left: 0;
                padding-right: 0;
                font-size: 12px;
            }

            .weekview-allday-label {
                line-height: 20px;
            }

            .weekview-allday-content-wrapper {
                margin-left: 31px;
            }

            [dir="rtl"] .weekview-allday-content-wrapper {
                margin-left: 0;
                margin-right: 31px;
            }
        }
    `]
    })
], WeekViewComponent);
export { WeekViewComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vla3ZpZXcuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYzItY2FsZW5kYXIvIiwic291cmNlcyI6WyJ3ZWVrdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQ0gsU0FBUyxFQUNULE1BQU0sRUFDTixTQUFTLEVBQ1QsV0FBVyxFQUNYLEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLGFBQWEsRUFDYixTQUFTLEVBQ1QsaUJBQWlCLEVBQ2pCLFdBQVcsRUFDWCxVQUFVLEVBQ1YsU0FBUyxFQUFFLGFBQWEsRUFDM0IsTUFBTSxlQUFlLENBQUM7QUFnQnZCLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQXdkbkQsSUFBYSxpQkFBaUIseUJBQTlCLE1BQWEsaUJBQWlCO0lBRTFCLFlBQW9CLGVBQWdDLEVBQVUsR0FBZTtRQUF6RCxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFBVSxRQUFHLEdBQUgsR0FBRyxDQUFZO1FBSTlDLFVBQUssR0FBRyxJQUFJLENBQUM7UUFpQm5DLGVBQVUsR0FBRyxJQUFJLENBQUM7UUFJbEIsUUFBRyxHQUFHLEVBQUUsQ0FBQztRQUNULGlCQUFZLEdBQUcsQ0FBQyxDQUFDO1FBU2hCLG1CQUFjLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUM1QyxvQkFBZSxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFDN0MsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBaUIsQ0FBQztRQUNuRCx3QkFBbUIsR0FBRyxJQUFJLFlBQVksRUFBaUIsQ0FBQztRQUN4RCxtQkFBYyxHQUFHLElBQUksWUFBWSxDQUFTLElBQUksQ0FBQyxDQUFDO1FBRW5ELFVBQUssR0FBZ0IsRUFBRSxDQUFDO1FBQ3hCLHFCQUFnQixHQUFHLENBQUMsQ0FBQztRQUVyQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsU0FBSSxHQUFp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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0E4UVQ7UUErTEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7aUJBOUw1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBNkxSO0tBRUosQ0FBQztHQUNXLGlCQUFpQixDQTB3QjdCO1NBMXdCWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RhdGVQaXBlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0lvblNsaWRlc30gZnJvbSAnQGlvbmljL2FuZ3VsYXInO1xyXG5pbXBvcnQge1xyXG4gICAgQ29tcG9uZW50LFxyXG4gICAgT25Jbml0LFxyXG4gICAgT25DaGFuZ2VzLFxyXG4gICAgSG9zdEJpbmRpbmcsXHJcbiAgICBJbnB1dCxcclxuICAgIE91dHB1dCxcclxuICAgIEV2ZW50RW1pdHRlcixcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBWaWV3Q2hpbGQsXHJcbiAgICBWaWV3RW5jYXBzdWxhdGlvbixcclxuICAgIFRlbXBsYXRlUmVmLFxyXG4gICAgRWxlbWVudFJlZixcclxuICAgIE9uRGVzdHJveSwgQWZ0ZXJWaWV3SW5pdFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgSUNhbGVuZGFyQ29tcG9uZW50LFxyXG4gICAgSURpc3BsYXlFdmVudCxcclxuICAgIElFdmVudCxcclxuICAgIElUaW1lU2VsZWN0ZWQsXHJcbiAgICBJUmFuZ2UsXHJcbiAgICBJV2Vla1ZpZXcsXHJcbiAgICBJV2Vla1ZpZXdSb3csXHJcbiAgICBJV2Vla1ZpZXdEYXRlUm93LFxyXG4gICAgQ2FsZW5kYXJNb2RlLFxyXG4gICAgSURhdGVGb3JtYXR0ZXIsXHJcbiAgICBJRGlzcGxheVdlZWtWaWV3SGVhZGVyXHJcbn0gZnJvbSAnLi9jYWxlbmRhcic7XHJcbmltcG9ydCB7Q2FsZW5kYXJTZXJ2aWNlfSBmcm9tICcuL2NhbGVuZGFyLnNlcnZpY2UnO1xyXG5pbXBvcnQge1xyXG4gICAgSURpc3BsYXlBbGxEYXlFdmVudCxcclxuICAgIElXZWVrVmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dCxcclxuICAgIElXZWVrVmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dFxyXG59IGZyb20gJy4vY2FsZW5kYXInO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3dlZWt2aWV3JyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGlvbi1zbGlkZXMgI3dlZWtTbGlkZXIgW29wdGlvbnNdPVwic2xpZGVyT3B0aW9uc1wiIFtkaXJdPVwiZGlyXCIgKGlvblNsaWRlRGlkQ2hhbmdlKT1cIm9uU2xpZGVDaGFuZ2VkKClcIlxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzPVwic2xpZGVzLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICA8aW9uLXNsaWRlIGNsYXNzPVwic2xpZGUtY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCB3ZWVrdmlldy1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYWxlbmRhci1ob3VyLWNvbHVtblwiPjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cIndlZWt2aWV3LWhlYWRlciB0ZXh0LWNlbnRlclwiICpuZ0Zvcj1cImxldCBkYXRlIG9mIHZpZXdzWzBdLmRhdGVzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cImdldEhpZ2hsaWdodENsYXNzKGRhdGUpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJkYXlTZWxlY3RlZChkYXRlKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3SGVhZGVyVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlld0RhdGU6ZGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDxkaXYgKm5nSWY9XCIwPT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS1sYWJlbFwiPnt7YWxsRGF5TGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciBzY3JvbGwtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZml4ZWQgd2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGRheSBvZiB2aWV3c1swXS5kYXRlc1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGF5OmRheSwgZXZlbnRUZW1wbGF0ZTp3ZWVrdmlld0FsbERheUV2ZW50VGVtcGxhdGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbml0LXBvc2l0aW9uLXNjcm9sbCBjbGFzcz1cIndlZWt2aWV3LW5vcm1hbC1ldmVudC1jb250YWluZXJcIiBbaW5pdFBvc2l0aW9uXT1cImluaXRTY3JvbGxQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlbWl0RXZlbnRdPVwicHJlc2VydmVTY3JvbGxQb3NpdGlvblwiIChvblNjcm9sbCk9XCJzZXRTY3JvbGxQb3NpdGlvbigkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIHdlZWt2aWV3LW5vcm1hbC1ldmVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2Ygdmlld3NbMF0ucm93czsgbGV0IGkgPSBpbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7aG91ckNvbHVtbkxhYmVsc1tpXX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IHRtIG9mIHJvd1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiIHRhcHBhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJzZWxlY3QodG0udGltZSwgdG0uZXZlbnRzKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwid2Vla3ZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3RtOnRtLCBob3VyUGFydHM6IGhvdXJQYXJ0cywgZXZlbnRUZW1wbGF0ZTp3ZWVrdmlld05vcm1hbEV2ZW50VGVtcGxhdGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvaW5pdC1wb3NpdGlvbi1zY3JvbGw+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgKm5nSWY9XCIwIT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS1sYWJlbFwiPnt7YWxsRGF5TGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciBzY3JvbGwtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZml4ZWQgd2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGRheSBvZiB2aWV3c1swXS5kYXRlc1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkYXk6ZGF5fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW5pdC1wb3NpdGlvbi1zY3JvbGwgY2xhc3M9XCJ3ZWVrdmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyXCIgW2luaXRQb3NpdGlvbl09XCJpbml0U2Nyb2xsUG9zaXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgd2Vla3ZpZXctbm9ybWFsLWV2ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiB2aWV3c1swXS5yb3dzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItaG91ci1jb2x1bW4gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3tob3VyQ29sdW1uTGFiZWxzW2ldfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgdG0gb2Ygcm93XCIgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJ3ZWVrdmlld0luYWN0aXZlTm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt0bTp0bSwgaG91clBhcnRzOiBob3VyUGFydHN9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvaW5pdC1wb3NpdGlvbi1zY3JvbGw+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9pb24tc2xpZGU+XHJcbiAgICAgICAgICAgIDxpb24tc2xpZGUgY2xhc3M9XCJzbGlkZS1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIHdlZWt2aWV3LWhlYWRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uXCI+PC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzPVwid2Vla3ZpZXctaGVhZGVyIHRleHQtY2VudGVyXCIgKm5nRm9yPVwibGV0IGRhdGUgb2Ygdmlld3NbMV0uZGF0ZXNcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwiZ2V0SGlnaGxpZ2h0Q2xhc3MoZGF0ZSlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cImRheVNlbGVjdGVkKGRhdGUpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwid2Vla3ZpZXdIZWFkZXJUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt2aWV3RGF0ZTpkYXRlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPGRpdiAqbmdJZj1cIjE9PT1jdXJyZW50Vmlld0luZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LWxhYmVsXCI+e3thbGxEYXlMYWJlbH19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktY29udGVudC13cmFwcGVyIHNjcm9sbC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1maXhlZCB3ZWVrdmlldy1hbGxkYXktY29udGVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgZGF5IG9mIHZpZXdzWzFdLmRhdGVzXCIgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwid2Vla3ZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkYXk6ZGF5LCBldmVudFRlbXBsYXRlOndlZWt2aWV3QWxsRGF5RXZlbnRUZW1wbGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGluaXQtcG9zaXRpb24tc2Nyb2xsIGNsYXNzPVwid2Vla3ZpZXctbm9ybWFsLWV2ZW50LWNvbnRhaW5lclwiIFtpbml0UG9zaXRpb25dPVwiaW5pdFNjcm9sbFBvc2l0aW9uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2VtaXRFdmVudF09XCJwcmVzZXJ2ZVNjcm9sbFBvc2l0aW9uXCIgKG9uU2Nyb2xsKT1cInNldFNjcm9sbFBvc2l0aW9uKCRldmVudClcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgd2Vla3ZpZXctbm9ybWFsLWV2ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiB2aWV3c1sxXS5yb3dzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItaG91ci1jb2x1bW4gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3tob3VyQ29sdW1uTGFiZWxzW2ldfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgdG0gb2Ygcm93XCIgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCIgdGFwcGFibGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cInNlbGVjdCh0bS50aW1lLCB0bS5ldmVudHMpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgW25nQ2xhc3NdPVwieydjYWxlbmRhci1ldmVudC13cmFwJzogdG0uZXZlbnRzfVwiICpuZ0lmPVwidG0uZXZlbnRzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwid2Vla3ZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt0bTp0bSwgaG91clBhcnRzOiBob3VyUGFydHMsIGV2ZW50VGVtcGxhdGU6d2Vla3ZpZXdOb3JtYWxFdmVudFRlbXBsYXRlfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvaW5pdC1wb3NpdGlvbi1zY3JvbGw+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgKm5nSWY9XCIxIT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS1sYWJlbFwiPnt7YWxsRGF5TGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciBzY3JvbGwtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZml4ZWQgd2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGRheSBvZiB2aWV3c1sxXS5kYXRlc1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3SW5hY3RpdmVBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntkYXk6ZGF5fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8aW5pdC1wb3NpdGlvbi1zY3JvbGwgY2xhc3M9XCJ3ZWVrdmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyXCIgW2luaXRQb3NpdGlvbl09XCJpbml0U2Nyb2xsUG9zaXRpb25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgd2Vla3ZpZXctbm9ybWFsLWV2ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiB2aWV3c1sxXS5yb3dzOyBsZXQgaSA9IGluZGV4XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzPVwiY2FsZW5kYXItaG91ci1jb2x1bW4gdGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3tob3VyQ29sdW1uTGFiZWxzW2ldfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgdG0gb2Ygcm93XCIgY2xhc3M9XCJjYWxlbmRhci1jZWxsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgW25nQ2xhc3NdPVwieydjYWxlbmRhci1ldmVudC13cmFwJzogdG0uZXZlbnRzfVwiICpuZ0lmPVwidG0uZXZlbnRzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwid2Vla3ZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3RtOnRtLCBob3VyUGFydHM6IGhvdXJQYXJ0c31cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2luaXQtcG9zaXRpb24tc2Nyb2xsPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvaW9uLXNsaWRlPlxyXG4gICAgICAgICAgICA8aW9uLXNsaWRlIGNsYXNzPVwic2xpZGUtY29udGFpbmVyXCI+XHJcbiAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCB3ZWVrdmlldy1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3M9XCJjYWxlbmRhci1ob3VyLWNvbHVtblwiPjwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzcz1cIndlZWt2aWV3LWhlYWRlciB0ZXh0LWNlbnRlclwiICpuZ0Zvcj1cImxldCBkYXRlIG9mIHZpZXdzWzJdLmRhdGVzXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cImdldEhpZ2hsaWdodENsYXNzKGRhdGUpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJkYXlTZWxlY3RlZChkYXRlKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3SGVhZGVyVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlld0RhdGU6ZGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDxkaXYgKm5nSWY9XCIyPT09Y3VycmVudFZpZXdJbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS1sYWJlbFwiPnt7YWxsRGF5TGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciBzY3JvbGwtY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzPVwidGFibGUgdGFibGUtZml4ZWQgd2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGRheSBvZiB2aWV3c1syXS5kYXRlc1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGF5OmRheSwgZXZlbnRUZW1wbGF0ZTp3ZWVrdmlld0FsbERheUV2ZW50VGVtcGxhdGV9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbml0LXBvc2l0aW9uLXNjcm9sbCBjbGFzcz1cIndlZWt2aWV3LW5vcm1hbC1ldmVudC1jb250YWluZXJcIiBbaW5pdFBvc2l0aW9uXT1cImluaXRTY3JvbGxQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlbWl0RXZlbnRdPVwicHJlc2VydmVTY3JvbGxQb3NpdGlvblwiIChvblNjcm9sbCk9XCJzZXRTY3JvbGxQb3NpdGlvbigkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIHdlZWt2aWV3LW5vcm1hbC1ldmVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2Ygdmlld3NbMl0ucm93czsgbGV0IGkgPSBpbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7aG91ckNvbHVtbkxhYmVsc1tpXX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IHRtIG9mIHJvd1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiIHRhcHBhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJzZWxlY3QodG0udGltZSwgdG0uZXZlbnRzKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsnY2FsZW5kYXItZXZlbnQtd3JhcCc6IHRtLmV2ZW50c31cIiAqbmdJZj1cInRtLmV2ZW50c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3Tm9ybWFsRXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dG06dG0sIGhvdXJQYXJ0czogaG91clBhcnRzLCBldmVudFRlbXBsYXRlOndlZWt2aWV3Tm9ybWFsRXZlbnRUZW1wbGF0ZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8L2luaXQtcG9zaXRpb24tc2Nyb2xsPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2ICpuZ0lmPVwiMiE9PWN1cnJlbnRWaWV3SW5kZXhcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwid2Vla3ZpZXctYWxsZGF5LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ3ZWVrdmlldy1hbGxkYXktbGFiZWxcIj57e2FsbERheUxhYmVsfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIndlZWt2aWV3LWFsbGRheS1jb250ZW50LXdyYXBwZXIgc2Nyb2xsLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWZpeGVkIHdlZWt2aWV3LWFsbGRheS1jb250ZW50LXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBkYXkgb2Ygdmlld3NbMl0uZGF0ZXNcIiBjbGFzcz1cImNhbGVuZGFyLWNlbGxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJ3ZWVrdmlld0luYWN0aXZlQWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7ZGF5OmRheX1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGluaXQtcG9zaXRpb24tc2Nyb2xsIGNsYXNzPVwid2Vla3ZpZXctbm9ybWFsLWV2ZW50LWNvbnRhaW5lclwiIFtpbml0UG9zaXRpb25dPVwiaW5pdFNjcm9sbFBvc2l0aW9uXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIHdlZWt2aWV3LW5vcm1hbC1ldmVudC10YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2Ygdmlld3NbMl0ucm93czsgbGV0IGkgPSBpbmRleFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzcz1cImNhbGVuZGFyLWhvdXItY29sdW1uIHRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt7aG91ckNvbHVtbkxhYmVsc1tpXX19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IHRtIG9mIHJvd1wiIGNsYXNzPVwiY2FsZW5kYXItY2VsbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsnY2FsZW5kYXItZXZlbnQtd3JhcCc6IHRtLmV2ZW50c31cIiAqbmdJZj1cInRtLmV2ZW50c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIndlZWt2aWV3SW5hY3RpdmVOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt0bTp0bSwgaG91clBhcnRzOiBob3VyUGFydHN9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9pbml0LXBvc2l0aW9uLXNjcm9sbD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2lvbi1zbGlkZT5cclxuICAgICAgICA8L2lvbi1zbGlkZXM+XHJcbiAgICBgLFxyXG4gICAgc3R5bGVzOiBbYFxyXG4gICAgICAgIC50YWJsZS1maXhlZCB7XHJcbiAgICAgICAgICAgIHRhYmxlLWxheW91dDogZml4ZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUge1xyXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICAgICAgbWF4LXdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUgPiB0Zm9vdCA+IHRyID4gdGgsIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0ZCxcclxuICAgICAgICAudGFibGUgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZSA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDhweDtcclxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUgPiB0aGVhZCA+IHRyID4gdGgge1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xyXG4gICAgICAgICAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkOmZpcnN0LWNoaWxkID4gdHI6Zmlyc3QtY2hpbGQgPiB0aCwgLnRhYmxlID4gdGhlYWQ6Zmlyc3QtY2hpbGQgPiB0cjpmaXJzdC1jaGlsZCA+IHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGJvZHkgKyB0Ym9keSB7XHJcbiAgICAgICAgICAgIGJvcmRlci10b3A6IDJweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkIHtcclxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlLWJvcmRlcmVkID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUtYm9yZGVyZWQgPiB0Zm9vdCA+IHRyID4gdGgsXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkID4gdGhlYWQgPiB0ciA+IHRkLCAudGFibGUtYm9yZGVyZWQgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZS1ib3JkZXJlZCA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUtYm9yZGVyZWQgPiB0aGVhZCA+IHRyID4gdGgsIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDJweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1zdHJpcGVkID4gdGJvZHkgPiB0cjpudGgtY2hpbGQob2RkKSA+IHRkLCAudGFibGUtc3RyaXBlZCA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKG9kZCkgPiB0aCB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY5ZjlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5jYWxlbmRhci1ob3VyLWNvbHVtbiB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA1MHB4O1xyXG4gICAgICAgICAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLmNhbGVuZGFyLWV2ZW50LXdyYXAge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XHJcbiAgICAgICAgICAgIHdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDEwMCU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuY2FsZW5kYXItZXZlbnQge1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDJweDtcclxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICAgICAgICB6LWluZGV4OiAxMDAwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5jYWxlbmRhci1jZWxsIHtcclxuICAgICAgICAgICAgcGFkZGluZzogMCAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDM3cHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAuc2xpZGVzLWNvbnRhaW5lciB7XHJcbiAgICAgICAgICAgIGhlaWdodDogMTAwJTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5zbGlkZS1jb250YWluZXIge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC53ZWVrdmlldy1hbGxkYXktbGFiZWwge1xyXG4gICAgICAgICAgICBmbG9hdDogbGVmdDtcclxuICAgICAgICAgICAgaGVpZ2h0OiAxMDAlO1xyXG4gICAgICAgICAgICBsaW5lLWhlaWdodDogNTBweDtcclxuICAgICAgICAgICAgdGV4dC1hbGlnbjogY2VudGVyO1xyXG4gICAgICAgICAgICB3aWR0aDogNTBweDtcclxuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgW2Rpcj1cInJ0bFwiXSAud2Vla3ZpZXctYWxsZGF5LWxhYmVsIHtcclxuICAgICAgICAgICAgZmxvYXQ6IHJpZ2h0O1xyXG4gICAgICAgICAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLndlZWt2aWV3LWFsbGRheS1jb250ZW50LXdyYXBwZXIge1xyXG4gICAgICAgICAgICBtYXJnaW4tbGVmdDogNTBweDtcclxuICAgICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgICAgICAgICAgaGVpZ2h0OiA1MXB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgW2Rpcj1cInJ0bFwiXSAud2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciB7XHJcbiAgICAgICAgICAgIG1hcmdpbi1sZWZ0OiAwO1xyXG4gICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDUwcHg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAud2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtdGFibGUge1xyXG4gICAgICAgICAgICBtaW4taGVpZ2h0OiA1MHB4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLndlZWt2aWV3LWFsbGRheS1jb250ZW50LXRhYmxlIHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLWxlZnQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgICAgICBib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLndlZWt2aWV3LWhlYWRlciB0aCB7XHJcbiAgICAgICAgICAgIG92ZXJmbG93OiBoaWRkZW47XHJcbiAgICAgICAgICAgIHdoaXRlLXNwYWNlOiBub3dyYXA7XHJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC53ZWVrdmlldy1hbGxkYXktdGFibGUge1xyXG4gICAgICAgICAgICBoZWlnaHQ6IDUwcHg7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcclxuICAgICAgICAgICAgYm9yZGVyLWJvdHRvbTogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC53ZWVrdmlldy1ub3JtYWwtZXZlbnQtY29udGFpbmVyIHtcclxuICAgICAgICAgICAgbWFyZ2luLXRvcDogODdweDtcclxuICAgICAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjtcclxuICAgICAgICAgICAgbGVmdDogMDtcclxuICAgICAgICAgICAgcmlnaHQ6IDA7XHJcbiAgICAgICAgICAgIHRvcDogMDtcclxuICAgICAgICAgICAgYm90dG9tOiAwO1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XHJcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMTRweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5zY3JvbGwtY29udGVudCB7XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIDo6LXdlYmtpdC1zY3JvbGxiYXIsXHJcbiAgICAgICAgKjo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRkLmNhbGVuZGFyLWhvdXItY29sdW1uIHtcclxuICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAwO1xyXG4gICAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiAwO1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogbWlkZGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQG1lZGlhIChtYXgtd2lkdGg6IDc1MHB4KSB7XHJcbiAgICAgICAgICAgIC53ZWVrdmlldy1hbGxkYXktbGFiZWwsIC5jYWxlbmRhci1ob3VyLWNvbHVtbiB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aDogMzFweDtcclxuICAgICAgICAgICAgICAgIGZvbnQtc2l6ZTogMTJweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLndlZWt2aWV3LWFsbGRheS1sYWJlbCB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nLXRvcDogNHB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAudGFibGUgPiB0Ym9keSA+IHRyID4gdGQuY2FsZW5kYXItaG91ci1jb2x1bW4ge1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZy1sZWZ0OiAwO1xyXG4gICAgICAgICAgICAgICAgcGFkZGluZy1yaWdodDogMDtcclxuICAgICAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiBtaWRkbGU7XHJcbiAgICAgICAgICAgICAgICBsaW5lLWhlaWdodDogMTJweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLnRhYmxlID4gdGhlYWQgPiB0ciA+IHRoLndlZWt2aWV3LWhlYWRlciB7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nLWxlZnQ6IDA7XHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nLXJpZ2h0OiAwO1xyXG4gICAgICAgICAgICAgICAgZm9udC1zaXplOiAxMnB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAud2Vla3ZpZXctYWxsZGF5LWxhYmVsIHtcclxuICAgICAgICAgICAgICAgIGxpbmUtaGVpZ2h0OiAyMHB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAud2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciB7XHJcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogMzFweDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgW2Rpcj1cInJ0bFwiXSAud2Vla3ZpZXctYWxsZGF5LWNvbnRlbnQtd3JhcHBlciB7XHJcbiAgICAgICAgICAgICAgICBtYXJnaW4tbGVmdDogMDtcclxuICAgICAgICAgICAgICAgIG1hcmdpbi1yaWdodDogMzFweDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIGBdLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxyXG59KVxyXG5leHBvcnQgY2xhc3MgV2Vla1ZpZXdDb21wb25lbnQgaW1wbGVtZW50cyBJQ2FsZW5kYXJDb21wb25lbnQsIE9uSW5pdCwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIEFmdGVyVmlld0luaXQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FsZW5kYXJTZXJ2aWNlOiBDYWxlbmRhclNlcnZpY2UsIHByaXZhdGUgZWxtOiBFbGVtZW50UmVmKSB7XHJcbiAgICB9XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnd2Vla1NsaWRlcicsIHtzdGF0aWM6IHRydWV9KSBzbGlkZXI6IElvblNsaWRlcztcclxuICAgIEBIb3N0QmluZGluZygnY2xhc3Mud2Vla3ZpZXcnKSBjbGFzcyA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdIZWFkZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SURpc3BsYXlXZWVrVmlld0hlYWRlcj47XHJcbiAgICBASW5wdXQoKSB3ZWVrdmlld0FsbERheUV2ZW50VGVtcGxhdGU6IFRlbXBsYXRlUmVmPElEaXNwbGF5QWxsRGF5RXZlbnQ+O1xyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdOb3JtYWxFdmVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJRGlzcGxheUV2ZW50PjtcclxuICAgIEBJbnB1dCgpIHdlZWt2aWV3QWxsRGF5RXZlbnRTZWN0aW9uVGVtcGxhdGU6IFRlbXBsYXRlUmVmPElXZWVrVmlld0FsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSB3ZWVrdmlld05vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJV2Vla1ZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdJbmFjdGl2ZUFsbERheUV2ZW50U2VjdGlvblRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJV2Vla1ZpZXdBbGxEYXlFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG4gICAgQElucHV0KCkgd2Vla3ZpZXdJbmFjdGl2ZU5vcm1hbEV2ZW50U2VjdGlvblRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJV2Vla1ZpZXdOb3JtYWxFdmVudFNlY3Rpb25UZW1wbGF0ZUNvbnRleHQ+O1xyXG5cclxuICAgIEBJbnB1dCgpIGZvcm1hdFdlZWtUaXRsZTogc3RyaW5nO1xyXG4gICAgQElucHV0KCkgZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXI6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGZvcm1hdEhvdXJDb2x1bW46IHN0cmluZztcclxuICAgIEBJbnB1dCgpIHN0YXJ0aW5nRGF5V2VlazogbnVtYmVyO1xyXG4gICAgQElucHV0KCkgYWxsRGF5TGFiZWw6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGhvdXJQYXJ0czogbnVtYmVyO1xyXG4gICAgQElucHV0KCkgZXZlbnRTb3VyY2U6IElFdmVudFtdO1xyXG4gICAgQElucHV0KCkgYXV0b1NlbGVjdCA9IHRydWU7XHJcbiAgICBASW5wdXQoKSBtYXJrRGlzYWJsZWQ6IChkYXRlOiBEYXRlKSA9PiBib29sZWFuO1xyXG4gICAgQElucHV0KCkgbG9jYWxlOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBkYXRlRm9ybWF0dGVyOiBJRGF0ZUZvcm1hdHRlcjtcclxuICAgIEBJbnB1dCgpIGRpciA9ICcnO1xyXG4gICAgQElucHV0KCkgc2Nyb2xsVG9Ib3VyID0gMDtcclxuICAgIEBJbnB1dCgpIHByZXNlcnZlU2Nyb2xsUG9zaXRpb246IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBsb2NrU3dpcGVUb1ByZXY6IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBsb2NrU3dpcGVzOiBib29sZWFuO1xyXG4gICAgQElucHV0KCkgc3RhcnRIb3VyOiBudW1iZXI7XHJcbiAgICBASW5wdXQoKSBlbmRIb3VyOiBudW1iZXI7XHJcbiAgICBASW5wdXQoKSBzbGlkZXJPcHRpb25zOiBhbnk7XHJcbiAgICBASW5wdXQoKSBob3VyU2VnbWVudHM6IG51bWJlcjtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25SYW5nZUNoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElSYW5nZT4oKTtcclxuICAgIEBPdXRwdXQoKSBvbkV2ZW50U2VsZWN0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPElFdmVudD4oKTtcclxuICAgIEBPdXRwdXQoKSBvblRpbWVTZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SVRpbWVTZWxlY3RlZD4oKTtcclxuICAgIEBPdXRwdXQoKSBvbkRheUhlYWRlclNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJVGltZVNlbGVjdGVkPigpO1xyXG4gICAgQE91dHB1dCgpIG9uVGl0bGVDaGFuZ2VkID0gbmV3IEV2ZW50RW1pdHRlcjxzdHJpbmc+KHRydWUpO1xyXG5cclxuICAgIHB1YmxpYyB2aWV3czogSVdlZWtWaWV3W10gPSBbXTtcclxuICAgIHB1YmxpYyBjdXJyZW50Vmlld0luZGV4ID0gMDtcclxuICAgIHB1YmxpYyByYW5nZTogSVJhbmdlO1xyXG4gICAgcHVibGljIGRpcmVjdGlvbiA9IDA7XHJcbiAgICBwdWJsaWMgbW9kZTogQ2FsZW5kYXJNb2RlID0gJ3dlZWsnO1xyXG5cclxuICAgIHByaXZhdGUgaW5pdGVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrT25Jbml0ID0gdHJ1ZTtcclxuICAgIHByaXZhdGUgY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gICAgcHJpdmF0ZSBldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAgIHByaXZhdGUgc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgICBwcml2YXRlIHNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG5cclxuICAgIHB1YmxpYyBob3VyQ29sdW1uTGFiZWxzOiBzdHJpbmdbXTtcclxuICAgIHB1YmxpYyBpbml0U2Nyb2xsUG9zaXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgZm9ybWF0RGF5SGVhZGVyOiAoZGF0ZTogRGF0ZSkgPT4gc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBmb3JtYXRUaXRsZTogKGRhdGU6IERhdGUpID0+IHN0cmluZztcclxuICAgIHByaXZhdGUgZm9ybWF0SG91ckNvbHVtbkxhYmVsOiAoZGF0ZTogRGF0ZSkgPT4gc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBob3VyUmFuZ2U6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0aWMgY3JlYXRlRGF0ZU9iamVjdHMoc3RhcnRUaW1lOiBEYXRlLCBzdGFydEhvdXI6IG51bWJlciwgZW5kSG91cjogbnVtYmVyLCB0aW1lSW50ZXJ2YWw6IG51bWJlcik6IElXZWVrVmlld1Jvd1tdW10ge1xyXG4gICAgICAgIGNvbnN0IHRpbWVzOiBJV2Vla1ZpZXdSb3dbXVtdID0gW10sXHJcbiAgICAgICAgICAgIGN1cnJlbnRIb3VyID0gMCxcclxuICAgICAgICAgICAgY3VycmVudERhdGUgPSBzdGFydFRpbWUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIGxldCBob3VyU3RlcCxcclxuICAgICAgICAgICAgbWluU3RlcDtcclxuXHJcbiAgICAgICAgaWYgKHRpbWVJbnRlcnZhbCA8IDEpIHtcclxuICAgICAgICAgICAgaG91clN0ZXAgPSBNYXRoLmZsb29yKDEgLyB0aW1lSW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICBtaW5TdGVwID0gNjA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaG91clN0ZXAgPSAxO1xyXG4gICAgICAgICAgICBtaW5TdGVwID0gTWF0aC5mbG9vcig2MCAvIHRpbWVJbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBob3VyID0gc3RhcnRIb3VyOyBob3VyIDwgZW5kSG91cjsgaG91ciArPSBob3VyU3RlcCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpbnRlcnZhbCA9IDA7IGludGVydmFsIDwgNjA7IGludGVydmFsICs9IG1pblN0ZXApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvdzogSVdlZWtWaWV3Um93W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRheSA9IDA7IGRheSA8IDc7IGRheSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGltZSA9IG5ldyBEYXRlKHN0YXJ0VGltZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUuc2V0SG91cnMoY3VycmVudEhvdXIgKyBob3VyLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZS5zZXREYXRlKGN1cnJlbnREYXRlICsgZGF5KTtcclxuICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50czogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRpbWVzLnB1c2gocm93KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGltZXM7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldERhdGVzKHN0YXJ0VGltZTogRGF0ZSwgbjogbnVtYmVyKTogSVdlZWtWaWV3RGF0ZVJvd1tdIHtcclxuICAgICAgICBjb25zdCBkYXRlcyA9IG5ldyBBcnJheShuKSxcclxuICAgICAgICAgICAgY3VycmVudCA9IG5ldyBEYXRlKHN0YXJ0VGltZS5nZXRUaW1lKCkpO1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IG4pIHtcclxuICAgICAgICAgICAgZGF0ZXNbaSsrXSA9IHtcclxuICAgICAgICAgICAgICAgIGRhdGU6IG5ldyBEYXRlKGN1cnJlbnQuZ2V0VGltZSgpKSxcclxuICAgICAgICAgICAgICAgIGV2ZW50czogW10sXHJcbiAgICAgICAgICAgICAgICBkYXlIZWFkZXI6ICcnXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY29tcGFyZUV2ZW50QnlTdGFydE9mZnNldChldmVudEE6IElEaXNwbGF5RXZlbnQsIGV2ZW50QjogSURpc3BsYXlFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIGV2ZW50QS5zdGFydE9mZnNldCAtIGV2ZW50Qi5zdGFydE9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBjYWxjdWxhdGVXaWR0aChvcmRlcmVkRXZlbnRzOiBJRGlzcGxheUV2ZW50W10sIHNpemU6IG51bWJlciwgaG91clBhcnRzOiBudW1iZXIpIHtcclxuICAgICAgICBjb25zdCB0b3RhbFNpemUgPSBzaXplICogaG91clBhcnRzLFxyXG4gICAgICAgICAgICBjZWxscyA9IG5ldyBBcnJheSh0b3RhbFNpemUpO1xyXG5cclxuICAgICAgICAvLyBzb3J0IGJ5IHBvc2l0aW9uIGluIGRlc2NlbmRpbmcgb3JkZXIsIHRoZSByaWdodCBtb3N0IGNvbHVtbnMgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgZmlyc3RcclxuICAgICAgICBvcmRlcmVkRXZlbnRzLnNvcnQoKGV2ZW50QSwgZXZlbnRCKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudEIucG9zaXRpb24gLSBldmVudEEucG9zaXRpb247XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b3RhbFNpemU7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjZWxsc1tpXSA9IHtcclxuICAgICAgICAgICAgICAgIGNhbGN1bGF0ZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbXVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsZW4gPSBvcmRlcmVkRXZlbnRzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gb3JkZXJlZEV2ZW50c1tpXTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gZXZlbnQuc3RhcnRJbmRleCAqIGhvdXJQYXJ0cyArIGV2ZW50LnN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgICB3aGlsZSAoaW5kZXggPCBldmVudC5lbmRJbmRleCAqIGhvdXJQYXJ0cyAtIGV2ZW50LmVuZE9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgY2VsbHNbaW5kZXhdLmV2ZW50cy5wdXNoKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICB3aGlsZSAoaSA8IGxlbikge1xyXG4gICAgICAgICAgICBsZXQgZXZlbnQgPSBvcmRlcmVkRXZlbnRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50Lm92ZXJsYXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG92ZXJsYXBOdW1iZXIgPSBldmVudC5wb3NpdGlvbiArIDE7XHJcbiAgICAgICAgICAgICAgICBldmVudC5vdmVybGFwTnVtYmVyID0gb3ZlcmxhcE51bWJlcjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50UXVldWUgPSBbZXZlbnRdO1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGV2ZW50ID0gZXZlbnRRdWV1ZS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gZXZlbnQuc3RhcnRJbmRleCAqIGhvdXJQYXJ0cyArIGV2ZW50LnN0YXJ0T2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChpbmRleCA8IGV2ZW50LmVuZEluZGV4ICogaG91clBhcnRzIC0gZXZlbnQuZW5kT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2VsbHNbaW5kZXhdLmNhbGN1bGF0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxzW2luZGV4XS5jYWxjdWxhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjZWxsc1tpbmRleF0uZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRDb3VudEluQ2VsbCA9IGNlbGxzW2luZGV4XS5ldmVudHMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgZXZlbnRDb3VudEluQ2VsbDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFdmVudEluQ2VsbCA9IGNlbGxzW2luZGV4XS5ldmVudHNbal07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY3VycmVudEV2ZW50SW5DZWxsLm92ZXJsYXBOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudEluQ2VsbC5vdmVybGFwTnVtYmVyID0gb3ZlcmxhcE51bWJlcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50UXVldWUucHVzaChjdXJyZW50RXZlbnRJbkNlbGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ICs9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGkgKz0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNsaWRlck9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXJPcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2xpZGVyT3B0aW9ucy5sb29wID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5ob3VyUmFuZ2UgPSAodGhpcy5lbmRIb3VyIC0gdGhpcy5zdGFydEhvdXIpICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXREYXlIZWFkZXIgPSB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZVBpcGUgPSBuZXcgRGF0ZVBpcGUodGhpcy5sb2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdERheUhlYWRlciA9IGZ1bmN0aW9uIChkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGUsIHRoaXMuZm9ybWF0V2Vla1ZpZXdEYXlIZWFkZXIpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0V2Vla1ZpZXdUaXRsZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFRpdGxlID0gdGhpcy5kYXRlRm9ybWF0dGVyLmZvcm1hdFdlZWtWaWV3VGl0bGU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgZGF0ZVBpcGUgPSBuZXcgRGF0ZVBpcGUodGhpcy5sb2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLmZvcm1hdFRpdGxlID0gZnVuY3Rpb24gKGRhdGU6IERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5mb3JtYXRXZWVrVGl0bGUpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0V2Vla1ZpZXdIb3VyQ29sdW1uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0SG91ckNvbHVtbkxhYmVsID0gdGhpcy5kYXRlRm9ybWF0dGVyLmZvcm1hdFdlZWtWaWV3SG91ckNvbHVtbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlUGlwZSA9IG5ldyBEYXRlUGlwZSh0aGlzLmxvY2FsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0SG91ckNvbHVtbkxhYmVsID0gZnVuY3Rpb24gKGRhdGU6IERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5mb3JtYXRIb3VyQ29sdW1uKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxvY2tTd2lwZVRvUHJldikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVUb1ByZXYodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2NrU3dpcGVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLmxvY2tTd2lwZXModHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5ob3VyQ29sdW1uTGFiZWxzID0gdGhpcy5nZXRIb3VyQ29sdW1uTGFiZWxzKCk7XHJcbiAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50JC5zdWJzY3JpYmUoY3VycmVudERhdGUgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZXZlbnRTb3VyY2VDaGFuZ2VkU3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuZXZlbnRTb3VyY2VDaGFuZ2VkJC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uRGF0YUxvYWRlZCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNsaWRlQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNsaWRlQ2hhbmdlZCQuc3Vic2NyaWJlKGRpcmVjdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlTmV4dCgpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlUHJldigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2xpZGVVcGRhdGVkJC5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci51cGRhdGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAgICAgY29uc3QgdGl0bGUgPSB0aGlzLmdldFRpdGxlKCk7XHJcbiAgICAgICAgdGhpcy5vblRpdGxlQ2hhbmdlZC5lbWl0KHRpdGxlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsVG9Ib3VyID4gMCkge1xyXG4gICAgICAgICAgICBjb25zdCBob3VyQ29sdW1ucyA9IHRoaXMuZWxtLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLndlZWt2aWV3LW5vcm1hbC1ldmVudC1jb250YWluZXInKS5xdWVyeVNlbGVjdG9yQWxsKCcuY2FsZW5kYXItaG91ci1jb2x1bW4nKTtcclxuICAgICAgICAgICAgY29uc3QgbWUgPSB0aGlzO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIG1lLmluaXRTY3JvbGxQb3NpdGlvbiA9IGhvdXJDb2x1bW5zW21lLnNjcm9sbFRvSG91ciAtIG1lLnN0YXJ0SG91cl0ub2Zmc2V0VG9wO1xyXG4gICAgICAgICAgICB9LCA1MCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25DaGFuZ2VzKGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgoY2hhbmdlcy5zdGFydEhvdXIgfHwgY2hhbmdlcy5lbmRIb3VyKSAmJiAoIWNoYW5nZXMuc3RhcnRIb3VyLmlzRmlyc3RDaGFuZ2UoKSB8fCAhY2hhbmdlcy5lbmRIb3VyLmlzRmlyc3RDaGFuZ2UoKSkpIHtcclxuICAgICAgICAgICAgdGhpcy52aWV3cyA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGhpcy5ob3VyUmFuZ2UgPSAodGhpcy5lbmRIb3VyIC0gdGhpcy5zdGFydEhvdXIpICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgICAgICB0aGlzLmhvdXJDb2x1bW5MYWJlbHMgPSB0aGlzLmdldEhvdXJDb2x1bW5MYWJlbHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGV2ZW50U291cmNlQ2hhbmdlID0gY2hhbmdlcy5ldmVudFNvdXJjZTtcclxuICAgICAgICBpZiAoZXZlbnRTb3VyY2VDaGFuZ2UgJiYgZXZlbnRTb3VyY2VDaGFuZ2UuY3VycmVudFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25EYXRhTG9hZGVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBsb2NrU3dpcGVUb1ByZXYgPSBjaGFuZ2VzLmxvY2tTd2lwZVRvUHJldjtcclxuICAgICAgICBpZiAobG9ja1N3aXBlVG9QcmV2KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLmxvY2tTd2lwZVRvUHJldihsb2NrU3dpcGVUb1ByZXYuY3VycmVudFZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvY2tTd2lwZXMgPSBjaGFuZ2VzLmxvY2tTd2lwZXM7XHJcbiAgICAgICAgaWYgKGxvY2tTd2lwZXMpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIubG9ja1N3aXBlcyhsb2NrU3dpcGVzLmN1cnJlbnRWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudFNvdXJjZUNoYW5nZWRTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVDaGFuZ2VkU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uU2xpZGVDaGFuZ2VkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNhbGxiYWNrT25Jbml0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tPbkluaXQgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgY3VycmVudFZpZXdJbmRleCA9IHRoaXMuY3VycmVudFZpZXdJbmRleDtcclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5zbGlkZXIuZ2V0QWN0aXZlSW5kZXgoKS50aGVuKGN1cnJlbnRTbGlkZUluZGV4ID0+IHtcclxuICAgICAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSAoY3VycmVudFNsaWRlSW5kZXggKyAyKSAlIDM7XHJcbiAgICAgICAgICAgIGlmKGlzTmFOKGN1cnJlbnRTbGlkZUluZGV4KSkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNsaWRlSW5kZXggPSBjdXJyZW50Vmlld0luZGV4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudFNsaWRlSW5kZXggLSBjdXJyZW50Vmlld0luZGV4ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTbGlkZUluZGV4ID09PSAwICYmIGN1cnJlbnRWaWV3SW5kZXggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IDE7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZVRvKDEsIDAsIGZhbHNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Vmlld0luZGV4IC0gY3VycmVudFNsaWRlSW5kZXggPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRTbGlkZUluZGV4ID09PSAyICYmIGN1cnJlbnRWaWV3SW5kZXggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVUbygzLCAwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50Vmlld0luZGV4ID0gY3VycmVudFNsaWRlSW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZShkaXJlY3Rpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmUoZGlyZWN0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XHJcbiAgICAgICAgY29uc3QgYWRqYWNlbnQgPSB0aGlzLmNhbGVuZGFyU2VydmljZS5nZXRBZGphY2VudENhbGVuZGFyRGF0ZSh0aGlzLm1vZGUsIGRpcmVjdGlvbik7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2Uuc2V0Q3VycmVudERhdGUoYWRqYWNlbnQpO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaFZpZXcoKTtcclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRIb3VyQ29sdW1uTGFiZWxzKCk6IHN0cmluZ1tdIHtcclxuICAgICAgICBjb25zdCBob3VyQ29sdW1uTGFiZWxzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhvdXIgPSAwLCBsZW5ndGggPSB0aGlzLnZpZXdzWzBdLnJvd3MubGVuZ3RoOyBob3VyIDwgbGVuZ3RoOyBob3VyICs9IDEpIHtcclxuICAgICAgICAgICAgLy8gaGFuZGxlIGVkZ2UgY2FzZSBmb3IgRFNUXHJcbiAgICAgICAgICAgIGlmIChob3VyID09PSAwICYmIHRoaXMudmlld3NbMF0ucm93c1tob3VyXVswXS50aW1lLmdldEhvdXJzKCkgIT09IHRoaXMuc3RhcnRIb3VyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0aW1lID0gbmV3IERhdGUodGhpcy52aWV3c1swXS5yb3dzW2hvdXJdWzBdLnRpbWUpO1xyXG4gICAgICAgICAgICAgICAgdGltZS5zZXREYXRlKHRpbWUuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgICAgICAgICB0aW1lLnNldEhvdXJzKHRoaXMuc3RhcnRIb3VyKTtcclxuICAgICAgICAgICAgICAgIGhvdXJDb2x1bW5MYWJlbHMucHVzaCh0aGlzLmZvcm1hdEhvdXJDb2x1bW5MYWJlbCh0aW1lKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBob3VyQ29sdW1uTGFiZWxzLnB1c2godGhpcy5mb3JtYXRIb3VyQ29sdW1uTGFiZWwodGhpcy52aWV3c1swXS5yb3dzW2hvdXJdWzBdLnRpbWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaG91ckNvbHVtbkxhYmVscztcclxuICAgIH1cclxuXHJcbiAgICBnZXRWaWV3RGF0YShzdGFydFRpbWU6IERhdGUpOiBJV2Vla1ZpZXcge1xyXG4gICAgICAgIGNvbnN0IGRhdGVzID0gV2Vla1ZpZXdDb21wb25lbnQuZ2V0RGF0ZXMoc3RhcnRUaW1lLCA3KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgICBkYXRlc1tpXS5kYXlIZWFkZXIgPSB0aGlzLmZvcm1hdERheUhlYWRlcihkYXRlc1tpXS5kYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJvd3M6IFdlZWtWaWV3Q29tcG9uZW50LmNyZWF0ZURhdGVPYmplY3RzKHN0YXJ0VGltZSwgdGhpcy5zdGFydEhvdXIsIHRoaXMuZW5kSG91ciwgdGhpcy5ob3VyU2VnbWVudHMpLFxyXG4gICAgICAgICAgICBkYXRlc1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0UmFuZ2UoY3VycmVudERhdGU6IERhdGUpOiBJUmFuZ2Uge1xyXG4gICAgICAgIGNvbnN0IHllYXIgPSBjdXJyZW50RGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgICBtb250aCA9IGN1cnJlbnREYXRlLmdldE1vbnRoKCksXHJcbiAgICAgICAgICAgIGRhdGUgPSBjdXJyZW50RGF0ZS5nZXREYXRlKCksXHJcbiAgICAgICAgICAgIGRheSA9IGN1cnJlbnREYXRlLmdldERheSgpO1xyXG4gICAgICAgIGxldCBkaWZmZXJlbmNlID0gZGF5IC0gdGhpcy5zdGFydGluZ0RheVdlZWs7XHJcblxyXG4gICAgICAgIGlmIChkaWZmZXJlbmNlIDwgMCkge1xyXG4gICAgICAgICAgICBkaWZmZXJlbmNlICs9IDc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZXQgaG91ciB0byAxMiB0byBhdm9pZCBEU1QgcHJvYmxlbVxyXG4gICAgICAgIGNvbnN0IGZpcnN0RGF5T2ZXZWVrID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUgLSBkaWZmZXJlbmNlLCAxMiwgMCwgMCksXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSAtIGRpZmZlcmVuY2UgKyA3LCAxMiwgMCwgMCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZTogZmlyc3REYXlPZldlZWssXHJcbiAgICAgICAgICAgIGVuZFRpbWVcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIG9uRGF0YUxvYWRlZCgpIHtcclxuICAgICAgICBjb25zdCBldmVudFNvdXJjZSA9IHRoaXMuZXZlbnRTb3VyY2UsXHJcbiAgICAgICAgICAgIGxlbiA9IGV2ZW50U291cmNlID8gZXZlbnRTb3VyY2UubGVuZ3RoIDogMCxcclxuICAgICAgICAgICAgc3RhcnRUaW1lID0gdGhpcy5yYW5nZS5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgIGVuZFRpbWUgPSB0aGlzLnJhbmdlLmVuZFRpbWUsXHJcbiAgICAgICAgICAgIHV0Y1N0YXJ0VGltZSA9IERhdGUuVVRDKHN0YXJ0VGltZS5nZXRGdWxsWWVhcigpLCBzdGFydFRpbWUuZ2V0TW9udGgoKSwgc3RhcnRUaW1lLmdldERhdGUoKSksXHJcbiAgICAgICAgICAgIHV0Y0VuZFRpbWUgPSBEYXRlLlVUQyhlbmRUaW1lLmdldEZ1bGxZZWFyKCksIGVuZFRpbWUuZ2V0TW9udGgoKSwgZW5kVGltZS5nZXREYXRlKCkpLFxyXG4gICAgICAgICAgICBjdXJyZW50Vmlld0luZGV4ID0gdGhpcy5jdXJyZW50Vmlld0luZGV4LFxyXG4gICAgICAgICAgICByb3dzID0gdGhpcy52aWV3c1tjdXJyZW50Vmlld0luZGV4XS5yb3dzLFxyXG4gICAgICAgICAgICBkYXRlcyA9IHRoaXMudmlld3NbY3VycmVudFZpZXdJbmRleF0uZGF0ZXMsXHJcbiAgICAgICAgICAgIG9uZUhvdXIgPSAzNjAwMDAwLFxyXG4gICAgICAgICAgICBvbmVEYXkgPSA4NjQwMDAwMCxcclxuICAgICAgICAgICAgLy8gYWRkIGFsbGRheSBlcHNcclxuICAgICAgICAgICAgZXBzID0gMC4wMTYsXHJcbiAgICAgICAgICAgIHJhbmdlU3RhcnRSb3dJbmRleCA9IHRoaXMuc3RhcnRIb3VyICogdGhpcy5ob3VyU2VnbWVudHMsXHJcbiAgICAgICAgICAgIHJhbmdlRW5kUm93SW5kZXggPSB0aGlzLmVuZEhvdXIgKiB0aGlzLmhvdXJTZWdtZW50cyxcclxuICAgICAgICAgICAgYWxsUm93cyA9IDI0ICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgbGV0IGFsbERheUV2ZW50SW5SYW5nZSA9IGZhbHNlLFxyXG4gICAgICAgICAgICBub3JtYWxFdmVudEluUmFuZ2UgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpICs9IDEpIHtcclxuICAgICAgICAgICAgZGF0ZXNbaV0uZXZlbnRzID0gW107XHJcbiAgICAgICAgICAgIGRhdGVzW2ldLmhhc0V2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBkYXkgPSAwOyBkYXkgPCA3OyBkYXkgKz0gMSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBob3VyID0gMDsgaG91ciA8IHRoaXMuaG91clJhbmdlOyBob3VyICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIHJvd3NbaG91cl1bZGF5XS5ldmVudHMgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gZXZlbnRTb3VyY2VbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U3RhcnRUaW1lID0gZXZlbnQuc3RhcnRUaW1lO1xyXG4gICAgICAgICAgICBjb25zdCBldmVudEVuZFRpbWUgPSBldmVudC5lbmRUaW1lO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50VVRDU3RhcnRUaW1lOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ0VuZFRpbWU6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5hbGxEYXkpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDU3RhcnRUaW1lID0gZXZlbnRTdGFydFRpbWUuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENFbmRUaW1lID0gZXZlbnRFbmRUaW1lLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDU3RhcnRUaW1lID0gRGF0ZS5VVEMoZXZlbnRTdGFydFRpbWUuZ2V0RnVsbFllYXIoKSwgZXZlbnRTdGFydFRpbWUuZ2V0TW9udGgoKSwgZXZlbnRTdGFydFRpbWUuZ2V0RGF0ZSgpKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50VVRDRW5kVGltZSA9IERhdGUuVVRDKGV2ZW50RW5kVGltZS5nZXRGdWxsWWVhcigpLCBldmVudEVuZFRpbWUuZ2V0TW9udGgoKSwgZXZlbnRFbmRUaW1lLmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnRVVENFbmRUaW1lIDw9IHV0Y1N0YXJ0VGltZSB8fCBldmVudFVUQ1N0YXJ0VGltZSA+PSB1dGNFbmRUaW1lIHx8IGV2ZW50U3RhcnRUaW1lID49IGV2ZW50RW5kVGltZSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudC5hbGxEYXkpIHtcclxuICAgICAgICAgICAgICAgIGFsbERheUV2ZW50SW5SYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGFsbERheVN0YXJ0SW5kZXg6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudFVUQ1N0YXJ0VGltZSA8PSB1dGNTdGFydFRpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxEYXlTdGFydEluZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsRGF5U3RhcnRJbmRleCA9IE1hdGgucm91bmQoKGV2ZW50VVRDU3RhcnRUaW1lIC0gdXRjU3RhcnRUaW1lKSAvIG9uZURheSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGFsbERheUVuZEluZGV4OiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRVVENFbmRUaW1lID49IHV0Y0VuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxEYXlFbmRJbmRleCA9IE1hdGgucm91bmQoKHV0Y0VuZFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lRGF5KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsRGF5RW5kSW5kZXggPSBNYXRoLnJvdW5kKChldmVudFVUQ0VuZFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lRGF5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5QWxsRGF5RXZlbnQ6IElEaXNwbGF5RXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhcnRJbmRleDogYWxsRGF5U3RhcnRJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICBlbmRJbmRleDogYWxsRGF5RW5kSW5kZXhcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGV2ZW50U2V0ID0gZGF0ZXNbYWxsRGF5U3RhcnRJbmRleF0uZXZlbnRzO1xyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50U2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQucHVzaChkaXNwbGF5QWxsRGF5RXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudFNldCA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50U2V0LnB1c2goZGlzcGxheUFsbERheUV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlc1thbGxEYXlTdGFydEluZGV4XS5ldmVudHMgPSBldmVudFNldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRhdGVzW2FsbERheVN0YXJ0SW5kZXhdLmhhc0V2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vcm1hbEV2ZW50SW5SYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVEaWZmZXJlbmNlU3RhcnQ6IG51bWJlcjtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudFVUQ1N0YXJ0VGltZSA8IHV0Y1N0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlU3RhcnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZVN0YXJ0ID0gKGV2ZW50VVRDU3RhcnRUaW1lIC0gdXRjU3RhcnRUaW1lKSAvIG9uZUhvdXIgKiB0aGlzLmhvdXJTZWdtZW50cyArIChldmVudFN0YXJ0VGltZS5nZXRIb3VycygpICsgZXZlbnRTdGFydFRpbWUuZ2V0TWludXRlcygpIC8gNjApICogdGhpcy5ob3VyU2VnbWVudHM7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWVEaWZmZXJlbmNlRW5kOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRVVENFbmRUaW1lID4gdXRjRW5kVGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlRW5kID0gKHV0Y0VuZFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lSG91ciAqIHRoaXMuaG91clNlZ21lbnRzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZUVuZCA9IChldmVudFVUQ0VuZFRpbWUgLSBvbmVEYXkgLSB1dGNTdGFydFRpbWUpIC8gb25lSG91ciAqIHRoaXMuaG91clNlZ21lbnRzICsgKGV2ZW50RW5kVGltZS5nZXRIb3VycygpICsgZXZlbnRFbmRUaW1lLmdldE1pbnV0ZXMoKSAvIDYwKSAqIHRoaXMuaG91clNlZ21lbnRzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBNYXRoLmZsb29yKHRpbWVEaWZmZXJlbmNlU3RhcnQpLFxyXG4gICAgICAgICAgICAgICAgICAgIGVuZEluZGV4ID0gTWF0aC5jZWlsKHRpbWVEaWZmZXJlbmNlRW5kIC0gZXBzKTtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydFJvd0luZGV4ID0gc3RhcnRJbmRleCAlIGFsbFJvd3MsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF5SW5kZXggPSBNYXRoLmZsb29yKHN0YXJ0SW5kZXggLyBhbGxSb3dzKSxcclxuICAgICAgICAgICAgICAgICAgICBlbmRPZkRheSA9IGRheUluZGV4ICogYWxsUm93cyxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydE9mZnNldCA9IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kT2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3VyUGFydHMgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRSb3dJbmRleCA8IHJhbmdlU3RhcnRSb3dJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydE9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRPZmZzZXQgPSBNYXRoLmZsb29yKCh0aW1lRGlmZmVyZW5jZVN0YXJ0IC0gc3RhcnRJbmRleCkgKiB0aGlzLmhvdXJQYXJ0cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICBlbmRPZkRheSArPSBhbGxSb3dzO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbmRSb3dJbmRleDogbnVtYmVyO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmRPZkRheSA8IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZFJvd0luZGV4ID0gYWxsUm93cztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW5kT2ZEYXkgPT09IGVuZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRSb3dJbmRleCA9IGFsbFJvd3M7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRSb3dJbmRleCA9IGVuZEluZGV4ICUgYWxsUm93cztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ob3VyUGFydHMgIT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbmRSb3dJbmRleCA+IHJhbmdlRW5kUm93SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRPZmZzZXQgPSBNYXRoLmZsb29yKChlbmRJbmRleCAtIHRpbWVEaWZmZXJlbmNlRW5kKSAqIHRoaXMuaG91clBhcnRzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnRSb3dJbmRleCA8IHJhbmdlU3RhcnRSb3dJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFJvd0luZGV4ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFydFJvd0luZGV4IC09IHJhbmdlU3RhcnRSb3dJbmRleDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVuZFJvd0luZGV4ID4gcmFuZ2VFbmRSb3dJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmRSb3dJbmRleCA9IHJhbmdlRW5kUm93SW5kZXg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVuZFJvd0luZGV4IC09IHJhbmdlU3RhcnRSb3dJbmRleDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0Um93SW5kZXggPCBlbmRSb3dJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5RXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXg6IHN0YXJ0Um93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbmRJbmRleDogZW5kUm93SW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE9mZnNldCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuZE9mZnNldFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZXZlbnRTZXQgPSByb3dzW3N0YXJ0Um93SW5kZXhdW2RheUluZGV4XS5ldmVudHM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudFNldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQucHVzaChkaXNwbGF5RXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50U2V0LnB1c2goZGlzcGxheUV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3Nbc3RhcnRSb3dJbmRleF1bZGF5SW5kZXhdLmV2ZW50cyA9IGV2ZW50U2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGVzW2RheUluZGV4XS5oYXNFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0Um93SW5kZXggPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0T2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBkYXlJbmRleCArPSAxO1xyXG4gICAgICAgICAgICAgICAgfSB3aGlsZSAoZW5kT2ZEYXkgPCBlbmRJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChub3JtYWxFdmVudEluUmFuZ2UpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgZGF5ID0gMDsgZGF5IDwgNzsgZGF5ICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGxldCBvcmRlcmVkRXZlbnRzOiBJRGlzcGxheUV2ZW50W10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGhvdXIgPSAwOyBob3VyIDwgdGhpcy5ob3VyUmFuZ2U7IGhvdXIgKz0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3dzW2hvdXJdW2RheV0uZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3NbaG91cl1bZGF5XS5ldmVudHMuc29ydChXZWVrVmlld0NvbXBvbmVudC5jb21wYXJlRXZlbnRCeVN0YXJ0T2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXJlZEV2ZW50cyA9IG9yZGVyZWRFdmVudHMuY29uY2F0KHJvd3NbaG91cl1bZGF5XS5ldmVudHMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChvcmRlcmVkRXZlbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYWNlRXZlbnRzKG9yZGVyZWRFdmVudHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoYWxsRGF5RXZlbnRJblJhbmdlKSB7XHJcbiAgICAgICAgICAgIGxldCBvcmRlcmVkQWxsRGF5RXZlbnRzOiBJRGlzcGxheUV2ZW50W10gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZGF5ID0gMDsgZGF5IDwgNzsgZGF5ICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlc1tkYXldLmV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyZWRBbGxEYXlFdmVudHMgPSBvcmRlcmVkQWxsRGF5RXZlbnRzLmNvbmNhdChkYXRlc1tkYXldLmV2ZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG9yZGVyZWRBbGxEYXlFdmVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjZUFsbERheUV2ZW50cyhvcmRlcmVkQWxsRGF5RXZlbnRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1NlbGVjdCkge1xyXG4gICAgICAgICAgICBsZXQgZmluZFNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZERhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNzsgciArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0ZXNbcl0uc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZERhdGUgPSBkYXRlc1tyXTtcclxuICAgICAgICAgICAgICAgICAgICBmaW5kU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZmluZFNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcmtEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID0gdGhpcy5tYXJrRGlzYWJsZWQoc2VsZWN0ZWREYXRlLmRhdGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMub25UaW1lU2VsZWN0ZWQuZW1pdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRUaW1lOiBzZWxlY3RlZERhdGUuZGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudHM6IHNlbGVjdGVkRGF0ZS5ldmVudHMubWFwKGUgPT4gZS5ldmVudCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2hWaWV3KCkge1xyXG4gICAgICAgIHRoaXMucmFuZ2UgPSB0aGlzLmdldFJhbmdlKHRoaXMuY2FsZW5kYXJTZXJ2aWNlLmN1cnJlbnREYXRlKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGVkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uVGl0bGVDaGFuZ2VkLmVtaXQodGl0bGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5wb3B1bGF0ZUFkamFjZW50Vmlld3ModGhpcyk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVDdXJyZW50Vmlldyh0aGlzLnJhbmdlLnN0YXJ0VGltZSwgdGhpcy52aWV3c1t0aGlzLmN1cnJlbnRWaWV3SW5kZXhdKTtcclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5yYW5nZUNoYW5nZWQodGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcclxuICAgICAgICBjb25zdCBmaXJzdERheU9mV2VlayA9IG5ldyBEYXRlKHRoaXMucmFuZ2Uuc3RhcnRUaW1lLmdldFRpbWUoKSk7XHJcbiAgICAgICAgZmlyc3REYXlPZldlZWsuc2V0SG91cnMoMTIsIDAsIDAsIDApO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmZvcm1hdFRpdGxlKGZpcnN0RGF5T2ZXZWVrKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRIaWdobGlnaHRDbGFzcyhkYXRlOiBJV2Vla1ZpZXdEYXRlUm93KTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmIChkYXRlLmhhc0V2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xhc3NOYW1lID0gJ3dlZWt2aWV3LXdpdGgtZXZlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGUuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJ3dlZWt2aWV3LXNlbGVjdGVkJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRlLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGNsYXNzTmFtZSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lICs9ICcgJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjbGFzc05hbWUgKz0gJ3dlZWt2aWV3LWN1cnJlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNsYXNzTmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3Qoc2VsZWN0ZWRUaW1lOiBEYXRlLCBldmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm1hcmtEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBkaXNhYmxlZCA9IHRoaXMubWFya0Rpc2FibGVkKHNlbGVjdGVkVGltZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9uVGltZVNlbGVjdGVkLmVtaXQoe1xyXG4gICAgICAgICAgICBzZWxlY3RlZFRpbWUsXHJcbiAgICAgICAgICAgIGV2ZW50czogZXZlbnRzLm1hcChlID0+IGUuZXZlbnQpLFxyXG4gICAgICAgICAgICBkaXNhYmxlZFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHBsYWNlRXZlbnRzKG9yZGVyZWRFdmVudHM6IElEaXNwbGF5RXZlbnRbXSkge1xyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb24ob3JkZXJlZEV2ZW50cyk7XHJcbiAgICAgICAgV2Vla1ZpZXdDb21wb25lbnQuY2FsY3VsYXRlV2lkdGgob3JkZXJlZEV2ZW50cywgdGhpcy5ob3VyUmFuZ2UsIHRoaXMuaG91clBhcnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBwbGFjZUFsbERheUV2ZW50cyhvcmRlcmVkRXZlbnRzOiBJRGlzcGxheUV2ZW50W10pIHtcclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKG9yZGVyZWRFdmVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIG92ZXJsYXAoZXZlbnQxOiBJRGlzcGxheUV2ZW50LCBldmVudDI6IElEaXNwbGF5RXZlbnQpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZWFybHlFdmVudCA9IGV2ZW50MSxcclxuICAgICAgICAgICAgbGF0ZUV2ZW50ID0gZXZlbnQyO1xyXG4gICAgICAgIGlmIChldmVudDEuc3RhcnRJbmRleCA+IGV2ZW50Mi5zdGFydEluZGV4IHx8IChldmVudDEuc3RhcnRJbmRleCA9PT0gZXZlbnQyLnN0YXJ0SW5kZXggJiYgZXZlbnQxLnN0YXJ0T2Zmc2V0ID4gZXZlbnQyLnN0YXJ0T2Zmc2V0KSkge1xyXG4gICAgICAgICAgICBlYXJseUV2ZW50ID0gZXZlbnQyO1xyXG4gICAgICAgICAgICBsYXRlRXZlbnQgPSBldmVudDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZWFybHlFdmVudC5lbmRJbmRleCA8PSBsYXRlRXZlbnQuc3RhcnRJbmRleCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuICEoZWFybHlFdmVudC5lbmRJbmRleCAtIGxhdGVFdmVudC5zdGFydEluZGV4ID09PSAxICYmIGVhcmx5RXZlbnQuZW5kT2Zmc2V0ICsgbGF0ZUV2ZW50LnN0YXJ0T2Zmc2V0ID49IHRoaXMuaG91clBhcnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY3VsYXRlUG9zaXRpb24oZXZlbnRzOiBJRGlzcGxheUV2ZW50W10pIHtcclxuICAgICAgICBjb25zdCBsZW4gPSBldmVudHMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpc0ZvcmJpZGRlbiA9IG5ldyBBcnJheShsZW4pO1xyXG4gICAgICAgIGxldCBtYXhDb2x1bW4gPSAwO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIGxldCBjb2w6IG51bWJlcjtcclxuICAgICAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBtYXhDb2x1bW47IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpc0ZvcmJpZGRlbltjb2xdID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBpOyBqICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm92ZXJsYXAoZXZlbnRzW2ldLCBldmVudHNbal0pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXNGb3JiaWRkZW5bZXZlbnRzW2pdLnBvc2l0aW9uXSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yIChjb2wgPSAwOyBjb2wgPCBtYXhDb2x1bW47IGNvbCArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWlzRm9yYmlkZGVuW2NvbF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY29sIDwgbWF4Q29sdW1uKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbaV0ucG9zaXRpb24gPSBjb2w7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbaV0ucG9zaXRpb24gPSBtYXhDb2x1bW4rKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlyID09PSAncnRsJykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgICAgICBldmVudHNbaV0ucG9zaXRpb24gPSBtYXhDb2x1bW4gLSAxIC0gZXZlbnRzW2ldLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUN1cnJlbnRWaWV3KGN1cnJlbnRWaWV3U3RhcnREYXRlOiBEYXRlLCB2aWV3OiBJV2Vla1ZpZXcpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Q2FsZW5kYXJEYXRlID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuY3VycmVudERhdGUsXHJcbiAgICAgICAgICAgIHRvZGF5ID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgb25lRGF5ID0gODY0MDAwMDAsXHJcbiAgICAgICAgICAgIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA9IE1hdGgucm91bmQoKERhdGUuVVRDKGN1cnJlbnRDYWxlbmRhckRhdGUuZ2V0RnVsbFllYXIoKSwgY3VycmVudENhbGVuZGFyRGF0ZS5nZXRNb250aCgpLCBjdXJyZW50Q2FsZW5kYXJEYXRlLmdldERhdGUoKSkgLSBEYXRlLlVUQyhjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpLCBjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRNb250aCgpLCBjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXREYXRlKCkpKSAvIG9uZURheSksXHJcbiAgICAgICAgICAgIGN1cnJlbnREYXlEaWZmZXJlbmNlID0gTWF0aC5mbG9vcigoRGF0ZS5VVEModG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKSAtIERhdGUuVVRDKGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldE1vbnRoKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldERhdGUoKSkpIC8gb25lRGF5KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCA3OyByICs9IDEpIHtcclxuICAgICAgICAgICAgdmlldy5kYXRlc1tyXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA+PSAwICYmIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA8IDcgJiYgdGhpcy5hdXRvU2VsZWN0KSB7XHJcbiAgICAgICAgICAgIHZpZXcuZGF0ZXNbc2VsZWN0ZWREYXlEaWZmZXJlbmNlXS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudERheURpZmZlcmVuY2UgPj0gMCAmJiBjdXJyZW50RGF5RGlmZmVyZW5jZSA8IDcpIHtcclxuICAgICAgICAgICAgdmlldy5kYXRlc1tjdXJyZW50RGF5RGlmZmVyZW5jZV0uY3VycmVudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRheVNlbGVjdGVkKHZpZXdEYXRlOiBJV2Vla1ZpZXdEYXRlUm93KSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWREYXRlID0gdmlld0RhdGUuZGF0ZSxcclxuICAgICAgICAgICAgZGF0ZXMgPSB0aGlzLnZpZXdzW3RoaXMuY3VycmVudFZpZXdJbmRleF0uZGF0ZXMsXHJcbiAgICAgICAgICAgIGN1cnJlbnRWaWV3U3RhcnREYXRlID0gdGhpcy5yYW5nZS5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgIG9uZURheSA9IDg2NDAwMDAwLFxyXG4gICAgICAgICAgICBzZWxlY3RlZERheURpZmZlcmVuY2UgPSBNYXRoLnJvdW5kKChEYXRlLlVUQyhzZWxlY3RlZERhdGUuZ2V0RnVsbFllYXIoKSwgc2VsZWN0ZWREYXRlLmdldE1vbnRoKCksIHNlbGVjdGVkRGF0ZS5nZXREYXRlKCkpIC0gRGF0ZS5VVEMoY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RnVsbFllYXIoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0TW9udGgoKSwgY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RGF0ZSgpKSkgLyBvbmVEYXkpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5zZXRDdXJyZW50RGF0ZShzZWxlY3RlZERhdGUpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDc7IHIgKz0gMSkge1xyXG4gICAgICAgICAgICBkYXRlc1tyXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA+PSAwICYmIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA8IDcpIHtcclxuICAgICAgICAgICAgZGF0ZXNbc2VsZWN0ZWREYXlEaWZmZXJlbmNlXS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5tYXJrRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgZGlzYWJsZWQgPSB0aGlzLm1hcmtEaXNhYmxlZChzZWxlY3RlZERhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vbkRheUhlYWRlclNlbGVjdGVkLmVtaXQoe3NlbGVjdGVkVGltZTogc2VsZWN0ZWREYXRlLCBldmVudHM6IHZpZXdEYXRlLmV2ZW50cy5tYXAoZSA9PiBlLmV2ZW50KSwgZGlzYWJsZWR9KTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRTY3JvbGxQb3NpdGlvbihzY3JvbGxQb3NpdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5pbml0U2Nyb2xsUG9zaXRpb24gPSBzY3JvbGxQb3NpdGlvbjtcclxuICAgIH1cclxufVxyXG4iXX0=