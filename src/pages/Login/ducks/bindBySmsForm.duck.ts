import { FormDuck } from '@/ducks';

interface IBindBySmsFormDuck {
  phone: string;
  smsCode: string;
}

export default class BindBySmsFormDuck extends FormDuck<IBindBySmsFormDuck> {
  validator(data: IBindBySmsFormDuck): boolean {
    return !!(data.phone && data.smsCode);
  }
}
