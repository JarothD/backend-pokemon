//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| e_e |)
//                      0\  w  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const server = require('./src/app.js');
const { conn } = require('./src/db.js');
const port = process.env.PORT ||3001;

// Syncing all the models at once.
conn.sync({ alter: true }).then(() => {// de force a alter
  server.listen(port, '0.0.0.0', () => {
    console.log(`%s listening at ${PORT}`); // eslint-disable-line no-console
  });
});