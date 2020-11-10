import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, of, Subject, merge, generate } from 'rxjs';
import { delay, map, switchMapTo, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderComponent {
  @ViewChild('slider', { static: true, read: ElementRef })
  slider!: ElementRef<HTMLDivElement>;

  @ViewChild('button', { static: true, read: ElementRef })
  button!: ElementRef<HTMLDivElement>;

  curPos = 1;

  mouseDown$ = new Subject<MouseEvent>();
  mouseUp$ = new Subject<number>();
  buttonStyle$ = merge(this.mouseDown$.pipe(
      switchMapTo(
        fromEvent<MouseEvent>(document, 'mousemove').pipe(
          takeUntil(fromEvent(document, 'mouseup')),
          throttleTime(0, animationFrameScheduler),
          withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
          map(([moveEvent, sliderWidth]) => {
            const position = moveEvent.clientX + 1 - 44;
            this.curPos = position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position);
            return { 'left.px': this.curPos };
          })
        )
      )
    ), this.mouseUp$.pipe(
        switchMapTo(
          generate(this.curPos, x => x >= 1, x => x - 1, x => x).pipe(
            delay(50),
            map((pos) => {
              console.log('pos ', pos)
              return { 'left.px': pos };
            }
          )
        )
      )
    )
  )
}
