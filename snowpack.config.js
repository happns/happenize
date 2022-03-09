module.exports = {
  mount: {
    public: '/',
    src: '/_dist_',
  },
  plugins: [
    __dirname + '/snowpack/auto-generated-index.js', 
    __dirname + '/snowpack/html-namespace.js',
    __dirname + '/snowpack/less-namespace.js',
    __dirname + '/snowpack/web-worker-proxy.js'
  ],
  devOptions: {
    hmr: true
  }
};
