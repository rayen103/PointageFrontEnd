import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const pulseAnimation = trigger('pulse', [
  state('in', style({ transform: 'scale(1)' })),
  transition('* => *', [
    animate('1s ease-in-out', keyframes([
      style({ transform: 'scale(1)', offset: 0 }),
      style({ transform: 'scale(1.05)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 })
    ]))
  ])
]);

export const skeletonLoader = trigger('skeletonLoader', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms', style({ opacity: 0.6 })),
    animate('1500ms ease-in-out', keyframes([
      style({ opacity: 0.6, offset: 0 }),
      style({ opacity: 0.3, offset: 0.5 }),
      style({ opacity: 0.6, offset: 1 })
    ]))
  ])
]);

export const spinnerAnimation = trigger('spinner', [
  transition(':enter', [
    style({ opacity: 0, transform: 'rotate(0deg)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'rotate(360deg)' }))
  ])
]);
