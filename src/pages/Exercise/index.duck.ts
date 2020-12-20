import { Duck } from '@/utils/duck';

export default class ExerciseDuck extends Duck {
  get quickTypes() {
    return {};
  }
  get creators() {
    return null;
  }
  get reducers() {
    return null;
  }
  *saga() {
    yield 123;
  }
}
