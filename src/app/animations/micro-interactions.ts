import { trigger, state, style, transition, animate } from '@angular/animations';

export const hoverScale = trigger('hoverScale', [
  state('default', style({ transform: 'scale(1)' })),
  state('hovered', style({ transform: 'scale(1.05)' })),
  transition('default <=> hovered', animate('200ms ease-in-out'))
]);

export const clickRipple = trigger('clickRipple', [
  transition('* => clicked', [
    style({ transform: 'scale(0.95)' }),
    animate('100ms ease-out', style({ transform: 'scale(1.02)' })),
    animate('100ms ease-in', style({ transform: 'scale(1)' }))
  ])
]);

export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', overflow: 'hidden', opacity: 0 })),
  state('expanded', style({ height: '*', overflow: 'visible', opacity: 1 })),
  transition('collapsed <=> expanded', animate('300ms ease-in-out'))
]);

export const listStagger = trigger('listStagger', [
  transition('* => *', [
    animate('300ms ease-out')
  ])
]);
