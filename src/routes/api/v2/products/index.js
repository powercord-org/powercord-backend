module.exports = {
  v2: (app, basePath) => {
    // Plugin & Themes
    [ 'plugins', 'themes' ].forEach(product => {
      // Search/dep tree
      app.get(`${basePath}/${product}/search`, (_, res) => res.sendStatus(501));
      app.get(`${basePath}/${product}/:id/dependency_tree`, (_, res) => res.sendStatus(501));

      // Reviews
      app.get(`${basePath}/${product}/:id/reviews`, (_, res) => res.sendStatus(501));
      app.post(`${basePath}/${product}/:id/reviews`, (_, res) => res.sendStatus(501));
      app.delete(`${basePath}/${product}/:id/reviews/:r_id`, (_, res) => res.sendStatus(501));
    });
  }
};
