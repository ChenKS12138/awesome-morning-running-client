import { FormDuck } from '@/ducks';

interface IBindByPasswordFormData {
  username: string;
  password: string;
}

export default class BindByPasswordFormDuck extends FormDuck<IBindByPasswordFormData> {
  validator(data: IBindByPasswordFormData): boolean {
    return !!(data.password?.length && data.username?.length);
  }
}
