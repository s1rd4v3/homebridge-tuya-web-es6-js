module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
  ],
  plugins: ['add-module-exports', 'transform-es2015-modules-umd'],
  sourceRoot: 'source',
  ignore: ['source/public/**'],
};
