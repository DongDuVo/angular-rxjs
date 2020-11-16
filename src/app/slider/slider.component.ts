import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { animationFrameScheduler, defer, fromEvent, of, Subject, merge, generate, timer } from 'rxjs';
import { debounceTime, delay, delayWhen, map, switchMap, switchMapTo, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

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

  mouseDown$ = new Subject<MouseEvent>();
  buttonStyle$ = this.mouseDown$.pipe(
    switchMapTo(
      merge(
        fromEvent<MouseEvent>(document, 'mousemove').pipe(
          takeUntil(fromEvent(document, 'mouseup')),
          throttleTime(0, animationFrameScheduler),
          withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
          map(([moveEvent, sliderWidth]) => {
            const position = moveEvent.clientX + 1 - 44;
            return { 'left.px': position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position) };
          })
        ),
        fromEvent<MouseEvent>(document, 'mouseup').pipe(
          withLatestFrom(defer(() => of(this.slider.nativeElement.clientWidth))),
          map(([mouseEvent, sliderWidth]) => {
            const position = mouseEvent.clientX + 1 - 44;
            return position <= 1 ? 1 : Math.min(sliderWidth - 1 - 44, position);
          }),
          switchMap(
            (x) => generate(x, x => x >= 1, x => x - 1, x => x).pipe(
              delayWhen(() => timer(100)),
              map(pos => { return {'left.px': pos }}),
            )
          )
        )
      )
    )
  )
}
