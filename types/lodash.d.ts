declare module 'lodash' {
  export function throttle<Args extends unknown[], Return>(
    func: (...args: Args) => Return,
    wait?: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
    }
  ): ((...args: Args) => Return) & {
    cancel(): void;
    flush(): void;
  };
} 