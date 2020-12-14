import { runApp } from 'rax-app';
import { isWeChatMiniProgram } from 'universal-env';
import { FONT_DIN_CONDENSED } from '@/assets';

const appConfig = {
  onLaunch() {
    if (isWeChatMiniProgram) {
      (wx as any).loadFontFace({
        family: 'DIN Condensed',
        source: `url('${FONT_DIN_CONDENSED}')`,
      });
    }
  },
};

runApp(appConfig);
