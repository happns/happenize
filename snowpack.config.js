module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  alias: {
    components: './src/shared/components'
  },
  plugins: [
    __dirname + '/snowpack/auto-generated-index.js', 
    __dirname + '/snowpack/html-namespace.js',
    __dirname + '/snowpack/less-namespace.js'
  ]
};
