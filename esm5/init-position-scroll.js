import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ElementRef, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
var initPositionScrollComponent = /** @class */ (function () {
    function initPositionScrollComponent(el) {
        this.onScroll = new EventEmitter();
        this.listenerAttached = false;
        this.element = el;
    }
    initPositionScrollComponent.prototype.ngOnChanges = function (changes) {
        var initPosition = changes['initPosition'];
        if (initPosition && initPosition.currentValue !== undefined && this.scrollContent) {
            var me_1 = this;
            setTimeout(function () {
                me_1.scrollContent.scrollTop = initPosition.currentValue;
            }, 0);
        }
    };
    initPositionScrollComponent.prototype.ngAfterViewInit = function () {
        var scrollContent = this.scrollContent = this.element.nativeElement.querySelector('.scroll-content');
        if (this.initPosition !== undefined) {
            scrollContent.scrollTop = this.initPosition;
        }
        if (this.emitEvent && !this.listenerAttached) {
            var onScroll_1 = this.onScroll;
            this.handler = function () {
                onScroll_1.emit(scrollContent.scrollTop);
            };
            this.listenerAttached = true;
            scrollContent.addEventListener('scroll', this.handler);
        }
    };
    initPositionScrollComponent.prototype.ngOnDestroy = function () {
        if (this.listenerAttached) {
            this.scrollContent.removeEventListener('scroll', this.handler);
        }
    };
    initPositionScrollComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    __decorate([
        Input()
    ], initPositionScrollComponent.prototype, "initPosition", void 0);
    __decorate([
        Input()
    ], initPositionScrollComponent.prototype, "emitEvent", void 0);
    __decorate([
        Output()
    ], initPositionScrollComponent.prototype, "onScroll", void 0);
    initPositionScrollComponent = __decorate([
        Component({
            selector: 'init-position-scroll',
            template: "\n        <div class=\"scroll-content\" style=\"height:100%\">\n            <ng-content></ng-content>\n        </div>\n    ",
            encapsulation: ViewEncapsulation.None,
            styles: ["\n        .scroll-content {\n            overflow-y: auto;\n            overflow-x: hidden;\n        }        \n    "]
        })
    ], initPositionScrollComponent);
    return initPositionScrollComponent;
}());
export { initPositionScrollComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC1wb3NpdGlvbi1zY3JvbGwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYzItY2FsZW5kYXIvIiwic291cmNlcyI6WyJpbml0LXBvc2l0aW9uLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixVQUFVLEVBQ1YsYUFBYSxFQUNiLFNBQVMsRUFDVCxhQUFhLEVBQ2IsU0FBUyxFQUNULGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQWlCdkI7SUFVSSxxQ0FBWSxFQUFhO1FBUGYsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFLeEMscUJBQWdCLEdBQVcsS0FBSyxDQUFDO1FBR3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxpREFBVyxHQUFYLFVBQVksT0FBcUI7UUFDN0IsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDL0UsSUFBTSxJQUFFLEdBQUUsSUFBSSxDQUFDO1lBQ2YsVUFBVSxDQUFDO2dCQUNQLElBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDM0QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1Q7SUFDTCxDQUFDO0lBRUQscURBQWUsR0FBZjtRQUNJLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkcsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtZQUNqQyxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDL0M7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDMUMsSUFBSSxVQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUNYLFVBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUQ7SUFDTCxDQUFDO0lBRUQsaURBQVcsR0FBWDtRQUNJLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNsRTtJQUNMLENBQUM7O2dCQWxDYyxVQUFVOztJQVRoQjtRQUFSLEtBQUssRUFBRTtxRUFBcUI7SUFDcEI7UUFBUixLQUFLLEVBQUU7a0VBQW1CO0lBQ2pCO1FBQVQsTUFBTSxFQUFFO2lFQUF1QztJQUh2QywyQkFBMkI7UUFmdkMsU0FBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLHNCQUFzQjtZQUNoQyxRQUFRLEVBQUUsNkhBSVQ7WUFPRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtxQkFONUIsc0hBS1I7U0FFSixDQUFDO09BQ1csMkJBQTJCLENBNkN2QztJQUFELGtDQUFDO0NBQUEsQUE3Q0QsSUE2Q0M7U0E3Q1ksMkJBQTJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcclxuICAgIENvbXBvbmVudCxcclxuICAgIElucHV0LFxyXG4gICAgT3V0cHV0LFxyXG4gICAgRXZlbnRFbWl0dGVyLFxyXG4gICAgRWxlbWVudFJlZixcclxuICAgIFNpbXBsZUNoYW5nZXMsXHJcbiAgICBPbkNoYW5nZXMsXHJcbiAgICBBZnRlclZpZXdJbml0LFxyXG4gICAgT25EZXN0cm95LFxyXG4gICAgVmlld0VuY2Fwc3VsYXRpb25cclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdpbml0LXBvc2l0aW9uLXNjcm9sbCcsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzY3JvbGwtY29udGVudFwiIHN0eWxlPVwiaGVpZ2h0OjEwMCVcIj5cclxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIHN0eWxlczogW2BcclxuICAgICAgICAuc2Nyb2xsLWNvbnRlbnQge1xyXG4gICAgICAgICAgICBvdmVyZmxvdy15OiBhdXRvO1xyXG4gICAgICAgICAgICBvdmVyZmxvdy14OiBoaWRkZW47XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICBgXSxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcclxufSlcclxuZXhwb3J0IGNsYXNzIGluaXRQb3NpdGlvblNjcm9sbENvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuICAgIEBJbnB1dCgpIGluaXRQb3NpdGlvbjpudW1iZXI7XHJcbiAgICBASW5wdXQoKSBlbWl0RXZlbnQ6Ym9vbGVhbjtcclxuICAgIEBPdXRwdXQoKSBvblNjcm9sbCA9IG5ldyBFdmVudEVtaXR0ZXI8bnVtYmVyPigpO1xyXG5cclxuICAgIHByaXZhdGUgZWxlbWVudDpFbGVtZW50UmVmO1xyXG4gICAgcHJpdmF0ZSBzY3JvbGxDb250ZW50OkhUTUxFbGVtZW50O1xyXG4gICAgcHJpdmF0ZSBoYW5kbGVyOigpPT52b2lkO1xyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lckF0dGFjaGVkOmJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbDpFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZWw7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczpTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAgICAgbGV0IGluaXRQb3NpdGlvbiA9IGNoYW5nZXNbJ2luaXRQb3NpdGlvbiddO1xyXG4gICAgICAgIGlmIChpbml0UG9zaXRpb24gJiYgaW5pdFBvc2l0aW9uLmN1cnJlbnRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIHRoaXMuc2Nyb2xsQ29udGVudCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZSA9dGhpcztcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIG1lLnNjcm9sbENvbnRlbnQuc2Nyb2xsVG9wID0gaW5pdFBvc2l0aW9uLmN1cnJlbnRWYWx1ZTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICBjb25zdCBzY3JvbGxDb250ZW50ID0gdGhpcy5zY3JvbGxDb250ZW50ID0gdGhpcy5lbGVtZW50Lm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLnNjcm9sbC1jb250ZW50Jyk7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdFBvc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgc2Nyb2xsQ29udGVudC5zY3JvbGxUb3AgPSB0aGlzLmluaXRQb3NpdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmVtaXRFdmVudCAmJiAhdGhpcy5saXN0ZW5lckF0dGFjaGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBvblNjcm9sbCA9IHRoaXMub25TY3JvbGw7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsLmVtaXQoc2Nyb2xsQ29udGVudC5zY3JvbGxUb3ApO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyQXR0YWNoZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBzY3JvbGxDb250ZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxpc3RlbmVyQXR0YWNoZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxDb250ZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRoaXMuaGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==