# IPFS Store

Store the Certificates generated by Certificate Authority inside IPFS
and place the IPFS hash inside the ethereum blockchain

Contract to deploy is placed in /contracts folder

To run this project
- Deploy the contract to the specific test or main ethereum network
- Store the contract specific values within storehash.js
- Set the values for IPFS network inside ipfs.js
- Run the code


storehash.js
```JavaScript

const address = '<<Contract address>>';
//ABI from contract
const abi = <<ABI from contract>>
```

ipfs.js
```Javascript
const ipfs = new IPFS({ host: 'any IPFS host address', port: 'IPFS port', protocol: 'https' });
```

Currently the IPFS system that is in use belongs to infura

Once the configuration is complete

```
npm install
npm run start
```

