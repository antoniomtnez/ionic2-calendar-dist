import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MonthViewComponent } from './monthview';
import { WeekViewComponent } from './weekview';
import { DayViewComponent } from './dayview';
import { CalendarComponent } from './calendar';
import { initPositionScrollComponent } from './init-position-scroll';
var NgCalendarModule = /** @class */ (function () {
    function NgCalendarModule() {
    }
    NgCalendarModule = __decorate([
        NgModule({
            declarations: [
                MonthViewComponent, WeekViewComponent, DayViewComponent, CalendarComponent, initPositionScrollComponent
            ],
            imports: [IonicModule, CommonModule],
            exports: [CalendarComponent]
        })
    ], NgCalendarModule);
    return NgCalendarModule;
}());
export { NgCalendarModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIubW9kdWxlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vaW9uaWMyLWNhbGVuZGFyLyIsInNvdXJjZXMiOlsiY2FsZW5kYXIubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2pELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDN0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBU3JFO0lBQUE7SUFBK0IsQ0FBQztJQUFuQixnQkFBZ0I7UUFQNUIsUUFBUSxDQUFDO1lBQ04sWUFBWSxFQUFFO2dCQUNWLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLDJCQUEyQjthQUMxRztZQUNELE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUM7WUFDcEMsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUM7U0FDL0IsQ0FBQztPQUNXLGdCQUFnQixDQUFHO0lBQUQsdUJBQUM7Q0FBQSxBQUFoQyxJQUFnQztTQUFuQixnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBJb25pY01vZHVsZSB9IGZyb20gJ0Bpb25pYy9hbmd1bGFyJztcclxuaW1wb3J0IHsgTW9udGhWaWV3Q29tcG9uZW50IH0gZnJvbSAnLi9tb250aHZpZXcnO1xyXG5pbXBvcnQgeyBXZWVrVmlld0NvbXBvbmVudCB9IGZyb20gJy4vd2Vla3ZpZXcnO1xyXG5pbXBvcnQgeyBEYXlWaWV3Q29tcG9uZW50IH0gZnJvbSAnLi9kYXl2aWV3JztcclxuaW1wb3J0IHsgQ2FsZW5kYXJDb21wb25lbnQgfSBmcm9tICcuL2NhbGVuZGFyJztcclxuaW1wb3J0IHsgaW5pdFBvc2l0aW9uU2Nyb2xsQ29tcG9uZW50IH0gZnJvbSAnLi9pbml0LXBvc2l0aW9uLXNjcm9sbCc7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgZGVjbGFyYXRpb25zOiBbXHJcbiAgICAgICAgTW9udGhWaWV3Q29tcG9uZW50LCBXZWVrVmlld0NvbXBvbmVudCwgRGF5Vmlld0NvbXBvbmVudCwgQ2FsZW5kYXJDb21wb25lbnQsIGluaXRQb3NpdGlvblNjcm9sbENvbXBvbmVudFxyXG4gICAgXSxcclxuICAgIGltcG9ydHM6IFtJb25pY01vZHVsZSwgQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtDYWxlbmRhckNvbXBvbmVudF1cclxufSlcclxuZXhwb3J0IGNsYXNzIE5nQ2FsZW5kYXJNb2R1bGUge31cclxuIl19