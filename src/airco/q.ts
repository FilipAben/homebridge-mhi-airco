
interface QEl<T> {
  func: () => Promise<T>;
  tries: number;
  resolve: (data: T) => void;
  reject: (err: Error) => void;
}

export class CmdQ<T> {
  private queue: QEl<T>[] = [];
  private processing: boolean = false;

  q(func: () => Promise<T>, tries = 1): Promise<T> {
    return new Promise((res, rej) => {
      this.queue.push({func, resolve: res, reject: rej, tries});
      void this.#processQ();
    })
  }

  async #processQ(): Promise<void> {
    if(this.processing || this.queue.length === 0) {
      return;
    }
    this.processing = true;
    while(this.queue.length) {
      const el = this.queue.shift();
      if(!el) {
        break;
      }
      while(el.tries) {
        try {
          const result = await el.func()
          el.resolve(result);
          break;
        } catch(err) {
          el.tries -= 1;
          if(!el.tries) {
            el.reject(err as Error);
          }
        }
      }
    }
    this.processing = false;
  }
}
