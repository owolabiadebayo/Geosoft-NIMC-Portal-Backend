module.exports = {
  apps: [
    {
      name: "node-api",
      script: "server.js",
      instances: 0,
      exec_mode: "cluster",
    },
  ],
};
