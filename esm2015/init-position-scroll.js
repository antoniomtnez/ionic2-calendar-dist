import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, ElementRef, SimpleChanges, OnChanges, AfterViewInit, OnDestroy, ViewEncapsulation } from '@angular/core';
let initPositionScrollComponent = class initPositionScrollComponent {
    constructor(el) {
        this.onScroll = new EventEmitter();
        this.listenerAttached = false;
        this.element = el;
    }
    ngOnChanges(changes) {
        let initPosition = changes['initPosition'];
        if (initPosition && initPosition.currentValue !== undefined && this.scrollContent) {
            const me = this;
            setTimeout(function () {
                me.scrollContent.scrollTop = initPosition.currentValue;
            }, 0);
        }
    }
    ngAfterViewInit() {
        const scrollContent = this.scrollContent = this.element.nativeElement.querySelector('.scroll-content');
        if (this.initPosition !== undefined) {
            scrollContent.scrollTop = this.initPosition;
        }
        if (this.emitEvent && !this.listenerAttached) {
            let onScroll = this.onScroll;
            this.handler = function () {
                onScroll.emit(scrollContent.scrollTop);
            };
            this.listenerAttached = true;
            scrollContent.addEventListener('scroll', this.handler);
        }
    }
    ngOnDestroy() {
        if (this.listenerAttached) {
            this.scrollContent.removeEventListener('scroll', this.handler);
        }
    }
};
initPositionScrollComponent.ctorParameters = () => [
    { type: ElementRef }
];
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
        template: `
        <div class="scroll-content" style="height:100%">
            <ng-content></ng-content>
        </div>
    `,
        encapsulation: ViewEncapsulation.None,
        styles: [`
        .scroll-content {
            overflow-y: auto;
            overflow-x: hidden;
        }        
    `]
    })
], initPositionScrollComponent);
export { initPositionScrollComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pdC1wb3NpdGlvbi1zY3JvbGwuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9pb25pYzItY2FsZW5kYXIvIiwic291cmNlcyI6WyJpbml0LXBvc2l0aW9uLXNjcm9sbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxLQUFLLEVBQ0wsTUFBTSxFQUNOLFlBQVksRUFDWixVQUFVLEVBQ1YsYUFBYSxFQUNiLFNBQVMsRUFDVCxhQUFhLEVBQ2IsU0FBUyxFQUNULGlCQUFpQixFQUNwQixNQUFNLGVBQWUsQ0FBQztBQWlCdkIsSUFBYSwyQkFBMkIsR0FBeEMsTUFBYSwyQkFBMkI7SUFVcEMsWUFBWSxFQUFhO1FBUGYsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFVLENBQUM7UUFLeEMscUJBQWdCLEdBQVcsS0FBSyxDQUFDO1FBR3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBcUI7UUFDN0IsSUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxZQUFZLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDL0UsTUFBTSxFQUFFLEdBQUUsSUFBSSxDQUFDO1lBQ2YsVUFBVSxDQUFDO2dCQUNQLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLENBQUM7WUFDM0QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ1Q7SUFDTCxDQUFDO0lBRUQsZUFBZTtRQUNYLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDdkcsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtZQUNqQyxhQUFhLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7U0FDL0M7UUFFRCxJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDMUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUM3QixJQUFJLENBQUMsT0FBTyxHQUFHO2dCQUNYLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzNDLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDMUQ7SUFDTCxDQUFDO0lBRUQsV0FBVztRQUNQLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNsRTtJQUNMLENBQUM7Q0FDSixDQUFBOztZQW5Da0IsVUFBVTs7QUFUaEI7SUFBUixLQUFLLEVBQUU7aUVBQXFCO0FBQ3BCO0lBQVIsS0FBSyxFQUFFOzhEQUFtQjtBQUNqQjtJQUFULE1BQU0sRUFBRTs2REFBdUM7QUFIdkMsMkJBQTJCO0lBZnZDLFNBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxzQkFBc0I7UUFDaEMsUUFBUSxFQUFFOzs7O0tBSVQ7UUFPRCxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTtpQkFONUI7Ozs7O0tBS1I7S0FFSixDQUFDO0dBQ1csMkJBQTJCLENBNkN2QztTQTdDWSwyQkFBMkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xyXG4gICAgQ29tcG9uZW50LFxyXG4gICAgSW5wdXQsXHJcbiAgICBPdXRwdXQsXHJcbiAgICBFdmVudEVtaXR0ZXIsXHJcbiAgICBFbGVtZW50UmVmLFxyXG4gICAgU2ltcGxlQ2hhbmdlcyxcclxuICAgIE9uQ2hhbmdlcyxcclxuICAgIEFmdGVyVmlld0luaXQsXHJcbiAgICBPbkRlc3Ryb3ksXHJcbiAgICBWaWV3RW5jYXBzdWxhdGlvblxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ2luaXQtcG9zaXRpb24tc2Nyb2xsJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiBjbGFzcz1cInNjcm9sbC1jb250ZW50XCIgc3R5bGU9XCJoZWlnaHQ6MTAwJVwiPlxyXG4gICAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgc3R5bGVzOiBbYFxyXG4gICAgICAgIC5zY3JvbGwtY29udGVudCB7XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXk6IGF1dG87XHJcbiAgICAgICAgICAgIG92ZXJmbG93LXg6IGhpZGRlbjtcclxuICAgICAgICB9ICAgICAgICBcclxuICAgIGBdLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZVxyXG59KVxyXG5leHBvcnQgY2xhc3MgaW5pdFBvc2l0aW9uU2Nyb2xsQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzLCBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xyXG4gICAgQElucHV0KCkgaW5pdFBvc2l0aW9uOm51bWJlcjtcclxuICAgIEBJbnB1dCgpIGVtaXRFdmVudDpib29sZWFuO1xyXG4gICAgQE91dHB1dCgpIG9uU2Nyb2xsID0gbmV3IEV2ZW50RW1pdHRlcjxudW1iZXI+KCk7XHJcblxyXG4gICAgcHJpdmF0ZSBlbGVtZW50OkVsZW1lbnRSZWY7XHJcbiAgICBwcml2YXRlIHNjcm9sbENvbnRlbnQ6SFRNTEVsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGhhbmRsZXI6KCk9PnZvaWQ7XHJcbiAgICBwcml2YXRlIGxpc3RlbmVyQXR0YWNoZWQ6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVsOkVsZW1lbnRSZWYpIHtcclxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbDtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOlNpbXBsZUNoYW5nZXMpIHtcclxuICAgICAgICBsZXQgaW5pdFBvc2l0aW9uID0gY2hhbmdlc1snaW5pdFBvc2l0aW9uJ107XHJcbiAgICAgICAgaWYgKGluaXRQb3NpdGlvbiAmJiBpbml0UG9zaXRpb24uY3VycmVudFZhbHVlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zY3JvbGxDb250ZW50KSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lID10aGlzO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgbWUuc2Nyb2xsQ29udGVudC5zY3JvbGxUb3AgPSBpbml0UG9zaXRpb24uY3VycmVudFZhbHVlO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgICAgIGNvbnN0IHNjcm9sbENvbnRlbnQgPSB0aGlzLnNjcm9sbENvbnRlbnQgPSB0aGlzLmVsZW1lbnQubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuc2Nyb2xsLWNvbnRlbnQnKTtcclxuICAgICAgICBpZiAodGhpcy5pbml0UG9zaXRpb24gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBzY3JvbGxDb250ZW50LnNjcm9sbFRvcCA9IHRoaXMuaW5pdFBvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZW1pdEV2ZW50ICYmICF0aGlzLmxpc3RlbmVyQXR0YWNoZWQpIHtcclxuICAgICAgICAgICAgbGV0IG9uU2Nyb2xsID0gdGhpcy5vblNjcm9sbDtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgb25TY3JvbGwuZW1pdChzY3JvbGxDb250ZW50LnNjcm9sbFRvcCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJBdHRhY2hlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHNjcm9sbENvbnRlbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5oYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGlzdGVuZXJBdHRhY2hlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbENvbnRlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5oYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl19