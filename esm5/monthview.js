import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CalendarService } from './calendar.service';
var MonthViewComponent = /** @class */ (function () {
    function MonthViewComponent(calendarService) {
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
    MonthViewComponent_1 = MonthViewComponent;
    ;
    MonthViewComponent.getDates = function (startDate, n) {
        var dates = new Array(n), current = new Date(startDate.getTime());
        var i = 0;
        while (i < n) {
            dates[i++] = new Date(current.getTime());
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };
    MonthViewComponent.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.sliderOptions) {
            this.sliderOptions = {};
        }
        this.sliderOptions.loop = true;
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDay) {
            this.formatDayLabel = this.dateFormatter.formatMonthViewDay;
        }
        else {
            var dayLabelDatePipe_1 = new DatePipe('en-US');
            this.formatDayLabel = function (date) {
                return dayLabelDatePipe_1.transform(date, this.formatDay);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewDayHeader) {
            this.formatDayHeaderLabel = this.dateFormatter.formatMonthViewDayHeader;
        }
        else {
            var datePipe_1 = new DatePipe(this.locale);
            this.formatDayHeaderLabel = function (date) {
                return datePipe_1.transform(date, this.formatDayHeader);
            };
        }
        if (this.dateFormatter && this.dateFormatter.formatMonthViewTitle) {
            this.formatTitle = this.dateFormatter.formatMonthViewTitle;
        }
        else {
            var datePipe_2 = new DatePipe(this.locale);
            this.formatTitle = function (date) {
                return datePipe_2.transform(date, this.formatMonthTitle);
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
        this.currentDateChangedFromParentSubscription = this.calendarService.currentDateChangedFromParent$.subscribe(function (currentDate) {
            _this.refreshView();
        });
        this.eventSourceChangedSubscription = this.calendarService.eventSourceChanged$.subscribe(function () {
            _this.onDataLoaded();
        });
        this.slideChangedSubscription = this.calendarService.slideChanged$.subscribe(function (direction) {
            if (direction === 1) {
                _this.slider.slideNext();
            }
            else if (direction === -1) {
                _this.slider.slidePrev();
            }
        });
        this.slideUpdatedSubscription = this.calendarService.slideUpdated$.subscribe(function () {
            _this.slider.update();
        });
    };
    MonthViewComponent.prototype.ngOnDestroy = function () {
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
    };
    MonthViewComponent.prototype.ngOnChanges = function (changes) {
        if (!this.inited) {
            return;
        }
        var eventSourceChange = changes.eventSource;
        if (eventSourceChange && eventSourceChange.currentValue) {
            this.onDataLoaded();
        }
        var lockSwipeToPrev = changes.lockSwipeToPrev;
        if (lockSwipeToPrev) {
            this.slider.lockSwipeToPrev(lockSwipeToPrev.currentValue);
        }
        var lockSwipes = changes.lockSwipes;
        if (lockSwipes) {
            this.slider.lockSwipes(lockSwipes.currentValue);
        }
    };
    MonthViewComponent.prototype.ngAfterViewInit = function () {
        var title = this.getTitle();
        this.onTitleChanged.emit(title);
    };
    MonthViewComponent.prototype.onSlideChanged = function () {
        var _this = this;
        if (this.callbackOnInit) {
            this.callbackOnInit = false;
            return;
        }
        var direction = 0;
        var currentViewIndex = this.currentViewIndex;
        this.slider.getActiveIndex().then(function (currentSlideIndex) {
            currentSlideIndex = (currentSlideIndex + 2) % 3;
            if (isNaN(currentSlideIndex)) {
                currentSlideIndex = currentViewIndex;
            }
            if (currentSlideIndex - currentViewIndex === 1) {
                direction = 1;
            }
            else if (currentSlideIndex === 0 && currentViewIndex === 2) {
                direction = 1;
                _this.slider.slideTo(1, 0, false);
            }
            else if (currentViewIndex - currentSlideIndex === 1) {
                direction = -1;
            }
            else if (currentSlideIndex === 2 && currentViewIndex === 0) {
                direction = -1;
                _this.slider.slideTo(3, 0, false);
            }
            _this.currentViewIndex = currentSlideIndex;
            _this.move(direction);
        });
    };
    MonthViewComponent.prototype.move = function (direction) {
        if (direction === 0) {
            return;
        }
        this.direction = direction;
        if (!this.moveOnSelected) {
            var adjacentDate = this.calendarService.getAdjacentCalendarDate(this.mode, direction);
            this.calendarService.setCurrentDate(adjacentDate);
        }
        this.refreshView();
        this.direction = 0;
        this.moveOnSelected = false;
    };
    MonthViewComponent.prototype.createDateObject = function (date) {
        var disabled = false;
        if (this.markDisabled) {
            disabled = this.markDisabled(date);
        }
        return {
            date: date,
            events: [],
            label: this.formatDayLabel(date),
            secondary: false,
            disabled: disabled
        };
    };
    MonthViewComponent.prototype.getViewData = function (startTime) {
        var startDate = startTime, date = startDate.getDate(), month = (startDate.getMonth() + (date !== 1 ? 1 : 0)) % 12;
        var dates = MonthViewComponent_1.getDates(startDate, 42);
        var days = [];
        for (var i = 0; i < 42; i++) {
            var dateObject = this.createDateObject(dates[i]);
            dateObject.secondary = dates[i].getMonth() !== month;
            days[i] = dateObject;
        }
        var dayHeaders = [];
        for (var i = 0; i < 7; i++) {
            dayHeaders.push(this.formatDayHeaderLabel(days[i].date));
        }
        return {
            dates: days,
            dayHeaders: dayHeaders
        };
    };
    MonthViewComponent.prototype.getHighlightClass = function (date) {
        var className = '';
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
    };
    MonthViewComponent.prototype.getRange = function (currentDate) {
        var year = currentDate.getFullYear(), month = currentDate.getMonth(), firstDayOfMonth = new Date(year, month, 1, 12, 0, 0), // set hour to 12 to avoid DST problem
        difference = this.startingDayMonth - firstDayOfMonth.getDay(), numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference, startDate = new Date(firstDayOfMonth.getTime());
        if (numDisplayedFromPreviousMonth > 0) {
            startDate.setDate(-numDisplayedFromPreviousMonth + 1);
        }
        var endDate = new Date(startDate.getTime());
        endDate.setDate(endDate.getDate() + 42);
        return {
            startTime: startDate,
            endTime: endDate
        };
    };
    MonthViewComponent.prototype.onDataLoaded = function () {
        var range = this.range, eventSource = this.eventSource, len = eventSource ? eventSource.length : 0, startTime = range.startTime, endTime = range.endTime, utcStartTime = Date.UTC(startTime.getFullYear(), startTime.getMonth(), startTime.getDate()), utcEndTime = Date.UTC(endTime.getFullYear(), endTime.getMonth(), endTime.getDate()), currentViewIndex = this.currentViewIndex, dates = this.views[currentViewIndex].dates, oneDay = 86400000, eps = 0.0006;
        for (var r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].hasEvent = false;
                dates[r].events = [];
            }
        }
        for (var i = 0; i < len; i += 1) {
            var event_1 = eventSource[i], eventStartTime = event_1.startTime, eventEndTime = event_1.endTime;
            var eventUTCStartTime = void 0, eventUTCEndTime = void 0;
            if (event_1.allDay) {
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
            var timeDifferenceStart = void 0, timeDifferenceEnd = void 0;
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
            var index = Math.floor(timeDifferenceStart);
            var endIndex = Math.ceil(timeDifferenceEnd - eps);
            while (index < endIndex) {
                dates[index].hasEvent = true;
                var eventSet = dates[index].events;
                if (eventSet) {
                    eventSet.push(event_1);
                }
                else {
                    eventSet = [];
                    eventSet.push(event_1);
                    dates[index].events = eventSet;
                }
                index += 1;
            }
        }
        for (var r = 0; r < 42; r += 1) {
            if (dates[r].hasEvent) {
                dates[r].events.sort(this.compareEvent);
            }
        }
        if (this.autoSelect) {
            var findSelected = false;
            for (var r = 0; r < 42; r += 1) {
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
    };
    MonthViewComponent.prototype.refreshView = function () {
        this.range = this.getRange(this.calendarService.currentDate);
        if (this.inited) {
            var title = this.getTitle();
            this.onTitleChanged.emit(title);
        }
        this.calendarService.populateAdjacentViews(this);
        this.updateCurrentView(this.range.startTime, this.views[this.currentViewIndex]);
        this.calendarService.rangeChanged(this);
    };
    MonthViewComponent.prototype.getTitle = function () {
        var currentViewStartDate = this.range.startTime, date = currentViewStartDate.getDate(), month = (currentViewStartDate.getMonth() + (date !== 1 ? 1 : 0)) % 12, year = currentViewStartDate.getFullYear() + (date !== 1 && month === 0 ? 1 : 0), headerDate = new Date(year, month, 1, 12, 0, 0, 0);
        return this.formatTitle(headerDate);
    };
    MonthViewComponent.prototype.compareEvent = function (event1, event2) {
        if (event1.allDay) {
            return 1;
        }
        else if (event2.allDay) {
            return -1;
        }
        else {
            return (event1.startTime.getTime() - event2.startTime.getTime());
        }
    };
    MonthViewComponent.prototype.select = function (viewDate) {
        if (!this.views) {
            return;
        }
        var selectedDate = viewDate.date, events = viewDate.events;
        if (!viewDate.disabled) {
            var dates = this.views[this.currentViewIndex].dates, currentCalendarDate = this.calendarService.currentDate, currentMonth = currentCalendarDate.getMonth(), currentYear = currentCalendarDate.getFullYear(), selectedMonth = selectedDate.getMonth(), selectedYear = selectedDate.getFullYear();
            var direction = 0;
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
                var currentViewStartDate = this.range.startTime, oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
                for (var r = 0; r < 42; r += 1) {
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
        this.onTimeSelected.emit({ selectedTime: selectedDate, events: events, disabled: viewDate.disabled });
    };
    MonthViewComponent.prototype.slideView = function (direction) {
        if (direction === 1) {
            this.slider.slideNext();
        }
        else if (direction === -1) {
            this.slider.slidePrev();
        }
    };
    MonthViewComponent.prototype.updateCurrentView = function (currentViewStartDate, view) {
        var currentCalendarDate = this.calendarService.currentDate, today = new Date(), oneDay = 86400000, selectedDayDifference = Math.round((Date.UTC(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), currentCalendarDate.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay), currentDayDifference = Math.round((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(currentViewStartDate.getFullYear(), currentViewStartDate.getMonth(), currentViewStartDate.getDate())) / oneDay);
        for (var r = 0; r < 42; r += 1) {
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
    };
    MonthViewComponent.prototype.eventSelected = function (event) {
        this.onEventSelected.emit(event);
    };
    var MonthViewComponent_1;
    MonthViewComponent.ctorParameters = function () { return [
        { type: CalendarService }
    ]; };
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
            template: "\n        <div>\n            <ion-slides #monthSlider [options]=\"sliderOptions\" [dir]=\"dir\" (ionSlideDidChange)=\"onSlideChanged()\">\n                <ion-slide>\n                    <table *ngIf=\"0===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr>\n                            <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[0].dates[row*7+col])\"\n                                [ngClass]=\"getHighlightClass(views[0].dates[row*7+col])\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                    <table *ngIf=\"0!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr class=\"text-center\">\n                            <th *ngFor=\"let dayHeader of views[0].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[0], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        <tr>\n                        </tbody>\n                    </table>\n                </ion-slide>\n                <ion-slide>\n                    <table *ngIf=\"1===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr>\n                            <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[1].dates[row*7+col])\"\n                                [ngClass]=\"getHighlightClass(views[1].dates[row*7+col])\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                    <table *ngIf=\"1!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr class=\"text-center\">\n                            <th *ngFor=\"let dayHeader of views[1].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[1], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        <tr>\n                        </tbody>\n                    </table>\n                </ion-slide>\n                <ion-slide>\n                    <table *ngIf=\"2===currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr>\n                            <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\" tappable (click)=\"select(views[2].dates[row*7+col])\"\n                                [ngClass]=\"getHighlightClass(views[2].dates[row*7+col])\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        </tr>\n                        </tbody>\n                    </table>\n                    <table *ngIf=\"2!==currentViewIndex\" class=\"table table-bordered table-fixed monthview-datetable\">\n                        <thead>\n                        <tr class=\"text-center\">\n                            <th *ngFor=\"let dayHeader of views[2].dayHeaders\">\n                                <small>{{dayHeader}}</small>\n                            </th>\n                        </tr>\n                        </thead>\n                        <tbody>\n                        <tr *ngFor=\"let row of [0,1,2,3,4,5]\">\n                            <td *ngFor=\"let col of [0,1,2,3,4,5,6]\">\n                                <ng-template [ngTemplateOutlet]=\"monthviewInactiveDisplayEventTemplate\"\n                                             [ngTemplateOutletContext]=\"{view: views[2], row: row, col: col}\">\n                                </ng-template>\n                            </td>\n                        <tr>\n                        </tbody>\n                    </table>\n                </ion-slide>\n            </ion-slides>\n            <ng-template [ngTemplateOutlet]=\"monthviewEventDetailTemplate\"\n                         [ngTemplateOutletContext]=\"{showEventDetail:showEventDetail, selectedDate: selectedDate, noEventsLabel: noEventsLabel}\">\n            </ng-template>\n        </div>\n    ",
            styles: ["\n        .text-muted {\n            color: #999;\n        }\n\n        .table-fixed {\n            table-layout: fixed;\n        }\n\n        .table {\n            width: 100%;\n            max-width: 100%;\n            background-color: transparent;\n        }\n\n        .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td,\n        .table > tbody > tr > td, .table > tfoot > tr > td {\n            padding: 8px;\n            line-height: 20px;\n            vertical-align: top;\n        }\n\n        .table > thead > tr > th {\n            vertical-align: bottom;\n            border-bottom: 2px solid #ddd;\n        }\n\n        .table > thead:first-child > tr:first-child > th, .table > thead:first-child > tr:first-child > td {\n            border-top: 0\n        }\n\n        .table > tbody + tbody {\n            border-top: 2px solid #ddd;\n        }\n\n        .table-bordered {\n            border: 1px solid #ddd;\n        }\n\n        .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th,\n        .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td {\n            border: 1px solid #ddd;\n        }\n\n        .table-bordered > thead > tr > th, .table-bordered > thead > tr > td {\n            border-bottom-width: 2px;\n        }\n\n        .table-striped > tbody > tr:nth-child(odd) > td, .table-striped > tbody > tr:nth-child(odd) > th {\n            background-color: #f9f9f9\n        }\n\n        .monthview-primary-with-event {\n            background-color: #3a87ad;\n            color: white;\n        }\n\n        .monthview-current {\n            background-color: #f0f0f0;\n        }\n\n        .monthview-selected {\n            background-color: #009900;\n            color: white;\n        }\n\n        .monthview-datetable td.monthview-disabled {\n            color: lightgrey;\n            cursor: default;\n        }\n\n        .monthview-datetable th {\n            text-align: center;\n        }\n\n        .monthview-datetable td {\n            cursor: pointer;\n            text-align: center;\n        }\n\n        .monthview-secondary-with-event {\n            background-color: #d9edf7;\n        }\n\n        ::-webkit-scrollbar,\n        *::-webkit-scrollbar {\n            display: none;\n        }\n    "]
        })
    ], MonthViewComponent);
    return MonthViewComponent;
}());
export { MonthViewComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGh2aWV3LmpzIiwic291cmNlUm9vdCI6Im5nOi8vaW9uaWMyLWNhbGVuZGFyLyIsInNvdXJjZXMiOlsibW9udGh2aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUdULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUVaLFNBQVMsRUFJWixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFJekMsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBNk5uRDtJQUVJLDRCQUFvQixlQUFnQztRQUFoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFpQjNDLGVBQVUsR0FBRyxJQUFJLENBQUM7UUFJbEIsUUFBRyxHQUFHLEVBQUUsQ0FBQztRQUtSLG1CQUFjLEdBQUcsSUFBSSxZQUFZLEVBQVUsQ0FBQztRQUM1QyxvQkFBZSxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFDN0MsbUJBQWMsR0FBRyxJQUFJLFlBQVksQ0FBZ0IsSUFBSSxDQUFDLENBQUM7UUFDdkQsbUJBQWMsR0FBRyxJQUFJLFlBQVksQ0FBUyxJQUFJLENBQUMsQ0FBQztRQUVuRCxVQUFLLEdBQWlCLEVBQUUsQ0FBQztRQUN6QixxQkFBZ0IsR0FBRyxDQUFDLENBQUM7UUFHckIsU0FBSSxHQUFpQixPQUFPLENBQUM7UUFDN0IsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUViLG1CQUFjLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLFdBQU0sR0FBRyxLQUFLLENBQUM7UUFDZixtQkFBYyxHQUFHLElBQUksQ0FBQztJQXZDOUIsQ0FBQzsyQkFIUSxrQkFBa0I7SUFJM0IsQ0FBQztJQWlETSwyQkFBUSxHQUFmLFVBQWdCLFNBQWUsRUFBRSxDQUFTO1FBQ3RDLElBQU0sS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUN0QixPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMs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SUFDekI7UUFBUixLQUFLLEVBQUU7NkRBQXVCO0lBQ3RCO1FBQVIsS0FBSyxFQUFFOzBEQUFtQjtJQUNsQjtRQUFSLEtBQUssRUFBRTs0REFBdUM7SUFDdEM7UUFBUixLQUFLLEVBQUU7c0RBQWdCO0lBQ2Y7UUFBUixLQUFLLEVBQUU7NkRBQStCO0lBQzlCO1FBQVIsS0FBSyxFQUFFO21EQUFVO0lBQ1Q7UUFBUixLQUFLLEVBQUU7K0RBQTBCO0lBQ3pCO1FBQVIsS0FBSyxFQUFFOzBEQUFxQjtJQUNwQjtRQUFSLEtBQUssRUFBRTs2REFBb0I7SUFFbEI7UUFBVCxNQUFNLEVBQUU7OERBQTZDO0lBQzVDO1FBQVQsTUFBTSxFQUFFOytEQUE4QztJQUM3QztRQUFULE1BQU0sRUFBRTs4REFBd0Q7SUFDdkQ7UUFBVCxNQUFNLEVBQUU7OERBQWlEO0lBL0JqRCxrQkFBa0I7UUExTjlCLFNBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFFBQVEsRUFBRSw0N05BNkhUO3FCQUNRLGkyRUF3RlI7U0FDSixDQUFDO09BQ1csa0JBQWtCLENBMmhCOUI7SUFBRCx5QkFBQztDQUFBLEFBM2hCRCxJQTJoQkM7U0EzaEJZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XHJcbiAgICBDb21wb25lbnQsXHJcbiAgICBPbkluaXQsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBJbnB1dCxcclxuICAgIE91dHB1dCxcclxuICAgIEV2ZW50RW1pdHRlcixcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBWaWV3Q2hpbGQsXHJcbiAgICBUZW1wbGF0ZVJlZixcclxuICAgIE9uRGVzdHJveSxcclxuICAgIEFmdGVyVmlld0luaXRcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQge0RhdGVQaXBlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0lvblNsaWRlc30gZnJvbSAnQGlvbmljL2FuZ3VsYXInO1xyXG5cclxuaW1wb3J0IHtJQ2FsZW5kYXJDb21wb25lbnQsIElFdmVudCwgSU1vbnRoVmlldywgSU1vbnRoVmlld1JvdywgSVRpbWVTZWxlY3RlZCwgSVJhbmdlLCBDYWxlbmRhck1vZGUsIElEYXRlRm9ybWF0dGVyfSBmcm9tICcuL2NhbGVuZGFyJztcclxuaW1wb3J0IHtDYWxlbmRhclNlcnZpY2V9IGZyb20gJy4vY2FsZW5kYXIuc2VydmljZSc7XHJcbmltcG9ydCB7SU1vbnRoVmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlQ29udGV4dH0gZnJvbSAnLi9jYWxlbmRhcic7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAnbW9udGh2aWV3JyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgPGlvbi1zbGlkZXMgI21vbnRoU2xpZGVyIFtvcHRpb25zXT1cInNsaWRlck9wdGlvbnNcIiBbZGlyXT1cImRpclwiIChpb25TbGlkZURpZENoYW5nZSk9XCJvblNsaWRlQ2hhbmdlZCgpXCI+XHJcbiAgICAgICAgICAgICAgICA8aW9uLXNsaWRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSAqbmdJZj1cIjA9PT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBtb250aHZpZXctZGF0ZXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoICpuZ0Zvcj1cImxldCBkYXlIZWFkZXIgb2Ygdmlld3NbMF0uZGF5SGVhZGVyc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbD57e2RheUhlYWRlcn19PC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2YgWzAsMSwyLDMsNCw1XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBjb2wgb2YgWzAsMSwyLDMsNCw1LDZdXCIgdGFwcGFibGUgKGNsaWNrKT1cInNlbGVjdCh2aWV3c1swXS5kYXRlc1tyb3cqNytjb2xdKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nQ2xhc3NdPVwiZ2V0SGlnaGxpZ2h0Q2xhc3Modmlld3NbMF0uZGF0ZXNbcm93KjcrY29sXSlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibW9udGh2aWV3RGlzcGxheUV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3ZpZXc6IHZpZXdzWzBdLCByb3c6IHJvdywgY29sOiBjb2x9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgKm5nSWY9XCIwIT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgbW9udGh2aWV3LWRhdGV0YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzcz1cInRleHQtY2VudGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggKm5nRm9yPVwibGV0IGRheUhlYWRlciBvZiB2aWV3c1swXS5kYXlIZWFkZXJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsPnt7ZGF5SGVhZGVyfX08L3NtYWxsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiBbMCwxLDIsMyw0LDVdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGNvbCBvZiBbMCwxLDIsMyw0LDUsNl1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgW25nVGVtcGxhdGVPdXRsZXRdPVwibW9udGh2aWV3SW5hY3RpdmVEaXNwbGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlldzogdmlld3NbMF0sIHJvdzogcm93LCBjb2w6IGNvbH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICA8L2lvbi1zbGlkZT5cclxuICAgICAgICAgICAgICAgIDxpb24tc2xpZGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlICpuZ0lmPVwiMT09PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIG1vbnRodmlldy1kYXRldGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggKm5nRm9yPVwibGV0IGRheUhlYWRlciBvZiB2aWV3c1sxXS5kYXlIZWFkZXJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNtYWxsPnt7ZGF5SGVhZGVyfX08L3NtYWxsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgKm5nRm9yPVwibGV0IHJvdyBvZiBbMCwxLDIsMyw0LDVdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nRm9yPVwibGV0IGNvbCBvZiBbMCwxLDIsMyw0LDUsNl1cIiB0YXBwYWJsZSAoY2xpY2spPVwic2VsZWN0KHZpZXdzWzFdLmRhdGVzW3Jvdyo3K2NvbF0pXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdDbGFzc109XCJnZXRIaWdobGlnaHRDbGFzcyh2aWV3c1sxXS5kYXRlc1tyb3cqNytjb2xdKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJtb250aHZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ1RlbXBsYXRlT3V0bGV0Q29udGV4dF09XCJ7dmlldzogdmlld3NbMV0sIHJvdzogcm93LCBjb2w6IGNvbH1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDx0YWJsZSAqbmdJZj1cIjEhPT1jdXJyZW50Vmlld0luZGV4XCIgY2xhc3M9XCJ0YWJsZSB0YWJsZS1ib3JkZXJlZCB0YWJsZS1maXhlZCBtb250aHZpZXctZGF0ZXRhYmxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzPVwidGV4dC1jZW50ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCAqbmdGb3I9XCJsZXQgZGF5SGVhZGVyIG9mIHZpZXdzWzFdLmRheUhlYWRlcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c21hbGw+e3tkYXlIZWFkZXJ9fTwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgcm93IG9mIFswLDEsMiwzLDQsNV1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgY29sIG9mIFswLDEsMiwzLDQsNSw2XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBbbmdUZW1wbGF0ZU91dGxldF09XCJtb250aHZpZXdJbmFjdGl2ZURpc3BsYXlFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt2aWV3OiB2aWV3c1sxXSwgcm93OiByb3csIGNvbDogY29sfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgICAgIDwvaW9uLXNsaWRlPlxyXG4gICAgICAgICAgICAgICAgPGlvbi1zbGlkZT5cclxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgKm5nSWY9XCIyPT09Y3VycmVudFZpZXdJbmRleFwiIGNsYXNzPVwidGFibGUgdGFibGUtYm9yZGVyZWQgdGFibGUtZml4ZWQgbW9udGh2aWV3LWRhdGV0YWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCAqbmdGb3I9XCJsZXQgZGF5SGVhZGVyIG9mIHZpZXdzWzJdLmRheUhlYWRlcnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c21hbGw+e3tkYXlIZWFkZXJ9fTwvc21hbGw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RoPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgcm93IG9mIFswLDEsMiwzLDQsNV1cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCAqbmdGb3I9XCJsZXQgY29sIG9mIFswLDEsMiwzLDQsNSw2XVwiIHRhcHBhYmxlIChjbGljayk9XCJzZWxlY3Qodmlld3NbMl0uZGF0ZXNbcm93KjcrY29sXSlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cImdldEhpZ2hsaWdodENsYXNzKHZpZXdzWzJdLmRhdGVzW3Jvdyo3K2NvbF0pXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm1vbnRodmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cInt2aWV3OiB2aWV3c1syXSwgcm93OiByb3csIGNvbDogY29sfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHRhYmxlICpuZ0lmPVwiMiE9PWN1cnJlbnRWaWV3SW5kZXhcIiBjbGFzcz1cInRhYmxlIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWZpeGVkIG1vbnRodmlldy1kYXRldGFibGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoZWFkPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoICpuZ0Zvcj1cImxldCBkYXlIZWFkZXIgb2Ygdmlld3NbMl0uZGF5SGVhZGVyc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzbWFsbD57e2RheUhlYWRlcn19PC9zbWFsbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGg+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyICpuZ0Zvcj1cImxldCByb3cgb2YgWzAsMSwyLDMsNCw1XVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBjb2wgb2YgWzAsMSwyLDMsNCw1LDZdXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm1vbnRodmlld0luYWN0aXZlRGlzcGxheUV2ZW50VGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbbmdUZW1wbGF0ZU91dGxldENvbnRleHRdPVwie3ZpZXc6IHZpZXdzWzJdLCByb3c6IHJvdywgY29sOiBjb2x9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICAgICAgPC9pb24tc2xpZGU+XHJcbiAgICAgICAgICAgIDwvaW9uLXNsaWRlcz5cclxuICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ1RlbXBsYXRlT3V0bGV0XT1cIm1vbnRodmlld0V2ZW50RGV0YWlsVGVtcGxhdGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgW25nVGVtcGxhdGVPdXRsZXRDb250ZXh0XT1cIntzaG93RXZlbnREZXRhaWw6c2hvd0V2ZW50RGV0YWlsLCBzZWxlY3RlZERhdGU6IHNlbGVjdGVkRGF0ZSwgbm9FdmVudHNMYWJlbDogbm9FdmVudHNMYWJlbH1cIj5cclxuICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBzdHlsZXM6IFtgXHJcbiAgICAgICAgLnRleHQtbXV0ZWQge1xyXG4gICAgICAgICAgICBjb2xvcjogIzk5OTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1maXhlZCB7XHJcbiAgICAgICAgICAgIHRhYmxlLWxheW91dDogZml4ZWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUge1xyXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcclxuICAgICAgICAgICAgbWF4LXdpZHRoOiAxMDAlO1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUgPiB0Zm9vdCA+IHRyID4gdGgsIC50YWJsZSA+IHRoZWFkID4gdHIgPiB0ZCxcclxuICAgICAgICAudGFibGUgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZSA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6IDhweDtcclxuICAgICAgICAgICAgbGluZS1oZWlnaHQ6IDIwcHg7XHJcbiAgICAgICAgICAgIHZlcnRpY2FsLWFsaWduOiB0b3A7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUgPiB0aGVhZCA+IHRyID4gdGgge1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbC1hbGlnbjogYm90dG9tO1xyXG4gICAgICAgICAgICBib3JkZXItYm90dG9tOiAycHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZSA+IHRoZWFkOmZpcnN0LWNoaWxkID4gdHI6Zmlyc3QtY2hpbGQgPiB0aCwgLnRhYmxlID4gdGhlYWQ6Zmlyc3QtY2hpbGQgPiB0cjpmaXJzdC1jaGlsZCA+IHRkIHtcclxuICAgICAgICAgICAgYm9yZGVyLXRvcDogMFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlID4gdGJvZHkgKyB0Ym9keSB7XHJcbiAgICAgICAgICAgIGJvcmRlci10b3A6IDJweCBzb2xpZCAjZGRkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkIHtcclxuICAgICAgICAgICAgYm9yZGVyOiAxcHggc29saWQgI2RkZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0aCwgLnRhYmxlLWJvcmRlcmVkID4gdGJvZHkgPiB0ciA+IHRoLCAudGFibGUtYm9yZGVyZWQgPiB0Zm9vdCA+IHRyID4gdGgsXHJcbiAgICAgICAgLnRhYmxlLWJvcmRlcmVkID4gdGhlYWQgPiB0ciA+IHRkLCAudGFibGUtYm9yZGVyZWQgPiB0Ym9keSA+IHRyID4gdGQsIC50YWJsZS1ib3JkZXJlZCA+IHRmb290ID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlcjogMXB4IHNvbGlkICNkZGQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAudGFibGUtYm9yZGVyZWQgPiB0aGVhZCA+IHRyID4gdGgsIC50YWJsZS1ib3JkZXJlZCA+IHRoZWFkID4gdHIgPiB0ZCB7XHJcbiAgICAgICAgICAgIGJvcmRlci1ib3R0b20td2lkdGg6IDJweDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC50YWJsZS1zdHJpcGVkID4gdGJvZHkgPiB0cjpudGgtY2hpbGQob2RkKSA+IHRkLCAudGFibGUtc3RyaXBlZCA+IHRib2R5ID4gdHI6bnRoLWNoaWxkKG9kZCkgPiB0aCB7XHJcbiAgICAgICAgICAgIGJhY2tncm91bmQtY29sb3I6ICNmOWY5ZjlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctcHJpbWFyeS13aXRoLWV2ZW50IHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogIzNhODdhZDtcclxuICAgICAgICAgICAgY29sb3I6IHdoaXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLm1vbnRodmlldy1jdXJyZW50IHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2YwZjBmMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctc2VsZWN0ZWQge1xyXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMDA5OTAwO1xyXG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAubW9udGh2aWV3LWRhdGV0YWJsZSB0ZC5tb250aHZpZXctZGlzYWJsZWQge1xyXG4gICAgICAgICAgICBjb2xvcjogbGlnaHRncmV5O1xyXG4gICAgICAgICAgICBjdXJzb3I6IGRlZmF1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAubW9udGh2aWV3LWRhdGV0YWJsZSB0aCB7XHJcbiAgICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC5tb250aHZpZXctZGF0ZXRhYmxlIHRkIHtcclxuICAgICAgICAgICAgY3Vyc29yOiBwb2ludGVyO1xyXG4gICAgICAgICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAubW9udGh2aWV3LXNlY29uZGFyeS13aXRoLWV2ZW50IHtcclxuICAgICAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogI2Q5ZWRmNztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIDo6LXdlYmtpdC1zY3JvbGxiYXIsXHJcbiAgICAgICAgKjo6LXdlYmtpdC1zY3JvbGxiYXIge1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBub25lO1xyXG4gICAgICAgIH1cclxuICAgIGBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBNb250aFZpZXdDb21wb25lbnQgaW1wbGVtZW50cyBJQ2FsZW5kYXJDb21wb25lbnQsIE9uSW5pdCwgT25EZXN0cm95LCBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgY2FsZW5kYXJTZXJ2aWNlOiBDYWxlbmRhclNlcnZpY2UpIHtcclxuICAgIH1cclxuICAgIDtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdtb250aFNsaWRlcicsIHtzdGF0aWM6IHRydWV9KSBzbGlkZXI6IElvblNsaWRlcztcclxuXHJcbiAgICBASW5wdXQoKSBtb250aHZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8SU1vbnRoVmlld0Rpc3BsYXlFdmVudFRlbXBsYXRlQ29udGV4dD47XHJcbiAgICBASW5wdXQoKSBtb250aHZpZXdJbmFjdGl2ZURpc3BsYXlFdmVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxJTW9udGhWaWV3RGlzcGxheUV2ZW50VGVtcGxhdGVDb250ZXh0PjtcclxuICAgIEBJbnB1dCgpIG1vbnRodmlld0V2ZW50RGV0YWlsVGVtcGxhdGU6IFRlbXBsYXRlUmVmPElNb250aFZpZXdEaXNwbGF5RXZlbnRUZW1wbGF0ZUNvbnRleHQ+O1xyXG5cclxuICAgIEBJbnB1dCgpIGZvcm1hdERheTogc3RyaW5nO1xyXG4gICAgQElucHV0KCkgZm9ybWF0RGF5SGVhZGVyOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBmb3JtYXRNb250aFRpdGxlOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBldmVudFNvdXJjZTogSUV2ZW50W107XHJcbiAgICBASW5wdXQoKSBzdGFydGluZ0RheU1vbnRoOiBudW1iZXI7XHJcbiAgICBASW5wdXQoKSBzaG93RXZlbnREZXRhaWw6IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBub0V2ZW50c0xhYmVsOiBzdHJpbmc7XHJcbiAgICBASW5wdXQoKSBhdXRvU2VsZWN0ID0gdHJ1ZTtcclxuICAgIEBJbnB1dCgpIG1hcmtEaXNhYmxlZDogKGRhdGU6IERhdGUpID0+IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBsb2NhbGU6IHN0cmluZztcclxuICAgIEBJbnB1dCgpIGRhdGVGb3JtYXR0ZXI6IElEYXRlRm9ybWF0dGVyO1xyXG4gICAgQElucHV0KCkgZGlyID0gJyc7XHJcbiAgICBASW5wdXQoKSBsb2NrU3dpcGVUb1ByZXY6IGJvb2xlYW47XHJcbiAgICBASW5wdXQoKSBsb2NrU3dpcGVzOiBib29sZWFuO1xyXG4gICAgQElucHV0KCkgc2xpZGVyT3B0aW9uczogYW55O1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblJhbmdlQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SVJhbmdlPigpO1xyXG4gICAgQE91dHB1dCgpIG9uRXZlbnRTZWxlY3RlZCA9IG5ldyBFdmVudEVtaXR0ZXI8SUV2ZW50PigpO1xyXG4gICAgQE91dHB1dCgpIG9uVGltZVNlbGVjdGVkID0gbmV3IEV2ZW50RW1pdHRlcjxJVGltZVNlbGVjdGVkPih0cnVlKTtcclxuICAgIEBPdXRwdXQoKSBvblRpdGxlQ2hhbmdlZCA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPih0cnVlKTtcclxuXHJcbiAgICBwdWJsaWMgdmlld3M6IElNb250aFZpZXdbXSA9IFtdO1xyXG4gICAgcHVibGljIGN1cnJlbnRWaWV3SW5kZXggPSAwO1xyXG4gICAgcHVibGljIHNlbGVjdGVkRGF0ZTogSU1vbnRoVmlld1JvdztcclxuICAgIHB1YmxpYyByYW5nZTogSVJhbmdlO1xyXG4gICAgcHVibGljIG1vZGU6IENhbGVuZGFyTW9kZSA9ICdtb250aCc7XHJcbiAgICBwdWJsaWMgZGlyZWN0aW9uID0gMDtcclxuXHJcbiAgICBwcml2YXRlIG1vdmVPblNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICBwcml2YXRlIGluaXRlZCA9IGZhbHNlO1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFja09uSW5pdCA9IHRydWU7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgICBwcml2YXRlIGV2ZW50U291cmNlQ2hhbmdlZFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gICAgcHJpdmF0ZSBzbGlkZUNoYW5nZWRTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAgIHByaXZhdGUgc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgcHJpdmF0ZSBmb3JtYXREYXlMYWJlbDogKGRhdGU6IERhdGUpID0+IHN0cmluZztcclxuICAgIHByaXZhdGUgZm9ybWF0RGF5SGVhZGVyTGFiZWw6IChkYXRlOiBEYXRlKSA9PiBzdHJpbmc7XHJcbiAgICBwcml2YXRlIGZvcm1hdFRpdGxlOiAoZGF0ZTogRGF0ZSkgPT4gc3RyaW5nO1xyXG5cclxuICAgIHN0YXRpYyBnZXREYXRlcyhzdGFydERhdGU6IERhdGUsIG46IG51bWJlcik6IERhdGVbXSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZXMgPSBuZXcgQXJyYXkobiksXHJcbiAgICAgICAgICAgIGN1cnJlbnQgPSBuZXcgRGF0ZShzdGFydERhdGUuZ2V0VGltZSgpKTtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGkgPCBuKSB7XHJcbiAgICAgICAgICAgIGRhdGVzW2krK10gPSBuZXcgRGF0ZShjdXJyZW50LmdldFRpbWUoKSk7XHJcbiAgICAgICAgICAgIGN1cnJlbnQuc2V0RGF0ZShjdXJyZW50LmdldERhdGUoKSArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGF0ZXM7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNsaWRlck9wdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXJPcHRpb25zID0ge307XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2xpZGVyT3B0aW9ucy5sb29wID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0TW9udGhWaWV3RGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0RGF5TGFiZWwgPSB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0TW9udGhWaWV3RGF5O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRheUxhYmVsRGF0ZVBpcGUgPSBuZXcgRGF0ZVBpcGUoJ2VuLVVTJyk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0RGF5TGFiZWwgPSBmdW5jdGlvbihkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF5TGFiZWxEYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5mb3JtYXREYXkpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0TW9udGhWaWV3RGF5SGVhZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0RGF5SGVhZGVyTGFiZWwgPSB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0TW9udGhWaWV3RGF5SGVhZGVyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVQaXBlID0gbmV3IERhdGVQaXBlKHRoaXMubG9jYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXREYXlIZWFkZXJMYWJlbCA9IGZ1bmN0aW9uKGRhdGU6IERhdGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRlUGlwZS50cmFuc2Zvcm0oZGF0ZSwgdGhpcy5mb3JtYXREYXlIZWFkZXIpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGF0ZUZvcm1hdHRlciAmJiB0aGlzLmRhdGVGb3JtYXR0ZXIuZm9ybWF0TW9udGhWaWV3VGl0bGUpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JtYXRUaXRsZSA9IHRoaXMuZGF0ZUZvcm1hdHRlci5mb3JtYXRNb250aFZpZXdUaXRsZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlUGlwZSA9IG5ldyBEYXRlUGlwZSh0aGlzLmxvY2FsZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0VGl0bGUgPSBmdW5jdGlvbihkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGUsIHRoaXMuZm9ybWF0TW9udGhUaXRsZSk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5sb2NrU3dpcGVUb1ByZXYpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIubG9ja1N3aXBlVG9QcmV2KHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubG9ja1N3aXBlcykge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVzKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIHRoaXMuaW5pdGVkID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudCQuc3Vic2NyaWJlKGN1cnJlbnREYXRlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZWZyZXNoVmlldygpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLmV2ZW50U291cmNlQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLmV2ZW50U291cmNlQ2hhbmdlZCQuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5vbkRhdGFMb2FkZWQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zbGlkZUNoYW5nZWRTdWJzY3JpcHRpb24gPSB0aGlzLmNhbGVuZGFyU2VydmljZS5zbGlkZUNoYW5nZWQkLnN1YnNjcmliZShkaXJlY3Rpb24gPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZU5leHQoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZVByZXYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnNsaWRlVXBkYXRlZFN1YnNjcmlwdGlvbiA9IHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNsaWRlVXBkYXRlZCQuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIudXBkYXRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudERhdGVDaGFuZ2VkRnJvbVBhcmVudFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnREYXRlQ2hhbmdlZEZyb21QYXJlbnRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RGF0ZUNoYW5nZWRGcm9tUGFyZW50U3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmV2ZW50U291cmNlQ2hhbmdlZFN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50U291cmNlQ2hhbmdlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmV2ZW50U291cmNlQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5zbGlkZUNoYW5nZWRTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZUNoYW5nZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZUNoYW5nZWRTdWJzY3JpcHRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVVcGRhdGVkU3Vic2NyaXB0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xyXG4gICAgICAgIGlmICghdGhpcy5pbml0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZXZlbnRTb3VyY2VDaGFuZ2UgPSBjaGFuZ2VzLmV2ZW50U291cmNlO1xyXG4gICAgICAgIGlmIChldmVudFNvdXJjZUNoYW5nZSAmJiBldmVudFNvdXJjZUNoYW5nZS5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkRhdGFMb2FkZWQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGxvY2tTd2lwZVRvUHJldiA9IGNoYW5nZXMubG9ja1N3aXBlVG9QcmV2O1xyXG4gICAgICAgIGlmIChsb2NrU3dpcGVUb1ByZXYpIHtcclxuICAgICAgICAgICAgdGhpcy5zbGlkZXIubG9ja1N3aXBlVG9QcmV2KGxvY2tTd2lwZVRvUHJldi5jdXJyZW50VmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgbG9ja1N3aXBlcyA9IGNoYW5nZXMubG9ja1N3aXBlcztcclxuICAgICAgICBpZiAobG9ja1N3aXBlcykge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5sb2NrU3dpcGVzKGxvY2tTd2lwZXMuY3VycmVudFZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHRpdGxlID0gdGhpcy5nZXRUaXRsZSgpO1xyXG4gICAgICAgIHRoaXMub25UaXRsZUNoYW5nZWQuZW1pdCh0aXRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25TbGlkZUNoYW5nZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tPbkluaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFja09uSW5pdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gMDtcclxuICAgICAgICBjb25zdCBjdXJyZW50Vmlld0luZGV4ID0gdGhpcy5jdXJyZW50Vmlld0luZGV4O1xyXG5cclxuICAgICAgICB0aGlzLnNsaWRlci5nZXRBY3RpdmVJbmRleCgpLnRoZW4oKGN1cnJlbnRTbGlkZUluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gKGN1cnJlbnRTbGlkZUluZGV4ICsgMikgJSAzO1xyXG4gICAgICAgICAgICBpZihpc05hTihjdXJyZW50U2xpZGVJbmRleCkpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTbGlkZUluZGV4ID0gY3VycmVudFZpZXdJbmRleDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRTbGlkZUluZGV4IC0gY3VycmVudFZpZXdJbmRleCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2xpZGVJbmRleCA9PT0gMCAmJiBjdXJyZW50Vmlld0luZGV4ID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAxO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXIuc2xpZGVUbygxLCAwLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VycmVudFZpZXdJbmRleCAtIGN1cnJlbnRTbGlkZUluZGV4ID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAtMTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50U2xpZGVJbmRleCA9PT0gMiAmJiBjdXJyZW50Vmlld0luZGV4ID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAtMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlVG8oMywgMCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZpZXdJbmRleCA9IGN1cnJlbnRTbGlkZUluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLm1vdmUoZGlyZWN0aW9uKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcclxuICAgICAgICBpZiAoIXRoaXMubW92ZU9uU2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgY29uc3QgYWRqYWNlbnREYXRlID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuZ2V0QWRqYWNlbnRDYWxlbmRhckRhdGUodGhpcy5tb2RlLCBkaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmNhbGVuZGFyU2VydmljZS5zZXRDdXJyZW50RGF0ZShhZGphY2VudERhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlZnJlc2hWaWV3KCk7XHJcbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xyXG4gICAgICAgIHRoaXMubW92ZU9uU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVEYXRlT2JqZWN0KGRhdGU6IERhdGUpOiBJTW9udGhWaWV3Um93IHtcclxuICAgICAgICBsZXQgZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5tYXJrRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgZGlzYWJsZWQgPSB0aGlzLm1hcmtEaXNhYmxlZChkYXRlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRhdGUsXHJcbiAgICAgICAgICAgIGV2ZW50czogW10sXHJcbiAgICAgICAgICAgIGxhYmVsOiB0aGlzLmZvcm1hdERheUxhYmVsKGRhdGUpLFxyXG4gICAgICAgICAgICBzZWNvbmRhcnk6IGZhbHNlLFxyXG4gICAgICAgICAgICBkaXNhYmxlZFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Vmlld0RhdGEoc3RhcnRUaW1lOiBEYXRlKTogSU1vbnRoVmlldyB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gc3RhcnRUaW1lLFxyXG4gICAgICAgICAgICBkYXRlID0gc3RhcnREYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgbW9udGggPSAoc3RhcnREYXRlLmdldE1vbnRoKCkgKyAoZGF0ZSAhPT0gMSA/IDEgOiAwKSkgJSAxMjtcclxuXHJcbiAgICAgICAgY29uc3QgZGF0ZXMgPSBNb250aFZpZXdDb21wb25lbnQuZ2V0RGF0ZXMoc3RhcnREYXRlLCA0Mik7XHJcbiAgICAgICAgY29uc3QgZGF5czogSU1vbnRoVmlld1Jvd1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0MjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVPYmplY3QgPSB0aGlzLmNyZWF0ZURhdGVPYmplY3QoZGF0ZXNbaV0pO1xyXG4gICAgICAgICAgICBkYXRlT2JqZWN0LnNlY29uZGFyeSA9IGRhdGVzW2ldLmdldE1vbnRoKCkgIT09IG1vbnRoO1xyXG4gICAgICAgICAgICBkYXlzW2ldID0gZGF0ZU9iamVjdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRheUhlYWRlcnM6IHN0cmluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgZGF5SGVhZGVycy5wdXNoKHRoaXMuZm9ybWF0RGF5SGVhZGVyTGFiZWwoZGF5c1tpXS5kYXRlKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGRhdGVzOiBkYXlzLFxyXG4gICAgICAgICAgICBkYXlIZWFkZXJzXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRIaWdobGlnaHRDbGFzcyhkYXRlOiBJTW9udGhWaWV3Um93KTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gJyc7XHJcblxyXG4gICAgICAgIGlmIChkYXRlLmhhc0V2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRlLnNlY29uZGFyeSkge1xyXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lID0gJ21vbnRodmlldy1zZWNvbmRhcnktd2l0aC1ldmVudCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSAnbW9udGh2aWV3LXByaW1hcnktd2l0aC1ldmVudCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRlLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICdtb250aHZpZXctc2VsZWN0ZWQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGUuY3VycmVudCkge1xyXG4gICAgICAgICAgICBpZiAoY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgKz0gJyAnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnbW9udGh2aWV3LWN1cnJlbnQnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGRhdGUuc2Vjb25kYXJ5KSB7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICd0ZXh0LW11dGVkJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkYXRlLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChjbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSArPSAnICc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xhc3NOYW1lICs9ICdtb250aHZpZXctZGlzYWJsZWQnO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2xhc3NOYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFJhbmdlKGN1cnJlbnREYXRlOiBEYXRlKTogSVJhbmdlIHtcclxuICAgICAgICBjb25zdCB5ZWFyID0gY3VycmVudERhdGUuZ2V0RnVsbFllYXIoKSxcclxuICAgICAgICAgICAgbW9udGggPSBjdXJyZW50RGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICBmaXJzdERheU9mTW9udGggPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSwgMTIsIDAsIDApLCAvLyBzZXQgaG91ciB0byAxMiB0byBhdm9pZCBEU1QgcHJvYmxlbVxyXG5cclxuICAgICAgICAgICAgZGlmZmVyZW5jZSA9IHRoaXMuc3RhcnRpbmdEYXlNb250aCAtIGZpcnN0RGF5T2ZNb250aC5nZXREYXkoKSxcclxuICAgICAgICAgICAgbnVtRGlzcGxheWVkRnJvbVByZXZpb3VzTW9udGggPSAoZGlmZmVyZW5jZSA+IDApID8gNyAtIGRpZmZlcmVuY2UgOiAtZGlmZmVyZW5jZSxcclxuICAgICAgICAgICAgc3RhcnREYXRlID0gbmV3IERhdGUoZmlyc3REYXlPZk1vbnRoLmdldFRpbWUoKSk7XHJcblxyXG4gICAgICAgIGlmIChudW1EaXNwbGF5ZWRGcm9tUHJldmlvdXNNb250aCA+IDApIHtcclxuICAgICAgICAgICAgc3RhcnREYXRlLnNldERhdGUoLW51bURpc3BsYXllZEZyb21QcmV2aW91c01vbnRoICsgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoc3RhcnREYXRlLmdldFRpbWUoKSk7XHJcbiAgICAgICAgZW5kRGF0ZS5zZXREYXRlKGVuZERhdGUuZ2V0RGF0ZSgpICsgNDIpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzdGFydFRpbWU6IHN0YXJ0RGF0ZSxcclxuICAgICAgICAgICAgZW5kVGltZTogZW5kRGF0ZVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgb25EYXRhTG9hZGVkKCkge1xyXG4gICAgICAgIGNvbnN0IHJhbmdlID0gdGhpcy5yYW5nZSxcclxuICAgICAgICAgICAgZXZlbnRTb3VyY2UgPSB0aGlzLmV2ZW50U291cmNlLFxyXG4gICAgICAgICAgICBsZW4gPSBldmVudFNvdXJjZSA/IGV2ZW50U291cmNlLmxlbmd0aCA6IDAsXHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IHJhbmdlLnN0YXJ0VGltZSxcclxuICAgICAgICAgICAgZW5kVGltZSA9IHJhbmdlLmVuZFRpbWUsXHJcbiAgICAgICAgICAgIHV0Y1N0YXJ0VGltZSA9IERhdGUuVVRDKHN0YXJ0VGltZS5nZXRGdWxsWWVhcigpLCBzdGFydFRpbWUuZ2V0TW9udGgoKSwgc3RhcnRUaW1lLmdldERhdGUoKSksXHJcbiAgICAgICAgICAgIHV0Y0VuZFRpbWUgPSBEYXRlLlVUQyhlbmRUaW1lLmdldEZ1bGxZZWFyKCksIGVuZFRpbWUuZ2V0TW9udGgoKSwgZW5kVGltZS5nZXREYXRlKCkpLFxyXG4gICAgICAgICAgICBjdXJyZW50Vmlld0luZGV4ID0gdGhpcy5jdXJyZW50Vmlld0luZGV4LFxyXG4gICAgICAgICAgICBkYXRlcyA9IHRoaXMudmlld3NbY3VycmVudFZpZXdJbmRleF0uZGF0ZXMsXHJcbiAgICAgICAgICAgIG9uZURheSA9IDg2NDAwMDAwLFxyXG4gICAgICAgICAgICBlcHMgPSAwLjAwMDY7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgNDI7IHIgKz0gMSkge1xyXG4gICAgICAgICAgICBpZiAoZGF0ZXNbcl0uaGFzRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGRhdGVzW3JdLmhhc0V2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBkYXRlc1tyXS5ldmVudHMgPSBbXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50U291cmNlW2ldLFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTdGFydFRpbWUgPSBldmVudC5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgICAgICBldmVudEVuZFRpbWUgPSBldmVudC5lbmRUaW1lO1xyXG5cclxuICAgICAgICAgICAgbGV0IGV2ZW50VVRDU3RhcnRUaW1lOiBudW1iZXIsXHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ0VuZFRpbWU6IG51bWJlcjtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmFsbERheSkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENTdGFydFRpbWUgPSBldmVudFN0YXJ0VGltZS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudFVUQ0VuZFRpbWUgPSBldmVudEVuZFRpbWUuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENTdGFydFRpbWUgPSBEYXRlLlVUQyhldmVudFN0YXJ0VGltZS5nZXRGdWxsWWVhcigpLCBldmVudFN0YXJ0VGltZS5nZXRNb250aCgpLCBldmVudFN0YXJ0VGltZS5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnRVVENFbmRUaW1lID0gRGF0ZS5VVEMoZXZlbnRFbmRUaW1lLmdldEZ1bGxZZWFyKCksIGV2ZW50RW5kVGltZS5nZXRNb250aCgpLCBldmVudEVuZFRpbWUuZ2V0RGF0ZSgpICsgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudFVUQ0VuZFRpbWUgPD0gdXRjU3RhcnRUaW1lIHx8IGV2ZW50VVRDU3RhcnRUaW1lID49IHV0Y0VuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgdGltZURpZmZlcmVuY2VTdGFydDogbnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgdGltZURpZmZlcmVuY2VFbmQ6IG51bWJlcjtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudFVUQ1N0YXJ0VGltZSA8IHV0Y1N0YXJ0VGltZSkge1xyXG4gICAgICAgICAgICAgICAgdGltZURpZmZlcmVuY2VTdGFydCA9IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lRGlmZmVyZW5jZVN0YXJ0ID0gKGV2ZW50VVRDU3RhcnRUaW1lIC0gdXRjU3RhcnRUaW1lKSAvIG9uZURheTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGV2ZW50VVRDRW5kVGltZSA+IHV0Y0VuZFRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVEaWZmZXJlbmNlRW5kID0gKHV0Y0VuZFRpbWUgLSB1dGNTdGFydFRpbWUpIC8gb25lRGF5O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGltZURpZmZlcmVuY2VFbmQgPSAoZXZlbnRVVENFbmRUaW1lIC0gdXRjU3RhcnRUaW1lKSAvIG9uZURheTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gTWF0aC5mbG9vcih0aW1lRGlmZmVyZW5jZVN0YXJ0KTtcclxuICAgICAgICAgICAgY29uc3QgZW5kSW5kZXggPSBNYXRoLmNlaWwodGltZURpZmZlcmVuY2VFbmQgLSBlcHMpO1xyXG4gICAgICAgICAgICB3aGlsZSAoaW5kZXggPCBlbmRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgZGF0ZXNbaW5kZXhdLmhhc0V2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBldmVudFNldCA9IGRhdGVzW2luZGV4XS5ldmVudHM7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRTZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudFNldC5wdXNoKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRTZXQgPSBbXTtcclxuICAgICAgICAgICAgICAgICAgICBldmVudFNldC5wdXNoKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlc1tpbmRleF0uZXZlbnRzID0gZXZlbnRTZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDQyOyByICs9IDEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGVzW3JdLmhhc0V2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlc1tyXS5ldmVudHMuc29ydCh0aGlzLmNvbXBhcmVFdmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmF1dG9TZWxlY3QpIHtcclxuICAgICAgICAgICAgbGV0IGZpbmRTZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDQyOyByICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlc1tyXS5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gZGF0ZXNbcl07XHJcbiAgICAgICAgICAgICAgICAgICAgZmluZFNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGZpbmRTZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblRpbWVTZWxlY3RlZC5lbWl0KHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFRpbWU6IHRoaXMuc2VsZWN0ZWREYXRlLmRhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB0aGlzLnNlbGVjdGVkRGF0ZS5ldmVudHMsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IHRoaXMuc2VsZWN0ZWREYXRlLmRpc2FibGVkXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZWZyZXNoVmlldygpIHtcclxuICAgICAgICB0aGlzLnJhbmdlID0gdGhpcy5nZXRSYW5nZSh0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmluaXRlZCkge1xyXG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IHRoaXMuZ2V0VGl0bGUoKTtcclxuICAgICAgICAgICAgdGhpcy5vblRpdGxlQ2hhbmdlZC5lbWl0KHRpdGxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2UucG9wdWxhdGVBZGphY2VudFZpZXdzKHRoaXMpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlQ3VycmVudFZpZXcodGhpcy5yYW5nZS5zdGFydFRpbWUsIHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld0luZGV4XSk7XHJcbiAgICAgICAgdGhpcy5jYWxlbmRhclNlcnZpY2UucmFuZ2VDaGFuZ2VkKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFRpdGxlKCk6IHN0cmluZyB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFZpZXdTdGFydERhdGUgPSB0aGlzLnJhbmdlLnN0YXJ0VGltZSxcclxuICAgICAgICAgICAgZGF0ZSA9IGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgbW9udGggPSAoY3VycmVudFZpZXdTdGFydERhdGUuZ2V0TW9udGgoKSArIChkYXRlICE9PSAxID8gMSA6IDApKSAlIDEyLFxyXG4gICAgICAgICAgICB5ZWFyID0gY3VycmVudFZpZXdTdGFydERhdGUuZ2V0RnVsbFllYXIoKSArIChkYXRlICE9PSAxICYmIG1vbnRoID09PSAwID8gMSA6IDApLFxyXG4gICAgICAgICAgICBoZWFkZXJEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEsIDEyLCAwLCAwLCAwKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5mb3JtYXRUaXRsZShoZWFkZXJEYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbXBhcmVFdmVudChldmVudDE6IElFdmVudCwgZXZlbnQyOiBJRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGlmIChldmVudDEuYWxsRGF5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQyLmFsbERheSkge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIChldmVudDEuc3RhcnRUaW1lLmdldFRpbWUoKSAtIGV2ZW50Mi5zdGFydFRpbWUuZ2V0VGltZSgpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0KHZpZXdEYXRlOiBJTW9udGhWaWV3Um93KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnZpZXdzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkRGF0ZSA9IHZpZXdEYXRlLmRhdGUsXHJcbiAgICAgICAgICAgIGV2ZW50cyA9IHZpZXdEYXRlLmV2ZW50cztcclxuXHJcbiAgICAgICAgaWYgKCF2aWV3RGF0ZS5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlcyA9IHRoaXMudmlld3NbdGhpcy5jdXJyZW50Vmlld0luZGV4XS5kYXRlcyxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRDYWxlbmRhckRhdGUgPSB0aGlzLmNhbGVuZGFyU2VydmljZS5jdXJyZW50RGF0ZSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRNb250aCA9IGN1cnJlbnRDYWxlbmRhckRhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRZZWFyID0gY3VycmVudENhbGVuZGFyRGF0ZS5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRNb250aCA9IHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRZZWFyID0gc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgICAgIGxldCBkaXJlY3Rpb24gPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRZZWFyID09PSBzZWxlY3RlZFllYXIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50TW9udGggIT09IHNlbGVjdGVkTW9udGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBjdXJyZW50TW9udGggPCBzZWxlY3RlZE1vbnRoID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gY3VycmVudFllYXIgPCBzZWxlY3RlZFllYXIgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2FsZW5kYXJTZXJ2aWNlLnNldEN1cnJlbnREYXRlKHNlbGVjdGVkRGF0ZSk7XHJcbiAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDApIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3U3RhcnREYXRlID0gdGhpcy5yYW5nZS5zdGFydFRpbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgb25lRGF5ID0gODY0MDAwMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWREYXlEaWZmZXJlbmNlID0gTWF0aC5yb3VuZCgoRGF0ZS5VVEMoc2VsZWN0ZWREYXRlLmdldEZ1bGxZZWFyKCksIHNlbGVjdGVkRGF0ZS5nZXRNb250aCgpLCBzZWxlY3RlZERhdGUuZ2V0RGF0ZSgpKSAtIERhdGUuVVRDKGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldE1vbnRoKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldERhdGUoKSkpIC8gb25lRGF5KTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IDQyOyByICs9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlc1tyXS5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZERheURpZmZlcmVuY2UgPj0gMCAmJiBzZWxlY3RlZERheURpZmZlcmVuY2UgPCA0Mikge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGVzW3NlbGVjdGVkRGF5RGlmZmVyZW5jZV0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWREYXRlID0gZGF0ZXNbc2VsZWN0ZWREYXlEaWZmZXJlbmNlXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZU9uU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZVZpZXcoZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vblRpbWVTZWxlY3RlZC5lbWl0KHtzZWxlY3RlZFRpbWU6IHNlbGVjdGVkRGF0ZSwgZXZlbnRzLCBkaXNhYmxlZDogdmlld0RhdGUuZGlzYWJsZWR9KTtcclxuICAgIH1cclxuXHJcbiAgICBzbGlkZVZpZXcoZGlyZWN0aW9uOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVyLnNsaWRlTmV4dCgpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNsaWRlci5zbGlkZVByZXYoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ3VycmVudFZpZXcoY3VycmVudFZpZXdTdGFydERhdGU6IERhdGUsIHZpZXc6IElNb250aFZpZXcpIHtcclxuICAgICAgICBjb25zdCBjdXJyZW50Q2FsZW5kYXJEYXRlID0gdGhpcy5jYWxlbmRhclNlcnZpY2UuY3VycmVudERhdGUsXHJcbiAgICAgICAgICAgIHRvZGF5ID0gbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgb25lRGF5ID0gODY0MDAwMDAsXHJcbiAgICAgICAgICAgIHNlbGVjdGVkRGF5RGlmZmVyZW5jZSA9IE1hdGgucm91bmQoKERhdGUuVVRDKGN1cnJlbnRDYWxlbmRhckRhdGUuZ2V0RnVsbFllYXIoKSwgY3VycmVudENhbGVuZGFyRGF0ZS5nZXRNb250aCgpLCBjdXJyZW50Q2FsZW5kYXJEYXRlLmdldERhdGUoKSkgLSBEYXRlLlVUQyhjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRGdWxsWWVhcigpLCBjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXRNb250aCgpLCBjdXJyZW50Vmlld1N0YXJ0RGF0ZS5nZXREYXRlKCkpKSAvIG9uZURheSksXHJcbiAgICAgICAgICAgIGN1cnJlbnREYXlEaWZmZXJlbmNlID0gTWF0aC5yb3VuZCgoRGF0ZS5VVEModG9kYXkuZ2V0RnVsbFllYXIoKSwgdG9kYXkuZ2V0TW9udGgoKSwgdG9kYXkuZ2V0RGF0ZSgpKSAtIERhdGUuVVRDKGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldEZ1bGxZZWFyKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldE1vbnRoKCksIGN1cnJlbnRWaWV3U3RhcnREYXRlLmdldERhdGUoKSkpIC8gb25lRGF5KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCA0MjsgciArPSAxKSB7XHJcbiAgICAgICAgICAgIHZpZXcuZGF0ZXNbcl0uc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzZWxlY3RlZERheURpZmZlcmVuY2UgPj0gMCAmJiBzZWxlY3RlZERheURpZmZlcmVuY2UgPCA0MiAmJiAhdmlldy5kYXRlc1tzZWxlY3RlZERheURpZmZlcmVuY2VdLmRpc2FibGVkICYmICh0aGlzLmF1dG9TZWxlY3QgfHwgdGhpcy5tb3ZlT25TZWxlY3RlZCkpIHtcclxuICAgICAgICAgICAgdmlldy5kYXRlc1tzZWxlY3RlZERheURpZmZlcmVuY2VdLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSB2aWV3LmRhdGVzW3NlbGVjdGVkRGF5RGlmZmVyZW5jZV07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZERhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICBkYXRlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZXZlbnRzOiBbXSxcclxuICAgICAgICAgICAgICAgIGxhYmVsOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ6IGZhbHNlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoY3VycmVudERheURpZmZlcmVuY2UgPj0gMCAmJiBjdXJyZW50RGF5RGlmZmVyZW5jZSA8IDQyKSB7XHJcbiAgICAgICAgICAgIHZpZXcuZGF0ZXNbY3VycmVudERheURpZmZlcmVuY2VdLmN1cnJlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBldmVudFNlbGVjdGVkKGV2ZW50OiBJRXZlbnQpIHtcclxuICAgICAgICB0aGlzLm9uRXZlbnRTZWxlY3RlZC5lbWl0KGV2ZW50KTtcclxuICAgIH1cclxufVxyXG4iXX0=