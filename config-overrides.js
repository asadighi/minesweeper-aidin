const { override, addWebpackModuleRule } = require('customize-cra');

module.exports = override(
  addWebpackModuleRule({
    test: /\.worker\.(js|ts)$/,
    use: { loader: 'worker-loader' }
  })
);
