const pkgInfo = require('./package.json');

const config = {
  define: {
    REQUEST_BASE_URL: process.env.REQUEST_BASE_URL,
    REDUX_LOGGER_ENABLE: process.env.REDUX_LOGGER_ENABLE,
  },
  targets: ['wechat-miniprogram'],
  plugins: [],
  babelPlugins: ['@babel/plugin-transform-regenerator'],
  sourceMap: false,
  'wechat-miniprogram': {
    nativeConfig: {
      appid: process.env.WECHAT_MINIPROGRAM_APPID,
      miniprogramRoot: '.', // 以 `build/wechat-miniprogram` 作为项目根目录使用微信开发者工具打开
      projectname: pkgInfo.name,
      setting: {
        urlCheck: false,
        es6: false,
        enhance: false,
        postcss: false,
        preloadBackgroundData: false,
        minified: false,
        newFeature: false,
        coverView: true,
        nodeModules: false,
        autoAudits: false,
        showShadowRootInWxmlPanel: false,
        scopeDataCheck: false,
        uglifyFileName: false,
        checkInvalidKey: true,
        checkSiteMap: false,
        uploadWithSourceMap: true,
        compileHotReLoad: false,
        useMultiFrameRuntime: true,
        useApiHook: true,
        useApiHostProcess: false,
        babelSetting: {
          ignore: [],
          disablePlugins: [],
          outputPath: '',
        },
        bundle: false,
        useIsolateContext: true,
        useCompilerModule: true,
        userConfirmedUseCompilerModuleSwitch: false,
        userConfirmedBundleSwitch: false,
        packNpmManually: false,
        packNpmRelationList: [],
        minifyWXSS: true,
      },
      condition: {},
    },
  },
  tsChecker: true,
  minify: process.env.NODE_ENV === 'production',
};

module.exports = config;
