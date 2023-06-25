const express = require('express');
const session = require('express-session');
const cors = require('cors');
const SSE = require('express-sse');
const bodyParser = require('body-parser');
const app = express();
const sseInstances = new Map();



const products = [
  { 
  id: 1, 
  barcode_id: '1111', 
  name: 'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops', 
  quantity: 1, 
  availability: true,
  price: 109.95,
  description: `Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
  "category":"men's clothing`,
  discount: 25,
  offers: 'some sample text' ,
  Image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg' 
 },
 { 
  id: 2, 
  barcode_id: '2222', 
  name: 'Mens Casual Premium Slim Fit T-Shirts', 
  quantity: 1, 
  availability: true,
  price: 22.3,
  description: `Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.`,
  discount: 12,
  offers: 'some sample text' ,
  Image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg' 
 },
 { 
  id: 3, 
  barcode_id: '3333', 
  name: 'Mens Cotton Jacket', 
  quantity: 1, 
  availability: true,
  price: 55.99,
  description: `great outerwear jackets for Spring/Autumn/Winter, suitable for many occasions, such as working, hiking, camping, mountain/rock climbing, cycling, traveling or other outdoors. Good gift choice for you or your family member. A warm hearted love to Father, husband or son in this thanksgiving or Christmas Day`,
  discount: 10,
  offers: 'some sample text' ,
  Image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg' 
 },
 { 
  id: 4, 
  barcode_id: '4444', 
  name: 'Mens Casual Slim Fit', 
  quantity: 1, 
  availability: true,
  price: 15.99,
  description: `The color could be slightly different between on the screen and in practice. / Please note that body builds vary by person, therefore, detailed size information should be reviewed below on the product description.`,
  discount: 10,
  offers: 'some sample text' ,
  Image: 'https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg' 
 }];
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // replace with the origin of your React app
    credentials: true, // this allows session cookies to be sent cross-origin
  }));

app.use(session({
  secret: 'secret-key', // Please replace it with your own secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: 'auto' },
}));

app.get('/', (req, res) => {
    const ipAddress = req.headers['x-forwarded-for'].split(",")[0];
    res.send(ipAddress);
});

app.get('/stream', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'].split(",")[0];

  let sse = sseInstances.get(ipAddress);
  if (!sse) {
    sse = new SSE();
    sseInstances.set(ipAddress, sse);
  }
  stream.init(req, res);
  console.log(`Stream opened, id: ${ipAddress}`);

  req.on('close', () => {
    sseInstances.delete(ipAddress);
    console.log(`Stream closed, id: ${ipAddress}`);
  });

  console.log(`New stream opened, id: ${ipAddress}`);
  
});

app.post('/broadcastdata', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'].split(",")[0];
  const scandata = req.body.scandata;
  const prod = products.find(product => { 
    if(product.barcode_id == scandata){
        return product
    }
  })

  const sse = sseInstances.get(ipAddress);
  if (sse) {
    console.log(`Sending message to stream: ${ipAddress}`);
    sse.send(prod);
  } else {
    console.log(`Stream not found: ${ipAddress}`);
  }

});


app.get('/api/getData', (req, res) => {
  finalProducts = [];
    // Assume the barcode data processing happened here
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  //console.log(`IP Address: ${ipAddress} -  ${req.ip}`);
    res.json({ sessionID: req.ip, data: 'processed data' });
  });
  
  app.get('/products/:barcodeid', (req, res) => {
    

     const prod = products.find(product => { 
      if(product.barcode_id == req.params.barcodeid){
          return product
      }
  })

     res.send(JSON.stringify(prod));
  });

  app.get('/sse/:terminalId', (req, res) => {
   
    const ipAddress = req.headers['x-forwarded-for'].split(",")[0];
    console.log("IP 1111 " + ipAddress)
    // Check if an SSE instance already exists for this terminal
    let sse = sseInstances.get(ipAddress);
    
    // If not, create a new instance and save it in the map
    if (!sse) {
      sse = new SSE();
      sseInstances.set(ipAddress, sse);
    }
    //console.log("done: " + req.params.terminalId)
    // Connect the SSE instance to the response
    sse.init(req, res);
  });

  app.post('/broadcast/:terminalId', (req, res) => {
   const ipAddress = req.headers['x-forwarded-for'].split(",")[0];
   console.log("IP 2222 " + ipAddress)
    const terminalId = req.body.termtype;
    const sse = sseInstances.get(ipAddress);
  
    const scandata = req.body.scandata;

    const prod = products.find(product => { 
        if(product.barcode_id == scandata){
            return product
        }
    })
    console.log("Data scanned on Node.JS",ipAddress)
    // If an instance exists, send a message
    if (sse) {
      
      sse.send(prod);
    }
  
    //res.status(204).end();
  });

app.listen(3001, () => console.log('App listening on port 3001'));
