import { Duck } from '@/utils/duck';

export default class PageDuck extends Duck {
  get quickTypes() {
    enum Types {
      PAGE_RELOAD,
    }
    return {
      ...Types,
    };
  }
  *saga() {
    yield null as any;
  }
}
