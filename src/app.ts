import { runApp } from 'rax-app';
import { isWeChatMiniProgram } from 'universal-env';
import { FONT_DIN_CONDENSED, FONT_HYYakuHei } from '@/assets';

const appConfig = {
  onLaunch() {
    if (isWeChatMiniProgram) {
      wx.loadFontFace({
        family: 'DIN Condensed',
        source: `url('${FONT_DIN_CONDENSED}')`,
      });
      wx.loadFontFace({
        family: 'HYYakuHei',
        source: `url('${FONT_HYYakuHei}')`,
      });
    }
  },
};

runApp(appConfig);
