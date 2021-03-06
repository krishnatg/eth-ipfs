import web3 from './web3';
//Contract address
const address = '0xb748d26431454c75aef0ef61fe6c18f834690bdd';
//ABI from contract
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "_address",
				"type": "address"
			}
		],
		"name": "addCAServer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_nodeAddress",
				"type": "address"
			},
			{
				"name": "_hashContent",
				"type": "string"
			}
		],
		"name": "saveCertificate",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "_hashSender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "_hashId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "_hashContent",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "NewHashStored",
		"type": "event"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_nodeAddress",
				"type": "address"
			}
		],
		"name": "getCertificate",
		"outputs": [
			{
				"name": "hashSender",
				"type": "address"
			},
			{
				"name": "hashContent",
				"type": "string"
			},
			{
				"name": "hashTimestamp",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
];
export default new web3.eth.Contract(abi, address);
